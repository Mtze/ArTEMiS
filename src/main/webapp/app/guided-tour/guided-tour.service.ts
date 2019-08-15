import { ErrorHandler, Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { cloneDeep } from 'lodash';
import { JhiAlertService } from 'ng-jhipster';
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { courseOverviewTour } from 'app/guided-tour/tours/course-overview-tour';
import { GuidedTourSettings } from 'app/guided-tour/guided-tour-settings.model';
import { ContentType, Orientation, OrientationConfiguration } from './guided-tour.constants';
import { AccountService } from 'app/core';
import { TourStep } from 'app/guided-tour/guided-tour-step.model';
import { GuidedTour } from 'app/guided-tour/guided-tour.model';
import { Exercise, ExerciseType } from 'app/entities/exercise';

export type EntityResponseType = HttpResponse<GuidedTourSettings>;

@Injectable({ providedIn: 'root' })
export class GuidedTourService {
    public resourceUrl = SERVER_API_URL + 'api/guided-tour-settings';

    private guidedTourSettings: GuidedTourSettings;
    private guidedTourCurrentStepSubject = new Subject<TourStep | null>();
    private currentTourStepIndex = 0;
    public currentTour: GuidedTour | null;
    private onResizeMessage = false;

    constructor(
        private errorHandler: ErrorHandler,
        private http: HttpClient,
        private jhiAlertService: JhiAlertService,
        private accountService: AccountService,
        private router: Router,
    ) {
        this.getGuidedTourSettings();

        /**
         * Subscribe to window resize events
         */
        fromEvent(window, 'resize')
            .pipe(debounceTime(200))
            .subscribe(() => {
                if (this.currentTour && this.currentTourStepIndex > -1) {
                    if (this.currentTour.minimumScreenSize && this.currentTour.minimumScreenSize >= window.innerWidth) {
                        this.onResizeMessage = true;
                        this.guidedTourCurrentStepSubject.next({
                            headlineTranslateKey: 'tour.resize.headline',
                            contentType: ContentType.TEXT,
                            contentTranslateKey: 'tour.resize.content',
                        });
                    } else {
                        this.onResizeMessage = false;
                        this.guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this.currentTourStepIndex));
                    }
                }
            });
    }

    /**
     * @return current tour step as Observable
     */
    public getGuidedTourCurrentStepStream(): Observable<TourStep | null> {
        return this.guidedTourCurrentStepSubject.asObservable();
    }

    /**
     * Load course overview tour
     * @return guided tour `courseOverviewTour`
     */
    public getOverviewTour(): Observable<GuidedTour> {
        return of(courseOverviewTour);
    }

    /**
     * Check if the provided tour step is the currently active one
     * @param tourStep: current tour step of the guided tour
     */
    public isCurrentStep(tourStep: TourStep): boolean {
        if (this.currentTour && this.currentTour.steps) {
            return this.currentTourStepDisplay === this.currentTour.steps.indexOf(tourStep) + 1;
        }
        return false;
    }

    /**
     * Navigate to next tour step
     */
    public nextStep(): void {
        if (!this.currentTour) {
            return;
        }
        const currentStep = this.currentTour.steps[this.currentTourStepIndex];
        if (currentStep.closeAction) {
            currentStep.closeAction();
        }
        if (this.currentTour.steps[this.currentTourStepIndex + 1]) {
            this.currentTourStepIndex++;
            if (currentStep.action) {
                currentStep.action();
            }
            // Usually an action is opening something so we need to give it time to render.
            setTimeout(() => {
                if (this.checkSelectorValidity()) {
                    this.guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this.currentTourStepIndex));
                } else {
                    this.nextStep();
                }
            });
        } else {
            if (this.currentTour.completeCallback) {
                this.currentTour.completeCallback();
            }
            this.updateGuidedTourSettings(this.currentTour.settingsId, false).subscribe(guidedTourSettings => {
                if (guidedTourSettings.body) {
                    this.guidedTourSettings = guidedTourSettings.body;
                }
            });
            this.resetTour();
        }
    }

    /**
     * Navigate to previous tour step
     */
    public backStep(): void {
        if (this.currentTour) {
            const currentStep = this.currentTour.steps[this.currentTourStepIndex];
            if (currentStep.closeAction) {
                currentStep.closeAction();
            }
            if (this.currentTour.steps[this.currentTourStepIndex - 1]) {
                this.currentTourStepIndex--;
                if (currentStep.action) {
                    currentStep.action();
                }
                setTimeout(() => {
                    if (this.checkSelectorValidity()) {
                        this.guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this.currentTourStepIndex));
                    } else {
                        this.backStep();
                    }
                });
            } else {
                this.resetTour();
            }
        }
    }

    /**
     * Skip tour and exit the tour context
     */
    public skipTour(): void {
        if (this.currentTour) {
            if (this.currentTour.skipCallback) {
                this.currentTour.skipCallback(this.currentTourStepIndex);
            }
            this.resetTour();
        }
    }

    /**
     * Close tour by resetting `currentTour`, `currentTourStepIndex` and `guidedTourCurrentStepSubject`
     * and remove overlay
     */
    public resetTour(): void {
        document.body.classList.remove('tour-open');
        this.currentTour = null;
        this.currentTourStepIndex = 0;
        this.guidedTourCurrentStepSubject.next(null);
    }

    /**
     * Start guided tour for given guided tour
     * @param tour: guided tour
     */
    private startTour(tour: GuidedTour): void {
        this.currentTour = cloneDeep(tour);

        // Filter tour steps according to permissions
        this.currentTour.steps = tour.steps.filter(step => !step.skipStep || !step.permission || this.accountService.hasAnyAuthorityDirect(step.permission));
        this.currentTourStepIndex = 0;

        // Proceed with tour if it has tour steps and the tour display is allowed for current window size
        if (this.currentTour.steps.length > 0 && this.tourAllowedForWindowSize()) {
            const currentStep = this.currentTour.steps[this.currentTourStepIndex];
            if (currentStep.action) {
                currentStep.action();
            }
            if (this.checkSelectorValidity()) {
                this.guidedTourCurrentStepSubject.next(this.getPreparedTourStep(this.currentTourStepIndex));
            } else {
                this.nextStep();
            }
        }
    }

    /**
     * Checks if the current window size is supposed display the guided tour
     * @return {boolean} returns true if the minimum screen size is not defined or greater than the current window.innerWidth
     */
    public tourAllowedForWindowSize(): boolean {
        if (this.currentTour) {
            return !this.currentTour.minimumScreenSize || window.innerWidth >= this.currentTour!.minimumScreenSize;
        }
        return false;
    }

    /**
     *  @return {boolean} if highlighted element is available
     */
    public checkSelectorValidity(): boolean {
        if (!this.currentTour) {
            return false;
        }
        if (this.currentTour.steps[this.currentTourStepIndex].selector) {
            const selectedElement = document.querySelector(this.currentTour.steps[this.currentTourStepIndex].selector!);
            if (!selectedElement) {
                return false;
            }
        }
        return true;
    }

    /**
     * @return {boolean} if the current step is the last tour step
     */
    public get isOnLastStep(): boolean {
        if (!this.currentTour) {
            return false;
        }
        return this.currentTour.steps.length - 1 === this.currentTourStepIndex;
    }

    /**
     * @return {boolean} if the current step is the first tour step
     */
    public get isOnFirstStep(): boolean {
        return this.currentTourStepIndex === 0;
    }

    /**
     * @return {boolean} if the `show resize` message should be displayed
     */
    public get isOnResizeMessage(): boolean {
        return this.onResizeMessage;
    }

    /**
     * @return current tour step number
     */
    public get currentTourStepDisplay(): number {
        return this.currentTourStepIndex + 1;
    }

    /**
     *  @return total count of tour steps of the current tour
     */
    public get currentTourStepCount(): any {
        return this.currentTour && this.currentTour.steps ? this.currentTour.steps.length : 0;
    }

    /**
     *  Prevents the tour from advancing by clicking the backdrop
     *  @return {boolean} `preventBackdropFromAdvancing` configuration if tour should advance when clicking on the backdrop
     *  or false if this configuration is not set
     */
    public get preventBackdropFromAdvancing(): boolean {
        if (this.currentTour) {
            return this.currentTour && (this.currentTour.preventBackdropFromAdvancing ? this.currentTour.preventBackdropFromAdvancing : false);
        }
        return false;
    }

    /**
     * Get the tour step with defined orientation
     * @param index current tour step index
     * @return prepared current tour step or null
     */
    private getPreparedTourStep(index: number): TourStep | null {
        if (this.currentTour) {
            return this.setTourOrientation(this.currentTour.steps[index]);
        } else {
            return null;
        }
    }

    /**
     * Set orientation of the passed on tour step
     * @param {step} passed on tour step of a guided tour
     * @return guided tour step with defined orientation
     */
    private setTourOrientation(step: TourStep): TourStep {
        const convertedStep = cloneDeep(step);
        if (convertedStep.orientation && !(typeof convertedStep.orientation === 'string') && (convertedStep.orientation as OrientationConfiguration[]).length) {
            (convertedStep.orientation as OrientationConfiguration[]).sort((a: OrientationConfiguration, b: OrientationConfiguration) => {
                if (!b.maximumSize) {
                    return 1;
                }
                if (!a.maximumSize) {
                    return -1;
                }
                return b.maximumSize - a.maximumSize;
            });

            let currentOrientation: Orientation = Orientation.TOP;
            (convertedStep.orientation as OrientationConfiguration[]).forEach((orientationConfig: OrientationConfiguration) => {
                if (!orientationConfig.maximumSize || window.innerWidth <= orientationConfig.maximumSize) {
                    currentOrientation = orientationConfig.orientationDirection;
                }
            });

            convertedStep.orientation = currentOrientation;
        }
        return convertedStep;
    }

    /**
     * Subscribe to guided tour settings GET request and store response value in service class variable
     */
    public getGuidedTourSettings() {
        this.fetchGuidedTourSettings().subscribe(guidedTourSettings => {
            if (guidedTourSettings) {
                this.guidedTourSettings = guidedTourSettings;
            }
        });
    }

    /**
     * Send a GET request for the guided tour settings of the current user
     * @return {Observable<GuidedTourSettings} guided tour settings
     */
    private fetchGuidedTourSettings(): Observable<GuidedTourSettings> {
        return this.http.get<GuidedTourSettings>(this.resourceUrl, { observe: 'response' }).map((res: EntityResponseType) => {
            if (!res.body) {
                throw new Error('Empty response returned while fetching guided tour settings');
            }
            return res.body;
        });
    }

    /**
     * Send a PUT request to update the guided tour settings of the current user
     * @param settingName   name of the tour setting that is stored in the guided tour settings json in the DB, e.g. showCourseOverviewTour
     * @param settingValue  boolean value that defines if the tour for [settingName] should be displayed automatically
     * @return {Observable<EntityResponseType>} updated guided tour settings
     */
    public updateGuidedTourSettings(settingName: string, settingValue: boolean): Observable<EntityResponseType> {
        if (!this.guidedTourSettings) {
            throw new Error('Cannot update non existing guided tour settings');
        }
        this.guidedTourSettings[settingName] = settingValue;
        return this.http.put<GuidedTourSettings>(this.resourceUrl, this.guidedTourSettings, { observe: 'response' });
    }

    /**
     * Checks if the current component has a guided tour by comparing the current router url to manually defined urls
     * that provide tours.
     * @return true if a guided tour is available
     */
    public checkGuidedTourAvailabilityForCurrentRoute(): boolean {
        if (this.router.url === '/overview') {
            return true;
        }
        return false;
    }

    /**
     * Starts the guided tour of the current component
     * */
    public startGuidedTourForCurrentRoute() {
        if (this.router.url === '/overview') {
            this.getOverviewTour().subscribe(tour => {
                this.startTour(tour);
            });
        }
    }

    public enableGuidedTourForExercise(exercise: Exercise | null, tour: GuidedTour) {
        setTimeout(() => {
            this.startTour(tour);
        }, 1000);
    }
}
