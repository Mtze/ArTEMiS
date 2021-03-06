package de.tum.in.www1.artemis.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import de.tum.in.www1.artemis.domain.modeling.ModelingSubmission;

/**
 * Spring Data JPA repository for the ModelingSubmission entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ModelingSubmissionRepository extends JpaRepository<ModelingSubmission, Long> {

    @Query("select distinct submission from ModelingSubmission submission left join fetch submission.result r left join fetch r.assessor where submission.id = :#{#submissionId}")
    Optional<ModelingSubmission> findByIdWithEagerResult(@Param("submissionId") Long submissionId);

    @Query("select distinct submission from ModelingSubmission submission left join fetch submission.result r left join fetch r.feedbacks left join fetch r.assessor where submission.id = :#{#submissionId}")
    Optional<ModelingSubmission> findByIdWithEagerResultAndFeedback(@Param("submissionId") Long submissionId);

    /**
     * Load the modeling submission with the given id together with its result, the feedback list of the result, the assessor of the result, its participation and all results of
     * the participation.
     *
     * @param submissionId the id of the modeling submission that should be loaded from the database
     * @return the modeling submission with its result, the feedback list of the result, the assessor of the result, its participation and all results of the participation
     */
    @EntityGraph(attributePaths = { "result", "result.feedbacks", "result.assessor", "participation", "participation.results" })
    Optional<ModelingSubmission> findWithEagerResultAndFeedbackAndAssessorAndParticipationResultsById(Long submissionId);

    /**
     * Load all modeling submissions with the given ids. Load every submission together with its result, the feedback list of the result, the assessor of the result, its
     * participation and all results of the participation.
     *
     * @param submissionIds the ids of the modeling submissions that should be loaded from the database
     * @return the list of modeling submissions with their results, the feedback list of the results, the assessor of the results, their participation and all results of the
     *         participations
     */
    @EntityGraph(attributePaths = { "result", "result.feedbacks", "result.assessor", "participation", "participation.results" })
    List<ModelingSubmission> findWithEagerResultAndFeedbackAndAssessorAndParticipationResultsByIdIn(Collection<Long> submissionIds);

    @Query("select distinct submission from ModelingSubmission submission left join fetch submission.result r left join fetch r.feedbacks where submission.participation.exercise.id = :#{#exerciseId} and submission.submitted = true")
    List<ModelingSubmission> findSubmittedByExerciseIdWithEagerResultsAndFeedback(@Param("exerciseId") Long exerciseId);

    @Query("select distinct submission from ModelingSubmission submission left join fetch submission.result r left join fetch r.feedbacks where submission.exampleSubmission = true and submission.id = :#{#submissionId}")
    Optional<ModelingSubmission> findExampleSubmissionByIdWithEagerResult(@Param("submissionId") Long submissionId);

    /**
     * @param courseId  the course we are interested in
     * @param submitted boolean to check if an exercise has been submitted or not
     * @return number of submissions belonging to courseId with submitted status
     */
    long countByParticipation_Exercise_Course_IdAndSubmitted(Long courseId, boolean submitted);

    /**
     * @param courseId the course id we are interested in
     * @return the number of submissions belonging to the course id, which have the submitted flag set to true and the submission date before the exercise due date, or no exercise
     *         due date at all
     */
    @Query("SELECT COUNT (DISTINCT submission) FROM ModelingSubmission submission WHERE submission.participation.exercise.course.id = :#{#courseId} AND submission.submitted = TRUE AND (submission.submissionDate < submission.participation.exercise.dueDate OR submission.participation.exercise.dueDate IS NULL)")
    long countByCourseIdSubmittedBeforeDueDate(@Param("courseId") Long courseId);

    /**
     * @param exerciseId the exercise id we are interested in
     * @return the number of submissions belonging to the exercise id, which have the submitted flag set to true and the submission date before the exercise due date, or no
     *         exercise due date at all
     */
    @Query("SELECT COUNT (DISTINCT submission) FROM ModelingSubmission submission WHERE submission.participation.exercise.id = :#{#exerciseId} AND submission.submitted = TRUE AND (submission.submissionDate < submission.participation.exercise.dueDate OR submission.participation.exercise.dueDate IS NULL)")
    long countByExerciseIdSubmittedBeforeDueDate(@Param("exerciseId") Long exerciseId);
}
