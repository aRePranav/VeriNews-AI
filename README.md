# VeriNews AI

Real-time fake news detection. Paste a headline or article, get a verdict, a
calibrated confidence score, and the exact words that drove the decision —
no black box.

Built by **R Pranav** as part of the Intrainz AI internship, on top of the
[FakeCheck](https://github.com/aRePranav/FakeCheck) project.

```
verinews/
├── ml/            training pipeline + source-of-truth model artifacts
├── backend/       FastAPI service (TF-IDF + Passive Aggressive Classifier)
└── frontend/      Next.js site (the portfolio-facing UI)
```

## What's real here

This is not a mockup wired to fake data. Specifically:

- The model was trained from scratch on your actual **WELFake dataset**
  (72,134 labeled articles) — `ml/train.py` is the exact script that produced
  the artifacts shipped in `backend/app/artifacts/`.
- Four models were trained and compared on a held-out 20% test split:
  Passive Aggressive Classifier (selected for production), Linear SVC,
  Logistic Regression, Naive Bayes. Real numbers, no placeholders — see
  `backend/app/artifacts/metrics.json`.
- `/predict` runs the live model on every request and writes the result to a
  real SQLite database. The "Live database" section on the site reads that
  same database back out.
- Word-level explainability comes directly from the trained linear model's
  coefficients × each word's TF-IDF weight in your specific input — not a
  canned explanation.

**One honest limitation worth knowing going in:** the model was trained on
full articles (median ~400 words), so very short headline-only input is
noticeably less reliable than full-article input. The API detects this and
returns a warning; the UI surfaces it. This is documented openly in the
site's "Limitations & Future Work" section rather than hidden.

---

## 1. Local development

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env                                 # adjust if needed
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/health` — you should see `{"status": "ok"}`.
Interactive API docs are at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # points at http://localhost:8000 by default
npm run dev
```

Visit `http://localhost:3000`.

---

## 2. Deploying for real (so you get a live link)

### Step A — Push to GitHub

From the `verinews/` folder:

```bash
git init
git add .
git commit -m "VeriNews AI: full-stack fake news detection platform"
git branch -M main
git remote add origin https://github.com/aRePranav/FakeCheck.git
git push -u origin main
```

(If you'd rather keep this separate from the original FakeCheck repo, create
a new empty repo on GitHub first and use its URL instead.)

> Note: `frontend/node_modules` and `frontend/.next` are git-ignored on
> purpose — Vercel installs dependencies itself during build.

### Step B — Deploy the backend on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service** →
   connect your GitHub repo.
2. **Root directory:** `backend`
3. **Runtime:** Docker (it'll pick up the `Dockerfile` automatically) — or,
   if you'd rather not use Docker: **Environment:** Python 3, **Build
   command:** `pip install -r requirements.txt`, **Start command:**
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add an environment variable: `VERINEWS_ALLOWED_ORIGINS` = `*` for now
   (tighten to your real Vercel URL once you have it — see Step D).
5. Deploy. Copy the resulting URL, e.g. `https://verinews-api.onrender.com`.

**On persistence:** Render's free tier filesystem is not guaranteed to
survive redeploys. For a portfolio demo this is usually fine — predictions
made during a session will show up in "Live database" until the next
redeploy. If you want predictions to persist permanently, the easiest path
is a free Postgres instance on [Neon](https://neon.tech) or
[Supabase](https://supabase.com) and swapping the few SQLite calls in
`backend/app/database.py` for `psycopg`.

### Step C — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** →
   import the same GitHub repo.
2. **Root directory:** `frontend`
3. Add an environment variable: `NEXT_PUBLIC_API_URL` = the Render URL from
   Step B (e.g. `https://verinews-api.onrender.com`).
4. Deploy. Vercel gives you a URL like `https://verinews-ai.vercel.app` —
   **this is the link you put in your portfolio.**

### Step D — Lock down CORS (optional but recommended)

Back in Render, set `VERINEWS_ALLOWED_ORIGINS` to your real Vercel URL
instead of `*`, and redeploy the backend. This stops other sites from
hitting your API directly.

---

## 3. Retraining the model

If you want to retrain (e.g. with more data, different hyperparameters):

```bash
cd ml
pip install pandas scikit-learn nltk joblib
python3 train.py   # expects WELFake_Dataset.csv at the path set in train.py
```

This regenerates `ml/artifacts/`. Copy the four files
(`vectorizer.joblib`, `model_raw.joblib`, `model_calibrated.joblib`,
`metrics.json`) into `backend/app/artifacts/` and redeploy the backend.

---

## 4. API reference

| Endpoint | Method | Description |
|---|---|---|
| `/predict` | POST | `{"text": "..."}` → verdict, confidence, word-level explanation |
| `/model-metrics` | GET | Dataset stats + all 4 models' comparison metrics |
| `/stats` | GET | Aggregate prediction counts (FAKE vs REAL ratio) |
| `/history` | GET | Recent predictions (`?limit=10`) |
| `/health` | GET | Health check |

Full interactive docs at `/docs` once the backend is running (FastAPI's
built-in Swagger UI).

---

## 5. Tech stack

Python · scikit-learn · FastAPI · SQLite · Next.js · TypeScript · Tailwind
CSS · Framer Motion · Recharts
