# JobTrackr

An AI-powered job application tracker that scrapes job boards, manages your pipeline, and generates tailored application emails and resume summaries — all from one dashboard.

---

## Features

- **AI job scraper** — Point it at any job board URL. Groq LLM (Llama 3.1) parses the page and extracts structured listings without custom per-site parsers.
- **Automated scheduling** — Sources are scraped on a configurable schedule (hourly / daily / weekly) via APScheduler.
- **Smart filtering** — Star jobs to auto-learn your preferred keywords; blacklist companies to permanently hide their listings.
- **Resume parsing** — Upload a PDF, DOCX, or plain-text resume. AI extracts your profile (skills, experience, education) automatically.
- **AI application assistant** — Select jobs, hit Generate, and get a tailored cover email + resume summary for each role in seconds.
- **Application tracking** — Save sent applications and track their status in one place.
- **Admin panel** — Manage all users, sources, jobs, and audit security events.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, SQLAlchemy, SQLite |
| AI | Groq API (llama-3.1-8b-instant) |
| Scraping | httpx, BeautifulSoup, Groq LLM |
| Frontend | React 18, Vite, Chakra UI, styled-components |
| Auth | JWT (access) + opaque refresh tokens, HttpOnly cookies |
| Scheduling | APScheduler |

---

## Project Structure

```
jobtrackr/
├── backend/
│   ├── main.py          # All API endpoints, middleware, auth
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # DB engine and session
│   ├── scraper.py       # Job board scraper (AI-powered)
│   ├── ai_service.py    # Resume parsing, email & summary generation
│   ├── migrate.py       # Schema migration script
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── context/AuthContext.jsx   # Cookie-based auth, authFetch wrapper
│       ├── pages/                    # Dashboard, Jobs, Profile, Apply, Auth
│       └── components/              # Layout, ProtectedRoute, error boundaries
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- Docker + Docker Compose, **or** Python 3.11+ and Node 18+
- A [Groq API key](https://console.groq.com)

### Environment variables

Create `backend/.env`:

```env
SECRET_KEY=your-random-secret-key-here
GROQ_API_KEY=your-groq-api-key-here
ALLOWED_ORIGINS=http://localhost:5173
# Optional:
# ACCESS_TOKEN_EXPIRE_MINUTES=60
# REFRESH_TOKEN_EXPIRE_DAYS=7
# ENV=production   # enables HSTS + secure cookies
```

### Run with Docker Compose

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Run locally (without Docker)

**Backend**
```bash
cd backend
pip install -r requirements.txt
python migrate.py        # apply DB schema migrations
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Database Migrations

When pulling updates that add new DB columns, run:

```bash
cd backend
python migrate.py
```

The script is idempotent — safe to run multiple times.

---

## Security

- Passwords hashed with bcrypt
- JWT access tokens (60 min) + rotating opaque refresh tokens (7 days), stored as HttpOnly cookies — no tokens in localStorage
- Refresh tokens stored as SHA-256 hashes in the database
- Password reset tokens stored as SHA-256 hashes, never exposed in API responses
- Rate limiting on auth endpoints (login: 5/min, forgot-password: 3/min)
- Security headers on all responses: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- CORS restricted to configured origins with explicit methods and headers
- Resume upload capped at 10 MB

---

## API Overview

| Method | Path | Description |
|---|---|---|
| POST | `/token` | Login — sets HttpOnly cookies |
| POST | `/users/` | Register |
| GET | `/auth/me` | Current user session check |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke session, clear cookies |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Complete password reset |
| GET/POST | `/sources/` | List / add job sources |
| POST | `/sources/{id}/scrape` | Trigger manual scrape |
| GET | `/jobs/` | List jobs for current user |
| POST | `/applications/generate` | AI-generate application drafts |
| POST | `/applications/` | Save applications |
| GET/PATCH | `/users/me/profile` | Read / update profile |
| POST | `/users/me/resume` | Upload resume (AI parses it) |
