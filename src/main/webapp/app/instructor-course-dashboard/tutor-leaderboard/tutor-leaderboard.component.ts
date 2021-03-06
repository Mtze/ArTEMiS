import { Component, Input, OnInit } from '@angular/core';
import { TutorLeaderboardElement } from 'app/instructor-course-dashboard/tutor-leaderboard/tutor-leaderboard.model';
import { Course } from 'app/entities/course';
import { Exercise } from 'app/entities/exercise';
import { AccountService } from 'app/core';

@Component({
    selector: 'jhi-tutor-leaderboard',
    templateUrl: './tutor-leaderboard.component.html',
})
export class TutorLeaderboardComponent implements OnInit {
    @Input() public tutorsData: TutorLeaderboardElement[] = [];
    @Input() public course?: Course;
    @Input() public exercise?: Exercise;

    isAtLeastInstructor = false;

    sortPredicate = 'points';
    reverseOrder = false;

    constructor(private accountService: AccountService) {}

    ngOnInit(): void {
        if (this.course) {
            this.isAtLeastInstructor = this.accountService.isAtLeastInstructorInCourse(this.course);
        }
        if (this.exercise && this.exercise.course) {
            this.isAtLeastInstructor = this.accountService.isAtLeastInstructorInCourse(this.exercise.course);
        }
    }

    callback() {}
}
