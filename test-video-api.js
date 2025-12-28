#!/usr/bin/env node

// Test script for video URL API functionality
// Run: node test-video-api.js

const testVideoUrls = [
  // Valid URLs
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://vimeo.com/123456789',
  'https://drive.google.com/file/d/1234567890/view',
  
  // Invalid URLs (should be rejected)
  'http://youtube.com/watch?v=test', // HTTP instead of HTTPS
  'https://malicious-site.com/video.mp4', // Disallowed domain
  'not-a-url', // Invalid format
  'https://youtube.com/../../../etc/passwd' // Path traversal attempt
]

async function testUploadApi(url, expectValid = true) {
  try {
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl: url })
    })
    
    const data = await response.json()
    
    const status = response.ok ? '✅ PASS' : '❌ FAIL'
    const expected = expectValid ? 'should pass' : 'should fail'
    
    console.log(`${status} | ${url}`)
    console.log(`   Expected: ${expected}, Got: ${response.status} ${response.ok ? 'success' : 'error'}`)
    
    if (data.error) {
      console.log(`   Error: ${data.error}`)
    } else if (data.url) {
      console.log(`   Sanitized: ${data.url}`)
    }
    
    console.log('---')
    
  } catch (error) {
    console.log(`❌ ERROR | ${url}`)
    console.log(`   ${error.message}`)
    console.log('---')
  }
}

async function runTests() {
  console.log('🧪 Testing Video URL API\n')
  
  // Test valid URLs
  console.log('Testing VALID URLs (should pass):')
  for (let i = 0; i < 4; i++) {
    await testUploadApi(testVideoUrls[i], true)
  }
  
  // Test invalid URLs  
  console.log('Testing INVALID URLs (should fail):')
  for (let i = 4; i < testVideoUrls.length; i++) {
    await testUploadApi(testVideoUrls[i], false)
  }
  
  console.log('🏁 Tests completed!')
  console.log('\nTo run manually:')
  console.log('npm start (in another terminal)')
  console.log('node test-video-api.js')
}

if (require.main === module) {
  runTests()
}

module.exports = { testUploadApi, testVideoUrls }