# Architecture — Finalization Addendum

For the overall system architecture, see `docs/Architecture.md` (existing).
This file covers what changed in the backend-finalization pass, so the two
stay easy to tell apart.

## Travel module — now fully wired

```
DestinationController ────┐
TravelQuestionController ─┼──► Service ──► Repository ──► PostgreSQL
TravelPreferenceController┤
TravelRouteController ────┤
TravelRecommendationController
                            │
                            ▼
                  DestinationMatchEngine
              (pure scoring, no DB/HTTP deps —
               unit-tested in isolation)
```

`DestinationController`, `TravelQuestionController`, and
`TravelRouteController` did not exist before this pass — their
corresponding services and repositories were already implemented but had
no REST endpoint exposing them.

## AI module — resilience added

```
AiWellnessController → AiWellnessServiceImpl → RestClient → n8n → Ollama
                              │
                              ├─ ResourceAccessException  → ServiceUnavailableException (503)
                              ├─ RestClientResponseException → ServiceUnavailableException (503)
                              ├─ RestClientException (bad JSON) → ServiceUnavailableException (503)
                              └─ null body → ServiceUnavailableException (503)
```

`RestClientConfig` now sets explicit connect/read timeouts
(`workbloom.http-client.*`, defaulting to 5s/30s) so a hung n8n instance
fails fast instead of tying up a request thread indefinitely.

## Exceptions — one new type, one bug fix

- Added `ServiceUnavailableException` (503) for upstream-integration
  failures (n8n/Ollama), handled centrally in `GlobalExceptionHandling`.
- Fixed a filename/classname mismatch: `ForbidddenException.java`
  (3 d's) contained `public class ForbiddenException` (2 d's) — this
  does not compile under standard `javac` rules (a public top-level
  class's name must match its file name). Renamed the file; no behavior
  changed, since the class itself was already correct.

## Logging

`System.out.println` was removed from `AiWellnessServiceImpl`,
`EmployeeServiceImpl`, and `JwtAuthenticationFilter`, replaced with SLF4J
at appropriate levels (`debug` for routine flow, `warn`/`error` for
failures). The JWT filter in particular no longer logs full authentication
objects or account-lookup results at a level likely to end up in
production logs.
