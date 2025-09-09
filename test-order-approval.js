// Test script for order approval functionality
// Run this with: node test-order-approval.js

const testOrderApproval = async () => {
  console.log('🧪 Testing Order Approval System...\n');

  // Test 1: Create a regular order
  console.log('1️⃣ Creating a regular order...');
  try {
    const orderResponse = await fetch('http://localhost:3000/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cakeId: 1,
        quantity: 2,
        customerName: 'Test Customer',
        lastName: 'Test',
        customerPhone: '555123456',
        customerEmail: 'test@example.com',
        address: 'Test Address 123',
        city: 'Tbilisi',
        notes: 'Test order for approval system',
        totalPrice: 50.00
      }),
    });

    const orderResult = await orderResponse.json();
    console.log('✅ Regular order created:', orderResult);

    if (orderResult.success) {
      // Test 2: Approve the order
      console.log('\n2️⃣ Approving the order...');
      const approveResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          status: 'APPROVED',
          action: 'approve'
        }),
      });

      const approveResult = await approveResponse.json();
      console.log('✅ Order approved:', approveResult);
    }

  } catch (error) {
    console.error('❌ Error creating/approving regular order:', error);
  }

  // Test 3: Create a custom cake order
  console.log('\n3️⃣ Creating a custom cake order...');
  try {
    const customOrderResponse = await fetch('http://localhost:3000/api/custom-cake', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        design: 'Test Design',
        flavor: 'Chocolate',
        filling: 'Vanilla',
        glaze: 'Chocolate',
        shape: 'Round',
        decorations: ['Flowers', 'Sprinkles'],
        text: 'Happy Birthday',
        quantity: 1,
        deliveryDate: '2024-12-25',
        deliveryTime: '14:00',
        totalPrice: 75.00,
        customerName: 'Custom Test Customer',
        lastName: 'Custom',
        customerPhone: '555654321',
        customerEmail: 'custom@example.com',
        address: 'Custom Address 456',
        city: 'Batumi',
        notes: 'Test custom cake order'
      }),
    });

    const customOrderResult = await customOrderResponse.json();
    console.log('✅ Custom cake order created:', customOrderResult);

    if (customOrderResult.success) {
      // Test 4: Approve the custom order
      console.log('\n4️⃣ Approving the custom order...');
      const approveCustomResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: customOrderResult.orderId,
          status: 'APPROVED',
          action: 'approve'
        }),
      });

      const approveCustomResult = await approveCustomResponse.json();
      console.log('✅ Custom order approved:', approveCustomResult);
    }

  } catch (error) {
    console.error('❌ Error creating/approving custom order:', error);
  }

  // Test 5: Get all orders to verify
  console.log('\n5️⃣ Fetching all orders to verify...');
  try {
    const ordersResponse = await fetch('http://localhost:3000/api/orders');
    const ordersResult = await ordersResponse.json();
    
    if (ordersResult.success) {
      console.log('✅ Orders fetched successfully');
      console.log('📊 Total orders:', ordersResult.data.length);
      
      const pendingOrders = ordersResult.data.filter(order => order.status === 'PENDING');
      const approvedOrders = ordersResult.data.filter(order => order.status === 'APPROVED');
      
      console.log('⏳ Pending orders:', pendingOrders.length);
      console.log('✅ Approved orders:', approvedOrders.length);
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
  }

  console.log('\n🎉 Order approval system test completed!');
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testOrderApproval();
} else {
  // Browser environment
  testOrderApproval();
}
