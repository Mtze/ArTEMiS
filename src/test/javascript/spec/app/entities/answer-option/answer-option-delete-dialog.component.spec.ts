/* tslint:disable max-line-length */
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { JhiEventManager } from 'ng-jhipster';

import { ArtemisTestModule } from '../../../test.module';
import { AnswerOptionDeleteDialogComponent } from 'app/entities/answer-option/answer-option-delete-dialog.component';
import { AnswerOptionService } from 'app/entities/answer-option/answer-option.service';

describe('Component Tests', () => {
    describe('AnswerOption Management Delete Component', () => {
        let comp: AnswerOptionDeleteDialogComponent;
        let fixture: ComponentFixture<AnswerOptionDeleteDialogComponent>;
        let service: AnswerOptionService;
        let mockEventManager: any;
        let mockActiveModal: any;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [ArtemisTestModule],
                declarations: [AnswerOptionDeleteDialogComponent],
            })
                .overrideTemplate(AnswerOptionDeleteDialogComponent, '')
                .compileComponents();
            fixture = TestBed.createComponent(AnswerOptionDeleteDialogComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(AnswerOptionService);
            mockEventManager = fixture.debugElement.injector.get(JhiEventManager);
            mockActiveModal = fixture.debugElement.injector.get(NgbActiveModal);
        });

        describe('confirmDelete', () => {
            it('Should call delete service on confirmDelete', inject(
                [],
                fakeAsync(() => {
                    // GIVEN
                    spyOn(service, 'delete').and.returnValue(of({}));

                    // WHEN
                    comp.confirmDelete(123);
                    tick();

                    // THEN
                    expect(service.delete).toHaveBeenCalledWith(123);
                    expect(mockActiveModal.dismissSpy).toHaveBeenCalled();
                    expect(mockEventManager.broadcastSpy).toHaveBeenCalled();
                }),
            ));
        });
    });
});
