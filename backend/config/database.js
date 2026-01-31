const mongoose = require('mongoose');

// In-memory storage for MVP (when MongoDB is not available)
let memoryStorage = {
  itineraries: new Map(),
  users: new Map()
};

const connectDB = async () => {
  try {
    if (process.env.USE_MEMORY_DB === 'true') {
      console.log('📦 Using in-memory database for MVP');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibevoyage', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log('⚠️  MongoDB connection failed, falling back to in-memory storage');
    console.error(error.message);
    process.env.USE_MEMORY_DB = 'true';
  }
};

// Memory database operations
const memoryDB = {
  // Save itinerary
  saveItinerary: (id, data) => {
    memoryStorage.itineraries.set(id, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return memoryStorage.itineraries.get(id);
  },

  // Get itinerary
  getItinerary: (id) => {
    return memoryStorage.itineraries.get(id);
  },

  // Update itinerary
  updateItinerary: (id, data) => {
    const existing = memoryStorage.itineraries.get(id);
    if (existing) {
      const updated = {
        ...existing,
        ...data,
        updatedAt: new Date()
      };
      memoryStorage.itineraries.set(id, updated);
      return updated;
    }
    return null;
  },

  // Delete itinerary
  deleteItinerary: (id) => {
    return memoryStorage.itineraries.delete(id);
  },

  // Get all itineraries (for testing)
  getAllItineraries: () => {
    return Array.from(memoryStorage.itineraries.values());
  }
};

module.exports = {
  connectDB,
  memoryDB
};