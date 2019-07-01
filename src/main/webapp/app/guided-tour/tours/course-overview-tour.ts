import { GuidedTour, Orientation } from 'app/guided-tour/guided-tour.constants';

export const courseOverviewTour: GuidedTour = {
    tourId: 'course-overview-tour',
    useOrb: false,
    minimumScreenSize: 600,
    steps: [
        {
            title: 'Welcome to Artemis',
            titleTranslateKey: 'tour.course-overview.1.title',
            content: 'Artemis is a learning platform where you can solve programming exercises in interactive learning sessions.',
            contentTranslateKey: 'tour.course-overview.1.content',
        },
        {
            title: 'Course overview',
            titleTranslateKey: 'tour.course-overview.2.title',
            content: 'On this page you can see an overview of all courses which you are signed up for.',
            contentTranslateKey: 'tour.course-overview.2.content',
            selector: '#overview-menu',
            orientation: Orientation.BottomLeft,
        },
        {
            title: 'Your current courses',
            titleTranslateKey: 'tour.course-overview.3.title',
            content: 'This is a course you are signed up to. Please check out the course details afterwards by clicking on the panel.',
            contentTranslateKey: 'tour.course-overview.3.content',
            selector: '.card-header',
            orientation: Orientation.Right,
        },
        {
            title: 'Next due exercise',
            titleTranslateKey: 'tour.course-overview.4.title',
            content: 'See what exercise has to be completed in the next few days.',
            contentTranslateKey: 'tour.course-overview.4.content',
            selector: '.card-footer',
            orientation: Orientation.Right,
        },
        {
            title: 'Sign up for other courses',
            titleTranslateKey: 'tour.course-overview.5.title',
            content: 'You can click here and see whether you can sign up for other courses additionally.',
            contentTranslateKey: 'tour.course-overview.5.content',
            selector: 'jhi-course-registration-selector button',
            orientation: Orientation.Left,
            useHighlightPadding: true,
            highlightPadding: 10,
        },
        {
            title: 'Your notifications',
            titleTranslateKey: 'tour.course-overview.6.title',
            content: 'Get notified about new exercises from this notification dropdown.',
            contentTranslateKey: 'tour.course-overview.6.content',
            selector: '#notificationsNavBarDropdown',
            orientation: Orientation.Left,
            useHighlightPadding: true,
            highlightPadding: 10,
        },
        {
            title: 'Personal settings',
            titleTranslateKey: 'tour.course-overview.7.title',
            content: 'In your account menu you can change your display language and restart the guided tour at any other time.',
            contentTranslateKey: 'tour.course-overview.7.content',
            selector: '#account-menu',
            orientation: Orientation.Left,
            useHighlightPadding: true,
            highlightPadding: 10,
        },
        {
            title: 'Contact the Artemis team',
            titleTranslateKey: 'tour.course-overview.8.title',
            content: 'Feel free to contact us to leave us some feedback, request features or to report bugs in the application.',
            contentTranslateKey: 'tour.course-overview.8.content',
            selector: '.footer .col-sm-6',
            orientation: Orientation.TopLeft,
        },
    ],
};
