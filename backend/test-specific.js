const axios = require('axios');

async function testSpecificItinerary() {
  try {
    console.log('🧪 Testing specific itinerary generation...');
    
    const testData = {
      destination: "Paris, France",
      startDate: "2026-06-01",
      endDate: "2026-06-03",
      budget: 800,
      interests: ["culture", "food", "history"],
      travelVibe: "explorer"
    };

    console.log('📤 Sending request:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/itinerary/generate', testData, {
      timeout: 60000 // 60 second timeout
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response success:', response.data.success);
    
    if (response.data.success) {
      console.log('✅ Itinerary generated successfully!');
      console.log('🏷️ AI Model:', response.data.data.metadata.aiModel);
      console.log('📋 Days:', response.data.data.dailyItinerary.length);
      
      // Show first day details
      const firstDay = response.data.data.dailyItinerary[0];
      console.log('\n📅 Day 1 Details:');
      console.log('🎯 Activities:', firstDay.activities.length);
      firstDay.activities.forEach((activity, index) => {
        console.log(`   ${index + 1}. ${activity.name} - $${activity.estimatedCost} (${activity.category})`);
      });
    } else {
      console.log('❌ Failed:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testSpecificItinerary();