package com.workbloom.travel.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.workbloom.travel.repository.DestinationImageRepository;
import com.workbloom.travel.repository.DestinationRepository;
import com.workbloom.travel.repository.TravelQuestionOptionRepository;
import com.workbloom.travel.repository.TravelQuestionRepository;

/**
 * Applies the Travel seed SQL files in {@code database/seed/} to the
 * PostgreSQL database this application is connected to.
 *
 * Why this exists: the seed files ALTER/INSERT into tables that Hibernate
 * only creates (ddl-auto=update) on the backend's first start, and nothing
 * ever ran them against the database Spring Boot actually uses - so
 * GET /api/travel/questions returned an empty list and the UI showed
 * "No travel questionnaire items configured".
 *
 * PostgreSQL stays the single source of truth: nothing is hardcoded in
 * Java or React. Each file is applied ONLY when its target table is empty
 * (the files are also idempotent via ON CONFLICT / NOT EXISTS), so existing
 * rows are never modified or duplicated. Disable with
 * {@code workbloom.travel.seed.enabled=false}.
 */
@Component
@ConditionalOnProperty(name = "workbloom.travel.seed.enabled", havingValue = "true", matchIfMissing = true)
public class TravelSeedInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TravelSeedInitializer.class);

    static final String QUESTIONS_FILE = "01_travel_questions.sql";
    static final String DESTINATIONS_FILE = "02_destinations.sql";
    static final String IMAGES_FILE = "03_destination_images.sql";

    private final JdbcTemplate jdbcTemplate;
    private final TravelQuestionRepository questionRepository;
    private final TravelQuestionOptionRepository optionRepository;
    private final DestinationRepository destinationRepository;
    private final DestinationImageRepository imageRepository;

    // Optional explicit directory; otherwise ./database/seed and ../database/seed
    // are tried (backend started from the repo root or from backend/).
    @Value("${workbloom.travel.seed.directory:}")
    private String configuredDirectory;

    public TravelSeedInitializer(
            JdbcTemplate jdbcTemplate,
            TravelQuestionRepository questionRepository,
            TravelQuestionOptionRepository optionRepository,
            DestinationRepository destinationRepository,
            DestinationImageRepository imageRepository) {

        this.jdbcTemplate = jdbcTemplate;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.destinationRepository = destinationRepository;
        this.imageRepository = imageRepository;
    }

    @Override
    public void run(ApplicationArguments args) {

        boolean needQuestions = questionRepository.count() == 0 || optionRepository.count() == 0;
        boolean needDestinations = destinationRepository.count() == 0;

        if (!needQuestions && !needDestinations && imageRepository.count() > 0) {
            log.info("Travel seed data already present - nothing to seed.");
            return;
        }

        Path directory = resolveSeedDirectory();
        if (directory == null) {
            log.error("Travel tables need seeding but database/seed/ was not found "
                    + "(tried '{}', ./database/seed, ../database/seed). Set "
                    + "workbloom.travel.seed.directory or run the SQL files manually.",
                    configuredDirectory);
            return;
        }

        if (needQuestions) {
            apply(directory.resolve(QUESTIONS_FILE));
        }
        if (needDestinations) {
            apply(directory.resolve(DESTINATIONS_FILE));
        }
        // Images reference destinations by name, so run after destinations exist.
        if (destinationRepository.count() > 0 && imageRepository.count() == 0) {
            apply(directory.resolve(IMAGES_FILE));
        }

        log.info("Travel seed complete: {} active questions, {} options, {} destinations, {} images.",
                questionRepository.countByActiveTrue(),
                optionRepository.count(),
                destinationRepository.count(),
                imageRepository.count());
    }

    private Path resolveSeedDirectory() {
        List<String> candidates = configuredDirectory == null || configuredDirectory.isBlank()
                ? List.of("database/seed", "../database/seed")
                : List.of(configuredDirectory);

        for (String candidate : candidates) {
            Path path = Path.of(candidate).toAbsolutePath().normalize();
            if (Files.isRegularFile(path.resolve(QUESTIONS_FILE))) {
                return path;
            }
        }
        return null;
    }

    private void apply(Path file) {
        try {
            String sql = Files.readString(file, StandardCharsets.UTF_8);
            // The whole file is sent as one multi-statement script. The
            // PostgreSQL JDBC driver understands $$ ... $$ blocks, which a
            // naive split-on-semicolon runner would break.
            jdbcTemplate.execute(sql);
            log.info("Applied travel seed file {}", file.getFileName());
        } catch (IOException ex) {
            log.error("Could not read travel seed file {}: {}", file, ex.getMessage());
        } catch (RuntimeException ex) {
            // Never block application startup because of seed data.
            log.error("Failed to apply travel seed file {}: {}", file.getFileName(), ex.getMessage());
        }
    }
}
