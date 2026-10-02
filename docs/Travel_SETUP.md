# Travel Setup

## Questionnaire and destinations come from PostgreSQL

```
database/seed/01_travel_questions.sql   -> travel_questions, travel_question_options
database/seed/02_destinations.sql       -> destinations (+ mood tags, activities)
database/seed/03_destination_images.sql -> destination_images
```

The seed files need the tables to exist first. Hibernate creates them
(`spring.jpa.hibernate.ddl-auto=update`) the first time the backend starts, so
running a seed file earlier fails with `relation "travel_questions" does not
exist`.

On startup, `TravelSeedInitializer` applies each file **only when its target
table is empty**. The files are idempotent (`ON CONFLICT` / `NOT EXISTS`), so
re-running them never duplicates rows.

| property | env var | default |
| --- | --- | --- |
| `workbloom.travel.seed.enabled` | `TRAVEL_SEED_ENABLED` | `true` |
| `workbloom.travel.seed.directory` | `TRAVEL_SEED_DIR` | `./database/seed`, then `../database/seed` |

Manual run (after the backend has started once):

```bash
psql -U postgres -d workbloom -f database/seed/01_travel_questions.sql
psql -U postgres -d workbloom -f database/seed/02_destinations.sql
psql -U postgres -d workbloom -f database/seed/03_destination_images.sql
```

Check: `SELECT count(*) FROM travel_questions WHERE active;` (6) and
`SELECT count(*) FROM travel_question_options;` (27).

## Endpoints used by the Travel page

`GET /api/travel/questions`, `GET /api/travel/destinations[/{id}[/images]]`,
`GET /api/travel/recommend?employeeId=`, `POST /api/travel/recommendations`,
`POST /api/travel/routes/optimize`. All require a JWT except static
`GET /images/**`.
