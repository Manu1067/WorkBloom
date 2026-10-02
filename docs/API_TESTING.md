# API Testing (Postman)

## Import

1. Open Postman → **Import**.
2. Select both:
   - `postman/WorkBloom.postman_collection.json`
   - `postman/WorkBloom.postman_environment.json`
3. Select the **WorkBloom Local** environment in the top-right environment
   picker.

## Variables

| Variable | Default | Purpose |
|---|---|---|
| `baseUrl` | `http://localhost:8080` | Backend base URL |
| `token` | *(empty)* | Set automatically by **01 Auth → Login**'s test script |
| `employeeId` | *(empty)* | Set manually after checking your seeded/registered employee's ID |

## Suggested run order

1. **01 Auth → Register** (if you don't have an account yet)
2. **01 Auth → Login** — this populates `{{token}}` for every other
   request via a small test script attached to the request
3. **02 Employee → Get My Profile** — confirms `{{token}}` works and gives
   you an employee ID to set as `{{employeeId}}`
4. Any other folder — **14 Travel** is the most relevant to this
   finalization pass:
   - **Get Active Questions**
   - **List Destinations**
   - **Get Destination by ID**
   - **Get Destination Images**
   - **Save Travel Preferences**
   - **Get Travel Preferences**
   - **Recommend (single best match)**
   - **Recommend From Answers (ranked list)**
   - **Optimize Route**
5. **16 AI → Analyze Wellness** — try this both with n8n/Ollama running
   (expect 200) and stopped (expect 503, see
   [N8N_OLLAMA_SETUP.md](./N8N_OLLAMA_SETUP.md))

## Authorization

Every request (other than Auth) has `Authorization: Bearer {{token}}` set
at the collection level, so setting `{{token}}` once (via the Login
request's test script) authenticates every other request automatically.

## No real credentials are included

The collection ships with empty/placeholder values only — you provide
real login credentials when you run **Register**/**Login** yourself.
