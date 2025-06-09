/**
 * Test script for Community Creation NextAuth.js v5 Beta Fix
 * 
 * This script tests the session handling and community creation flow
 * to verify that the NextAuth.js v5 beta issues have been resolved.
 */

// Test session validation endpoint
async function testSessionValidation() {
  console.log('🔍 Testing session validation...');
  
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const session = await response.json();
    
    console.log('✅ Session validation response:', {
      status: response.status,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    });
    
    return session;
  } catch (error) {
    console.error('❌ Session validation failed:', error);
    return null;
  }
}

// Test community creation API
async function testCommunityCreation(startupId, communityName) {
  console.log('🏗️ Testing community creation...');
  
  try {
    const response = await fetch('/api/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startupId: startupId,
        name: communityName,
        description: `Test community for ${communityName}`,
      }),
    });
    
    const result = await response.json();
    
    console.log('✅ Community creation response:', {
      status: response.status,
      ok: response.ok,
      result: result,
    });
    
    return { response, result };
  } catch (error) {
    console.error('❌ Community creation failed:', error);
    return { error };
  }
}

// Test error handling for invalid requests
async function testErrorHandling() {
  console.log('🚨 Testing error handling...');
  
  try {
    // Test with missing data
    const response = await fetch('/api/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    
    const result = await response.json();
    
    console.log('✅ Error handling response:', {
      status: response.status,
      errorCode: result.code,
      errorMessage: result.message,
    });
    
    return { response, result };
  } catch (error) {
    console.error('❌ Error handling test failed:', error);
    return { error };
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Community Creation Tests...\n');
  
  // Test 1: Session validation
  const session = await testSessionValidation();
  console.log('\n');
  
  // Test 2: Error handling
  await testErrorHandling();
  console.log('\n');
  
  // Test 3: Community creation (only if session exists)
  if (session && session.user && session.user.id) {
    console.log('👤 User authenticated, testing community creation...');
    
    // Use a test startup ID (you may need to replace this with a real one)
    const testStartupId = 'test-startup-id';
    const testCommunityName = 'Test Community ' + Date.now();
    
    await testCommunityCreation(testStartupId, testCommunityName);
  } else {
    console.log('👤 User not authenticated, skipping community creation test');
  }
  
  console.log('\n🏁 Tests completed!');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCommunityCreation = {
    runTests,
    testSessionValidation,
    testCommunityCreation,
    testErrorHandling,
  };
  
  console.log('🔧 Community creation test functions loaded!');
  console.log('Run window.testCommunityCreation.runTests() to start testing');
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runTests,
    testSessionValidation,
    testCommunityCreation,
    testErrorHandling,
  };
}
