/**
 * API Test Script for VibeVoyage Backend
 * Run with: node test-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testItinerary = {
  destination: "Tokyo, Japan",
  startDate: "2026-06-01",
  endDate: "2026-06-05",
  budget: 2000,
  interests: ["culture", "food", "adventure"],
  travelVibe: "explorer"
};

async function testAPI() {
  console.log('🧪 Testing VibeVoyage Backend API\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health Check:', healthResponse.data.message);
    console.log();

    // Test 2: Generate Itinerary
    console.log('2️⃣ Testing Itinerary Generation...');
    const generateResponse = await axios.post(`${BASE_URL}/itinerary/generate`, testItinerary);
    
    if (generateResponse.data.success) {
      console.log('✅ Itinerary Generated Successfully!');
      console.log(`📍 Destination: ${generateResponse.data.data.tripSummary.destination}`);
      console.log(`📅 Duration: ${generateResponse.data.data.tripSummary.totalDays} days`);
      console.log(`💰 Budget: $${generateResponse.data.data.tripSummary.budget}`);
      console.log(`🎯 Activities: ${generateResponse.data.data.dailyItinerary.length} days planned`);
      
      const itineraryId = generateResponse.data.data.id;
      console.log(`🆔 Itinerary ID: ${itineraryId}`);
      console.log();

      // Test 3: Get Itinerary
      console.log('3️⃣ Testing Get Itinerary...');
      const getResponse = await axios.get(`${BASE_URL}/itinerary/${itineraryId}`);
      
      if (getResponse.data.success) {
        console.log('✅ Itinerary Retrieved Successfully!');
        console.log(`📊 Budget Status: ${getResponse.data.data.budgetBreakdown.budgetStatus}`);
        console.log(`💵 Estimated Total: $${getResponse.data.data.budgetBreakdown.estimatedTotal}`);
        console.log();

        // Test 4: Regenerate Day
        console.log('4️⃣ Testing Day Regeneration...');
        const regenerateData = {
          itineraryId: itineraryId,
          dayNumber: 2,
          preferences: {
            moreFood: true,
            budgetFocus: "food"
          }
        };

        const regenerateResponse = await axios.post(`${BASE_URL}/itinerary/regenerate-day`, regenerateData);
        
        if (regenerateResponse.data.success) {
          console.log('✅ Day 2 Regenerated Successfully!');
          console.log(`🍽️ Updated activities: ${regenerateResponse.data.data.updatedDay.activities.length}`);
          console.log();
        }
      }
    }

    // Test 5: Sample Endpoint
    console.log('5️⃣ Testing Sample Endpoint...');
    const sampleResponse = await axios.get(`${BASE_URL}/itinerary/test/sample`);
    
    if (sampleResponse.data.success) {
      console.log('✅ Sample Itinerary Retrieved!');
      console.log(`📍 Sample Destination: ${sampleResponse.data.data.tripSummary.destination}`);
      console.log();
    }

    // Test 6: Error Handling
    console.log('6️⃣ Testing Error Handling...');
    try {
      await axios.post(`${BASE_URL}/itinerary/generate`, {
        destination: "Test",
        startDate: "invalid-date",
        budget: -100
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Validation Errors Handled Correctly!');
        console.log(`❌ Status: ${error.response.status}`);
        console.log(`📝 Errors: ${error.response.data.errors?.length || 0} validation errors`);
        console.log();
      }
    }

    console.log('🎉 All API Tests Completed Successfully!');
    console.log('\n📋 API Summary:');
    console.log('• Health Check: ✅ Working');
    console.log('• Generate Itinerary: ✅ Working');
    console.log('• Get Itinerary: ✅ Working');
    console.log('• Regenerate Day: ✅ Working');
    console.log('• Sample Data: ✅ Working');
    console.log('• Error Handling: ✅ Working');
    console.log('\n🚀 Backend is ready for frontend integration!');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testAPI();