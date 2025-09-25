# ShieldX Server (minimal)

This folder contains a minimal Express + MongoDB backend for authentication.

Quick start

1. Copy `.env.example` to `.env` and edit `MONGODB_URI` and `JWT_SECRET`.
2. Install and run:

```bash
cd server
npm install

# On macOS / Linux
npm run dev

# On Windows (cmd.exe)
npm run dev:win
```

3. API endpoints:
- POST /api/signup { name, email, password }
- POST /api/login { email, password }
- GET /api/ping

The server returns a JWT token on successful auth.
