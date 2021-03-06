/* tslint:disable max-line-length */
import { getTestBed, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { map, take } from 'rxjs/operators';
import * as moment from 'moment';
import { DATE_TIME_FORMAT } from 'app/shared/constants/input.constants';
import { ExerciseResultService } from 'app/entities/exercise-result/exercise-result.service';
import { AssessmentType, ExerciseResult, IExerciseResult } from 'app/shared/model/exercise-result.model';

describe('Service Tests', () => {
    describe('ExerciseResult Service', () => {
        let injector: TestBed;
        let service: ExerciseResultService;
        let httpMock: HttpTestingController;
        let elemDefault: IExerciseResult;
        let currentDate: moment.Moment;
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
            });
            injector = getTestBed();
            service = injector.get(ExerciseResultService);
            httpMock = injector.get(HttpTestingController);
            currentDate = moment();

            elemDefault = new ExerciseResult(0, 'AAAAAAA', currentDate, false, false, 0, false, false, AssessmentType.AUTOMATIC);
        });

        describe('Service methods', async () => {
            it('should find an element', async () => {
                const returnedFromService = Object.assign(
                    {
                        completionDate: currentDate.format(DATE_TIME_FORMAT),
                    },
                    elemDefault,
                );
                service
                    .find(123)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: elemDefault }));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should create a ExerciseResult', async () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0,
                        completionDate: currentDate.format(DATE_TIME_FORMAT),
                    },
                    elemDefault,
                );
                const expected = Object.assign(
                    {
                        completionDate: currentDate,
                    },
                    returnedFromService,
                );
                service
                    .create(new ExerciseResult(null))
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should update a ExerciseResult', async () => {
                const returnedFromService = Object.assign(
                    {
                        resultString: 'BBBBBB',
                        completionDate: currentDate.format(DATE_TIME_FORMAT),
                        successful: true,
                        buildArtifact: true,
                        score: 1,
                        rated: true,
                        hasFeedback: true,
                        assessmentType: 'BBBBBB',
                    },
                    elemDefault,
                );

                const expected = Object.assign(
                    {
                        completionDate: currentDate,
                    },
                    returnedFromService,
                );
                service
                    .update(expected)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should return a list of ExerciseResult', async () => {
                const returnedFromService = Object.assign(
                    {
                        resultString: 'BBBBBB',
                        completionDate: currentDate.format(DATE_TIME_FORMAT),
                        successful: true,
                        buildArtifact: true,
                        score: 1,
                        rated: true,
                        hasFeedback: true,
                        assessmentType: 'BBBBBB',
                    },
                    elemDefault,
                );
                const expected = Object.assign(
                    {
                        completionDate: currentDate,
                    },
                    returnedFromService,
                );
                service
                    .query(expected)
                    .pipe(
                        take(1),
                        map(resp => resp.body),
                    )
                    .subscribe(body => expect(body).toContainEqual(expected));
                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify([returnedFromService]));
                httpMock.verify();
            });

            it('should delete a ExerciseResult', async () => {
                const rxPromise = service.delete(123).subscribe(resp => expect(resp.ok));

                const req = httpMock.expectOne({ method: 'DELETE' });
                req.flush({ status: 200 });
            });
        });

        afterEach(() => {
            httpMock.verify();
        });
    });
});
