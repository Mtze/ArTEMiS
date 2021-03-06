package de.tum.in.www1.artemis.service.scheduled;

import static java.time.ZonedDateTime.now;

import java.util.*;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import de.tum.in.www1.artemis.domain.ProgrammingExerciseStudentParticipation;
import de.tum.in.www1.artemis.domain.Result;
import de.tum.in.www1.artemis.repository.ProgrammingExerciseStudentParticipationRepository;
import de.tum.in.www1.artemis.service.ParticipationService;
import io.github.jhipster.config.JHipsterConstants;

@Service
public class AutomaticBuildPlanCleanupService {

    private static final Logger log = LoggerFactory.getLogger(AutomaticBuildPlanCleanupService.class);

    private final Environment env;

    private final ProgrammingExerciseStudentParticipationRepository programmingExerciseStudentParticipationRepository;

    private final ParticipationService participationService;

    public AutomaticBuildPlanCleanupService(Environment env, ProgrammingExerciseStudentParticipationRepository programmingExerciseStudentParticipationRepository,
            ParticipationService participationService) {
        this.env = env;
        this.programmingExerciseStudentParticipationRepository = programmingExerciseStudentParticipationRepository;
        this.participationService = participationService;
    }

    /**
     *  Cleans up all build plans
     */
    @Scheduled(cron = "0 0 3 * * *") // execute this every night at 3:00:00 am
    @Transactional
    public void cleanupBuildPlans() {
        Collection<String> activeProfiles = Arrays.asList(env.getActiveProfiles());
        if (!activeProfiles.contains(JHipsterConstants.SPRING_PROFILE_PRODUCTION)) {
            // only execute this on production server, i.e. when the prod profile is active
            return;
        }

        long start = System.currentTimeMillis();
        log.info("Find build plans for potential cleanup");

        long countNoResultAfter14Days = 0;
        long countSuccessfulLatestResultAfter7Days = 0;
        long countUnsuccessfulLatestResultAfter14Days = 0;

        List<ProgrammingExerciseStudentParticipation> allParticipationsWithBuildPlanId = programmingExerciseStudentParticipationRepository.findAllWithBuildPlanId();
        Set<ProgrammingExerciseStudentParticipation> participationsWithBuildPlanToDelete = new HashSet<>();

        for (ProgrammingExerciseStudentParticipation participation : allParticipationsWithBuildPlanId) {

            if (participation.getBuildPlanId() == null) {
                // already cleaned up
                continue;
            }
            if (participation.getStudent() == null) {
                // we only want to clean up build plans of students
                continue;
            }
            Result result = participation.findLatestResult();
            // 1st case: delete the build plan 14 days after the participation was initialized in case there is no result
            if (result == null) {
                if (participation.getInitializationDate() != null && participation.getInitializationDate().plusDays(14).isBefore(now())) {
                    participationsWithBuildPlanToDelete.add(participation);
                    countNoResultAfter14Days++;
                }
            }
            else {
                // 2nd case: delete the build plan after 7 days in case the latest result is successful
                if (result.isSuccessful()) {
                    if (result.getCompletionDate() != null && result.getCompletionDate().plusDays(7).isBefore(now())) {
                        participationsWithBuildPlanToDelete.add(participation);
                        countSuccessfulLatestResultAfter7Days++;
                    }
                }
                // 3rd case: delete the build plan after 14 days in case the latest result is NOT successful
                else {
                    if (result.getCompletionDate() != null && result.getCompletionDate().plusDays(14).isBefore(now())) {
                        participationsWithBuildPlanToDelete.add(participation);
                        countUnsuccessfulLatestResultAfter14Days++;
                    }
                }
            }
        }

        log.info("Found " + allParticipationsWithBuildPlanId.size() + " participations with build plans in " + (System.currentTimeMillis() - start) + " ms execution time");
        log.info("Found " + participationsWithBuildPlanToDelete.size() + " old build plans to delete");
        log.info("  Found " + countNoResultAfter14Days + " build plans without results 14 days after initialization");
        log.info("  Found " + countSuccessfulLatestResultAfter7Days + " build plans with successful latest result is older than 7 days");
        log.info("  Found " + countUnsuccessfulLatestResultAfter14Days + " build plans with unsuccessful latest result is older than 14 days");

        // Limit to 1000 deletions per night
        List<ProgrammingExerciseStudentParticipation> actualParticipationsToClean = participationsWithBuildPlanToDelete.stream().limit(1000).collect(Collectors.toList());
        List<String> buildPlanIds = actualParticipationsToClean.stream().map(ProgrammingExerciseStudentParticipation::getBuildPlanId).collect(Collectors.toList());
        log.info("Build plans to cleanup: " + buildPlanIds);

        for (ProgrammingExerciseStudentParticipation participation : actualParticipationsToClean) {
            try {
                participationService.cleanupBuildPlan(participation);
            }
            catch (Exception ex) {
                log.error("Could not cleanup build plan in participation " + participation.getId(), ex);
            }
        }
        log.info(actualParticipationsToClean.size() + " build plans have been cleaned");
    }
}
