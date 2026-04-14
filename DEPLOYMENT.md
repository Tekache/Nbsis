# Deployment Guide

## Recommended free setup

- Frontend: Vercel
- Backend: Render Web Service
- Database: MongoDB Atlas M0 free cluster

This is the safest free deployment path for the current codebase because:

- the frontend is a static Vite app
- the backend is a standard FastAPI app
- the app already expects MongoDB, so Atlas is the correct hosted database replacement

## Before you deploy

The repo is now prepared for deployment with:

- `vercel.json` for SPA route rewrites
- `backend/.env.example` for backend environment variables
- `.env.example` for frontend environment variables
- configurable backend CORS via `FRONTEND_ORIGINS`

## Step 1: Create MongoDB Atlas

1. Create a free Atlas cluster.
2. Create a database user.
3. In Atlas Network Access, add an IP access entry.
4. Copy your MongoDB connection string.
5. Replace the database user, password, and cluster values in the string.

Use the Atlas connection string as `MONGODB_URL` in Render.

## Step 2: Deploy the backend on Render

Create a new Web Service from this same repository.

Render settings:

- Root Directory: `backend`
- Runtime: `Python 3`
- Python Version: `3.12` via [backend/.python-version](C:/Users/USER/OneDrive/Desktop/nbsis/backend/.python-version)
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Instance Type: `Free`

If Render shows a default command like `gunicorn your_application.wsgi`, replace it manually in the service settings before redeploying.

Backend environment variables:

- `MONGODB_URL=<your Atlas connection string>`
- `DATABASE_NAME=shell_security`
- `SECRET_KEY=<a long random secret>`
- `FRONTEND_ORIGINS=<your Vercel frontend URL>`
- `FRONTEND_ORIGIN_REGEX=^https://.*\\.vercel\\.app$` (optional but useful for preview deploys)

After deployment, confirm these URLs work:

- `https://your-backend.onrender.com/`
- `https://your-backend.onrender.com/health`
- `https://your-backend.onrender.com/docs`

## Step 3: Deploy the frontend on Vercel

Create a new Vercel project from this repository.

Vercel settings:

- Framework Preset: `Vite`
- Root Directory: repository root
- Build Command: `npm run build`
- Output Directory: `dist`

Frontend environment variable:

- `VITE_API_BASE_URL=https://your-backend.onrender.com/api`

Then redeploy the frontend after the env var is added. If the deployed site still shows requests to `http://localhost:8000/api`, the old build is still live and you need a fresh Vercel redeploy.

## Step 4: Update backend CORS

Once Vercel gives you the final frontend URL, put that exact URL in Render as:

- `FRONTEND_ORIGINS=https://your-frontend.vercel.app`

If you later add a custom domain, include both domains separated by commas.

Example:

`FRONTEND_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com`

## Step 5: Final checks

Test these flows on the live site:

- signup
- login
- dashboard load
- personnel create and edit
- incidents create
- alerts list
- settings profile update

## Important free-tier limitation

The app will work on free hosting, but Render Free can spin the backend down after inactivity. The first request after idle can take around a minute to wake up.

Use the free setup for a demo, portfolio, class project, or low-traffic internal review.

If you want the backend to behave like local development with no sleep delay and fewer availability risks, you need a paid backend plan.

## If you want one-platform hosting instead

You can also host both frontend and backend on Render, but Vercel + Render is the simpler and more reliable free combination for this project.
