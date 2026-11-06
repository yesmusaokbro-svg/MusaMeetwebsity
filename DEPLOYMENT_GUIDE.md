# MusaMeet - Production Deployment Guide

## Overview
This guide will help you deploy MusaMeet to production with:
- **Frontend**: Vercel (free tier)
- **Backend**: Railway or Render (free tier)

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app) OR Render account (render.com)

---

## Part 1: Deploy Backend (WebRTC Signaling Server)

### Option A: Railway (Recommended)

1. **Push code to GitHub** (if not already done):
```bash
cd c:\Users\HP\MusaMeetwebsity
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

2. **Deploy to Railway**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `MusaMeetwebsity` repository
   - Railway will auto-detect the Node.js project

3. **Configure Railway**:
   - Click on your service → "Settings"
   - Set **Root Directory**: `server`
   - Set **Start Command**: `npm start`
   - Under "Networking" → Click "Generate Domain"
   - Copy your domain (e.g., `musameet-server.railway.app`)

4. **Environment Variables** (if needed):
   - Go to "Variables" tab
   - Add: `PORT` = `3001` (Railway will override with its own port)
   - Add: `NODE_ENV` = `production`

### Option B: Render

1. **Deploy to Render**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: musameet-server
     - **Root Directory**: `server`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

2. **Note your URL**: e.g., `https://musameet-server.onrender.com`

---

## Part 2: Update Frontend Configuration

### Step 1: Update WebRTC Service

Edit `client/src/services/webrtcService.js`:

```javascript
// Replace localhost with your production backend URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
```

### Step 2: Create Environment Files

Create `client/.env.production`:

```env
VITE_SOCKET_URL=https://your-railway-domain.railway.app
```

Create `client/.env.development`:

```env
VITE_SOCKET_URL=http://localhost:3001
```

---

## Part 3: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional):
```bash
npm install -g vercel
```

2. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Add Environment Variable**:
   - Go to "Settings" → "Environment Variables"
   - Add: `VITE_SOCKET_URL` = `https://your-backend-url`
   - Click "Redeploy"

4. **Your app is live!**: e.g., `https://musameet.vercel.app`

---

## Part 4: Update Backend CORS

After deploying frontend, update backend CORS to allow your Vercel domain:

Edit `server/server.js`:

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://musameet.vercel.app",  // Add your Vercel domain
      "https://*.vercel.app"           // Allow all Vercel preview deployments
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

Commit and push changes to trigger redeployment.

---

## Part 5: Testing Production Deployment

1. Open your Vercel URL in two different browsers (or normal + incognito)
2. Test all features:
   - ✅ Camera preview
   - ✅ Waiting room approval
   - ✅ Video streaming between participants
   - ✅ Raise hand with queue numbers
   - ✅ Chat, screen sharing
   - ✅ Virtual backgrounds

---

## Troubleshooting

### Issue: "Cannot connect to server"
- Check backend URL in Vercel environment variables
- Verify backend is running on Railway/Render
- Check browser console for CORS errors

### Issue: "CORS policy error"
- Ensure your Vercel domain is added to server CORS config
- Redeploy backend after CORS changes

### Issue: "Video not showing"
- HTTPS is required for camera/microphone access
- Both Vercel and Railway/Render provide HTTPS by default

### Issue: "Connection timeout"
- Railway free tier spins down after inactivity (first request takes ~30s)
- Consider upgrading to paid tier for always-on service

---

## Cost Estimate

**Free Tier (Perfect for testing):**
- Vercel: Free (100GB bandwidth/month)
- Railway: Free ($5 credit/month, ~500 hours)
- Render: Free (750 hours/month)

**Paid Tier (For production):**
- Vercel Pro: $20/month
- Railway: Pay-as-you-go (~$5-20/month)
- Render: $7/month per service

---

## Next Steps After Deployment

1. **Custom Domain** (optional):
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains
   - Update CORS with new domain

2. **Monitoring**:
   - Railway/Render provide built-in logs
   - Add error tracking (Sentry)
   - Monitor uptime (UptimeRobot)

3. **Security Enhancements**:
   - Add rate limiting
   - Implement user authentication
   - Add meeting passwords

4. **Performance Optimization**:
   - Enable CDN for static assets
   - Compress video streams
   - Implement connection quality indicators

---

## Quick Deploy Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL noted
- [ ] Frontend environment variable set
- [ ] Frontend deployed to Vercel
- [ ] Backend CORS updated with Vercel URL
- [ ] Production testing complete
- [ ] Custom domain configured (optional)

---

## Support

If you encounter issues:
1. Check deployment logs (Railway/Render/Vercel dashboards)
2. Verify environment variables are set correctly
3. Test locally first: `npm run dev` (client) + `npm start` (server)
4. Check browser console for errors

**Your MusaMeet app is ready for the world! 🚀**
