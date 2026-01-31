const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  duration: {
    type: Number, // in minutes
    required: true
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    enum: ['transport', 'food', 'activity', 'accommodation'],
    required: true
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
  },
  startTime: String, // "09:00"
  endTime: String,   // "11:00"
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
});

const DayItinerarySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  activities: [ActivitySchema],
  dailyBudget: {
    transport: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  routeOptimized: {
    type: Boolean,
    default: false
  }
});

const ItinerarySchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  tripSummary: {
    destination: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    },
    budget: {
      type: Number,
      required: true
    },
    interests: [{
      type: String,
      enum: ['culture', 'food', 'adventure', 'nature', 'history', 'nightlife', 'shopping', 'relaxation', 'photography', 'local-experience']
    }],
    travelVibe: {
      type: String,
      enum: ['chill', 'explorer', 'adventure', 'foodie'],
      required: true
    }
  },
  dailyItinerary: [DayItinerarySchema],
  budgetBreakdown: {
    totalBudget: Number,
    dailyAverage: Number,
    categoryBreakdown: {
      transport: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 }
    },
    estimatedTotal: Number,
    budgetStatus: {
      type: String,
      enum: ['under', 'within', 'over'],
      default: 'within'
    }
  },
  mapRoutes: [{
    dayNumber: Number,
    waypoints: [{
      location: {
        name: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      order: Number
    }],
    totalDistance: String,
    totalDuration: String
  }],
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    lastModified: {
      type: Date,
      default: Date.now
    },
    version: {
      type: String,
      default: '1.0'
    },
    aiModel: String,
    regenerationCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Update lastModified on save
ItinerarySchema.pre('save', function(next) {
  this.metadata.lastModified = new Date();
  next();
});

module.exports = mongoose.model('Itinerary', ItinerarySchema);