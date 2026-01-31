/**
 * AI Service for generating travel itineraries
 * Integrated with OpenRouter GPT API for real AI-powered itinerary generation
 */

const axios = require('axios');

// OpenRouter API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1';
const AI_MODEL = process.env.AI_MODEL || 'gpt-oss-120b';

/**
 * Parse AI response with robust error handling
 */
const parseAIResponse = (response) => {
  try {
    // Clean the response - remove markdown code blocks and extra whitespace
    let cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    
    // Remove any text before the first { or [
    const jsonStart = Math.min(
      cleanResponse.indexOf('{') !== -1 ? cleanResponse.indexOf('{') : Infinity,
      cleanResponse.indexOf('[') !== -1 ? cleanResponse.indexOf('[') : Infinity
    );
    
    if (jsonStart !== Infinity && jsonStart > 0) {
      cleanResponse = cleanResponse.substring(jsonStart);
    }
    
    // Try to fix incomplete JSON by finding the last complete object
    let bracketCount = 0;
    let lastValidIndex = -1;
    
    for (let i = 0; i < cleanResponse.length; i++) {
      if (cleanResponse[i] === '{') bracketCount++;
      if (cleanResponse[i] === '}') {
        bracketCount--;
        if (bracketCount === 0) {
          lastValidIndex = i;
        }
      }
    }
    
    if (lastValidIndex > 0 && bracketCount !== 0) {
      cleanResponse = cleanResponse.substring(0, lastValidIndex + 1);
    }
    
    // Try to parse the cleaned response
    const parsed = JSON.parse(cleanResponse);
    console.log('✅ JSON parsed successfully');
    return parsed;
    
  } catch (error) {
    console.error('❌ JSON parsing failed:', error.message);
    console.error('Response length:', response.length);
    console.error('First 200 chars:', response.substring(0, 200));
    console.error('Last 200 chars:', response.substring(Math.max(0, response.length - 200)));
    throw new Error('Invalid JSON response from AI');
  }
};

/**
 * Make API call to OpenRouter GPT with retry logic
 */
const callGPTAPI = async (messages, maxTokens = 2000, retries = 2) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🤖 AI API Call (attempt ${attempt}/${retries})`);
      
      const response = await axios.post(`${OPENAI_BASE_URL}/chat/completions`, {
        model: AI_MODEL,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://vibevoyage.com',
          'X-Title': 'VibeVoyage Travel Planner'
        },
        timeout: 30000 // 30 second timeout
      });

      const content = response.data.choices[0].message.content;
      console.log(`✅ AI Response received (${content.length} characters)`);
      return content;
      
    } catch (error) {
      console.error(`❌ GPT API Error (attempt ${attempt}):`, error.response?.data || error.message);
      
      if (attempt === retries) {
        throw new Error('AI service temporarily unavailable');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Get destination-based interest suggestions
 */
const getDestinationInterests = async (destination) => {
  console.log(`🎯 AI: Getting interest suggestions for ${destination}`);

  const prompt = `You are a travel expert. For the destination "${destination}", suggest the most relevant travel interests from this list: culture, food, adventure, nature, history, nightlife, shopping, relaxation, photography, local-experience.

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown, no extra text.

Return this exact JSON structure:
{
  "suggestedInterests": ["interest1", "interest2", "interest3", "interest4", "interest5"],
  "destinationInfo": {
    "bestTimeToVisit": "season/months",
    "averageBudgetPerDay": 100,
    "topAttractions": ["attraction1", "attraction2", "attraction3"],
    "localCurrency": "currency name",
    "language": "primary language",
    "timeZone": "timezone"
  }
}

Focus on the top 5 most relevant interests for ${destination}. Use only the interests from the provided list.`;

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a travel expert who provides accurate destination information and interest suggestions. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callGPTAPI(messages, 800);
    
    // Parse JSON response with robust error handling
    const parsedResponse = parseAIResponse(response);
    
    return parsedResponse;
  } catch (error) {
    console.error('❌ Error getting destination interests:', error);
    // Fallback to default suggestions
    return {
      suggestedInterests: ['culture', 'food', 'history', 'photography', 'local-experience'],
      destinationInfo: {
        bestTimeToVisit: 'Year-round',
        averageBudgetPerDay: 100,
        topAttractions: ['Local attractions', 'Cultural sites', 'Food markets'],
        localCurrency: 'Local currency',
        language: 'Local language',
        timeZone: 'Local timezone'
      }
    };
  }
};

/**
 * Generate a complete itinerary using real AI
 */
const generateItinerary = async (params) => {
  const {
    destination,
    startDate,
    totalDays,
    budget,
    interests,
    travelVibe,
    transportMode = 'flight'
  } = params;

  console.log(`🤖 AI: Generating ${totalDays}-day itinerary for ${destination}`);

  const dailyBudget = Math.floor(budget / totalDays);
  
  const prompt = `Create a ${totalDays}-day itinerary for ${destination}. Budget: $${budget}. Interests: ${interests.join(', ')}. Vibe: ${travelVibe}.

