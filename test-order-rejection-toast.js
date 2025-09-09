// Test script for order rejection toast notification functionality
// Run this with: node test-order-rejection-toast.js

const testOrderRejectionToast = async () => {
  console.log('🧪 Testing Order Rejection Toast Notification System...\n');

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
        notes: 'Test order for rejection toast system',
        totalPrice: 50.00
      }),
    });

    const orderResult = await orderResponse.json();
    console.log('✅ Regular order created:', orderResult);

    if (orderResult.success) {
      // Test 2: Reject the order
      console.log('\n2️⃣ Rejecting the order...');
      const rejectResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          status: 'REJECTED',
          action: 'reject'
        }),
      });

      const rejectResult = await rejectResponse.json();
      console.log('✅ Order rejected:', rejectResult);

      // Test 3: Check customer orders API
      console.log('\n3️⃣ Testing customer orders API...');
      const customerOrdersResponse = await fetch(`http://localhost:3000/api/orders/customer?email=test@example.com`);
      const customerOrdersResult = await customerOrdersResponse.json();
      
      if (customerOrdersResult.success) {
        console.log('✅ Customer orders API working');
        console.log('📊 Customer orders found:', customerOrdersResult.data.length);
        
        const rejectedOrder = customerOrdersResult.data.find(order => order.status === 'REJECTED');
        if (rejectedOrder) {
          console.log('✅ Rejected order found in customer orders');
          console.log('📋 Order details:', {
            id: rejectedOrder.id,
            status: rejectedOrder.status,
            customerEmail: rejectedOrder.customerEmail,
            createdAt: rejectedOrder.createdAt
          });
        }
      } else {
        console.log('❌ Customer orders API failed:', customerOrdersResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Error creating/rejecting regular order:', error);
  }

  // Test 4: Create a custom cake order
  console.log('\n4️⃣ Creating a custom cake order...');
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
        customerName: 'Test Custom Customer',
        lastName: 'Test',
        customerPhone: '555789012',
        customerEmail: 'customtest@example.com',
        address: 'Custom Test Address 456',
        city: 'Tbilisi',
        notes: 'Test custom cake order for rejection toast system'
      }),
    });

    const customOrderResult = await customOrderResponse.json();
    console.log('✅ Custom cake order created:', customOrderResult);

    if (customOrderResult.success) {
      // Test 5: Reject the custom cake order
      console.log('\n5️⃣ Rejecting the custom cake order...');
      const rejectCustomResponse = await fetch('http://localhost:3000/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: customOrderResult.orderId,
          status: 'REJECTED',
          action: 'reject'
        }),
      });

      const rejectCustomResult = await rejectCustomResponse.json();
      console.log('✅ Custom cake order rejected:', rejectCustomResult);

      // Test 6: Check customer orders API for custom order
      console.log('\n6️⃣ Testing customer orders API for custom order...');
      const customCustomerOrdersResponse = await fetch(`http://localhost:3000/api/orders/customer?email=customtest@example.com`);
      const customCustomerOrdersResult = await customCustomerOrdersResponse.json();
      
      if (customCustomerOrdersResult.success) {
        console.log('✅ Custom customer orders API working');
        console.log('📊 Custom customer orders found:', customCustomerOrdersResult.data.length);
        
        const rejectedCustomOrder = customCustomerOrdersResult.data.find(order => order.status === 'REJECTED');
        if (rejectedCustomOrder) {
          console.log('✅ Rejected custom order found in customer orders');
          console.log('📋 Custom order details:', {
            id: rejectedCustomOrder.id,
            status: rejectedCustomOrder.status,
            customerEmail: rejectedCustomOrder.customerEmail,
            createdAt: rejectedCustomOrder.createdAt,
            hasCustomCake: !!rejectedCustomOrder.customCake
          });
        }
      } else {
        console.log('❌ Custom customer orders API failed:', customCustomerOrdersResult.error);
      }
    }

  } catch (error) {
    console.error('❌ Error creating/rejecting custom cake order:', error);
  }

  console.log('\n🎉 Order rejection toast notification system test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Open the order pages in your browser');
  console.log('2. Submit an order with a valid email');
  console.log('3. Wait for the admin to reject the order');
  console.log('4. Verify that the toast notification appears');
  console.log('5. Verify that the rejection message UI is displayed');
};

// Run the test if this file is executed directly
if (require.main === module) {
  testOrderRejectionToast().catch(console.error);
}

module.exports = { testOrderRejectionToast };
