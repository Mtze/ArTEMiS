import { NgModule } from '@angular/core';

import { ArtemisSharedModule } from 'app/shared';
import { ArtemisColorSelectorModule } from 'app/components/color-selector/color-selector.module';
import { TagInputModule } from 'ngx-chips';
import { ReactiveFormsModule } from '@angular/forms';
import { CourseRegistrationSelectorComponent } from 'app/components/course-registration-selector/course-registration-selector.component';

@NgModule({
    imports: [ArtemisSharedModule, ArtemisColorSelectorModule, ReactiveFormsModule, TagInputModule],
    declarations: [CourseRegistrationSelectorComponent],
    exports: [CourseRegistrationSelectorComponent],
})
export class ArtemisCourseRegistrationSelector {}