CRITICAL REQUIREMENTS:
1. ALL activities MUST be located in ${destination} - NO activities from other cities
2. Use REAL places that exist in ${destination}
3. Include accurate coordinates for ${destination} locations
4. Match activities to the specified interests: ${interests.join(', ')}
5. Consider the ${travelVibe} travel style

Return ONLY this JSON (no extra text):
{
  "dailyItinerary": [
    {
      "dayNumber": 1,
      "date": "${startDate}",
      "activities": [
        {
          "name": "Specific place name in ${destination}",
          "description": "Brief description of this ${destination} location",
          "duration": 120,
          "estimatedCost": 25,
          "category": "activity",
          "location": {"name": "Exact location name", "coordinates": {"lat": 0.0000, "lng": 0.0000}, "address": "Real address in ${destination}"},
          "startTime": "09:00",
          "endTime": "11:00",
          "priority": 3
        }
      ]
    }
  ]
}

IMPORTANT: Create ${totalDays} days with 3-4 activities each. Every activity must be a real place in ${destination}. Use accurate coordinates for ${destination}, not examples from other cities.`;

  try {
    const messages = [
      {
        role: 'system',
        content: `You are a professional travel planner with extensive knowledge of destinations worldwide. You MUST create itineraries with activities that are actually located in the specified destination. Never use activities from other cities or countries. Always use real places with accurate coordinates. Always respond with valid JSON only.`
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callGPTAPI(messages, 4000); // Increased token limit
    
    // Parse JSON response with robust error handling
    const parsedResponse = parseAIResponse(response);
    
    // Validate and enhance the response
    const enhancedItinerary = enhanceItineraryData(parsedResponse.dailyItinerary, params);
    
    return { dailyItinerary: enhancedItinerary };
  } catch (error) {
    console.error('❌ Error generating AI itinerary:', error);
    // Fallback to mock data if AI fails
    return generateFallbackItinerary(params);
  }
};

/**
 * Enhance AI-generated itinerary with additional data
 */
const enhanceItineraryData = (dailyItinerary, params) => {
  return dailyItinerary.map((day, index) => {
    // Ensure proper date formatting
    const dayDate = new Date(params.startDate);
    dayDate.setDate(dayDate.getDate() + index);
    
    // Calculate daily budget
    const dailyBudget = calculateDayBudget(day.activities);
    
    return {
      ...day,
      dayNumber: index + 1,
      date: dayDate,
      dailyBudget,
      routeOptimized: false
    };
  });
};

/**
 * Calculate daily budget breakdown
 */
const calculateDayBudget = (activities) => {
  const breakdown = {
    transport: 0,
    food: 0,
    activities: 0,
    total: 0
  };

  activities.forEach(activity => {
    const cost = activity.estimatedCost || 0;
    const category = activity.category;

    if (breakdown.hasOwnProperty(category)) {
      breakdown[category] += cost;
    }
    breakdown.total += cost;
  });

  return breakdown;
};

/**
 * Regenerate a specific day using AI
 */
const regenerateDay = async (params) => {
  const {
    destination,
    dayNumber,
    date,
    budget,
    interests,
    travelVibe,
    preferences
  } = params;

  console.log(`🤖 AI: Regenerating day ${dayNumber} for ${destination}`);

  const preferencesText = preferences ? Object.entries(preferences)
    .filter(([key, value]) => value === true)
    .map(([key]) => key.replace(/([A-Z])/g, ' $1').toLowerCase())
    .join(', ') : '';

  const prompt = `You are an expert travel planner. Regenerate day ${dayNumber} of a trip to ${destination}.

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown, no extra text.

**Day Details:**
- Day: ${dayNumber}
- Date: ${date}
- Daily Budget: $${budget}
- Interests: ${interests.join(', ')}
- Travel Vibe: ${travelVibe}
${preferencesText ? `- Special Preferences: ${preferencesText}` : ''}

**Requirements:**
1. Create 3-5 activities for this day
2. Include realistic timing and costs
3. Stay within the daily budget of $${budget}
4. Consider preferences: ${preferencesText || 'standard planning'}

Return this exact JSON structure:
{
  "dayNumber": ${dayNumber},
  "date": "${date}",
  "activities": [
    {
      "name": "Activity Name",
      "description": "Brief description",
      "duration": 120,
      "estimatedCost": 25,
      "category": "activity",
      "location": {
        "name": "Location Name",
        "coordinates": {"lat": 0.0, "lng": 0.0},
        "address": "Address"
      },
      "startTime": "09:00",
      "endTime": "11:00",
      "priority": 3
    }
  ]
}

