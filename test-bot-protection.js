#!/usr/bin/env node

// Test script for bot protection functionality
// Run: node test-bot-protection.js

async function testBotChallenge() {
  try {
    console.log('🧪 Testing Bot Challenge API\n')
    
    // Test 1: Generate challenge
    console.log('1. Generating challenge...')
    const response = await fetch('http://localhost:3000/api/bot-challenge')
    const data = await response.json()
    
    if (data.success) {
      console.log(`✅ Challenge generated: ${data.challenge.question}`)
      console.log(`   Timestamp: ${data.challenge.timestamp}`)
      
      // Test 2: Validate correct answer
      console.log('\n2. Testing correct answer...')
      const validateResponse = await fetch('http://localhost:3000/api/bot-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: data.serverData.expectedAnswer,
          expectedAnswer: data.serverData.expectedAnswer,
          timestamp: data.serverData.timestamp
        })
      })
      
      const validateData = await validateResponse.json()
      if (validateData.success) {
        console.log('✅ Correct answer validated')
      } else {
        console.log(`❌ Validation failed: ${validateData.error}`)
      }
      
      // Test 3: Test wrong answer
      console.log('\n3. Testing wrong answer...')
      const wrongResponse = await fetch('http://localhost:3000/api/bot-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: '999',
          expectedAnswer: data.serverData.expectedAnswer,
          timestamp: data.serverData.timestamp
        })
      })
      
      const wrongData = await wrongResponse.json()
      if (!wrongData.success) {
        console.log(`✅ Wrong answer rejected: ${wrongData.error}`)
      } else {
        console.log('❌ Wrong answer was accepted (should have failed)')
      }
      
    } else {
      console.log(`❌ Failed to generate challenge: ${data.error}`)
    }
    
  } catch (error) {
    console.log(`❌ Test error: ${error.message}`)
  }
}

async function testReportWithBot() {
  console.log('\n🤖 Testing Report API with Bot Protection\n')
  
  const testCases = [
    {
      name: 'No bot challenge',
      data: {
        title: 'Test Report',
        reportType: 'SAFETY',
        location: 'Test Location',
        locationType: 'PARK'
      },
      expectFail: true
    },
    {
      name: 'Bot User-Agent',
      headers: {
        'User-Agent': 'Bot/1.0 Spider Crawler'
      },
      data: {
        title: 'Test Report',
        reportType: 'SAFETY', 
        location: 'Test Location',
        locationType: 'PARK',
        formTiming: 5000
      },
      expectFail: true
    },
    {
      name: 'Too fast submission',
      data: {
        title: 'Test Report',
        reportType: 'SAFETY',
        location: 'Test Location',
        locationType: 'PARK',
        formTiming: 1000 // Less than 3 seconds
      },
      expectFail: true
    }
  ]
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`)
      
      const response = await fetch('http://localhost:3000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...testCase.headers
        },
        body: JSON.stringify(testCase.data)
      })
      
      const data = await response.json()
      
      if (testCase.expectFail) {
        if (!response.ok) {
          console.log(`✅ Correctly rejected: ${data.error}`)
        } else {
          console.log('❌ Should have been rejected but was accepted')
        }
      } else {
        if (response.ok) {
          console.log('✅ Correctly accepted')
        } else {
          console.log(`❌ Should have been accepted: ${data.error}`)
        }
      }
      
    } catch (error) {
      console.log(`❌ Test error: ${error.message}`)
    }
    
    console.log('---')
  }
}

async function runAllTests() {
  await testBotChallenge()
  await testReportWithBot()
  
  console.log('\n🏁 All tests completed!')
  console.log('\nTo run manually:')
  console.log('1. npm start (in another terminal)')
  console.log('2. node test-bot-protection.js')
}

if (require.main === module) {
  runAllTests()
}

module.exports = { testBotChallenge, testReportWithBot }