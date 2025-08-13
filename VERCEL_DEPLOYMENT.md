# Vercel Deployment Fix Guide

## Issue
Your Vehicle Configurator is deployed on Vercel but showing "Failed to initialize configurator session" because the frontend is trying to connect to a backend that doesn't exist.

## Solutions

### Option 1: Deploy Backend Separately (Recommended)

1. **Deploy the Flask backend** (easiest option):
   - Use the `/deployment` folder which contains a Flask app with demo data
   - Deploy to Railway, Render, or Heroku
   - Set the `VITE_API_BASE_URL` environment variable in Vercel

2. **Deploy the Node.js backend**:
   - Use the `/backend` folder
   - Deploy to Railway, Render, or Heroku
   - Set up Supabase database
   - Set the `VITE_API_BASE_URL` environment variable in Vercel

### Option 2: Quick Fix with Demo Data

If you want to test quickly, you can deploy the Flask backend to Railway:

1. **Deploy to Railway**:
   ```bash
   cd deployment
   # Create a new Railway project
   # Upload the deployment folder
   ```

2. **Set Environment Variables in Vercel**:
   - Go to your Vercel project settings
   - Add environment variable: `VITE_API_BASE_URL`
   - Set value to your Railway app URL + `/api`
   - Example: `https://your-app.railway.app/api`

### Option 3: Use Supabase Functions (Advanced)

You can create Supabase Edge Functions to replace the backend entirely.

## Steps to Fix

### 1. Deploy Backend (Railway Example)

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Set the root directory to `/deployment`
5. Railway will automatically detect it's a Python app
6. Deploy

### 2. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-app.railway.app/api`
   - **Environment**: Production, Preview, Development
4. Redeploy your Vercel app

### 3. Test the Connection

After deployment, your app should work with demo data. The Flask backend includes:
- Demo chassis data
- Demo body configurations
- Session management
- Basic API endpoints

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.railway.app/api` |

## Troubleshooting

### If you still see connection errors:

1. **Check CORS**: Ensure your backend allows requests from your Vercel domain
2. **Check API endpoints**: Verify the backend is responding at the correct URL
3. **Check environment variables**: Make sure they're set correctly in Vercel
4. **Check browser console**: Look for CORS or network errors

### For production with real data:

1. Set up Supabase database
2. Deploy the Node.js backend with proper Supabase credentials
3. Update environment variables to point to your production backend

## Quick Test

To test if your backend is working, visit:
`https://your-backend-url.railway.app/api/chassis`

You should see JSON data with chassis options.
