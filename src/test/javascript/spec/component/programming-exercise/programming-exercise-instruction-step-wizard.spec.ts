import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { DebugElement } from '@angular/core';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as moment from 'moment';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ArtemisTestModule } from '../../test.module';
import { ArtemisSharedModule } from 'src/main/webapp/app/shared';
import { ProgrammingExerciseInstructionStepWizardComponent } from 'app/entities/programming-exercise/instructions/instructions-render/step-wizard/programming-exercise-instruction-step-wizard.component';
import { ProgrammingExerciseInstructionService } from 'app/entities/programming-exercise/instructions/instructions-render/service/programming-exercise-instruction.service';
import { triggerChanges } from '../../utils/general.utils';

chai.use(sinonChai);
const expect = chai.expect;

describe('ProgrammingExerciseInstructionStepWizard', () => {
    let comp: ProgrammingExerciseInstructionStepWizardComponent;
    let fixture: ComponentFixture<ProgrammingExerciseInstructionStepWizardComponent>;
    let debugElement: DebugElement;

    let programmingExerciseInstructionService: ProgrammingExerciseInstructionService;

    const stepWizardStep = '.stepwizard-step';

    beforeEach(async () => {
        return TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ArtemisTestModule, ArtemisSharedModule, NgbModule],
            declarations: [ProgrammingExerciseInstructionStepWizardComponent],
            providers: [ProgrammingExerciseInstructionService],
        })
            .overrideModule(BrowserDynamicTestingModule, { set: { entryComponents: [FaIconComponent] } })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(ProgrammingExerciseInstructionStepWizardComponent);
                comp = fixture.componentInstance;
                debugElement = fixture.debugElement;

                programmingExerciseInstructionService = debugElement.injector.get(ProgrammingExerciseInstructionService);
            });
    });

    afterEach(() => {});

    it('Should load the expected number of steps according to the provided tests', () => {
        const result = {
            id: 1,
            completionDate: moment('2019-01-06T22:15:29.203+02:00'),
            feedbacks: [{ text: 'testBubbleSort', detail_text: 'lorem ipsum' }],
        } as any;
        const tasks = [
            { completeString: '[task][Implement BubbleSort](testBubbleSort)', taskName: 'Implement BubbleSort', tests: ['testBubbleSort'] },
            { completeString: '[task][Implement MergeSort](testMergeSort)', taskName: 'Implement MergeSort', tests: ['testMergeSort'] },
        ];
        comp.latestResult = result;
        comp.tasks = tasks;

        triggerChanges(comp, { property: 'tasks', currentValue: tasks }, { property: 'latestResult', currentValue: result });
        fixture.detectChanges();

        const steps = debugElement.queryAll(By.css(stepWizardStep));
        expect(steps).to.have.lengthOf(2);

        // BubbleSort has a failed icon.
        expect(steps[0].query(By.css('.text-danger'))).to.exist;
        // MergeSort has a success icon.
        expect(steps[1].query(By.css('.text-success'))).to.exist;
    });

    it('Should not show any icons for empty tasks list', () => {
        const result = {
            id: 1,
            completionDate: moment('2019-01-06T22:15:29.203+02:00'),
            feedbacks: [{ text: 'testBubbleSort', detail_text: 'lorem ipsum' }],
        } as any;
        comp.latestResult = result;
        comp.tasks = [];

        triggerChanges(comp, { property: 'tasks', currentValue: [] }, { property: 'latestResult', currentValue: result });
        fixture.detectChanges();

        const steps = debugElement.queryAll(By.css(stepWizardStep));
        expect(steps).to.have.lengthOf(0);
    });
});
