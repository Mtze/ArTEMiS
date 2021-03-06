import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizExercise, QuizExerciseService } from 'app/entities/quiz-exercise';
import { QuizStatisticUtil } from 'app/components/util/quiz-statistic-util.service';
import { QuizQuestion, QuizQuestionType } from 'app/entities/quiz-question';
import { MultipleChoiceQuestionStatistic } from 'app/entities/multiple-choice-question-statistic';
import { ShortAnswerQuestionUtil } from 'app/components/util/short-answer-question-util.service';
import { QuizPointStatistic } from 'app/entities/quiz-point-statistic';
import { ArtemisMarkdown } from 'app/components/util/markdown.service';
import { AccountService, JhiWebsocketService } from 'app/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { HttpResponse } from '@angular/common/http';
import * as moment from 'moment';

@Component({
    selector: 'jhi-quiz-statistics-footer',
    templateUrl: './quiz-statistics-footer.component.html',
    providers: [QuizStatisticUtil, ShortAnswerQuestionUtil, ArtemisMarkdown],
    styleUrls: ['./quiz-statistics-footer.component.scss', '../../../quiz.scss'],
})
export class QuizStatisticsFooterComponent implements OnInit, OnDestroy {
    @Input() isQuizPointStatistic: boolean;
    @Input() isQuizStatistic: boolean;

    readonly DRAG_AND_DROP = QuizQuestionType.DRAG_AND_DROP;
    readonly MULTIPLE_CHOICE = QuizQuestionType.MULTIPLE_CHOICE;
    readonly SHORT_ANSWER = QuizQuestionType.SHORT_ANSWER;

