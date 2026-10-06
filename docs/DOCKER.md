# Running WorkBloom with Docker

Services: `db` (PostgreSQL 16) -> `backend` (Spring Boot) -> `web` (nginx serving the React build and
proxying `/spring-api`, `/images`, `/uploads` to the backend). `n8n` and `ollama` are optional (`--profile ai`).

## 1. Configure
    cp .env.docker.example .env        # Windows PowerShell: Copy-Item .env.docker.example .env
Edit `.env`: set `DB_PASSWORD`, `JWT_SECRET` (32+ chars, `openssl rand -hex 32`), and optionally
`MAIL_USERNAME` / `MAIL_PASSWORD` (Gmail App Password) for password-reset emails.
For a real server set `FRONTEND_BASE_URL` to its public URL (e.g. `https://workbloom.example.com`).

## 2. Build and start
    docker compose up -d --build
    docker compose ps
    docker compose logs -f backend      # wait for "Started ... " and "Travel seed complete"
Open http://localhost:3000. Tables are created by Hibernate on first start and the Travel questions /
destinations are seeded automatically into empty tables.

## 3. Everyday commands
    docker compose logs -f backend            # backend logs
    docker compose restart backend
    docker compose down                       # stop (data kept in volumes)
    docker compose down -v                    # stop AND DELETE the database + uploads
    docker compose up -d --build backend      # rebuild after backend changes

## 4. Move your existing local database into Docker (optional)
    docker compose up -d db
    pg_dump -U postgres -d workbloom --no-owner > workbloom.sql
    docker compose exec -T db psql -U postgres -d workbloom < workbloom.sql
    docker compose up -d --build
(Do this BEFORE the backend first starts, otherwise Hibernate has already created empty tables.)
Existing uploaded Impact images: `docker cp backend/uploads/. $(docker compose ps -q backend):/app/uploads/`

## 5. AI Wellness (n8n -> Ollama)
- n8n already running on your machine (default): nothing to change; the backend calls
  `http://host.docker.internal:5678/webhook/workbloom/wellness`.
- n8n in Docker: `docker compose --profile ai up -d --build`, set
  `N8N_WELLNESS_WEBHOOK_URL=http://n8n:5678/webhook/workbloom/wellness` in `.env`, import your workflow
  into n8n, and inside the workflow point the Ollama node at `http://ollama:11434`
  (then `docker compose exec ollama ollama pull <your-model>`).
nginx waits 180 s on API calls so the backend's 120 s AI timeout is respected.

## 6. Production notes
- Put TLS in front (Caddy, Traefik or a cloud load balancer) and publish only port 80/443.
- Keep `.env` out of Git; do not publish PostgreSQL (port 5432) to the internet.
- `pgdata` and `uploads` are named volumes - back them up (`pg_dump`, volume snapshot).
- Backend image build skips tests (they need a database); run `cd backend && mvn test` in CI.
