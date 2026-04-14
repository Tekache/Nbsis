# NBSIS (Network Based Shell Security)

Full-stack security dashboard with:
- Frontend: React + Vite
- Backend: FastAPI
- Database: MongoDB

## Project structure

- `src/` frontend app
- `backend/` FastAPI backend
- `backend/app/` backend application package

## What was fixed

- `uvicorn main:app --reload` now works from `backend/` via `backend/main.py` shim.
- Auth user state is normalized (`name` and `full_name`) to avoid sidebar crashes after signup/login.
- Signup/login now normalize email casing and whitespace.
- Inactive accounts are blocked cleanly.
- Mobile layout updated for sidebar + dashboard pages to prevent overflow/compression on small screens.
- Frontend API client improved for clearer backend/CORS errors.
- Added missing root `.env.example`.

## Local development

### 1) Backend setup

From project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env`:

- `MONGODB_URL=<your mongo url>`
- `SECRET_KEY=<long random secret>`
- `FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`

Run backend:

```powershell
uvicorn main:app --reload
```

Backend URLs:
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

### 2) Frontend setup

From project root:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Default frontend env (`.env`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Frontend URL:
- `http://localhost:5173`

## Signup/Login behavior

- Anyone can sign up using `/api/auth/signup`.
- Login is `/api/auth/login`.
- Email is stored lowercase to avoid duplicate-account confusion.
- Passwords are hashed with bcrypt.

## Deployment (Vercel + Render)

### Backend (Render)

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Set env vars on Render:
- `MONGODB_URL`
- `DATABASE_NAME=shell_security`
- `SECRET_KEY=<secure random value>`
- `FRONTEND_ORIGINS=https://your-frontend.vercel.app`
- Optional: `FRONTEND_ORIGIN_REGEX=^https://.*\.vercel\.app$`

### Frontend (Vercel)

Set env var:
- `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

Then redeploy frontend.

## Verification checklist

- Signup creates account and redirects to dashboard.
- Login persists session after browser refresh.
- Sidebar shows correct user name.
- Dashboard and pages render cleanly on mobile widths.
- Hosted frontend can call hosted backend without CORS errors.

## Troubleshooting

- `Could not import module "main"`: run backend from `backend/` directory, or use `uvicorn main:app --reload` there.
- `Failed to fetch`: check backend is running and `VITE_API_BASE_URL` points to the right API.
- CORS errors: ensure frontend domain is included in `FRONTEND_ORIGINS` (and regex if using preview URLs).
- Empty data: verify MongoDB URL and backend startup logs for connection errors.