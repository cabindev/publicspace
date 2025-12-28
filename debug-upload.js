#!/usr/bin/env node

// Debug upload API with various request types
const BASE_URL = 'http://localhost:3001';

async function testVariousRequests() {
  console.log('🐛 Debugging Upload API\n');
  
  const tests = [
    {
      name: 'Valid JSON',
      body: JSON.stringify({ videoUrl: 'https://youtube.com/watch?v=test' }),
      contentType: 'application/json'
    },
    {
      name: 'Empty body',
      body: '',
      contentType: 'application/json'
    },
    {
      name: 'Invalid JSON - missing quote',
      body: '{ videoUrl: "test" }',
      contentType: 'application/json'
    },
    {
      name: 'Invalid JSON - trailing comma',
      body: '{ "videoUrl": "test", }',
      contentType: 'application/json'
    },
    {
      name: 'Only opening brace',
      body: '{',
      contentType: 'application/json'
    },
    {
      name: 'Form data instead of JSON',
      body: 'videoUrl=https://youtube.com/test',
      contentType: 'application/x-www-form-urlencoded'
    }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`${i + 1}. Testing: ${test.name}`);
    console.log(`   Body: "${test.body}"`);
    console.log(`   Content-Type: ${test.contentType}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': test.contentType },
        body: test.body
      });
      
      const data = await response.json();
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Response: ${JSON.stringify(data)}`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

if (require.main === module) {
  testVariousRequests();
}