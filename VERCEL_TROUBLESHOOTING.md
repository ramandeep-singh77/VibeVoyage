# 🔧 Vercel Deployment Troubleshooting

## Common Issues and Solutions

### ❌ Environment Variable "VITE_API_URL" references Secret "vite_api_url", which does not exist

**Problem**: The vercel.json file was referencing a secret that doesn't exist.

**Solution**: ✅ **FIXED** - Removed secret reference from vercel.json. Now use regular environment variables.

**How to set environment variables correctly:**

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings → Environment Variables**
3. **Add these variables as regular environment variables (NOT secrets):**

   **Frontend Environment Variables:**
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.vercel.app
   Environment: Production (and Preview if needed)
   
   Name: VITE_GOOGLE_MAPS_API_KEY
   Value: AIzaSyC8zTjtFNz-aACgGDE4utlb1fMhBJO82dE
   Environment: Production (and Preview if needed)
   ```

   **Backend Environment Variables:**
   ```
   Name: NODE_ENV
   Value: production
   Environment: Production
   
   Name: OPENAI_API_KEY
   Value: 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
   Environment: Production
   
   Name: OPENAI_BASE_URL
   Value: https://openrouter.ai/api/v1
   Environment: Production
   
   Name: AI_MODEL
   Value: gpt-oss-120b
   Environment: Production
   
   Name: USE_MEMORY_DB
   Value: true
   Environment: Production
   
   Name: FRONTEND_URL
   Value: https://your-frontend-url.vercel.app
   Environment: Production
   ```

4. **Redeploy your project** after setting environment variables

### 🚀 Deployment Steps (Updated)

#### Step 1: Deploy Backend First
```bash
cd backend
vercel --prod
```

1. When prompted, create a new project
2. Set Root Directory to `backend`
3. After deployment, note the backend URL (e.g., `https://vibevoyage-backend.vercel.app`)
4. Set backend environment variables in Vercel dashboard

#### Step 2: Deploy Frontend
```bash
# Go back to project root
cd ..
vercel --prod
```

1. When prompted, create a new project
2. Keep Root Directory empty (project root)
3. Set frontend environment variables in Vercel dashboard
4. **Important**: Set `VITE_API_URL` to your backend URL from Step 1

#### Step 3: Update Frontend with Backend URL
1. Go to frontend project settings in Vercel
2. Update `VITE_API_URL` environment variable with actual backend URL
3. Redeploy frontend

### 🔍 Common Deployment Issues

#### Issue: Build Fails
**Solutions:**
- Check Node.js version (should be 18.x or 20.x)
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard
- Try building locally: `npm run build`

#### Issue: API Calls Fail (CORS Error)
**Solutions:**
- Verify `VITE_API_URL` points to correct backend URL
- Check backend CORS configuration
- Ensure backend is deployed and accessible
- Test backend health endpoint: `https://your-backend.vercel.app/health`

#### Issue: Google Maps Not Loading
**Solutions:**
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Check Google Cloud Console API restrictions
- Ensure domain is added to allowed referrers
- Check browser console for specific error messages

#### Issue: Serverless Function Timeout
**Solutions:**
- Function timeout is set to 30 seconds (maximum for free tier)
- AI requests may take time - this is expected
- Check function logs in Vercel dashboard
- Consider optimizing AI prompts for faster responses

### 📊 Verification Checklist

After deployment, verify these work:

- [ ] Frontend loads at your Vercel URL
- [ ] Backend health check: `https://your-backend.vercel.app/health`
- [ ] API endpoints respond: `https://your-backend.vercel.app/api/itinerary/test/sample`
- [ ] Google Maps loads on itinerary page
- [ ] AI itinerary generation works
- [ ] No CORS errors in browser console

### 🛠️ Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test local build
npm run build && npm run preview

# Check backend health
curl https://your-backend.vercel.app/health

# Test API endpoint
curl https://your-backend.vercel.app/api/itinerary/test/sample
```

### 📞 Still Having Issues?

1. **Check Vercel deployment logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test API endpoints manually** using curl or Postman
4. **Check browser console** for client-side errors
5. **Ensure API keys are valid** and have proper permissions

### 🎯 Quick Fix Commands

If you need to redeploy after fixing issues:

```bash
# Redeploy frontend
vercel --prod

# Redeploy backend
cd backend
vercel --prod
cd ..

# Or use the deployment script
./deploy.sh
```

---

**✅ The secret reference issue has been fixed. Your project should now deploy successfully!**