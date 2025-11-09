# Development & Deployment Guide — Hanzi Dojo (漢字道場)

## 🧰 Local Development Setup

### 1️⃣ Install Dependencies
```bash
npm install
npm run dev
```

### 2️⃣ Environment Variables
Create a `.env.local` file in the project root with the following:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
Supabase credentials can be retrieved from the project dashboard.

### 3️⃣ Recommended VS Code Extensions
- Prettier
- ESLint
- Tailwind CSS IntelliSense
- TypeScript React (tsx)

### 4️⃣ Folder Structure Summary
- `/src/components` → UI components
- `/src/lib` → Supabase client, queue logic, drills, scoring, dictionary adapters
- `/src/pages` → Main routes (Practice, Catalog, Dashboard)
- `/src/assets` → Icons, dojo textures, mascot art
- `/src/types` → TypeScript interfaces and enums

---

## 🧪 Testing
- Use **Vitest** for component and logic tests.  
- Recommended coverage: drills, queue sorting, belt rank computation.
- Run:  
  ```bash
  npm run test
  ```

---

## 🔐 Parent/Kid Mode Configuration
- Training mode is a separate full-screen /training route optimized for landscape on tablets/phones.
- Simple "Exit Training" button returns to dashboard (parent supervision assumed, no passcode needed).
- Training should lock/pause when offline (show the dojo-themed offline guard).
- Ensure analytics differentiate between parent console events and kid training events for future insights.

---

## 🗄️ Database Initialization (Supabase)

### Create the Project
1. Log in at [https://supabase.com](https://supabase.com).
2. Create a new project with free-tier Postgres.
3. Copy your URL and anon key for `.env.local`.

### Apply Schema
Use the SQL definitions from `docs/TECH_AND_LOGIC.md` to create:
- `kids`, `entries`, `readings`, `practice_state`, `practice_events`
- `dictionary_entries`, `dictionary_confusions`, `dictionary_missing`
- `test_weeks`, `test_week_items`

### Seed Dictionary Data
1. Maintain a versioned CSV/JSON of the canonical 500 high-frequency characters (and their Traditional/Zhuyin metadata).
2. Import via Supabase SQL `COPY` or the dashboard data editor into `dictionary_entries` and `dictionary_confusions`.
3. When expanding to 1,000+ entries, run an upsert migration so existing data updates in place.
4. Review `dictionary_missing` regularly; append new entries from that backlog to the next seed file.

### Enable Auth
- Activate **Email / Magic Link** auth.
- Allow only logged-in users to read/write their data.

### Create a Private Storage Bucket
- Name: `user_backups`
- Access policy: **private**
- Used for JSON backup snapshots in V1.1+.

---

## ☁️ Deployment to Vercel

### Build Command
```bash
npm run build
```
### Output Directory
```
dist
```

### Steps
1. Go to [https://vercel.com](https://vercel.com).
2. Import GitHub repo → select **Vite preset**.
3. Add environment variables (same as `.env.local`).
4. Set both preview & production redirect URLs in Supabase Auth settings.

---

## 🔁 Continuous Deployment
| Branch | Environment |
|---------|--------------|
| `main` | Production |
| `feature/*` or `dev/*` | Preview deployments |

Merges to `main` automatically update production.  

---

## 🧱 Optional Staging Setup
Create a second Supabase project for staging with separate credentials.  
Set those keys as Vercel **Preview Environment Variables**.

---

## 💾 Backups (V1.1 and later)
### Trigger Points
- After adding a new entry
- After deleting an entry
- On “End Training” session event

### Backup Format
- JSON snapshot containing `entries`, `readings`, and `practice_state`
- Stored at: `user_backups/{user_id}/backup_<timestamp>.json`
- Keep last 5–10 backups per user

### Restore Flow (manual)
1. Parent selects a backup from Dashboard → Settings.  
2. Client fetches and displays snapshot metadata.  
3. Confirm → overwrite or merge tables.

---

## 🧮 Deployment Checklist

| Area | Check |
|-------|--------|
| ✅ Supabase | Schema created, RLS enabled |
| ✅ Dictionary | Initial 500 entries + confusions seeded; `dictionary_missing` monitored |
| ✅ Auth | Email login working |
| ✅ Frontend | Builds locally with `npm run build`; training mode layout verified |
| ✅ Environment | Supabase URL & key added to Vercel |
| ✅ Storage | `user_backups` bucket created |
| ✅ Logs | Network + Supabase events tested, offline guard reviewed |

---

## 🪶 Developer Notes
- Always review the latest `SESSION_LOG.md` before changes.  
- Keep variable names in English but UI strings bilingual (English + Chinese).  
- Avoid blocking animations or sound effects for accessibility.  
- For icons, prefer **Lucide-react**.  
- Offline guard overlays should be tested by simulating network loss in dev tools.  
- When deploying, revalidate all API routes to avoid stale caches and confirm dictionary RPC latency.
