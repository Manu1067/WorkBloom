# WorkBloom

An Employee Experience & Well-being Platform built with React, Spring Boot, and PostgreSQL to foster workplace culture, wellness, collaboration, mentorship, and community engagement. 🌸

## Quick start

See [docs/SETUP.md](docs/SETUP.md) for the full, step-by-step guide. In short:

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE workbloom;"

# 2. Backend (set DB_USERNAME / DB_PASSWORD / JWT_SECRET first - see backend/.env.example)
cd backend
./mvnw spring-boot:run

# 3. Seed reference data (Travel questions + destinations)
psql -U postgres -d workbloom -f database/seed/01_travel_questions.sql
psql -U postgres -d workbloom -f database/seed/02_destinations.sql
psql -U postgres -d workbloom -f database/seed/03_destination_images.sql

# 4. Frontend
npm install
npm run dev
```

## Documentation

| Doc | Covers |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Full setup walkthrough, start to finish |
| [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) | Database creation, schema strategy, seeding, reset |
| [docs/TRAVEL_SETUP.md](docs/TRAVEL_SETUP.md) | Travel module: flow, endpoints, scoring model |
| [docs/TRAVEL_IMAGES.md](docs/TRAVEL_IMAGES.md) | Destination image placeholders and how to replace them |
| [docs/ROUTE_ALGORITHM.md](docs/ROUTE_ALGORITHM.md) | Nearest Neighbor + Haversine route algorithm, and its limits |
| [docs/MAPS_SETUP.md](docs/MAPS_SETUP.md) | Map rendering setup (MapLibre/OSM recommended; Google Maps notes) |
| [docs/N8N_OLLAMA_SETUP.md](docs/N8N_OLLAMA_SETUP.md) | AI wellness feature: n8n + Ollama setup and error handling |
| [docs/API_TESTING.md](docs/API_TESTING.md) | Using the Postman collection |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | What changed in the latest backend-finalization pass |
| [docs/Architecture.md](docs/Architecture.md) | Overall system architecture |
| [docs/API.md](docs/API.md) | API reference |
| [docs/Database.md](docs/Database.md) | Data model reference |
| [docs/Deployment.md](docs/Deployment.md) | Deployment notes |

## Tech stack

- **Frontend:** React
- **Backend:** Spring Boot (Java), JPA/Hibernate
- **Database:** PostgreSQL
- **AI pipeline:** n8n workflow orchestration + Ollama (local LLM), for wellness analysis
- **Testing:** JUnit 5 + Mockito (`backend/src/test/java`)

## Environment variables

Copy `.env.example` (frontend) and `backend/.env.example` (backend) and
fill in real values in your own shell/CI — never commit real secrets.
Required backend variables: `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
Optional (have working local defaults): `N8N_WELLNESS_WEBHOOK_URL`,
`HTTP_CLIENT_CONNECT_TIMEOUT_MS`, `HTTP_CLIENT_READ_TIMEOUT_MS`.

## Postman

Import `postman/WorkBloom.postman_collection.json` and
`postman/WorkBloom.postman_environment.json` — see
[docs/API_TESTING.md](docs/API_TESTING.md).
