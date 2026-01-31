const Joi = require('joi');

/**
 * Validation schema for itinerary generation
 */
const itinerarySchema = Joi.object({
  destination: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Destination is required',
      'string.min': 'Destination must be at least 2 characters',
      'string.max': 'Destination must not exceed 100 characters'
    }),

  startDate: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),

  budget: Joi.number()
    .positive()
    .min(50)
    .max(50000)
    .required()
    .messages({
      'number.base': 'Budget must be a number',
      'number.positive': 'Budget must be positive',
      'number.min': 'Budget must be at least $50',
      'number.max': 'Budget cannot exceed $50,000',
      'any.required': 'Budget is required'
    }),

  interests: Joi.array()
    .items(
      Joi.string().valid(
        'culture', 'food', 'adventure', 'nature', 'history', 
        'nightlife', 'shopping', 'relaxation', 'photography', 'local-experience'
      )
    )
    .min(1)
    .max(5)
    .required()
    .messages({
      'array.min': 'At least one interest must be selected',
      'array.max': 'Maximum 5 interests can be selected',
      'any.only': 'Invalid interest selected',
      'any.required': 'Interests are required'
    }),

  travelVibe: Joi.string()
    .valid('chill', 'explorer', 'adventure', 'foodie')
    .required()
    .messages({
      'any.only': 'Travel vibe must be one of: chill, explorer, adventure, foodie',
      'any.required': 'Travel vibe is required'
    }),

  transportMode: Joi.string()
    .valid('flight', 'train')
    .default('flight')
    .messages({
      'any.only': 'Transport mode must be either flight or train'
    })
});

/**
 * Validation schema for destination suggestions
 */
const destinationSuggestionsSchema = Joi.object({
  destination: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Destination is required',
      'string.min': 'Destination must be at least 2 characters',
      'string.max': 'Destination must not exceed 100 characters'
    })
});

/**
 * Middleware to validate destination input for suggestions
 */
const validateDestinationInput = (req, res, next) => {
  const { error, value } = destinationSuggestionsSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.validatedData = value;
  next();
};
const regenerateDaySchema = Joi.object({
  itineraryId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid itinerary ID format',
      'any.required': 'Itinerary ID is required'
    }),

  dayNumber: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(30)
    .required()
    .messages({
      'number.base': 'Day number must be a number',
      'number.integer': 'Day number must be an integer',
      'number.positive': 'Day number must be positive',
      'number.min': 'Day number must be at least 1',
      'number.max': 'Day number cannot exceed 30',
      'any.required': 'Day number is required'
    }),

  preferences: Joi.object({
    moreFood: Joi.boolean(),
    lessActivities: Joi.boolean(),
    moreOutdoor: Joi.boolean(),
    moreCultural: Joi.boolean(),
    budgetFocus: Joi.string().valid('transport', 'food', 'activities'),
    avoidActivities: Joi.array().items(Joi.string()),
    preferredStartTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    maxActivities: Joi.number().integer().min(1).max(10)
  }).optional()
});

/**
 * Middleware to validate itinerary generation input
 */
const validateItineraryInput = (req, res, next) => {
  const { error, value } = itinerarySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Additional custom validations
  const { startDate, endDate } = value;
  const tripDuration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

  if (tripDuration > 30) {
    return res.status(400).json({
      success: false,
      message: 'Trip duration cannot exceed 30 days',
      errors: [{ field: 'endDate', message: 'Trip too long' }]
    });
  }

  if (tripDuration < 1) {
    return res.status(400).json({
      success: false,
      message: 'Trip must be at least 1 day',
      errors: [{ field: 'endDate', message: 'Trip too short' }]
    });
  }

  // Budget per day validation
  const budgetPerDay = value.budget / tripDuration;
  if (budgetPerDay < 20) {
    return res.status(400).json({
      success: false,
      message: 'Budget too low for meaningful itinerary',
      errors: [{ field: 'budget', message: 'Minimum $20 per day required' }]
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware to validate day regeneration input
 */
const validateRegenerateDay = (req, res, next) => {
  const { error, value } = regenerateDaySchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Validate destination format and extract city/country
 */
const validateDestination = (destination) => {
  const cleanDestination = destination.trim();
  
  // Basic validation for destination format
  if (!/^[a-zA-Z\s,.-]+$/.test(cleanDestination)) {
    throw new Error('Destination contains invalid characters');
  }

  // Extract city and country if comma-separated
  const parts = cleanDestination.split(',').map(part => part.trim());
  
  return {
    original: cleanDestination,
    city: parts[0],
    country: parts[1] || null,
    formatted: parts.length > 1 ? `${parts[0]}, ${parts[1]}` : parts[0]
  };
};

/**
 * Validate date range and calculate trip details
 */
const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  // Remove time component for comparison
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start < now) {
    throw new Error('Start date cannot be in the past');
  }

  if (end <= start) {
    throw new Error('End date must be after start date');
  }

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  if (totalDays > 30) {
    throw new Error('Trip duration cannot exceed 30 days');
  }

  return {
    startDate: start,
    endDate: end,
    totalDays,
    isWeekend: start.getDay() === 0 || start.getDay() === 6,
    season: getSeason(start)
  };
};

/**
 * Get season based on date (Northern Hemisphere)
 */
const getSeason = (date) => {
  const month = date.getMonth() + 1;
  
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
};

/**
 * Sanitize and validate user input strings
 */
const sanitizeString = (str, maxLength = 100) => {
  if (typeof str !== 'string') return '';
  
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

module.exports = {
  validateItineraryInput,
  validateRegenerateDay,
  validateDestinationInput,
  validateDestination,
  validateDateRange,
  sanitizeString,
  itinerarySchema,
  regenerateDaySchema,
  destinationSuggestionsSchema
};