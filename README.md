# 🌍 VibeVoyage - AI-Powered Travel Planner

> **Your Ultimate AI Travel Companion** - Generate personalized itineraries with real-time maps, hotel recommendations, and smart route optimization.

[![Live Demo](https://img.shields.io/badge/🚀-Live%20Demo-blue)](https://vibevoyage.vercel.app)
[![GitHub](https://img.shields.io/badge/⭐-Star%20on%20GitHub-yellow)](https://github.com/ramandeep-singh77/VibeVoyage)

## ✨ Features

### 🤖 **AI-Powered Itinerary Generation**
- **Real GPT Integration**: Uses GPT-OSS-120B via OpenRouter API
- **Destination-Specific**: Generates authentic activities for each location
- **Interest-Based**: Tailored to your preferences (culture, food, adventure, etc.)
- **Smart Regeneration**: Regenerate individual days with AI

### 🗺️ **Google Maps Integration**
- **Interactive Maps**: Real Google Maps with activity markers
- **Hotel Search**: Find nearby hotels with star ratings and budget filtering
- **Route Optimization**: Smart route planning between activities
- **Geocoding**: Automatic location finding with accurate coordinates

### 🚗 **Transport Options**
- **Flight Mode**: Optimized for air travel with driving routes
- **Train Mode**: Public transit-friendly route planning
- **Visual Indicators**: Clear transport mode display

### 📱 **Modern UI/UX**
- **Mobile-First**: Fully responsive design
- **Dark/Light Theme**: Automatic theme switching
- **Smooth Animations**: Polished user experience
- **Intuitive Navigation**: Easy-to-use interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google Maps API key
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramandeep-singh77/VibeVoyage.git
   cd VibeVoyage
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   ```
   
   Update `.env` with your API keys:
   ```env
   OPENAI_API_KEY=your_openrouter_api_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Start backend
   cd backend
   npm start
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── GoogleMap.tsx    # Maps integration
│   └── ...
├── pages/
│   ├── Landing.tsx      # Home page
│   ├── CreateTrip.tsx   # Trip creation form
│   ├── Loading.tsx      # AI generation loading
│   └── Itinerary.tsx    # Generated itinerary display
└── hooks/               # Custom React hooks
```

### Backend (Node.js + Express)
```
backend/
├── controllers/         # Route handlers
├── services/
│   ├── aiService.js    # GPT integration
│   ├── routeService.js # Route optimization
│   └── budgetService.js # Budget calculations
├── middleware/         # Validation & error handling
└── routes/            # API endpoints
```

## 🔧 API Endpoints

### Core Endpoints
- `POST /api/itinerary/generate` - Generate new itinerary
- `POST /api/itinerary/regenerate-day` - Regenerate specific day
- `POST /api/itinerary/destination-suggestions` - Get destination insights
- `GET /api/itinerary/:id` - Retrieve existing itinerary

### Example Request
```javascript
POST /api/itinerary/generate
{
  "destination": "Tokyo, Japan",
  "startDate": "2024-03-15",
  "endDate": "2024-03-18",
  "budget": 1200,
  "interests": ["culture", "food", "nightlife"],
  "travelVibe": "explorer",
  "transportMode": "train"
}
```

## 🌟 Key Features Explained

### 🎯 **Destination-Specific Generation**
- **Problem Solved**: No more generic "Eiffel Tower" activities for Tokyo trips
- **Solution**: Enhanced AI prompts with strict destination validation
- **Result**: Authentic, location-specific activities every time

### 🗺️ **Smart Maps Integration**
- **Interactive Markers**: Click to see activity details, times, and costs
- **Hotel Discovery**: Budget-filtered hotel search with ratings
- **Route Visualization**: Optimized paths between activities
- **Mobile Responsive**: Perfect experience on all devices

### 🤖 **AI-Powered Intelligence**
- **Real GPT Model**: Not mock data - actual AI responses
- **Context Awareness**: Considers interests, budget, and travel style
- **Fallback System**: Graceful handling when AI is unavailable
- **Continuous Learning**: Improves with each generation

## 🛠️ Development

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB (optional)
- **AI**: OpenRouter GPT-OSS-120B
- **Maps**: Google Maps JavaScript API, Places API
- **UI**: shadcn/ui components, Lucide icons

### Development Commands
```bash
# Frontend development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend development
npm start            # Start server
npm run dev          # Start with nodemon
npm test             # Run tests
```

### Environment Variables
```env
# Backend (.env)
PORT=5000
OPENAI_API_KEY=sk-or-v1-your-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=gpt-oss-120b
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel, Netlify, or any static host
```

### Backend (Railway/Heroku)
```bash
# Set environment variables in your hosting platform
# Deploy backend to Railway, Heroku, or DigitalOcean
```

### Environment Setup for Production
- Enable Google Maps APIs (Maps, Places, Geocoding)
- Set up OpenRouter account and API key
- Configure CORS for your domain
- Set up MongoDB (optional) or use in-memory storage

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter** for GPT API access
- **Google Maps** for mapping services
- **shadcn/ui** for beautiful UI components
- **Lucide** for icons
- **Tailwind CSS** for styling

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/ramandeep-singh77/VibeVoyage/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/ramandeep-singh77/VibeVoyage/discussions)
- 📧 **Contact**: [Your Email](mailto:your-email@example.com)

---

<div align="center">

**Made with ❤️ by [Ramandeep Singh](https://github.com/ramandeep-singh77)**

⭐ **Star this repo if you found it helpful!** ⭐

</div>