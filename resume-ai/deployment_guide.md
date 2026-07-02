# Cloud Deployment Guide - Resume AI & Staffing Site

This guide walks you through deploying the complete application (Next.js Staffing Site, FastAPI Backend, Background Worker, and React Frontend) to the cloud so they run 24/7 without needing your local computer.

---

## Step 1: Deploy the Backend on Render (FastAPI + Worker)

We have provided a `render.yaml` blueprint configuration. Render will automatically set up both the API Web Service and the Background Worker from it.

1. Go to **[Render.com](https://render.com/)** and log in.
2. Click on **Blueprints** in the top navigation, then click **New Blueprint Instance**.
3. Connect your GitHub repository: `mohitjain1619-code/staffing_company`.
4. Render will auto-detect the configuration from `resume-ai/backend/render.yaml`.
5. Fill in the required environment variables:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string.
   * `REDIS_URL`: Your Upstash Redis connection string (`rediss://...`).
   * `GEMINI_API_KEYS`: Your Gemini API keys (comma-separated).
   * `R2_ACCOUNT_ID`: Cloudflare R2 Account ID.
   * `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: Cloudflare R2 access credentials.
   * `STRIPE_SECRET_KEY`: Stripe API Secret key.
6. Click **Deploy**. Render will build and start both the **resume-ai-backend** server and the **resume-ai-worker**.
7. Copy the live URL of your **resume-ai-backend** (e.g., `https://resume-ai-backend.onrender.com`).

---

## Step 2: Deploy the Resume Builder Frontend on Vercel

1. Go to **[Vercel.com](https://vercel.com/)** and log in.
2. Click **Add New > Project**, and select the `staffing_company` repository.
3. In **Project Settings**:
   * **Project Name**: `resume-ai-frontend` (or similar).
   * **Root Directory**: Click Edit and select **`resume-ai/frontend`**.
   * **Framework Preset**: `Vite` (auto-detected).
4. Expand **Environment Variables** and add:
   * `VITE_API_URL`: Paste your Render backend URL from Step 1 (e.g., `https://resume-ai-backend.onrender.com`).
   * `VITE_GOOGLE_CLIENT_ID`: `120675702482-22lphhribogmqk8avjlb636ao6el4j5n.apps.googleusercontent.com`
   * `VITE_SENTRY_DSN`: `https://8e5c35bc8274c68f4633b275f64cf18d@o4511667541245952.ingest.us.sentry.io/4511667553107968`
5. Click **Deploy**. Copy your live frontend URL once completed (e.g., `https://resume-ai-frontend.vercel.app` or your custom domain `https://tailor.averioncareers.com`).

---

## Step 3: Link the Next.js Staffing Site to the Live Resume Builder

We have updated the Next.js site to dynamically read the Resume Builder URL from environment variables.

1. Open your existing Next.js **staffing-site** project on your Vercel Dashboard.
2. Go to **Settings > Environment Variables**.
3. Add a new variable:
   * **Key**: `NEXT_PUBLIC_RESUME_BUILDER_URL`
   * **Value**: Paste the live Vercel URL of the resume builder frontend from Step 2 (e.g., `https://resume-ai-frontend.vercel.app` or `https://tailor.averioncareers.com`).
4. Trigger a redeployment of your main staffing website (under **Deployments > Redeploy** on Vercel).
5. Once rebuilt, the "AI Resume Tailoring" navigation links and preview section CTA buttons on `https://www.averioncareers.com` will automatically redirect users to your live cloud-based resume builder!
