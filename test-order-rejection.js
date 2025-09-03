// Test script to verify order rejection emails are working
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test order rejection
async function testOrderRejection() {
  const testOrderData = {
    orderId: 999,
    customerName: 'Test Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+995 555 123 456',
    address: 'Test Address, Tbilisi, 0101',
    cakeName: 'Test Cake',
    quantity: 1,
    totalPrice: 25.00,
    orderDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  const testCustomCakeData = {
    orderId: 998,
    customerName: 'Test Custom Customer',
    customerEmail: 'test@example.com',
    customerPhone: '+995 555 123 456',
    address: 'Test Address, Tbilisi, 0101',
    design: 'Test Design',
    flavor: 'Chocolate',
    filling: 'Vanilla',
    glaze: 'White Chocolate',
    shape: 'Round',
    decorations: ['Flowers', 'Sprinkles'],
    text: 'Happy Birthday',
    quantity: 1,
    deliveryDate: '2024-12-25',
    deliveryTime: '14:00',
    totalPrice: 45.00,
    orderDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  try {
    console.log('Testing regular cake order rejection...');
    
    // Test regular cake rejection
    const regularRejectionResponse = await fetch('http://localhost:3000/api/test-rejection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderData: testOrderData,
        isCustomCake: false
      }),
    });

    if (regularRejectionResponse.ok) {
      console.log('✅ Regular cake rejection email sent successfully');
    } else {
      console.log('❌ Regular cake rejection email failed');
    }

    console.log('Testing custom cake order rejection...');
    
    // Test custom cake rejection
    const customRejectionResponse = await fetch('http://localhost:3000/api/test-rejection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderData: testCustomCakeData,
        isCustomCake: true
      }),
    });

    if (customRejectionResponse.ok) {
      console.log('✅ Custom cake rejection email sent successfully');
    } else {
      console.log('❌ Custom cake rejection email failed');
    }

  } catch (error) {
    console.error('Error testing rejection emails:', error);
  }
}

// Run the test
testOrderRejection();
