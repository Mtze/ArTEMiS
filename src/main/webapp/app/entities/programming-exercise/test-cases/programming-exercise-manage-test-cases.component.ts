import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { differenceBy as _differenceBy, differenceWith as _differenceWith, intersectionWith as _intersectionWith, unionBy as _unionBy } from 'lodash';
import { JhiAlertService } from 'ng-jhipster';
import { ProgrammingExerciseService, ProgrammingExerciseTestCaseService } from 'app/entities/programming-exercise/services';
import { ProgrammingExerciseTestCase } from 'app/entities/programming-exercise/programming-exercise-test-case.model';
import { ComponentCanDeactivate } from 'app/shared';
import { ProgrammingExerciseWebsocketService } from 'app/entities/programming-exercise/services/programming-exercise-websocket.service';

export enum EditableField {
    WEIGHT = 'weight',
}

@Component({
    selector: 'jhi-programming-exercise-manage-test-cases',
    templateUrl: './programming-exercise-manage-test-cases.component.html',
    styleUrls: ['./programming-exercise-manage-test-cases.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProgrammingExerciseManageTestCasesComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
    EditableField = EditableField;

    exerciseId: number;
    courseId: number;
    editing: [ProgrammingExerciseTestCase, EditableField] | null = null;
    testCaseSubscription: Subscription;
    testCaseChangedSubscription: Subscription;
    paramSub: Subscription;

    testCasesValue: ProgrammingExerciseTestCase[] = [];
    changedTestCaseIds: number[] = [];
    filteredTestCases: ProgrammingExerciseTestCase[] = [];

    buildAfterDueDateActive: boolean;
    isReleasedAndHasResults: boolean;
    showInactiveValue = false;
    isSaving = false;
    isLoading = false;
    // This flag means that the test cases were edited, but no submission run was triggered yet.
    hasUpdatedTestCases = false;

    get testCases() {
        return this.testCasesValue;
    }

    set testCases(testCases: ProgrammingExerciseTestCase[]) {
        this.testCasesValue = testCases;
        this.updateTestCaseFilter();
    }

    get showInactive() {
        return this.showInactiveValue;
    }

    set showInactive(showInactive: boolean) {
        this.editing = null;
        this.showInactiveValue = showInactive;
        this.updateTestCaseFilter();
    }

    constructor(
        private testCaseService: ProgrammingExerciseTestCaseService,
        private programmingExerciseService: ProgrammingExerciseService,
        private programmingExerciseWebsocketService: ProgrammingExerciseWebsocketService,
        private route: ActivatedRoute,
        private alertService: JhiAlertService,
        private translateService: TranslateService,
    ) {}

    /**
     * Subscribes to the route params to get the current exerciseId.
     * Uses the exerciseId to subscribe to the newest value of the exercise's test cases.
     *
     * Also checks if a change guard needs to be activated when the test cases where saved.
     */
    ngOnInit(): void {
        this.paramSub = this.route.params.pipe(distinctUntilChanged()).subscribe(params => {
            this.isLoading = true;
            this.exerciseId = Number(params['exerciseId']);
            this.courseId = Number(params['courseId']);
            this.editing = null;
            if (this.testCaseSubscription) {
                this.testCaseSubscription.unsubscribe();
            }
            if (this.testCaseChangedSubscription) {
                this.testCaseChangedSubscription.unsubscribe();
            }

            this.getExerciseTestCaseState()
                .pipe(
                    tap(releaseState => {
                        this.hasUpdatedTestCases = releaseState.testCasesChanged;
                        this.isReleasedAndHasResults = releaseState.released && releaseState.hasStudentResult;
                        this.buildAfterDueDateActive = !!releaseState.buildAndTestStudentSubmissionsAfterDueDate;
                    }),
                    catchError(() => of(null)),
                )
                .subscribe(() => {
                    // This subscription e.g. adds new new tests to the table that were just created.
                    this.subscribeForTestCaseUpdates();
                    // This subscription is used to determine if the programming exercise's properties necessitate build runs after the test cases are changed.
                    this.subscribeForExerciseTestCasesChangedUpdates();
                    this.isLoading = false;
                });
        });
    }

    ngOnDestroy(): void {
        if (this.testCaseSubscription) {
            this.testCaseSubscription.unsubscribe();
        }
        if (this.testCaseChangedSubscription) {
            this.testCaseChangedSubscription.unsubscribe();
        }
        if (this.paramSub) {
            this.paramSub.unsubscribe();
        }
    }

    private subscribeForTestCaseUpdates() {
        if (this.testCaseSubscription) {
            this.testCaseSubscription.unsubscribe();
        }
        this.testCaseSubscription = this.testCaseService
            .subscribeForTestCases(this.exerciseId)
            .pipe(
                tap((testCases: ProgrammingExerciseTestCase[]) => {
                    this.testCases = testCases;
                }),
            )
            .subscribe();
    }

    private subscribeForExerciseTestCasesChangedUpdates() {
        if (this.testCaseChangedSubscription) {
            this.testCaseChangedSubscription.unsubscribe();
        }
        this.testCaseChangedSubscription = this.programmingExerciseWebsocketService
            .getTestCaseState(this.exerciseId)
            .pipe(tap((testCasesChanged: boolean) => (this.hasUpdatedTestCases = testCasesChanged)))
            .subscribe();
    }

    /**
     * Checks if the exercise is released and has at least one student result.
     */
    getExerciseTestCaseState() {
        return this.programmingExerciseService.getProgrammingExerciseTestCaseState(this.exerciseId).pipe(map(({ body }) => body!));
    }

    /**
     * Show an input to edit the test cases weight.
     * @param rowIndex
     */
    enterEditing(rowIndex: number, field: EditableField) {
        this.editing = [this.filteredTestCases[rowIndex], field];
    }

    /**
     * Hide input.
     */
    leaveEditingWithoutSaving() {
        this.editing = null;
    }

    /**
     * Update the weight of the edited test case in the component state (does not persist the value on the server!).
     * Adds the currently edited weight to the list of unsaved changes.
     *
     * @param newValue of updated field;
     */
    updateEditedField(newValue: any) {
        if (!this.editing) {
            return;
        }
        // Don't allow an empty string as a value!
        if (!newValue) {
            this.editing = null;
            return;
        }
        const [editedTestCase, field] = this.editing;
        // If the weight has not changed, don't do anything besides closing the input.
        if (newValue === editedTestCase[field]) {
            this.editing = null;
            return;
        }
        this.changedTestCaseIds = this.changedTestCaseIds.includes(editedTestCase.id) ? this.changedTestCaseIds : [...this.changedTestCaseIds, editedTestCase.id];
        this.testCases = this.testCases.map(testCase => (testCase.id !== editedTestCase.id ? testCase : { ...testCase, [field]: newValue }));
        this.editing = null;
    }

    /**
     * Save the unsaved (edited) weights of the test cases.
     */
    saveWeights() {
        this.editing = null;
        this.isSaving = true;

        const testCasesToUpdate = _intersectionWith(this.testCases, this.changedTestCaseIds, (testCase: ProgrammingExerciseTestCase, id: number) => testCase.id === id);
        const testCaseUpdates = testCasesToUpdate.map(({ id, weight, afterDueDate }) => ({ id, weight, afterDueDate }));

        this.testCaseService
            .updateTestCase(this.exerciseId, testCaseUpdates)
            .pipe(
                tap((updatedTestCases: ProgrammingExerciseTestCase[]) => {
                    // From successfully updated test cases from dirty checking list.
                    this.changedTestCaseIds = _differenceWith(this.changedTestCaseIds, updatedTestCases, (id: number, testCase: ProgrammingExerciseTestCase) => testCase.id === id);

                    // Generate the new list of test cases with the updated weights and notify the test case service.
                    const newTestCases = _unionBy(updatedTestCases, this.testCases, 'id');
                    this.testCaseService.notifyTestCases(this.exerciseId, newTestCases);

                    // Find out if there are test cases that were not updated, show an error.
                    const notUpdatedTestCases = _differenceBy(testCasesToUpdate, updatedTestCases, 'id');
                    if (notUpdatedTestCases.length) {
                        this.alertService.error(`artemisApp.programmingExercise.manageTestCases.testCasesCouldNotBeUpdated`, { testCases: notUpdatedTestCases });
                    } else {
                        this.alertService.success(`artemisApp.programmingExercise.manageTestCases.testCasesUpdated`);
                    }
                }),
                catchError((err: HttpErrorResponse) => {
                    this.alertService.error(`artemisApp.programmingExercise.manageTestCases.testCasesCouldNotBeUpdated`, { testCases: testCasesToUpdate });
                    return of(null);
                }),
            )
            .subscribe(() => {
                this.isSaving = false;
            });
    }

    /**
     * Toggle the after due date of the test case related to the provided row of the datatable.
     * @param rowIndex
     */
    toggleAfterDueDate(rowIndex: number) {
        const testCase = this.filteredTestCases[rowIndex];
        this.changedTestCaseIds = this.changedTestCaseIds.includes(testCase.id) ? this.changedTestCaseIds : [...this.changedTestCaseIds, testCase.id];
        this.testCases = this.testCases.map(t => (t.id === testCase.id ? { ...t, afterDueDate: !t.afterDueDate } : t));
    }

    /**
     * Sets the weights of all test cases to 1.
     */
    resetWeights() {
        this.editing = null;
        this.isSaving = true;
        const existsUnchangedWithCustomWeight = this.testCases.filter(({ id }) => !this.changedTestCaseIds.includes(id)).some(({ weight }) => weight > 1);
        // If the updated weights are unsaved, we can just reset them locally in the browser without contacting the server.
        if (!existsUnchangedWithCustomWeight) {
            this.testCases = this.testCases.map(({ weight, ...rest }) => ({ weight: 1, ...rest }));
            return;
        }

        this.testCaseService
            .resetWeights(this.exerciseId)
            .pipe(
                tap((testCases: ProgrammingExerciseTestCase[]) => {
                    this.alertService.success(`artemisApp.programmingExercise.manageTestCases.weightsReset`);
                    this.testCaseService.notifyTestCases(this.exerciseId, testCases);
                }),
                catchError((err: HttpErrorResponse) => {
                    this.alertService.error(`artemisApp.programmingExercise.manageTestCases.weightsResetFailed`);
                    return of(null);
                }),
            )
            .subscribe(() => {
                this.isSaving = false;
                this.changedTestCaseIds = [];
            });
    }

    /**
     * Executes filtering on all availabile test cases with the specified params.
     */
    updateTestCaseFilter = () => {
        this.filteredTestCases = !this.showInactiveValue && this.testCases ? this.testCases.filter(({ active }) => active) : this.testCases;
    };

    /**
     * Makes inactive test cases grey.
     *
     * @param row
     */
    getRowClass(row: ProgrammingExerciseTestCase) {
        return !row.active ? 'test-case--inactive' : '';
    }

    /**
     * Checks if there are unsaved test cases or there was no submission run after the test cases were changed.
     * Provides a fitting text for the confirm.
     */
    canDeactivate() {
        if (!this.changedTestCaseIds.length && (!this.isReleasedAndHasResults || !this.hasUpdatedTestCases)) {
            return true;
        }
        const warning = this.changedTestCaseIds.length
            ? this.translateService.instant('pendingChanges')
            : this.translateService.instant('artemisApp.programmingExercise.manageTestCases.updatedTestCases');
        return confirm(warning);
    }
}
