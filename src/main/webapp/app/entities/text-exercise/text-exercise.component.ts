import { Component, Input } from '@angular/core';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { JhiAlertService, JhiEventManager } from 'ng-jhipster';

import { TextExercise } from './text-exercise.model';
import { TextExerciseService } from './text-exercise.service';
import { CourseExerciseService, CourseService } from '../course';
import { ActivatedRoute } from '@angular/router';
import { ExerciseComponent } from 'app/entities/exercise/exercise.component';
import { TranslateService } from '@ngx-translate/core';
import { AccountService } from 'app/core';
import { DeleteDialogData, DeleteDialogService } from 'app/shared/delete-dialog/delete-dialog.service';

@Component({
    selector: 'jhi-text-exercise',
    templateUrl: './text-exercise.component.html',
})
export class TextExerciseComponent extends ExerciseComponent {
    @Input() textExercises: TextExercise[];

    constructor(
        private textExerciseService: TextExerciseService,
        private courseExerciseService: CourseExerciseService,
        courseService: CourseService,
        translateService: TranslateService,
        private jhiAlertService: JhiAlertService,
        eventManager: JhiEventManager,
        route: ActivatedRoute,
        private accountService: AccountService,
        private deleteDialogService: DeleteDialogService,
    ) {
        super(courseService, translateService, route, eventManager);
        this.textExercises = [];
    }

    protected loadExercises(): void {
        this.courseExerciseService.findAllTextExercisesForCourse(this.courseId).subscribe(
            (res: HttpResponse<TextExercise[]>) => {
                this.textExercises = res.body!;

                // reconnect exercise with course
                this.textExercises.forEach(exercise => {
                    exercise.course = this.course;
                    exercise.isAtLeastTutor = this.accountService.isAtLeastTutorInCourse(exercise.course);
                    exercise.isAtLeastInstructor = this.accountService.isAtLeastInstructorInCourse(exercise.course);
                });
                this.emitExerciseCount(this.textExercises.length);
            },
            (res: HttpErrorResponse) => this.onError(res),
        );
    }

    /**
     * Returns the unique identifier for items in the collection
     * @param index of a text exercise in the collection
     * @param item current text exercise
     */
    trackId(index: number, item: TextExercise) {
        return item.id;
    }

    /**
     * Opens delete text exercise dialog
     * @param textExercise exercise that will be deleted
     */
    openDeleteTextExerciseDialog(textExercise: TextExercise) {
        if (!textExercise) {
            return;
        }
        const deleteDialogData: DeleteDialogData = {
            entityTitle: textExercise.title,
            deleteQuestion: 'artemisApp.exercise.delete.question',
            deleteConfirmationText: 'artemisApp.exercise.delete.typeNameToConfirm',
        };
        this.deleteDialogService.openDeleteDialog(deleteDialogData).subscribe(
            () => {
                this.textExerciseService.delete(textExercise.id).subscribe(
                    response => {
                        this.eventManager.broadcast({
                            name: 'textExerciseListModification',
                            content: 'Deleted an textExercise',
                        });
                    },
                    error => this.onError(error),
                );
            },
            () => {},
        );
    }

    protected getChangeEventName(): string {
        return 'textExerciseListModification';
    }

    private onError(error: HttpErrorResponse) {
        this.jhiAlertService.error(error.message);
    }

    /**
     * Used in the template for jhiSort
     */
    callback() {}
}
