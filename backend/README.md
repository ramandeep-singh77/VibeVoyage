# VibeVoyage Backend API

AI-Powered Travel Itinerary Planner Backend for Hackathon MVP

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The server will start on `http://localhost:5000`

## 📋 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "VibeVoyage Backend is running",
  "timestamp": "2024-01-31T10:00:00.000Z"
}
```

## 🎯 Core Endpoints

### 1. Generate Itinerary

**Endpoint:** `POST /api/itinerary/generate`

**Request Body:**
```json
{
  "destination": "Paris, France",
  "startDate": "2024-03-15",
  "endDate": "2024-03-18",
  "budget": 1200,
  "interests": ["culture", "food", "history"],
  "travelVibe": "explorer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Itinerary generated successfully",
  "data": {
    "id": "uuid-string",
    "tripSummary": {
      "destination": "Paris, France",
      "startDate": "2024-03-15T00:00:00.000Z",
      "endDate": "2024-03-18T00:00:00.000Z",
      "totalDays": 4,
      "budget": 1200,
      "interests": ["culture", "food", "history"],
      "travelVibe": "explorer"
    },
    "dailyItinerary": [
      {
        "dayNumber": 1,
        "date": "2024-03-15T00:00:00.000Z",
        "activities": [
          {
            "name": "Eiffel Tower",
            "description": "Iconic iron lattice tower and symbol of Paris",
            "duration": 120,
            "estimatedCost": 25,
            "category": "activity",
            "location": {
              "name": "Eiffel Tower",
              "coordinates": { "lat": 48.8584, "lng": 2.2945 },
              "address": "Eiffel Tower Address"
            },
            "startTime": "10:00",
            "endTime": "12:00",
            "priority": 3
          }
        ],
        "dailyBudget": {
          "transport": 8,
          "food": 50,
          "activities": 42,
          "total": 100
        },
        "routeOptimized": true
      }
    ],
    "mapRoutes": [
      {
        "dayNumber": 1,
        "waypoints": [
          {
            "location": {
              "name": "Eiffel Tower",
              "coordinates": { "lat": 48.8584, "lng": 2.2945 }
            },
            "order": 1
          }
        ],
        "totalDistance": "5.2 km",
        "totalDuration": "18 min"
      }
    ],
    "budgetBreakdown": {
      "totalBudget": 1200,
      "dailyAverage": 300,
      "categoryBreakdown": {
        "transport": 120,
        "food": 400,
        "activities": 350,
        "accommodation": 280
      },
      "estimatedTotal": 1150,
      "budgetStatus": "within",
      "recommendations": []
    }
  }
}
```

### 2. Regenerate Day

**Endpoint:** `POST /api/itinerary/regenerate-day`

**Request Body:**
```json
{
  "itineraryId": "uuid-string",
  "dayNumber": 2,
  "preferences": {
    "moreFood": true,
    "lessActivities": false,
    "budgetFocus": "food"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Day 2 regenerated successfully",
  "data": {
    "updatedDay": {
      "dayNumber": 2,
      "date": "2024-03-16T00:00:00.000Z",
      "activities": [...],
      "dailyBudget": {...}
    },
    "fullItinerary": {...}
  }
}
```

### 3. Get Itinerary

**Endpoint:** `GET /api/itinerary/:id`

**Response:**
```json
{
  "success": true,
  "message": "Itinerary retrieved successfully",
  "data": {
    "id": "uuid-string",
    "tripSummary": {...},
    "dailyItinerary": [...],
    "mapRoutes": [...],
    "budgetBreakdown": {...}
  }
}
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vibevoyage
USE_MEMORY_DB=true

# AI Configuration (Optional for MVP)
OPENAI_API_KEY=your_openai_api_key_here
AI_MODEL=gpt-3.5-turbo

# Maps API Configuration (Optional for MVP)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## 🏗️ Architecture

### Folder Structure
```
backend/
├── config/
│   └── database.js          # Database configuration
├── controllers/
│   └── itineraryController.js # Route handlers
├── middleware/
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   └── Itinerary.js         # Data models
├── routes/
│   └── itinerary.js         # API routes
├── services/
│   ├── aiService.js         # AI logic (mock)
│   ├── routeService.js      # Route optimization
│   └── budgetService.js     # Budget calculations
├── server.js                # Main server file
└── package.json
```

### Services Overview

#### 🤖 AI Service (`aiService.js`)
- **Mock Implementation**: Uses predefined activity templates
- **Production Ready**: Structured for OpenAI GPT integration
- **Features**: 
  - Day-wise activity generation
  - Interest-based filtering
  - Travel vibe adjustments
  - Activity regeneration

#### 🗺️ Route Service (`routeService.js`)
- **Route Optimization**: Nearest neighbor algorithm
- **Distance Calculation**: Haversine formula
- **Mock Maps Integration**: Ready for Google Maps API
- **Features**:
  - Multi-day route optimization
  - Travel time estimation
  - Waypoint ordering

#### 💰 Budget Service (`budgetService.js`)
- **Comprehensive Breakdown**: Category-wise analysis
- **Smart Recommendations**: Based on spending patterns
- **Budget Optimization**: Vibe-based allocation
- **Features**:
  - Over/under budget detection
  - Savings opportunities
  - Group cost splitting

## 🧪 Testing

### Sample Request
```bash
curl -X POST http://localhost:5000/api/itinerary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "destination": "Tokyo, Japan",
    "startDate": "2024-04-01",
    "endDate": "2024-04-05",
    "budget": 2000,
    "interests": ["culture", "food", "adventure"],
    "travelVibe": "explorer"
  }'
```

### Test Endpoint
```http
GET /api/itinerary/test/sample
```

## 🚦 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "budget",
      "message": "Budget must be at least $50"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet.js protection
- **CORS**: Configured for frontend origin
- **Error Sanitization**: No sensitive data in responses

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance

- **In-Memory Storage**: Fast for MVP/demo
- **Route Optimization**: O(n²) nearest neighbor
- **Concurrent Requests**: Express.js async handling
- **Response Time**: < 2 seconds for typical requests

## 🔮 Future Enhancements

1. **Real AI Integration**: OpenAI GPT-4 for better itineraries
2. **Maps Integration**: Google Maps/Mapbox for real routes
3. **Database**: MongoDB for persistence
4. **Authentication**: JWT-based user sessions
5. **Caching**: Redis for improved performance
6. **Real-time Updates**: WebSocket for live itinerary updates

## 🐛 Known Limitations (MVP)

- Mock AI responses (no real LLM)
- In-memory storage (data lost on restart)
- Basic route optimization
- Limited destination data
- No user authentication
- No real-time pricing

## 📞 Support

For hackathon demo and questions:
- Check `/health` endpoint for server status
- Use `/api/itinerary/test/sample` for quick testing
- All endpoints return detailed error messages
- Development mode includes full error stack traces

---

**Built for Hackathon MVP** 🏆
Ready to demo, easy to extend, production-ready architecture!