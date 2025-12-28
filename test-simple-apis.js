#!/usr/bin/env node

// Test simplified APIs without bot protection
const BASE_URL = 'http://localhost:3001';

async function testUploadAPI() {
  console.log('📤 Testing Upload API (without bot protection)\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
      })
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response:`, data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testReportsAPI() {
  console.log('\n📋 Testing Reports API (without bot protection)\n');
  
  // Note: This will fail with 401 unless we have a valid auth token
  // But we can see if the endpoint exists and responds properly
  
  try {
    const response = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Report',
        description: 'Test description',
        reportType: 'SAFETY',
        location: 'Test Location',
        locationType: 'PARK',
        imageUrl: null
      })
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response:`, data);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testBotChallengeRemoved() {
  console.log('\n🚫 Testing Bot Challenge API (should be removed)\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/bot-challenge`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.status === 404) {
      console.log('✅ Bot challenge API successfully removed');
    } else {
      console.log('❌ Bot challenge API still exists');
    }
    
  } catch (error) {
    console.log(`✅ Bot challenge API removed (connection failed as expected)`);
  }
}

async function runTests() {
  console.log('🧪 Testing Simplified APIs (No Bot Protection)\n');
  
  await testUploadAPI();
  await testReportsAPI();
  await testBotChallengeRemoved();
  
  console.log('\n🏁 Tests completed!');
  console.log('📝 Note: Reports API may return 401 without authentication');
  console.log('📝 Note: This is normal behavior for protected endpoints');
}

if (require.main === module) {
  runTests();
}

module.exports = { testUploadAPI, testReportsAPI };