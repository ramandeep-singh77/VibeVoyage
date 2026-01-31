#!/bin/bash

# VibeVoyage Deployment Script
# This script helps deploy both frontend and backend to Vercel

echo "🚀 VibeVoyage Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Deployment Options:"
echo "1. Deploy Frontend only"
echo "2. Deploy Backend only"
echo "3. Deploy Both (Recommended)"
echo "4. Setup Environment Variables"

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo "🌐 Deploying Frontend..."
        vercel --prod
        ;;
    2)
        echo "⚙️ Deploying Backend..."
        cd backend
        vercel --prod
        cd ..
        ;;
    3)
        echo "🌐 Deploying Frontend..."
        vercel --prod
        echo ""
        echo "⚙️ Deploying Backend..."
        cd backend
        vercel --prod
        cd ..
        echo ""
        echo "✅ Both deployments completed!"
        echo "📝 Don't forget to update VITE_API_URL in your frontend environment variables"
        ;;
    4)
        echo "🔧 Environment Variables Setup Guide:"
        echo ""
        echo "Frontend Environment Variables (set in Vercel dashboard):"
        echo "- VITE_API_URL=https://your-backend.vercel.app"
        echo "- VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key"
        echo ""
        echo "Backend Environment Variables (set in Vercel dashboard):"
        echo "- NODE_ENV=production"
        echo "- OPENAI_API_KEY=sk-or-v1-your-openrouter-api-key"
        echo "- OPENAI_BASE_URL=https://openrouter.ai/api/v1"
        echo "- AI_MODEL=gpt-oss-120b"
        echo "- FRONTEND_URL=https://your-frontend.vercel.app"
        echo "- USE_MEMORY_DB=true"
        echo "- RATE_LIMIT_WINDOW_MS=900000"
        echo "- RATE_LIMIT_MAX_REQUESTS=100"
        echo ""
        echo "📖 See DEPLOYMENT.md for detailed instructions"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment script completed!"
echo "📖 Check DEPLOYMENT.md for post-deployment steps"