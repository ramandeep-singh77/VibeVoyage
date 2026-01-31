/**
 * Route Optimization Service
 * Handles route optimization and distance calculations
 * Mock implementation for hackathon MVP
 */

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Simple nearest neighbor algorithm for route optimization
 */
const optimizeRoute = (activities) => {
  if (activities.length <= 2) return activities;

  const optimized = [];
  const remaining = [...activities];
  
  // Start with the first activity
  let current = remaining.shift();
  optimized.push(current);

  // Find nearest neighbor for each subsequent activity
  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const distance = calculateDistance(
        current.location.coordinates,
        remaining[i].location.coordinates
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    current = remaining.splice(nearestIndex, 1)[0];
    optimized.push(current);
  }

  return optimized;
};

/**
 * Optimize route for a single day
 */
const optimizeDayRoute = async (dayItinerary) => {
  console.log(`🗺️  Optimizing route for day ${dayItinerary.dayNumber}`);

  const activities = dayItinerary.activities.filter(
    activity => activity.location && activity.location.coordinates
  );

  if (activities.length === 0) {
    return {
      dayNumber: dayItinerary.dayNumber,
      waypoints: [],
      totalDistance: '0 km',
      totalDuration: '0 min'
    };
  }

  // Optimize the route
  const optimizedActivities = optimizeRoute(activities);
  
  // Calculate total distance and duration
  let totalDistance = 0;
  let totalDuration = 0;

  const waypoints = optimizedActivities.map((activity, index) => {
    if (index > 0) {
      const distance = calculateDistance(
        optimizedActivities[index - 1].location.coordinates,
        activity.location.coordinates
      );
      totalDistance += distance;
      totalDuration += Math.ceil(distance * 3); // Assume 3 minutes per km travel time
    }

    return {
      location: {
        name: activity.location.name,
        coordinates: activity.location.coordinates
      },
      order: index + 1
    };
  });

  return {
    dayNumber: dayItinerary.dayNumber,
    waypoints,
    totalDistance: `${totalDistance.toFixed(1)} km`,
    totalDuration: `${totalDuration} min`
  };
};

/**
 * Optimize routes for all days in an itinerary
 */
const optimizeAllDayRoutes = async (dailyItinerary) => {
  console.log('🗺️  Optimizing routes for all days');

  const optimizedRoutes = [];

  for (const day of dailyItinerary) {
    const optimizedRoute = await optimizeDayRoute(day);
    optimizedRoutes.push(optimizedRoute);
    
    // Update the day's activities with optimized order
    const activitiesWithCoords = day.activities.filter(
      activity => activity.location && activity.location.coordinates
    );
    
    if (activitiesWithCoords.length > 0) {
      const optimizedActivities = optimizeRoute(activitiesWithCoords);
      
      // Merge back with activities without coordinates
      const activitiesWithoutCoords = day.activities.filter(
        activity => !activity.location || !activity.location.coordinates
      );
      
      day.activities = [...optimizedActivities, ...activitiesWithoutCoords];
      day.routeOptimized = true;
    }
  }

  return optimizedRoutes;
};

/**
 * Get mock route data for Google Maps integration
 */
const getMockRouteData = (waypoints) => {
  return {
    routes: [{
      legs: waypoints.slice(1).map((waypoint, index) => ({
        distance: { text: '1.2 km', value: 1200 },
        duration: { text: '4 mins', value: 240 },
        start_location: waypoints[index].location.coordinates,
        end_location: waypoint.location.coordinates
      })),
      overview_polyline: {
        points: 'mock_encoded_polyline_string'
      }
    }]
  };
};

/**
 * Calculate estimated travel time between locations
 */
const calculateTravelTime = (distance, mode = 'walking') => {
  const speeds = {
    walking: 5, // km/h
    driving: 30, // km/h in city
    transit: 20  // km/h average
  };

  const speed = speeds[mode] || speeds.walking;
  const timeInHours = distance / speed;
  const timeInMinutes = Math.ceil(timeInHours * 60);

  return timeInMinutes;
};

/**
 * Generate directions between two points
 */
const getDirections = async (origin, destination, mode = 'walking') => {
  // Mock implementation - in production, use Google Maps Directions API
  const distance = calculateDistance(origin, destination);
  const duration = calculateTravelTime(distance, mode);

  return {
    distance: `${distance.toFixed(1)} km`,
    duration: `${duration} min`,
    mode,
    steps: [
      {
        instruction: `Head ${getDirection(origin, destination)} on main road`,
        distance: `${(distance * 0.6).toFixed(1)} km`,
        duration: `${Math.ceil(duration * 0.6)} min`
      },
      {
        instruction: 'Turn right and continue to destination',
        distance: `${(distance * 0.4).toFixed(1)} km`,
        duration: `${Math.ceil(duration * 0.4)} min`
      }
    ]
  };
};

/**
 * Get general direction between two coordinates
 */
const getDirection = (origin, destination) => {
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;

  if (Math.abs(latDiff) > Math.abs(lngDiff)) {
    return latDiff > 0 ? 'north' : 'south';
  } else {
    return lngDiff > 0 ? 'east' : 'west';
  }
};

module.exports = {
  optimizeDayRoute,
  optimizeAllDayRoutes,
  calculateDistance,
  calculateTravelTime,
  getDirections,
  getMockRouteData
};