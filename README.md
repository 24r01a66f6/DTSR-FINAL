# DTSR-FINAL
USE THIS FOR HOSTING
# Deployment Guide: Hosting Your AI Resume Builder for Free

Since your project is a full-stack application (React frontend + Node.js backend + MongoDB cloud), the best way to host it for free is to use **Render** for the backend and **Vercel** for the frontend.

## Prerequisites
1.  **GitHub**: Upload your project to GitHub (follow "Option B" from our previous discussion).
2.  **MongoDB Atlas**: Ensure your [MongoDB URI](file:///c:/Users/RAHUL/OneDrive/Desktop/new%20project/resume%20builder%20anti%20gravity/backend/.env) is working (it already is!).

---

## Step 1: Deploy the Backend (to Render.com)

1.  Go to [Render.com](https://render.com/) and create a free account.
2.  Click **"New +"** and select **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Name**: `resume-builder-backend`
    *   **Runtime**: `Node`
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**:
    *   Click the "Advanced" button.
    *   Add everything from your [backend/.env](file:///c:/Users/RAHUL/OneDrive/Desktop/new%20project/resume%20builder%20anti%20gravity/backend/.env) file:
        *   `MONGO_URI`: (Your MongoDB string)
        *   `JWT_SECRET`: (Your secret key)
        *   `OPENROUTER_API_KEY`: (Your OpenRouter key)
6.  **Deploy**: Click "Create Web Service". Render will give you a URL like `https://resume-builder-backend.onrender.com`. **Save this URL.**

---

## Step 2: Deploy the Frontend (to Vercel.com)

1.  Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2.  Click **"Add New"** > **"Project"**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Select **"Vite"**.
5.  **Root Directory**: Set this to `frontend`.
6.  **Environment Variables**:
    *   Add a variable named `VITE_API_BASE_URL`.
    *   Set its value to your **Render Backend URL** (e.g., `https://resume-builder-backend.onrender.com`).
7.  **Deploy**: Click "Deploy". Vercel will give you a live URL for your website!

---

## Important Final Checks

### 1. CORS Policy
Once your Vercel app is live, you must tell your backend that it's allowed to receive requests from that specific website.
*   In your [backend/server.js](file:///c:/Users/RAHUL/OneDrive/Desktop/new%20project/resume%20builder%20anti%20gravity/backend/server.js), ensure `cors()` is configured. If you have issues, update it to:
    ```javascript
    app.use(cors({ origin: 'https://your-vercel-app-url.vercel.app' }));
    ```

### 2. Frontend API Calls
Ensure your frontend is using the environment variable for API calls. If you are using `127.0.0.1` anywhere in your frontend code, you'll need to update it to use the dynamic URL.

---

> [!TIP]
> **Free Tier Sleep**: Render's free tier "sleeps" after 15 minutes of inactivity. The first time you visit your site after a break, the backend might take 30-60 seconds to "wake up." This is normal for free hosting!
