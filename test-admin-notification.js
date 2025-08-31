// Test script for admin notification emails
// Run this with: node test-admin-notification.js

const nodemailer = require('nodemailer');

// Test email configuration (you'll need to set these in your .env.local file)
const testConfig = {
  emailUser: process.env.EMAIL_USER || 'your-email@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'your-app-password',
  adminEmail: 'Lappetit2019@gmail.com'
};

// Create test transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: testConfig.emailUser,
    pass: testConfig.emailPassword,
  },
});

// Test regular cake order notification
const testRegularOrderNotification = async () => {
  const testOrderData = {
    orderId: 12345,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    address: '123 Main St, City, Country',
    cakeName: 'Chocolate Cake',
    quantity: 2,
    totalPrice: 45.00,
    orderDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    notes: 'Please add extra chocolate chips'
  };

  const emailContent = {
    subject: `🎂 NEW CAKE ORDER #${testOrderData.orderId} - ${testOrderData.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Cake Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .customer-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d9ff; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #d90b6b; font-weight: bold; }
          .status { display: inline-block; background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎂 NEW CAKE ORDER RECEIVED!</h1>
            <p>Order #${testOrderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>⚠️ ACTION REQUIRED</h2>
              <p>A new cake order has been placed and requires your attention.</p>
            </div>
            
            <div class="order-details">
              <h3>📋 ORDER INFORMATION</h3>
              <p><strong>Order ID:</strong> #${testOrderData.orderId}</p>
              <p><strong>Order Date:</strong> ${testOrderData.orderDate}</p>
              <p><strong>Status:</strong> <span class="status">PENDING</span></p>
            </div>
            
            <div class="cake-info">
              <h3>🍰 CAKE DETAILS</h3>
              <p><strong>Cake Name:</strong> ${testOrderData.cakeName}</p>
              <p><strong>Quantity:</strong> ${testOrderData.quantity}</p>
              ${testOrderData.notes ? `<p><strong>Special Notes:</strong> ${testOrderData.notes}</p>` : ''}
            </div>
            
            <div class="customer-info">
              <h3>👤 CUSTOMER INFORMATION</h3>
              <p><strong>Name:</strong> ${testOrderData.customerName}</p>
              <p><strong>Phone:</strong> ${testOrderData.customerPhone}</p>
              <p><strong>Email:</strong> ${testOrderData.customerEmail || 'Not provided'}</p>
              <p><strong>Address:</strong> ${testOrderData.address}</p>
            </div>
            
            <div class="total">
              <strong>TOTAL AMOUNT: ₾${testOrderData.totalPrice.toFixed(2)}</strong>
            </div>
            
            <div class="order-details">
              <h3>📱 NEXT STEPS</h3>
              <ol>
                <li>Review the order details above</li>
                <li>Contact the customer to confirm the order</li>
                <li>Update order status in the admin panel</li>
                <li>Begin preparing the cake</li>
              </ol>
            </div>
            
            <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>This is an automated notification from your cake ordering system.</p>
              <p>Order received at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const mailOptions = {
      from: testConfig.emailUser,
      to: testConfig.adminEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Regular cake order notification sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Sent to:', testConfig.adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending regular cake order notification:', error.message);
    return false;
  }
};

// Test custom cake order notification
const testCustomCakeNotification = async () => {
  const testCustomOrderData = {
    orderId: 12346,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    customerPhone: '+1987654321',
    address: '456 Oak Ave, Town, Country',
    design: 'Wedding Cake with Roses',
    flavor: 'Vanilla',
    filling: 'Strawberry',
    glaze: 'White Chocolate',
    shape: 'Round',
    decorations: ['Roses', 'Pearls', 'Gold Leaf'],
    text: 'Happy Anniversary!',
    quantity: 1,
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    deliveryTime: '2:00 PM',
    totalPrice: 120.00,
    orderDate: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    notes: 'Please make it extra special for 25th anniversary',
    imageUrl: 'https://example.com/reference-image.jpg'
  };

  const emailContent = {
    subject: `🎨 NEW CUSTOM CAKE ORDER #${testCustomOrderData.orderId} - ${testCustomOrderData.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Custom Cake Order</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .custom-details { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d9ff; }
          .customer-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6c3; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #d90b6b; font-weight: bold; }
          .status { display: inline-block; background: #28a745; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
          .decoration-tag { display: inline-block; background: #e6f3ff; color: #0066cc; padding: 4px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
          .image-preview { text-align: center; margin: 20px 0; }
          .image-preview img { max-width: 300px; border-radius: 8px; border: 2px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 NEW CUSTOM CAKE ORDER RECEIVED!</h1>
            <p>Order #${testCustomOrderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>⚠️ ACTION REQUIRED</h2>
              <p>A new custom cake order has been placed and requires your immediate attention.</p>
            </div>
            
            <div class="order-details">
              <h3>📋 ORDER INFORMATION</h3>
              <p><strong>Order ID:</strong> #${testCustomOrderData.orderId}</p>
              <p><strong>Order Date:</strong> ${testCustomOrderData.orderDate}</p>
              <p><strong>Status:</strong> <span class="status">PENDING</span></p>
            </div>
            
            <div class="cake-info">
              <h3>🍰 CUSTOM CAKE SPECIFICATIONS</h3>
              <p><strong>Design:</strong> ${testCustomOrderData.design}</p>
              <p><strong>Flavor:</strong> ${testCustomOrderData.flavor}</p>
              <p><strong>Filling:</strong> ${testCustomOrderData.filling || 'Not specified'}</p>
              <p><strong>Glaze:</strong> ${testCustomOrderData.glaze || 'Not specified'}</p>
              <p><strong>Shape:</strong> ${testCustomOrderData.shape || 'Not specified'}</p>
              <p><strong>Quantity:</strong> ${testCustomOrderData.quantity}</p>
              ${testCustomOrderData.text ? `<p><strong>Special Text:</strong> "${testCustomOrderData.text}"</p>` : ''}
              ${testCustomOrderData.notes ? `<p><strong>Additional Notes:</strong> ${testCustomOrderData.notes}</p>` : ''}
            </div>
            
            ${testCustomOrderData.decorations.length > 0 ? `
            <div class="custom-details">
              <h3>✨ DECORATIONS</h3>
              <p>${testCustomOrderData.decorations.map(dec => `<span class="decoration-tag">${dec}</span>`).join(' ')}</p>
            </div>
            ` : ''}
            
            <div class="custom-details">
              <h3>📅 DELIVERY INFORMATION</h3>
              <p><strong>Delivery Date:</strong> ${new Date(testCustomOrderData.deliveryDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${testCustomOrderData.deliveryTime ? `<p><strong>Delivery Time:</strong> ${testCustomOrderData.deliveryTime}</p>` : ''}
            </div>
            
            ${testCustomOrderData.imageUrl ? `
            <div class="image-preview">
              <h3>🖼️ REFERENCE IMAGE</h3>
              <img src="${testCustomOrderData.imageUrl}" alt="Reference Image" />
            </div>
            ` : ''}
            
            <div class="customer-info">
              <h3>👤 CUSTOMER INFORMATION</h3>
              <p><strong>Name:</strong> ${testCustomOrderData.customerName}</p>
              <p><strong>Phone:</strong> ${testCustomOrderData.customerPhone}</p>
              <p><strong>Email:</strong> ${testCustomOrderData.customerEmail || 'Not provided'}</p>
              <p><strong>Address:</strong> ${testCustomOrderData.address}</p>
            </div>
            
            <div class="total">
              <strong>TOTAL AMOUNT: ₾${testCustomOrderData.totalPrice.toFixed(2)}</strong>
            </div>
            
            <div class="order-details">
              <h3>📱 NEXT STEPS</h3>
              <ol>
                <li>Review the custom cake specifications above</li>
                <li>Contact the customer to discuss design details</li>
                <li>Confirm the design is feasible and timeline</li>
                <li>Update order status in the admin panel</li>
                <li>Begin the custom cake creation process</li>
              </ol>
            </div>
            
            <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>This is an automated notification from your custom cake ordering system.</p>
              <p>Order received at: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const mailOptions = {
      from: testConfig.emailUser,
      to: testConfig.adminEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Custom cake order notification sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Sent to:', testConfig.adminEmail);
    return true;
  } catch (error) {
    console.error('❌ Error sending custom cake order notification:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🧪 Testing Admin Notification System...\n');
  
  console.log('📧 Testing Regular Cake Order Notification...');
  const regularResult = await testRegularOrderNotification();
  
  console.log('\n📧 Testing Custom Cake Order Notification...');
  const customResult = await testCustomCakeNotification();
  
  console.log('\n📊 Test Results:');
  console.log(`Regular Order Notification: ${regularResult ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Custom Cake Notification: ${customResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (regularResult && customResult) {
    console.log('\n🎉 All tests passed! Admin notification system is working correctly.');
    console.log(`📬 Check your email at ${testConfig.adminEmail} for the test notifications.`);
  } else {
    console.log('\n⚠️ Some tests failed. Please check your email configuration.');
    console.log('Make sure you have set up your .env.local file with EMAIL_USER and EMAIL_PASSWORD.');
  }
};

// Check if environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('⚠️  Environment variables not set!');
  console.log('Please create a .env.local file with:');
  console.log('EMAIL_USER=your-email@gmail.com');
  console.log('EMAIL_PASSWORD=your-app-password');
  console.log('\nThen run: source .env.local && node test-admin-notification.js');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
