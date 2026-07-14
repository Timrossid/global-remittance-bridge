# Backend Deployment Guide

The Payment API can be deployed to either **Render** (recommended, free tier) or **Railway**.
Both require the same environment variables. Steps below cover both options.

---

## Prerequisites

You need these values ready before deploying:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Supabase → Project → Settings → Database → Connection string (Transaction pooler, port 6543) |
| `DIRECT_URL` | Supabase → Project → Settings → Database → Connection string (Session pooler, port 5432) |
| `JWT_SECRET` | Run: `openssl rand -hex 32` |
| `STELLAR_SECRET` | Your server Stellar keypair secret (S...) |
| `REDIS_URL` | Upstash → Create Redis DB → `.env` tab → `REDIS_URL` |

The following are already set in `render.yaml` / `railway.toml`:

| Variable | Value |
|---|---|
| `STELLAR_NETWORK` | `testnet` |
| `SOROBAN_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `SOROBAN_CONTRACT_ID` | `CBL3I4IDMIUZJEJG56DV2VP6K7L2ROLT3JYCC53KNU7PPUX6DGPJJVKC` |

---

## Option A — Render (Recommended, Free Tier)

### 1. Deploy via Blueprint (one-click)

Click this URL (replace `your-github-username` if you forked):

```
https://render.com/deploy?repo=https://github.com/Timrossid/global-remittance-bridge
```

Render will read `render.yaml` from the repo root and create the service automatically.

### 2. Set secret environment variables

In the Render dashboard → your service → **Environment** tab, add:

```
DATABASE_URL   = postgresql://<user>:<password>@<host>:6543/<db>?pgbouncer=true
DIRECT_URL     = postgresql://<user>:<password>@<host>:5432/<db>
JWT_SECRET     = <your-32-char-hex-secret>
STELLAR_SECRET = SBRIYWQPCBWAVCORWQZ4ZC7IF3K437N3VQPCTZ2L6BL24SM7VH2VDFO5
REDIS_URL      = redis://<upstash-url>
```

### 3. Trigger a deploy

Click **Manual Deploy → Deploy latest commit**. Render will:
1. `npm ci` — install dependencies
2. `npx prisma generate` — generate Prisma client
3. `npm run build` — compile TypeScript
4. On start: `npx prisma migrate deploy && node dist/payment-api/src/main.js`

### 4. Verify

```bash
curl https://<your-service>.onrender.com/health
# → {"status":"ok","timestamp":"..."}
```

---

## Option B — Railway

### 1. Install CLI and login

```bash
npm install -g @railway/cli
railway login        # opens browser OAuth
```

### 2. Create project and deploy

```bash
git clone https://github.com/Timrossid/global-remittance-bridge
cd global-remittance-bridge

railway init         # creates a new project
railway up           # deploys using railway.toml
```

### 3. Set environment variables

```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set DIRECT_URL="postgresql://..."
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set STELLAR_SECRET="SBRIYWQPCBWAVCORWQZ4ZC7IF3K437N3VQPCTZ2L6BL24SM7VH2VDFO5"
railway variables set REDIS_URL="redis://..."
```

Or set them in the Railway dashboard → your service → **Variables** tab.

### 4. Get the public URL

```bash
railway domain       # generates a *.up.railway.app URL
```

### 5. Verify

```bash
curl https://<your-service>.up.railway.app/health
# → {"status":"ok","timestamp":"..."}
```

---

## After Deployment — Update the Frontend

Once you have the live API URL, update the Vercel environment variables:

1. Go to [vercel.com](https://vercel.com) → your `merchant-dashboard` project → **Settings** → **Environment Variables**
2. Set `NEXT_PUBLIC_API_URL` = `https://<your-api-url>`
3. Redeploy: **Deployments** → **Redeploy**

---

## Running Migrations Manually

If migrations need to be run separately:

```bash
# Render — use the Shell tab in the dashboard
npx prisma migrate deploy

# Railway
railway run npx prisma migrate deploy
```

---

## Health Check

Both Render and Railway probe `GET /health`. The endpoint returns:

```json
{ "status": "ok", "timestamp": "2026-07-14T10:00:00.000Z" }
```
