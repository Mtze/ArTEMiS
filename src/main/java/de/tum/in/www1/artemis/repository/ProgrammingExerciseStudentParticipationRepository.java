package de.tum.in.www1.artemis.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import de.tum.in.www1.artemis.domain.ProgrammingExerciseStudentParticipation;
import de.tum.in.www1.artemis.domain.enumeration.InitializationState;

/**
 * Spring Data JPA repository for the Participation entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProgrammingExerciseStudentParticipationRepository extends JpaRepository<ProgrammingExerciseStudentParticipation, Long> {

    @EntityGraph(attributePaths = "results.feedbacks")
    @Query("select p from ProgrammingExerciseStudentParticipation p left join p.results pr where p.id = :participationId and (pr.id = (select max(id) from p.results) or pr.id = null)")
    Optional<ProgrammingExerciseStudentParticipation> findByIdWithLatestResultAndFeedbacks(@Param("participationId") Long participationId);

    @EntityGraph(attributePaths = "results")
    List<ProgrammingExerciseStudentParticipation> findByBuildPlanIdAndInitializationState(String buildPlanId, InitializationState state);

    // TODO: at the moment we don't want to consider online courses due to some legacy programming exercises where the VCS repo does not notify Artemis that there is a new
    // submission). In the future we can deactivate the last part.
    @Query("select distinct participation from Participation participation left join fetch participation.results where participation.buildPlanId is not null and participation.student is not null and participation.exercise.course.onlineCourse = false")
    List<ProgrammingExerciseStudentParticipation> findAllWithBuildPlanId();

    Optional<ProgrammingExerciseStudentParticipation> findByExerciseIdAndStudentLogin(Long exerciseId, String username);

    List<ProgrammingExerciseStudentParticipation> findByExerciseId(Long exerciseId);

    /**
     * Will return the participations matching the provided participation ids, but only if they belong to the given exercise.
     *
     * @param exerciseId is used as a filter for the found participations.
     * @param participationIds the participations to retrieve.
     * @return filtered list of participations.
     */
    @Query("select participation from ProgrammingExerciseStudentParticipation participation where participation.exercise.id = :#{#exerciseId} and participation.id in :#{#participationIds}")
    List<ProgrammingExerciseStudentParticipation> findByExerciseIdAndParticipationIds(@Param("exerciseId") Long exerciseId,
            @Param("participationIds") Collection<Long> participationIds);

    @EntityGraph(attributePaths = "student")
    @Query("select distinct participation from Participation participation where participation.id = :#{#participationId}")
    Optional<ProgrammingExerciseStudentParticipation> findByIdWithStudent(@Param("participationId") Long participationId);
}
