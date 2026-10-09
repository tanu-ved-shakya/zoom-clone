# Zoom Web Application Clone

A full-stack video conferencing web application clone replicating the modern **Zoom Workplace** interface, design language, and core meeting workflows.

---

## 🌟 Key Features

1. **Dashboard (Zoom Workplace UI)**
   - Top Navigation bar with Zoom branding, universal search, product launcher, notifications, and profile details.
   - Quick action grid: **New Meeting**, **Join Meeting**, **Schedule**, and **Share Screen**.
   - **Upcoming Meetings** section with direct launch, date badges, and copyable invite links.
   - **Recent Meetings** section showing history, ended status, and attendee statistics.

2. **Instant Meeting Creation**
   - 1-click meeting launcher generating an authentic **11-digit Meeting ID** and secret invite token.
   - Automatically registers the host and redirects to the live meeting room.

3. **Join Meeting**
   - Join via 11-digit Meeting ID or full invite URL.
   - Custom display name selection and meeting validation.
   - Checks active meeting status and registers participants with live state.

4. **Meeting Scheduler**
   - Title, optional agenda description, date & start time picker.
   - Duration selector (15m to 2h) and global timezone configuration.
   - Stores meeting in the SQLite database and populates the Upcoming Meetings dashboard.

5. **Meeting Room Experience**
   - Dark theme matching Zoom's video arena (`#141414`).
   - Simulated dynamic participant video tiles + local camera stream integration.
   - Bottom control toolbar:
     - **Microphone**: Toggle Mute / Unmute
     - **Camera**: Toggle Video On / Off
     - **Participants Panel**: Live roster count, host actions, **Mute All**, individual participant mute & remove controls
     - **Live In-Meeting Chat**: Send and receive instant messages with timestamping
     - **Reactions**: Animated emoji reactions (👏, 👍, ❤️, 🎉)
     - **End Meeting**: Graceful leave / meeting closure

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy ORM, Uvicorn ASGI server
- **Database**: SQLite (relational schema with foreign keys and check constraints)

---

## 🗄️ Database Schema

The database strictly conforms to the requested specification:

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    display_name  TEXT NOT NULL,
    avatar_url    TEXT,
    timezone      TEXT NOT NULL DEFAULT 'UTC',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE meetings (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_code     TEXT NOT NULL UNIQUE,
    invite_token     TEXT NOT NULL UNIQUE,
    host_id          INTEGER NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    type             TEXT NOT NULL CHECK (type IN ('instant','scheduled')),
    status           TEXT NOT NULL CHECK (status IN ('scheduled','live','ended','cancelled')),
    scheduled_start  TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 40 CHECK (duration_minutes > 0),
    timezone         TEXT NOT NULL DEFAULT 'UTC',
    started_at       TEXT,
    ended_at         TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (type = 'instant' OR scheduled_start IS NOT NULL)
);

CREATE TABLE participants (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    meeting_id    INTEGER NOT NULL,
    user_id       INTEGER,
    display_name  TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host','participant')),
    status        TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined','left','removed')),
    is_muted      INTEGER NOT NULL DEFAULT 0,
    is_video_on   INTEGER NOT NULL DEFAULT 1,
    joined_at     TEXT NOT NULL DEFAULT (datetime('now')),
    left_at       TEXT,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL
);
```

---

## 🚀 Setup & Running Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python seed.py        # Seeds initial user, upcoming & concluded meetings
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be running at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run build
npm run start
# OR for development: npm run dev
```
Frontend web app will be accessible at `http://localhost:3000`.

---

## 💡 Assumptions & Design Decisions
1. **Default Logged-in User**: As instructed, user authentication is assumed with a default active user (**Alex Morgan**) pre-seeded in the database to showcase host privileges.
2. **WebRTC & Video Fallback**: The meeting room queries user webcam/mic via `navigator.mediaDevices.getUserMedia` when granted; if cameras are unavailable or permissions denied, high-fidelity Zoom profile initials/avatars are automatically displayed.
3. **Responsive Design**: Designed responsively for desktop, tablet, and mobile views with collapsible sidebars and floating controls.
