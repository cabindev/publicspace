#!/usr/bin/env node

// Test working upload functionality
const BASE_URL = 'http://localhost:3001';

async function testFileUpload() {
  console.log('📤 Testing File Upload API\n');
  
  try {
    // Create a simple test "image" data
    const testImageData = Buffer.from('test-image-content')
    
    // Create FormData with test file
    const formData = new FormData()
    const testFile = new File([testImageData], 'test.jpg', { 
      type: 'image/jpeg',
      lastModified: Date.now() 
    })
    
    formData.append('image', testFile)
    
    console.log('1. Testing image upload...');
    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response:`, data);
    
    if (response.ok) {
      console.log(`✅ File uploaded successfully: ${data.url}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function testInvalidFile() {
  console.log('\n📤 Testing Invalid File Type\n');
  
  try {
    // Test with invalid file type
    const formData = new FormData()
    const testFile = new File(['test'], 'test.txt', { 
      type: 'text/plain',
      lastModified: Date.now() 
    })
    
    formData.append('image', testFile)
    
    console.log('1. Testing invalid file type (.txt)...');
    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`✅ Response:`, data);
    
    if (response.status === 400) {
      console.log(`✅ Correctly rejected invalid file type`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Testing Working Upload API\n');
  
  await testFileUpload();
  await testInvalidFile();
  
  console.log('\n🏁 Tests completed!');
}

if (require.main === module) {
  runTests();
}

module.exports = { testFileUpload, testInvalidFile };