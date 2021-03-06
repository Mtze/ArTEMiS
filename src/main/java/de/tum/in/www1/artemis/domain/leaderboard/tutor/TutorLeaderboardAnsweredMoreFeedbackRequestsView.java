package de.tum.in.www1.artemis.domain.leaderboard.tutor;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "view_tutor_leaderboard_answered_more_feedback_requests")
@Immutable
public class TutorLeaderboardAnsweredMoreFeedbackRequestsView {

    @EmbeddedId
    private LeaderboardId leaderboardId;

    @Column(name = "answered_requests")
    private Long answeredRequests;

    @Column(name = "points")
    private Long points;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "first_name")
    private String userFirstName;

    public Long getAnsweredRequests() {
        return answeredRequests;
    }

    public Long getPoints() {
        return points;
    }

    public Long getUserId() {
        return leaderboardId.getUserId();
    }

    public Long getCourseId() {
        return courseId;
    }

    public Long getExerciseId() {
        return leaderboardId.getExerciseId();
    }

    public String getUserFirstName() {
        return userFirstName;
    }
}
