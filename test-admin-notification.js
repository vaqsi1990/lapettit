// Test script to verify admin notifications are sent to both email addresses
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Test admin notification
async function testAdminNotification() {
  const adminEmails = ['Lappetit2019@gmail.com', 'Lappetit2019@gmail.com'];
  
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
    }),
    notes: 'This is a test order notification'
  };

  const emailContent = {
    subject: `TEST - ახალი ტორტის შეკვეთა #${testOrderData.orderId} - ${testOrderData.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TEST - ახალი ტორტის შეკვეთა</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #d90b6b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TEST - ახალი ტორტის შეკვეთა მიღებულია!</h1>
            <p>შეკვეთა #${testOrderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>TEST - ყურადღება საჭიროა</h2>
              <p>ახალი ტორტის შეკვეთა განთავსებულია და თქვენი ყურადღება საჭიროებს.</p>
              <p><strong>გთხოვთ შედით ადმინის გვერდზე შეკვეთის დასადასტურებლად!</strong></p>
            </div>
            
            <p>ეს არის ტესტური შეტყობინება ორივე ადმინის ელ-ფოსტაზე გასაგზავნად.</p>
            <p><strong>კლიენტი:</strong> ${testOrderData.customerName}</p>
            <p><strong>ტელეფონი:</strong> ${testOrderData.customerPhone}</p>
            <p><strong>ტორტი:</strong> ${testOrderData.cakeName}</p>
            <p><strong>ფასი:</strong> ₾${testOrderData.totalPrice.toFixed(2)}</p>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>ეს არის ტესტური შეტყობინება - ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Send email to all admin addresses
  const emailPromises = adminEmails.map(email => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    return transporter.sendMail(mailOptions);
  });

  try {
    const results = await Promise.allSettled(emailPromises);
    
    console.log('Test Results:');
    adminEmails.forEach((email, index) => {
      const result = results[index];
      if (result.status === 'fulfilled') {
        console.log(`✅ Successfully sent to ${email} - Message ID: ${result.value.messageId}`);
      } else {
        console.log(`❌ Failed to send to ${email} - Error: ${result.reason.message}`);
      }
    });
    
    const successfulResults = results.filter(result => 
      result.status === 'fulfilled'
    );
    
    console.log(`\nSummary: ${successfulResults.length} out of ${adminEmails.length} emails sent successfully`);
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

// Run the test
testAdminNotification();
