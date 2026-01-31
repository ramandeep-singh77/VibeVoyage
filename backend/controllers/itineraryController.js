const { v4: uuidv4 } = require('uuid');
const { memoryDB } = require('../config/database');
const aiService = require('../services/aiService');
const routeService = require('../services/routeService');
const budgetService = require('../services/budgetService');

/**
 * Get AI-powered destination suggestions
 */
const getDestinationSuggestions = async (req, res) => {
  try {
    const { destination } = req.body;

    console.log(`🎯 Getting AI suggestions for ${destination}`);

    // Get AI-powered suggestions
    const suggestions = await aiService.getDestinationInterests(destination);

    res.json({
      success: true,
      message: 'Destination suggestions retrieved successfully',
      data: {
        destination,
        ...suggestions
      }
    });

  } catch (error) {
    console.error('❌ Error getting destination suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get destination suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Generate a new travel itinerary
 */
const generateItinerary = async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      budget,
      interests,
      travelVibe,
      transportMode = 'flight'
    } = req.body;

    // Calculate trip duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    console.log(`🎯 Generating AI-powered itinerary for ${destination} (${totalDays} days)`);

    // Generate AI-powered itinerary
    const aiItinerary = await aiService.generateItinerary({
      destination,
      startDate,
      endDate,
      totalDays,
      budget,
      interests,
      travelVibe,
      transportMode
    });

    // Optimize routes for each day
    const optimizedRoutes = await routeService.optimizeAllDayRoutes(aiItinerary.dailyItinerary);

    // Calculate detailed budget breakdown
    const budgetBreakdown = budgetService.calculateBudgetBreakdown(
      aiItinerary.dailyItinerary,
      budget
    );

    // Create complete itinerary object
    const itineraryId = uuidv4();
    const completeItinerary = {
      id: itineraryId,
      tripSummary: {
        destination,
        startDate: start,
        endDate: end,
        totalDays,
        budget,
        interests,
        travelVibe
      },
      dailyItinerary: aiItinerary.dailyItinerary,
      mapRoutes: optimizedRoutes,
      budgetBreakdown,
      metadata: {
        generatedAt: new Date(),
        lastModified: new Date(),
        version: '1.0',
        aiModel: process.env.AI_MODEL || 'gpt-oss-120b',
        regenerationCount: 0
      }
    };

    // Save to database (memory or MongoDB)
    const savedItinerary = memoryDB.saveItinerary(itineraryId, completeItinerary);

    console.log(`✅ AI-powered itinerary generated successfully: ${itineraryId}`);

    res.status(201).json({
      success: true,
      message: 'AI-powered itinerary generated successfully',
      data: savedItinerary
    });

  } catch (error) {
    console.error('❌ Error generating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate itinerary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Regenerate a specific day of an existing itinerary
 */
const regenerateDay = async (req, res) => {
  try {
    const { itineraryId, dayNumber, preferences } = req.body;

    console.log(`🔄 Regenerating day ${dayNumber} for itinerary ${itineraryId} with AI`);

    // Get existing itinerary
    const existingItinerary = memoryDB.getItinerary(itineraryId);
    if (!existingItinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Find the day to regenerate
    const dayIndex = existingItinerary.dailyItinerary.findIndex(
      day => day.dayNumber === dayNumber
    );

    if (dayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Day not found in itinerary'
      });
    }

    // Generate new day with AI
    const originalDay = existingItinerary.dailyItinerary[dayIndex];
    const newDayData = await aiService.regenerateDay({
      destination: existingItinerary.tripSummary.destination,
      dayNumber,
      date: originalDay.date,
      budget: originalDay.dailyBudget.total,
      interests: existingItinerary.tripSummary.interests,
      travelVibe: existingItinerary.tripSummary.travelVibe,
      preferences: preferences || {}
    });

    // Optimize route for the new day
    const optimizedRoute = await routeService.optimizeDayRoute(newDayData);

    // Update the itinerary
    existingItinerary.dailyItinerary[dayIndex] = newDayData;
    existingItinerary.mapRoutes[dayIndex] = optimizedRoute;
    
    // Recalculate budget
    existingItinerary.budgetBreakdown = budgetService.calculateBudgetBreakdown(
      existingItinerary.dailyItinerary,
      existingItinerary.tripSummary.budget
    );

    // Update metadata
    existingItinerary.metadata.lastModified = new Date();
    existingItinerary.metadata.regenerationCount += 1;

    // Save updated itinerary
    const updatedItinerary = memoryDB.updateItinerary(itineraryId, existingItinerary);

    console.log(`✅ Day ${dayNumber} regenerated successfully with AI`);

    res.json({
      success: true,
      message: `Day ${dayNumber} regenerated successfully with AI`,
      data: {
        updatedDay: newDayData,
        fullItinerary: updatedItinerary
      }
    });

  } catch (error) {
    console.error('❌ Error regenerating day:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate day',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get an existing itinerary by ID
 */
const getItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    const itinerary = memoryDB.getItinerary(id);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary retrieved successfully',
      data: itinerary
    });

  } catch (error) {
    console.error('❌ Error retrieving itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve itinerary',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getDestinationSuggestions,
  generateItinerary,
  regenerateDay,
  getItinerary
};