# Impact activity image uploads

Flow (HR/ADMIN only):

1. `POST /api/impact/events/image` - multipart field `file` (JPEG, PNG or WebP, max 5 MB).
   Returns `{ "imageUrl": "/uploads/impact/<uuid>.png" }`.
2. `POST /api/impact/events` - the existing JSON body plus optional `imageUrl` from step 1.
   Only URLs issued by step 1 are accepted (anything else -> 400).
3. `GET /api/impact/events` now includes `imageUrl` (null for older activities).

Storage: files live on local disk under `workbloom.upload.dir` (env `UPLOAD_DIR`, default
`./uploads` relative to where the backend starts) and are served read-only at `/uploads/**`.
The database stores only the relative URL. The server ignores the client's filename, checks the
MIME type **and** the file signature, and enforces the size limit. Keep the folder on a persistent
volume in production and out of Git (`backend/.gitignore` ignores `uploads/`).

Dev proxy: `vite.config.js` proxies `/uploads` to the backend like `/images`.
