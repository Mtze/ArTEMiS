import { Component, HostBinding, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Course } from 'app/entities/course';
import { ActivatedRoute, Router } from '@angular/router';
import { Lecture } from 'app/entities/lecture';

@Component({
    selector: 'jhi-course-lecture-row',
    templateUrl: './course-lecture-row.component.html',
    styleUrls: ['../course-exercises/course-exercise-row.scss'],
})
export class CourseLectureRowComponent implements OnInit {
    @HostBinding('class') classes = 'exercise-row';
    @Input() lecture: Lecture;
    @Input() course: Course;
    @Input() extendedLink = false;

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {}

    getUrgentClass(date: Moment): string {
        if (!date) {
            return;
        }
        const remainingDays = date.diff(moment(), 'days');
        if (0 <= remainingDays && remainingDays < 7) {
            return 'text-danger';
        } else {
            return;
        }
    }

    showDetails(event: any) {
        const lectureToAttach = {
            ...this.lecture,
            startDate: this.lecture.startDate.valueOf(),
            endDate: this.lecture.endDate.valueOf(),
            course: {
                id: this.course.id,
            },
        };
        if (this.extendedLink) {
            this.router.navigate(['overview', this.course.id, 'lectures', this.lecture.id], {
                state: {
                    lecture: lectureToAttach,
                },
            });
        } else {
            this.router.navigate([this.lecture.id], {
                relativeTo: this.route,
                state: {
                    lecture: lectureToAttach,
                },
            });
        }
    }
}