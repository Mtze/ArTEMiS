/* tslint:disable max-line-length */
import { getTestBed, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { map, take } from 'rxjs/operators';
import { ShortAnswerSpotService } from 'app/entities/short-answer-spot/short-answer-spot.service';
import { IShortAnswerSpot, ShortAnswerSpot } from 'app/entities/short-answer-spot/short-answer-spot.model';

describe('Service Tests', () => {
    describe('ShortAnswerSpot Service', () => {
        let injector: TestBed;
        let service: ShortAnswerSpotService;
        let httpMock: HttpTestingController;
        let elemDefault: IShortAnswerSpot;
        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
            });
            injector = getTestBed();
            service = injector.get(ShortAnswerSpotService);
            httpMock = injector.get(HttpTestingController);

            elemDefault = new ShortAnswerSpot(0, 0, false);
        });

        describe('Service methods', async () => {
            it('should find an element', async () => {
                const returnedFromService = Object.assign({}, elemDefault);
                service
                    .find(123)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: elemDefault }));

                const req = httpMock.expectOne({ method: 'GET' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should create a ShortAnswerSpot', async () => {
                const returnedFromService = Object.assign(
                    {
                        id: 0,
                    },
                    elemDefault,
                );
                const expected = Object.assign({}, returnedFromService);
                service
                    .create(new ShortAnswerSpot(null))
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'POST' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should update a ShortAnswerSpot', async () => {
                const returnedFromService = Object.assign(
                    {
                        width: 1,
                        invalid: true,
                    },
                    elemDefault,
                );

                const expected = Object.assign({}, returnedFromService);
                service
                    .update(expected)
                    .pipe(take(1))
                    .subscribe(resp => expect(resp).toMatchObject({ body: expected }));
                const req = httpMock.expectOne({ method: 'PUT' });
                req.flush(JSON.stringify(returnedFromService));
            });

            it('should return a list of ShortAnswerSpot', async () => {
                const returnedFromService = Object.assign(
                    {
                        width: 1,
                        invalid: true,
                    },
                    elemDefault,
                );
                const expected = Object.assign({}, returnedFromService);
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

            it('should delete a ShortAnswerSpot', async () => {
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
