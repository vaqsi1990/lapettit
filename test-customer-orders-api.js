// Test script for customer orders API
// Run this with: node test-customer-orders-api.js

const testCustomerOrdersAPI = async () => {
  console.log('🧪 Testing Customer Orders API...\n');

  // Test 1: Test with a valid email
  console.log('1️⃣ Testing with valid email...');
  try {
    const response = await fetch('http://localhost:3000/api/orders/customer?email=test@example.com');
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (result.success) {
      console.log('✅ Customer orders API working');
      console.log('📊 Orders found:', result.data.length);
      
      if (result.data.length > 0) {
        console.log('📋 Sample order:', {
          id: result.data[0].id,
          status: result.data[0].status,
          customerEmail: result.data[0].customerEmail,
          createdAt: result.data[0].createdAt
        });
      }
    } else {
      console.log('❌ Customer orders API failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing customer orders API:', error);
  }

  // Test 2: Test with missing email parameter
  console.log('\n2️⃣ Testing with missing email parameter...');
  try {
    const response = await fetch('http://localhost:3000/api/orders/customer');
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 400) {
      console.log('✅ API correctly returns error for missing email parameter');
    } else {
      console.log('❌ API should return 400 for missing email parameter');
    }
  } catch (error) {
    console.error('❌ Error testing missing email parameter:', error);
  }

  // Test 3: Test with empty email parameter
  console.log('\n3️⃣ Testing with empty email parameter...');
  try {
    const response = await fetch('http://localhost:3000/api/orders/customer?email=');
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.status === 400) {
      console.log('✅ API correctly returns error for empty email parameter');
    } else {
      console.log('❌ API should return 400 for empty email parameter');
    }
  } catch (error) {
    console.error('❌ Error testing empty email parameter:', error);
  }

  console.log('\n🎉 Customer orders API test completed!');
};

// Run the test if this file is executed directly
if (require.main === module) {
  testCustomerOrdersAPI().catch(console.error);
}

module.exports = { testCustomerOrdersAPI };
