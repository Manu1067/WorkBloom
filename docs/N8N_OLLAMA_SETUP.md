# n8n + Ollama Setup (AI Wellness Feature)

## Architecture (preserved, not replaced)

```
Spring Boot (AiWellnessServiceImpl)
        │  POST { employeeId, mood, ... }
        ▼
      n8n  (workflow: docs/n8n/workbloom-wellness-workflow.json)
        │  prompts
        ▼
      Ollama (local LLM)
        │  completion
        ▼
      n8n  (formats into AiWellnessResponse shape)
        │  JSON response
        ▼
Spring Boot (returns AiWellnessResponse to the frontend)
```

## 1. Install and start Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: download the installer from https://ollama.com/download
```

Start the Ollama server (if not already running as a service):

```bash
ollama serve
```

## 2. Pull the model the workflow uses

```bash
ollama pull llama3.1
```

(Swap `llama3.1` for whichever model you configure in the n8n Ollama node —
smaller models such as `llama3.2:3b` work fine for this use case and start
faster on modest hardware.)

## 3. Install and start n8n

```bash
npx n8n
# or: npm install -g n8n && n8n start
```

n8n's editor UI opens at `http://localhost:5678` by default.

## 4. Import the WorkBloom workflow

1. In the n8n UI: **Workflows → Import from File**.
2. Select `docs/n8n/workbloom-wellness-workflow.json`.
3. Open the imported workflow and review the two nodes that need local
   configuration (see below), then **Activate** it.

If you'd rather build it from scratch, the workflow only needs three nodes:

1. **Webhook** (trigger) — Method: `POST`, Path: `webhook/workbloom/wellness`.
2. **Ollama** (or **HTTP Request** to `http://localhost:11434/api/generate`) — receives the webhook body, prompts the model to assess wellness from the employee's mood/notes, and asks for a JSON-shaped response.
3. **Set / Function** node — maps the Ollama output onto the exact shape Spring Boot expects (see below), and returns it via **Respond to Webhook**.

## 5. Configure the webhook path

The imported workflow listens on:

```
POST http://127.0.0.1:5678/webhook/workbloom/wellness
```

This must match `N8N_WELLNESS_WEBHOOK_URL` in your backend environment
(see step 8).

## 6. Configure the Ollama node

Point it at your local Ollama server (`http://localhost:11434` by
default) and select the model you pulled in step 2. If you're running
n8n inside Docker and Ollama on the host machine, use
`http://host.docker.internal:11434` instead of `localhost`.

## 7. Test the webhook directly

```bash
curl -X POST http://127.0.0.1:5678/webhook/workbloom/wellness \
  -H "Content-Type: application/json" \
  -d '{"employeeId": 1, "mood": "STRESSED", "notes": "Heavy workload this week"}'
```

You should get back JSON matching `AiWellnessResponse`
(`com.workbloom.ai.dto.AiWellnessResponse`), e.g.:

```json
{
  "employeeId": 1,
  "wellnessScore": 62.5,
  "riskLevel": "MODERATE",
  "recommendation": "..."
}
```

(Check `AiWellnessResponse.java` for the exact current field set — the
workflow's final node must produce JSON matching it field-for-field, or
Spring Boot will fail to deserialize the response and the request will
receive a 503 from `ServiceUnavailableException`, which is by design —
see step 9.)

## 8. Configure the Spring Boot environment variable

```
N8N_WELLNESS_WEBHOOK_URL=http://127.0.0.1:5678/webhook/workbloom/wellness
```

This is externalized in `application.properties`:

```
n8n.wellness.webhook-url=${N8N_WELLNESS_WEBHOOK_URL:http://127.0.0.1:5678/webhook/workbloom/wellness}
```

— the local default is a convenience for dev only; set the real
environment variable in any non-local environment.

Two more variables control the outbound HTTP client's timeouts (also
defaulted, also overridable):

```
HTTP_CLIENT_CONNECT_TIMEOUT_MS=5000
HTTP_CLIENT_READ_TIMEOUT_MS=30000
```

## 9. Test the Spring Boot AI endpoint end-to-end

With both Ollama and n8n running:

```
POST /api/ai/wellness/analyze?employeeId=1
```

Request body matches `AiWellnessRequest`. It should return the same shape you saw directly from the webhook in step 7.

**Then test the failure path deliberately** — stop n8n (or Ollama) and
call the same endpoint again. You should get an HTTP `503` with a body
like:

```json
{
  "status": 503,
  "message": "The AI wellness service (n8n) is currently unreachable. Please try again shortly.",
  "timestamp": "..."
}
```

This is `ServiceUnavailableException`, thrown from
`AiWellnessServiceImpl` and mapped by `GlobalExceptionHandling` — the
application does not crash, hang, or 500 when the AI pipeline is down.

## Error handling reference

| Failure | Exception thrown | HTTP status |
|---|---|---|
| n8n unreachable / connection refused / timeout | `ServiceUnavailableException` (from `ResourceAccessException`) | 503 |
| n8n responds with a non-2xx status (workflow error, Ollama error surfaced by n8n) | `ServiceUnavailableException` (from `RestClientResponseException`) | 503 |
| Malformed / unparseable JSON response | `ServiceUnavailableException` (from `RestClientException`) | 503 |
| Empty (`null`) response body | `ServiceUnavailableException` | 503 |

All AI request/response activity is logged via SLF4J
(`AiWellnessServiceImpl`) at `debug`/`info`/`error` levels — there is no
`System.out.println` left in this path.
