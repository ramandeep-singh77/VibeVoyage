const express = require('express');
const router = express.Router();
const { generateItinerary, regenerateDay, getItinerary, getDestinationSuggestions } = require('../controllers/itineraryController');
const { validateItineraryInput, validateRegenerateDay, validateDestinationInput } = require('../middleware/validation');

/**
 * @route   POST /api/itinerary/destination-suggestions
 * @desc    Get AI-powered interest suggestions for a destination
 * @access  Public
 */
router.post('/destination-suggestions', validateDestinationInput, getDestinationSuggestions);

/**
 * @route   POST /api/itinerary/generate
 * @desc    Generate a new travel itinerary
 * @access  Public
 */
router.post('/generate', validateItineraryInput, generateItinerary);

/**
 * @route   POST /api/itinerary/regenerate-day
 * @desc    Regenerate a specific day of an existing itinerary
 * @access  Public
 */
router.post('/regenerate-day', validateRegenerateDay, regenerateDay);

/**
 * @route   GET /api/itinerary/:id
 * @desc    Get an existing itinerary by ID
 * @access  Public
 */
router.get('/:id', getItinerary);

/**
 * @route   GET /api/itinerary/test/sample
 * @desc    Get a sample itinerary for testing
 * @access  Public
 */
router.get('/test/sample', (req, res) => {
  const sampleItinerary = {
    tripSummary: {
      destination: "Paris, France",
      startDate: "2024-03-15",
      endDate: "2024-03-18",
      totalDays: 4,
      budget: 1200,
      interests: ["culture", "food", "history"],
      travelVibe: "explorer"
    },
    dailyItinerary: [
      {
        dayNumber: 1,
        date: "2024-03-15",
        activities: [
          {
            name: "Arrive at Charles de Gaulle Airport",
            description: "Land and take RER B to city center",
            duration: 90,
            estimatedCost: 12,
            category: "transport",
            startTime: "10:00",
            endTime: "11:30"
          },
          {
            name: "Lunch at Café de Flore",
            description: "Classic Parisian café experience",
            duration: 60,
            estimatedCost: 25,
            category: "food",
            startTime: "12:00",
            endTime: "13:00"
          }
        ]
      }
    ],
    budgetBreakdown: {
      totalBudget: 1200,
      dailyAverage: 300,
      estimatedTotal: 1150,
      budgetStatus: "within"
    }
  };

  res.json({
    success: true,
    message: "Sample itinerary for testing",
    data: sampleItinerary
  });
});

module.exports = router;