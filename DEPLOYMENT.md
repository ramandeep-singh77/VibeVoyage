# 🚀 Deployment Guide - VibeVoyage

This guide covers deploying VibeVoyage to Vercel with separate frontend and backend deployments.

## 📋 Prerequisites

- Vercel account (free tier works)
- GitHub repository (already set up)
- OpenRouter API key (`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`)
- Google Maps API key (`AIzaSyC8zTjtFNz-aACgGDE4utlb1fMhBJO82dE`)

## 🎯 Deployment Strategy

VibeVoyage uses a **split deployment** approach:
- **Frontend**: Deployed as a static site on Vercel
- **Backend**: Deployed as serverless functions on Vercel

## 🚀 Quick Deployment

### Option 1: Use Deployment Script (Recommended)
```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment script
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# Deploy frontend
vercel --prod

# Deploy backend
cd backend
vercel --prod
cd ..
```

## 🌐 Frontend Deployment

### 1. Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import `ramandeep-singh77/VibeVoyage`

2. **Configure Build Settings**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Root Directory: (leave empty)
   ```

3. **Set Environment Variables**
   
   In your Vercel project dashboard:
   - Go to Settings → Environment Variables
   - Add the following variables:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC8zTjtFNz-aACgGDE4utlb1fMhBJO82dE
   ```
   
   **Important**: 
   - Set these as regular environment variables, NOT secrets
   - Make sure to select "Production" environment
   - The VITE_API_URL should point to your deployed backend URL

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend will be live at `https://your-project.vercel.app`

## 🔧 Backend Deployment

### 1. Create Separate Backend Project

1. **Create New Vercel Project**
   - Import the same repository
   - Set Root Directory to `backend`

2. **Configure Build Settings**
   ```
   Framework Preset: Other
   Build Command: (leave empty)
   Output Directory: (leave empty)
   Install Command: npm install
   Root Directory: backend
   ```

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   OPENAI_API_KEY=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
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   AI_MODEL=gpt-oss-120b
   FRONTEND_URL=https://your-frontend.vercel.app
   USE_MEMORY_DB=true
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Deploy Backend**
   - Click "Deploy"
   - Your backend will be live at `https://your-backend.vercel.app`

### 2. Update Frontend Environment

1. Go to Frontend project settings
2. Update `VITE_API_URL` to your backend URL
3. Redeploy frontend

## 🔐 Environment Variables Setup

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC8zTjtFNz-aACgGDE4utlb1fMhBJO82dE
```

### Backend (.env)
```env
NODE_ENV=production
OPENAI_API_KEY=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
OPENAI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=gpt-oss-120b
FRONTEND_URL=https://your-frontend.vercel.app
USE_MEMORY_DB=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗺️ Google Maps API Setup

### 1. Enable Required APIs
In Google Cloud Console, enable:
- Maps JavaScript API
- Places API
- Geocoding API

### 2. Configure API Key Restrictions
- **Application restrictions**: HTTP referrers
- **Website restrictions**: Add your Vercel domains
  ```
  https://your-project.vercel.app/*
  https://your-custom-domain.com/*
  ```

### 3. API restrictions
- Restrict to: Maps JavaScript API, Places API, Geocoding API

## 🔄 Continuous Deployment

Both projects are configured for automatic deployment:
- **Trigger**: Push to `main` branch
- **Build**: Automatic via Vercel
- **Deploy**: Automatic on successful build

## 📊 Vercel Configuration Files

### Frontend (vercel.json)
```json
{
  "version": 2,
  "name": "vibevoyage-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "max-age=31536000, immutable"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Backend (backend/vercel.json)
```json
{
  "version": 2,
  "name": "vibevoyage-backend",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ],
  "functions": {
    "server.js": {
      "maxDuration": 30
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version (use 18.x)
   - Verify all dependencies are in package.json
   - Check build logs in Vercel dashboard

2. **API Calls Fail**
   - Verify VITE_API_URL is correct
   - Check CORS settings in backend
   - Ensure environment variables are set

3. **Google Maps Not Loading**
   - Verify API key is correct
   - Check domain restrictions
   - Ensure required APIs are enabled

4. **Serverless Function Timeout**
   - AI requests may take time
   - Function timeout set to 30 seconds
   - Consider implementing request queuing for longer requests

### Debug Commands
```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test local build
npm run build && npm run preview
```

## 📈 Performance Optimization

### Frontend
- Static asset caching (configured in vercel.json)
- Image optimization via Vercel
- Bundle size optimization with Vite

### Backend
- Serverless function cold start optimization
- Response caching for repeated requests
- Memory-based storage for fast access

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit API keys
   - Use Vercel's environment variable system
   - Separate dev/prod environments

2. **API Security**
   - CORS properly configured for multiple domains
   - Rate limiting enabled (100 requests per 15 minutes)
   - Input validation on all endpoints

3. **Google Maps**
   - API key restrictions enabled
   - Domain restrictions configured
   - Usage monitoring enabled

## 🎯 Production Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Environment variables configured
- [ ] Google Maps API working
- [ ] AI integration functional
- [ ] CORS configured correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check Google Cloud Console for API usage

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)

---

**Your VibeVoyage app is now ready for production! 🌍✈️**