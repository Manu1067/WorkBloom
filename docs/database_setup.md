# Database Setup

## 1. Create the database

```sql
-- as the postgres superuser, e.g. `psql -U postgres`
CREATE DATABASE workbloom;
```

## 2. Configure the connection

Set `DB_USERNAME` / `DB_PASSWORD` as environment variables (see
`backend/.env.example`). `backend/src/main/resources/application.properties`
reads them via `${DB_USERNAME}` / `${DB_PASSWORD}` — there are no hardcoded
credentials in the repository.

## 3. Schema creation strategy

This project uses Hibernate's `spring.jpa.hibernate.ddl-auto=update`, which
creates/updates tables automatically from the `@Entity` classes on
application startup. This is the existing project's strategy and has been
preserved rather than replaced with a migration tool (Flyway/Liquibase),
per the "do not replace existing architecture" requirement.

**Practical implication:** start the backend once (`./mvnw spring-boot:run`)
before running the seed scripts below, so the tables they insert into
already exist.

## 4. Seed reference data

All seed scripts live under `database/seed/` and are **idempotent** — they
use `ON CONFLICT ... DO NOTHING` (or an equivalent `NOT EXISTS` guard) so
re-running them never duplicates rows or destroys existing data.

```bash
psql -U postgres -d workbloom -f database/seed/01_travel_questions.sql
psql -U postgres -d workbloom -f database/seed/02_destinations.sql
psql -U postgres -d workbloom -f database/seed/03_destination_images.sql
```

| Script | Seeds |
|---|---|
| `01_travel_questions.sql` | 6 Travel Questions covering mood, environment, trip style, budget, duration, activities, each with several options |
| `02_destinations.sql` | 31 real Indian destinations with verified coordinates, category, environment, mood tags, activities, budget level, duration |
| `03_destination_images.sql` | Primary + map-thumbnail image rows per destination, pointing at the placeholder SVGs shipped under `backend/src/main/resources/static/images/destinations/` |

## 5. Verifying the seed

```sql
SELECT count(*) FROM travel_questions;        -- expect 6
SELECT count(*) FROM travel_question_options; -- expect ~26
SELECT count(*) FROM destinations;            -- expect 31
SELECT count(*) FROM destination_images;      -- expect 62
```

## 6. Resetting (development only)

If you need a clean slate in development:

```sql
TRUNCATE destination_images, destination_mood_tags, destination_activities,
         travel_recommendation_logs, destinations,
         travel_question_options, travel_questions RESTART IDENTITY CASCADE;
```

Then re-run the three seed scripts. **Never run this against a database
with real employee data** — it only touches Travel-module tables, but
double-check your target database first.
