import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ArtemisSharedModule } from 'app/shared';
import {
    ProgrammingExerciseArchiveDialogComponent,
    ProgrammingExerciseArchivePopupComponent,
    ProgrammingExerciseCleanupDialogComponent,
    ProgrammingExerciseCleanupPopupComponent,
    ProgrammingExerciseComponent,
    ProgrammingExerciseDeleteDialogComponent,
    ProgrammingExerciseDeletePopupComponent,
    ProgrammingExerciseDetailComponent,
    ProgrammingExerciseDialogComponent,
    ProgrammingExerciseParticipationService,
    ProgrammingExercisePopupComponent,
    programmingExercisePopupRoute,
    ProgrammingExercisePopupService,
    programmingExerciseRoute,
    ProgrammingExerciseService,
    ProgrammingExerciseTestCaseService,
    ProgrammingExerciseUpdateComponent,
    ProgrammingExerciseImportComponent,
} from './';
import { SortByModule } from 'app/components/pipes';
import { FormDateTimePickerModule } from 'app/shared/date-time-picker/date-time-picker.module';
import { ArtemisCategorySelectorModule } from 'app/components/category-selector/category-selector.module';
import { ArtemisDifficultyPickerModule } from 'app/components/exercise/difficulty-picker/difficulty-picker.module';
import { ArtemisResultModule } from 'app/entities/result';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ArtemisProgrammingExerciseTestCaseModule } from 'app/entities/programming-exercise/test-cases/programming-exercise-test-case.module';
import { ArtemisProgrammingExerciseInstructionsEditorModule } from 'app/entities/programming-exercise/instructions/instructions-editor';
import { ArtemisProgrammingExerciseStatusModule } from 'app/entities/programming-exercise/status';
import { ArtemisProgrammingExerciseActionsModule } from 'app/entities/programming-exercise/actions/programming-exercise-actions.module';
import { ProgrammingExerciseDueDateSelectComponent } from 'app/entities/programming-exercise/form';
import { ArtemisSharedComponentModule } from 'app/shared/components/shared-component.module';

const ENTITY_STATES = [...programmingExerciseRoute, ...programmingExercisePopupRoute];

@NgModule({
    imports: [
        // Shared modules.
        ArtemisSharedModule,
        RouterModule.forChild(ENTITY_STATES),
        SortByModule,
        FormDateTimePickerModule,
        ArtemisCategorySelectorModule,
        ArtemisDifficultyPickerModule,
        // Programming exercise sub modules.
        ArtemisProgrammingExerciseInstructionsEditorModule,
        ArtemisProgrammingExerciseStatusModule,
        ArtemisProgrammingExerciseActionsModule,
        ArtemisProgrammingExerciseTestCaseModule,
        // Other entity modules.
        ArtemisResultModule,
        ArtemisSharedComponentModule,
    ],
    declarations: [
        ProgrammingExerciseComponent,
        ProgrammingExerciseDetailComponent,
        ProgrammingExerciseUpdateComponent,
        ProgrammingExerciseDialogComponent,
        ProgrammingExerciseDeleteDialogComponent,
        ProgrammingExercisePopupComponent,
        ProgrammingExerciseDeletePopupComponent,
        ProgrammingExerciseArchiveDialogComponent,
        ProgrammingExerciseArchivePopupComponent,
        ProgrammingExerciseCleanupDialogComponent,
        ProgrammingExerciseCleanupPopupComponent,
        ProgrammingExerciseImportComponent,
        // Form components
        ProgrammingExerciseDueDateSelectComponent,
    ],
    entryComponents: [
        ProgrammingExerciseComponent,
        ProgrammingExerciseDialogComponent,
        ProgrammingExerciseUpdateComponent,
        ProgrammingExercisePopupComponent,
        ProgrammingExerciseDeleteDialogComponent,
        ProgrammingExerciseDeletePopupComponent,
        ProgrammingExerciseArchiveDialogComponent,
        ProgrammingExerciseArchivePopupComponent,
        ProgrammingExerciseCleanupDialogComponent,
        ProgrammingExerciseCleanupPopupComponent,
        ProgrammingExerciseImportComponent,
        FaIconComponent,
    ],
    exports: [ProgrammingExerciseComponent, ArtemisProgrammingExerciseInstructionsEditorModule, ArtemisProgrammingExerciseActionsModule],
    providers: [ProgrammingExerciseService, ProgrammingExerciseTestCaseService, ProgrammingExercisePopupService, ProgrammingExerciseParticipationService],
})
export class ArtemisProgrammingExerciseModule {}
