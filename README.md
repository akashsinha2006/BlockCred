# BlockCred

A prototype for issuing and verifying **tamper-evident academic credentials**.

An issuer creates a credential, and the server digitally signs the record (HMAC-SHA256). Anyone can later verify a credential by its ID or QR code and see whether it is **verified**, **revoked**, or **invalid** (not found or altered).

> **Prototype only.** BlockCred uses a single issuer account and a server-held signing secret. It is a demonstration, not a production system, and it does not establish institutional accreditation. Use fictional data only.

---

## Features

- **Issuer dashboard**: totals (issued, active, revoked, verified checks, invalid checks), 7-day verification activity and recently issued credentials.
- **Issue credentials**: validated form that generates a unique ID (`BC-XXXXXXXXXXXX`), signs the record and produces a QR code.
- **Manage credentials**: search, filter by status (active / revoked), paginate, view details and verification history, revoke.
- **Public verification page**: look up by ID or scan a QR code. Shows only the fields a verifier needs (the student identifier and signature are never exposed).
- **Tamper detection**: if a record is edited directly in the database, its signature no longer matches and verification returns `INVALID`.
- **Audit trail**: every verification attempt is logged as a `VerificationEvent`.
- **Security basics**: Helmet, CORS allow-list, rate limiting (login and verify), JWT auth (8h expiry), timing-safe comparisons, Zod input validation.
- Light/dark theme toggle.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Database | MongoDB (Atlas or local) via Mongoose |
| API | Node.js, Express 4, Zod, JSON Web Tokens, QRCode |
| Client | React 18, Vite 6, React Router 6, lucide-react |
| Testing | Node's built-in test runner (`node --test`) |

## How Verification Works

1. On issue, the server builds a payload of the credential fields (`credentialId`, `studentName`, `studentIdentifier`, `institution`, `qualification`, `department`, `graduationYear`, `issueDate`).
2. The payload is serialized as canonical JSON (sorted keys) and signed with `HMAC-SHA256` using `SIGNING_SECRET`. The hex signature is stored with the record.
3. On verify, the server recomputes the signature from the stored record and compares it in constant time:

| Status | Meaning |
| --- | --- |
| `VERIFIED` | Record found, signature intact, not revoked |
| `REVOKED` | Signature intact, but the issuer revoked it |
| `INVALID` | No such ID, or the stored record no longer matches its signature |

Without the signing secret, a record cannot be changed in the database and still produce a matching signature.

## Project Structure

```
blockcred/
├── package.json          # root scripts (install:all, dev, test, check:db)
├── client/               # React + Vite front end
│   └── src/
│       ├── pages/        # Login, Dashboard, Issue, Credentials, Details, Verify, About
│       ├── components/   # Layout, Ui, ThemeToggle
│       ├── context/      # Auth, Toast
│       └── api.js        # fetch wrapper + token storage
└── server/               # Express API
    ├── scripts/check-db.js
    ├── test/hash.test.js
    └── src/
        ├── index.js, app.js, config.js, db.js
        ├── middleware/auth.js
        ├── models/       # Credential, VerificationEvent
        ├── routes/       # auth, credentials, dashboard, verify
        └── utils/        # hash.js (signing), http.js
```

## Getting Started

### Prerequisites

- Node.js 18+ (20+ recommended)
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or a local `mongod`

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the server

Create `server/.env`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Atlas: mongodb+srv://<user>:<password>@<cluster>.mongodb.net/blockcred
# Local: mongodb://127.0.0.1:27017/blockcred
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

ADMIN_EMAIL=admin@blockcred.local
ADMIN_PASSWORD=choose-a-strong-password

# Generate each with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-random-hex-string
SIGNING_SECRET=another-random-hex-string
```

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `CLIENT_URL` | Front-end origin (CORS and verification/QR links) | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/blockcred` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The single issuer login | `admin@blockcred.local` / `change-this-password` |
| `JWT_SECRET` | Signs session tokens | dev-only fallback (warns on start) |
| `SIGNING_SECRET` | Signs credential records | dev-only fallback (warns on start) |

> **Keep `SIGNING_SECRET` stable.** Changing it later makes every previously issued credential fail verification.

If you use Atlas, add your IP under **Network Access**, and make sure the database user has read/write access.

### 3. Check the database connection (optional)

```bash
npm run check:db
```

### 4. Run in development

```bash
npm run dev
```

This starts both servers:

- Client: http://localhost:5173 (Vite proxies `/api` to the server, so no CORS setup is needed in dev)
- API: http://localhost:5000 (health check at `/api/health`)

Sign in at `/login` with your `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The public verification page is at `/verify`.

### 5. Run tests

```bash
npm test
```

The tests cover the signing utilities: determinism, key-order independence, tamper sensitivity, and secret sensitivity.

## Production Build

```bash
npm run build --prefix client      # outputs client/dist
npm start --prefix server
```

When the API is hosted on a different origin than the client, set `VITE_API_URL` in `client/.env` (see `client/.env.example`) before building, and set `CLIENT_URL` on the server to the deployed client origin.

## API Reference

Base path: `/api`. Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | API and database status |
| POST | `/auth/login` | Public (rate limited) | Issuer login, returns JWT |
| GET | `/auth/me` | Issuer | Current user |
| GET | `/dashboard` | Issuer | Totals, 7-day activity, recent credentials |
| GET | `/credentials` | Issuer | List with `page`, `limit`, `q`, `status=active\|revoked` |
| POST | `/credentials` | Issuer | Issue a new signed credential |
| GET | `/credentials/:id` | Issuer | Credential details and last 10 verification events |
| POST | `/credentials/:id/revoke` | Issuer | Revoke a credential |
| GET | `/credentials/:id/qr` | Public | QR code PNG linking to the verify page |
| GET | `/verify/:id` | Public (rate limited) | Verification result and public fields |

**Issue request body**

```json
{
  "studentName": "Demo Student",
  "studentIdentifier": "S-1001",
  "institution": "Demo University",
  "qualification": "BSc Computer Science",
  "department": "Computer Science",
  "graduationYear": 2026,
  "issueDate": "2026-05-01"
}
```

## Security Notes

- Never commit `server/.env`. It is already in `.gitignore`.
- Use long random values for `JWT_SECRET` and `SIGNING_SECRET`, and a strong `ADMIN_PASSWORD`.
- If any secret or database password has been shared or committed, rotate it.
- Limitations: a single issuer account, signatures verifiable only by the server (not by third parties), and no external anchoring of records.

## License

Add a license of your choice (for example MIT) before publishing.
