# MOZ Scheduler

A clean, practical event scheduling and tracking system built for field operations in Mozambique.

---

## Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Node.js + Express
- **Database** — MongoDB (Atlas)
- **Auth** — JWT
- **Hosting** — Render (API + Static Site)

---

## Local Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd moz-scheduler
npm install          # root (installs concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Set up environment variables

**Server** — copy and fill in:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/moz-scheduler
JWT_SECRET=some_long_random_secret
PORT=5000
CLIENT_URL=http://localhost:5173

# Optional — email notifications on status changes
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=MOZ Scheduler <youremail@gmail.com>
```

> **Gmail App Password**: Go to myaccount.google.com → Security → 2-Step Verification → App passwords. Email is optional — the app works fine without it.

### 3. MongoDB Atlas (free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas/database)
2. Create a free cluster
3. Create a database user
4. Whitelist `0.0.0.0/0` (all IPs) in Network Access
5. Copy the connection string into `MONGO_URI`

### 4. Run locally

```bash
cd moz-scheduler
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000

---

## First Use

1. Go to `/register`
2. The **first account registered is automatically admin**
3. All subsequent registrations are `staff` by default
4. Admin can promote staff to admin via the Users page

---

## Deploying to Render

### Option A — render.yaml (recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `render.yaml` and creates both services
4. Fill in the environment variables marked `sync: false` in the Render dashboard:
   - `MONGO_URI`
   - `CLIENT_URL` → your static site URL (e.g. `https://moz-scheduler.onrender.com`)
   - `VITE_API_URL` → your API URL (e.g. `https://moz-scheduler-api.onrender.com`)
   - Email vars (optional)

The client automatically appends `/api` in production if your `VITE_API_URL` does not include it.

### Option B — manual

**API (Web Service)**
- Root dir: `server`
- Build: `npm install`
- Start: `npm start`
- Add all env vars from `server/.env.example`

**Client (Static Site)**
- Root dir: `client`
- Build: `npm install && npm run build`
- Publish dir: `dist`
- Add rewrite rule: `/* → /index.html`

> **Free tier note**: Render free tier spins down after 15 min of inactivity. First request takes ~30s to wake up. Upgrade to Starter ($7/mo) for always-on.

---

## Features

| Feature | Who |
|---|---|
| Submit event request (form) | Staff + Admin |
| View own events | Staff |
| View all events | Admin |
| Filter by status, search | Both |
| Update event status | Admin only |
| Email notification on status change | Automatic |
| Add follow-up report | Submitter + Admin (after complete) |
| Export event + follow-ups to PDF | Both |
| Duplicate an event | Both |
| Manage users / roles | Admin only |
| Update own profile + contacts | Both |

---

## Project Structure

```
moz-scheduler/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Followup.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── followups.js
│   │   └── users.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── email.js
│   ├── index.js
│   └── .env.example        ← copy to .env and fill in
├── client/
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── api.js
├── render.yaml
└── README.md
```
# DondoScheduleing