Use real place names for ${destination}.`;

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a professional travel planner. Create detailed, realistic day plans with accurate information. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callGPTAPI(messages, 2000);
    
    // Parse JSON response with robust error handling
    const parsedResponse = parseAIResponse(response);
    
    // Calculate daily budget
    const dailyBudget = calculateDayBudget(parsedResponse.activities);
    
    return {
      ...parsedResponse,
      date: new Date(date),
      dailyBudget,
      routeOptimized: false
    };
  } catch (error) {
    console.error('❌ Error regenerating day:', error);
    // Fallback to mock regeneration
    return generateFallbackDay(params);
  }
};

/**
 * Fallback itinerary generation (mock data)
 */
const generateFallbackItinerary = (params) => {
  console.log(`⚠️ Using fallback itinerary generation for ${params.destination}`);
  
  // Get approximate coordinates for major destinations
  const getDestinationCoords = (destination) => {
    const dest = destination.toLowerCase();
    if (dest.includes('paris')) return { lat: 48.8566, lng: 2.3522 };
    if (dest.includes('tokyo')) return { lat: 35.6762, lng: 139.6503 };
    if (dest.includes('london')) return { lat: 51.5074, lng: -0.1278 };
    if (dest.includes('new york')) return { lat: 40.7128, lng: -74.0060 };
    if (dest.includes('rome')) return { lat: 41.9028, lng: 12.4964 };
    if (dest.includes('barcelona')) return { lat: 41.3851, lng: 2.1734 };
    if (dest.includes('amsterdam')) return { lat: 52.3676, lng: 4.9041 };
    if (dest.includes('berlin')) return { lat: 52.5200, lng: 13.4050 };
    if (dest.includes('madrid')) return { lat: 40.4168, lng: -3.7038 };
    if (dest.includes('lisbon')) return { lat: 38.7223, lng: -9.1393 };
    // Default to center of Europe if unknown
    return { lat: 50.0755, lng: 14.4378 };
  };

  const coords = getDestinationCoords(params.destination);
  
  // Generate generic activities based on interests
  const generateActivities = (interests, destination) => {
    const activities = [];
    
    if (interests.includes('culture') || interests.includes('history')) {
      activities.push({
        name: `Historic District of ${destination.split(',')[0]}`,
        category: 'activity',
        duration: 120,
        cost: 15,
        description: `Explore the historic heart of ${destination.split(',')[0]}`
      });
    }
    
    if (interests.includes('food')) {
      activities.push({
        name: `Local Restaurant in ${destination.split(',')[0]}`,
        category: 'food',
        duration: 90,
        cost: 35,
        description: `Traditional cuisine of ${destination.split(',')[0]}`
      });
    }
    
    if (interests.includes('nature')) {
      activities.push({
        name: `City Park in ${destination.split(',')[0]}`,
        category: 'activity',
        duration: 90,
        cost: 0,
        description: `Relax in a beautiful park in ${destination.split(',')[0]}`
      });
    }
    
    if (interests.includes('shopping')) {
      activities.push({
        name: `Shopping District of ${destination.split(',')[0]}`,
        category: 'activity',
        duration: 120,
        cost: 50,
        description: `Browse local shops in ${destination.split(',')[0]}`
      });
    }
    
    // Add transport if not enough activities
    if (activities.length < 3) {
      activities.push({
        name: `Public Transport Pass`,
        category: 'transport',
        duration: 0,
        cost: 15,
        description: `Day pass for public transportation`
      });
    }
    
    return activities.slice(0, 4); // Max 4 activities per day
  };

  const dailyItinerary = [];
  const startDateObj = new Date(params.startDate);
  const baseActivities = generateActivities(params.interests, params.destination);

  for (let day = 1; day <= params.totalDays; day++) {
    const currentDate = new Date(startDateObj);
    currentDate.setDate(startDateObj.getDate() + (day - 1));

    const activities = baseActivities.map((activity, index) => ({
      name: activity.name,
      description: activity.description,
      duration: activity.duration,
      estimatedCost: activity.cost,
      category: activity.category,
      location: {
        name: activity.name,
        coordinates: { 
          lat: coords.lat + (Math.random() - 0.5) * 0.02, 
          lng: coords.lng + (Math.random() - 0.5) * 0.02 
        },
        address: `${activity.name}, ${params.destination}`
      },
      startTime: `${9 + index * 2}:00`,
      endTime: `${9 + index * 2 + Math.floor(activity.duration / 60)}:00`,
      priority: 3
    }));

    dailyItinerary.push({
      dayNumber: day,
      date: currentDate,
      activities,
      dailyBudget: calculateDayBudget(activities),
      routeOptimized: false
    });
  }

  return { dailyItinerary };
};

/**
 * Fallback day regeneration
 */
const generateFallbackDay = (params) => {
  console.log('⚠️ Using fallback day regeneration');
  
  const activities = [
    {
      name: 'Morning Activity',
      description: 'Start your day with exploration',
      duration: 120,
      estimatedCost: 20,
      category: 'activity',
      location: {
        name: 'Local Attraction',
        coordinates: { lat: 48.8566, lng: 2.3522 },
        address: 'Local Address'
      },
      startTime: '09:00',
      endTime: '11:00',
      priority: 3
    }
  ];

  return {
    dayNumber: params.dayNumber,
    date: new Date(params.date),
    activities,
    dailyBudget: calculateDayBudget(activities),
    routeOptimized: false
  };
};

module.exports = {
  generateItinerary,
  regenerateDay,
  getDestinationInterests
};