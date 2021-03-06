import { NgModule } from '@angular/core';
import { JhiAlertService } from 'ng-jhipster';

import { ArtemisSharedModule } from '../../shared';
import { RepositoryService } from '../../entities/repository/repository.service';
import { HomeComponent } from '../../home';
import { JhiMainComponent } from '../../layouts';
import { QuizComponent } from '../participate/quiz.component';
import { QuizExerciseComponent } from '../../entities/quiz-exercise';
import { AngularFittextModule } from 'angular-fittext';
import { AceEditorModule } from 'ng2-ace-editor';
import { DndModule } from 'ng2-dnd';
import { ArtemisQuizModule } from '../participate';
import { ArtemisQuizEditModule } from '../edit';
import { QuizReEvaluateComponent } from './quiz-re-evaluate.component';
import { ReEvaluateMultipleChoiceQuestionComponent } from './multiple-choice-question/re-evaluate-multiple-choice-question.component';
import { ReEvaluateDragAndDropQuestionComponent } from './drag-and-drop-question/re-evaluate-drag-and-drop-question.component';
import { ReEvaluateShortAnswerQuestionComponent } from './short-answer-question/re-evaluate-short-answer-question.component';
import { QuizReEvaluateWarningComponent } from './quiz-re-evaluate-warning.component';
import { QuizReEvaluateService } from './quiz-re-evaluate.service';

@NgModule({
    imports: [ArtemisSharedModule, DndModule.forRoot(), AngularFittextModule, AceEditorModule, ArtemisQuizModule, ArtemisQuizEditModule],
    declarations: [
        QuizReEvaluateComponent,
        ReEvaluateMultipleChoiceQuestionComponent,
        ReEvaluateDragAndDropQuestionComponent,
        ReEvaluateShortAnswerQuestionComponent,
        QuizReEvaluateWarningComponent,
    ],
    entryComponents: [HomeComponent, QuizComponent, QuizExerciseComponent, JhiMainComponent, QuizReEvaluateWarningComponent],
    providers: [RepositoryService, JhiAlertService, QuizReEvaluateService],
    exports: [
        QuizReEvaluateComponent,
        ReEvaluateMultipleChoiceQuestionComponent,
        ReEvaluateDragAndDropQuestionComponent,
        ReEvaluateShortAnswerQuestionComponent,
        QuizReEvaluateWarningComponent,
    ],
})
export class ArtemisQuizReEvaluateModule {}
