// Configuration for API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Only log in development to avoid production console spam
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_URL,
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD
  });
}

export const API_ENDPOINTS = {
  GENERATE_ITINERARY: `${API_BASE_URL}/api/itinerary/generate`,
  REGENERATE_DAY: `${API_BASE_URL}/api/itinerary/regenerate-day`,
  DESTINATION_SUGGESTIONS: `${API_BASE_URL}/api/itinerary/destination-suggestions`,
  GET_ITINERARY: (id: string) => `${API_BASE_URL}/api/itinerary/${id}`,
  HEALTH: `${API_BASE_URL}/health`
};

// Helper function for API calls with better error handling
export const apiCall = async (url: string, options: RequestInit = {}) => {
  try {
    if (import.meta.env.DEV) {
      console.log('🌐 Making API call to:', url);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (import.meta.env.DEV) {
      console.log('📥 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (import.meta.env.DEV) {
      console.log('✅ API Success:', { url, dataKeys: Object.keys(data) });
    }
    return data;
  } catch (error) {
    console.error('❌ API Call Failed:', { url, error: error.message });
    throw error;
  }
};

export { API_BASE_URL };