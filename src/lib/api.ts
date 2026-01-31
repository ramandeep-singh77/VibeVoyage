// Configuration for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  GENERATE_ITINERARY: `${API_BASE_URL}/api/itinerary/generate`,
  REGENERATE_DAY: `${API_BASE_URL}/api/itinerary/regenerate-day`,
  DESTINATION_SUGGESTIONS: `${API_BASE_URL}/api/itinerary/destination-suggestions`,
  GET_ITINERARY: (id: string) => `${API_BASE_URL}/api/itinerary/${id}`,
  HEALTH: `${API_BASE_URL}/health`
};

export { API_BASE_URL };