    quizExercise: QuizExercise;
    question: QuizQuestion;
    quizPointStatistic: QuizPointStatistic;
    questionStatistic: MultipleChoiceQuestionStatistic;
    questionIdParam: number;
    private sub: Subscription;
    private websocketChannelForData: string;
    // timer
    waitingForQuizStart = false;
    remainingTimeText = '?';
    remainingTimeSeconds = 0;
    interval: any;
    disconnected = true;
    onConnected: () => void;
    onDisconnected: () => void;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private translateService: TranslateService,
        private quizExerciseService: QuizExerciseService,
        private quizStatisticUtil: QuizStatisticUtil,
        private jhiWebsocketService: JhiWebsocketService,
    ) {}

    ngOnInit() {
        this.sub = this.route.params.subscribe(params => {
            this.questionIdParam = +params['questionId'];
            if (this.accountService.hasAnyAuthorityDirect(['ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_TA'])) {
                this.quizExerciseService.find(params['quizId']).subscribe((res: HttpResponse<QuizExercise>) => {
                    this.loadQuiz(res.body!);
                });
            }

            // listen to connect / disconnect events
            this.onConnected = () => {
                this.disconnected = false;
            };
            this.jhiWebsocketService.bind('connect', () => {
                this.onConnected();
            });
            this.onDisconnected = () => {
                this.disconnected = true;
            };
            this.jhiWebsocketService.bind('disconnect', () => {
                this.onDisconnected();
            });
        });

        // update displayed times in UI regularly
        this.interval = setInterval(() => {
            this.updateDisplayedTimes();
        }, 200);
    }

    /**
     * updates all displayed (relative) times in the UI
     */
    updateDisplayedTimes() {
        const translationBasePath = 'showStatistic.';
        // update remaining time
        if (this.quizExercise && this.quizExercise.adjustedDueDate) {
            const endDate = this.quizExercise.adjustedDueDate;
            if (endDate.isAfter(moment())) {
                // quiz is still running => calculate remaining seconds and generate text based on that
                this.remainingTimeSeconds = endDate.diff(moment(), 'seconds');
                this.remainingTimeText = this.relativeTimeText(this.remainingTimeSeconds);
            } else {
                // quiz is over => set remaining seconds to negative, to deactivate 'Submit' button
                this.remainingTimeSeconds = -1;
                this.remainingTimeText = this.translateService.instant(translationBasePath + 'quizhasEnded');
            }
        } else {
            // remaining time is unknown => Set remaining seconds to 0, to keep 'Submit' button enabled
            this.remainingTimeSeconds = 0;
            this.remainingTimeText = '?';
        }
    }

    /**
     * Express the given timespan as humanized text
     *
     * @param remainingTimeSeconds {number} the amount of seconds to display
     * @return {string} humanized text for the given amount of seconds
     */
    relativeTimeText(remainingTimeSeconds: number) {
        if (remainingTimeSeconds > 210) {
            return Math.ceil(remainingTimeSeconds / 60) + ' min';
        } else if (remainingTimeSeconds > 59) {
            return Math.floor(remainingTimeSeconds / 60) + ' min ' + (remainingTimeSeconds % 60) + ' s';
        } else {
            return remainingTimeSeconds + ' s';
        }
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.jhiWebsocketService.unsubscribe(this.websocketChannelForData);
        if (this.onConnected) {
            this.jhiWebsocketService.unbind('connect', this.onConnected);
        }
        if (this.onDisconnected) {
            this.jhiWebsocketService.unbind('disconnect', this.onDisconnected);
        }
    }

    /**
     * This functions loads the Quiz, which is necessary to build the Web-Template
     * And it loads the new Data if the Websocket has been notified
     *
     * @param {QuizExercise} quiz: the quizExercise, which the this quiz-statistic presents.
     */
    loadQuiz(quiz: QuizExercise) {
        // if the Student finds a way to the Website -> the Student will be send back to Courses
        if (!this.accountService.hasAnyAuthorityDirect(['ROLE_ADMIN', 'ROLE_INSTRUCTOR', 'ROLE_TA'])) {
            this.router.navigate(['/courses']);
        }
        this.quizExercise = quiz;
        const updatedQuestion = this.quizExercise.quizQuestions.filter(question => this.questionIdParam === question.id)[0];
        this.question = updatedQuestion as QuizQuestion;
        this.quizExercise.adjustedDueDate = moment().add(this.quizExercise.remainingTime, 'seconds');
        this.waitingForQuizStart = !this.quizExercise.started;
    }

    /**
     * This function navigates to the previous quiz question statistic.
     * If the current page shows the first quiz question statistic then it will navigate to the quiz statistic
     */
    previousStatistic() {
        if (this.isQuizStatistic) {
            this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/quiz-point-statistic`);
        } else if (this.isQuizPointStatistic) {
            if (this.quizExercise.quizQuestions === null || this.quizExercise.quizQuestions.length === 0) {
                this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/quiz-statistic`);
            } else {
                const previousQuestion = this.quizExercise.quizQuestions[this.quizExercise.quizQuestions.length - 1];
                if (previousQuestion.type === QuizQuestionType.MULTIPLE_CHOICE) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/multiple-choice-question-statistic/${previousQuestion.id}`);
                } else if (previousQuestion.type === QuizQuestionType.DRAG_AND_DROP) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/drag-and-drop-question-statistic/${previousQuestion.id}`);
                } else if (previousQuestion.type === QuizQuestionType.SHORT_ANSWER) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/short-answer-question-statistic/${previousQuestion.id}`);
                }
            }
        } else {
            this.quizStatisticUtil.previousStatistic(this.quizExercise, this.question);
        }
    }

    /**
     * This function navigates to the next quiz question statistic.
     * If the current page shows the last quiz question statistic then it will navigate to the quiz point statistic
     */
    nextStatistic() {
        if (this.isQuizPointStatistic) {
            this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/quiz-statistic`);
        } else if (this.isQuizStatistic) {
            // go to quiz-statistic if the position = last position
            if (this.quizExercise.quizQuestions === null || this.quizExercise.quizQuestions.length === 0) {
                this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/quiz-point-statistic`);
            } else {
                // go to next question-statistic
                const nextQuestion = this.quizExercise.quizQuestions[0];
                if (nextQuestion.type === QuizQuestionType.MULTIPLE_CHOICE) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/multiple-choice-question-statistic/${nextQuestion.id}`);
                } else if (nextQuestion.type === QuizQuestionType.DRAG_AND_DROP) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/drag-and-drop-question-statistic/${nextQuestion.id}`);
                } else if (nextQuestion.type === QuizQuestionType.SHORT_ANSWER) {
                    this.router.navigateByUrl(`/quiz/${this.quizExercise.id}/short-answer-question-statistic/${nextQuestion.id}`);
                }
            }
        } else {
            this.quizStatisticUtil.nextStatistic(this.quizExercise, this.question);
        }
    }
}
