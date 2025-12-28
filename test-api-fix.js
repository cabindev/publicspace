#!/usr/bin/env node

// Test fixed API endpoints
const BASE_URL = 'http://localhost:3001';

async function testUploadAPI() {
  console.log('🧪 Testing Upload API\n');
  
  try {
    // Test 1: Valid video URL
    console.log('1. Testing valid YouTube URL...');
    const response1 = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' 
      })
    });
    
    const data1 = await response1.json();
    console.log(`✅ Status: ${response1.status}`);
    console.log(`✅ Response:`, data1);
    
    // Test 2: Invalid JSON
    console.log('\n2. Testing invalid JSON...');
    const response2 = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ invalid json -'
    });
    
    const data2 = await response2.json();
    console.log(`✅ Status: ${response2.status}`);
    console.log(`✅ Response:`, data2);
    
    // Test 3: Wrong content type
    console.log('\n3. Testing wrong content type...');
    const response3 = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ videoUrl: 'test' })
    });
    
    const data3 = await response3.json();
    console.log(`✅ Status: ${response3.status}`);
    console.log(`✅ Response:`, data3);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testBotChallengeAPI() {
  console.log('\n🤖 Testing Bot Challenge API\n');
  
  try {
    // Test challenge generation
    console.log('1. Testing challenge generation...');
    const response = await fetch(`${BASE_URL}/api/bot-challenge`);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Challenge: ${data.challenge.question}`);
      console.log(`✅ Timestamp: ${data.challenge.timestamp}`);
    } else {
      console.log(`❌ Failed: ${data.error}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🔧 API Fix Tests\n');
  
  await testUploadAPI();
  await testBotChallengeAPI();
  
  console.log('\n🏁 Tests completed!\n');
  console.log('Note: Reports API now allows submissions without bot challenge (for testing)');
}

if (require.main === module) {
  runTests();
}

module.exports = { testUploadAPI, testBotChallengeAPI };