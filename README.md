# StudyTracker — Certification Exam Planner

A full-stack certification exam study planner built with React + Vite, Tailwind CSS, Supabase, and Recharts.

---

## Quick Setup

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → New project
2. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Run the Database Schema
In your Supabase dashboard → **SQL Editor**, paste and run the entire contents of `supabase-schema.sql`.

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

---

## Features
- **Auth** — Supabase email/password sign up & login
- **Onboarding** — Pick a certification, set exam date & weekly hours
- **Dashboard** — Circular progress ring, days countdown, adaptive daily targets
- **Section tracking** — Per-section progress bars and bar charts
- **Study heatmap** — GitHub-style activity grid
- **Session logging** — Log hours by section with optional notes
- **Adaptive planning** — Daily target auto-recalculates as you fall behind

## Certifications Included
CPA · CFA Level 1 · PMP · Bar Exam · AWS Solutions Architect · Series 7 · USMLE Step 1 · (+ custom)

## Tech Stack
- **React 18** + Vite
- **Tailwind CSS** (dark mode, custom design system)
- **Supabase** (auth + Postgres database)
- **Recharts** (bar charts)
- **React Router v6**
