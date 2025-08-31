import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
  },
});

// Email templates
export const emailTemplates = {
  // Regular cake order confirmation
  regularOrderConfirmation: (orderData: {
    orderId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    cakeName: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
  }) => ({
    subject: `Order Confirmation #${orderData.orderId} - Your Cake Order`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { color: #d90b6b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>დასტური შეკვეთა</h1>
            <p>Thank you for your order!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${orderData.customerName}!</h2>
            <p>Your cake order has been successfully placed. Here are the details:</p>
            
            <div class="order-details">
              <h3>შეკვეთილი პროდუქტი</h3>
              <p><strong>Order ID:</strong> #${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Status:</strong> <span class="highlight">Pending</span></p>
            </div>
            
            <div class="cake-info">
              <h3> პროდუქტის დეტალები</h3>
              <p><strong>Cake:</strong> ${orderData.cakeName}</p>
              <p><strong>Quantity:</strong> ${orderData.quantity}</p>
            </div>
            
            <div class="order-details">
              <h3> მომხმარებლის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${orderData.customerName}</p>
              <p><strong>ტელეფონი:</strong> ${orderData.customerPhone}</p>
              <p><strong>მისამართი:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              ჯამი: ₾${orderData.totalPrice.toFixed(2)}
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
           
              <li>გადახდა განხორციელდება დასტურის შემდეგ</li>
              <li>ჩვენ გამოგიგზავნით შეტყობინებას, როცა პროდუქტი მზადაა მიღებადობისთვის</li>
            </ul>
            
            <p>თუ გაქვთ კითხვები, გთხოვთ დაგვეკვრით <span class="highlight">${process.env.CONTACT_EMAIL || 'info@lapettit.com'}</span></p>
            
            <div class="footer">
              <p>გმადლობთ რომ აირჩიეთ ჩვენი მაღაზია! </p>
           
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Custom cake order confirmation
  customCakeConfirmation: (orderData: {
    orderId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    design: string;
    flavor: string;
    filling?: string;
    glaze?: string;
    shape?: string;
    decorations: string[];
    text?: string;
    quantity: number;
    deliveryDate: string;
    deliveryTime?: string;
    totalPrice: number;
    orderDate: string;
  }) => ({
    subject: `Custom Cake Order Confirmation #${orderData.orderId} - Your Special Creation`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>დასტური შეკვეთა</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .custom-details { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d9ff; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { color: #d90b6b; font-weight: bold; }
          .decoration-tag { display: inline-block; background: #e6f3ff; color: #0066cc; padding: 4px 8px; border-radius: 12px; margin: 2px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> დასტური შეკვეთა</h1>
            <p>თქვენი სპეციალური შეკვეთა მზადდება!</p>
          </div>
          
          <div class="content">
            <h2>გამარჯობა ${orderData.customerName}!</h2>
            <p>თქვენი სპეციალური შეკვეთა მზადდება. ჩვენ გამოგიგზავნით შეტყობინებას, როცა პროდუქტი მზადაა მიღებადობისთვის</p>
            
            <div class="order-details">
              <h3> შეკვეთილი პროდუქტი</h3>
              <p><strong>შეკვეთილი პროდუქტის კოდი:</strong> #${orderData.orderId}</p>
              <p><strong>შეკვეთილი პროდუქტის თარიღი:</strong> ${orderData.orderDate}</p>
              <p><strong>სტატუსი:</strong> <span class="highlight">მიმდინარე</span></p>
            </div>
            
            <div class="cake-info">
              <h3> პროდუქტის დეტალები</h3>
              <p><strong>დიზაინი:</strong> ${orderData.design}</p>
              <p><strong>ვარიანტი:</strong> ${orderData.flavor}</p>
              <p><strong>შევსება:</strong> ${orderData.filling || 'Not specified'}</p>
              <p><strong>გლეიზი:</strong> ${orderData.glaze || 'Not specified'}</p>
              <p><strong>ფორმა:</strong> ${orderData.shape || 'Not specified'}</p>
              <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
              ${orderData.text ? `<p><strong>სპეციალური ტექსტი:</strong> "${orderData.text}"</p>` : ''}
            </div>
            
            ${orderData.decorations.length > 0 ? `
            <div class="custom-details">
              <h3> დეკორაციები</h3>
              <p>${orderData.decorations.map(dec => `<span class="decoration-tag">${dec}</span>`).join(' ')}</p>
            </div>
            ` : ''}
            
            <div class="order-details">
              <h3> გადაცემის ინფორმაცია</h3>
              <p><strong>გადაცემის თარიღი:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${orderData.deliveryTime ? `<p><strong>გადაცემის დრო:</strong> ${orderData.deliveryTime}</p>` : ''}
            </div>
            
            <div class="order-details">
              <h3> მომხმარებლის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${orderData.customerName}</p>
              <p><strong>ტელეფონი:</strong> ${orderData.customerPhone}</p>
              <p><strong>მისამართი:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              ჯამი: ₾${orderData.totalPrice.toFixed(2)}
            </div>
            
            <p><strong>What Happens Next:</strong></p>
            <ul>
              <li>ჩვენი გუნდი გადავიდეთ შეკვეთილი პროდუქტი და დაგვეკვრით დეტალებზე</li>
              <li>ჩვენ გამოგიგზავნით შეტყობინებას, როცა პროდუქტი მზადაა მიღებადობისთვის</li>
              <li>ჩვენ გამოგიგზავნით შეტყობინებას, როცა პროდუქტი მზადაა მიღებადობისთვის</li>
              <li>გადახდა განხორციელდება დასტურის შემდეგ</li>
            </ul>
            
            <p>თუ გაქვთ კითხვები, გთხოვთ დაგვეკვრით <span class="highlight">${process.env.CONTACT_EMAIL || 'info@lapettit.com'}</span></p>
            
            <div class="footer">
              <p>გმადლობთ რომ აირჩიეთ ჩვენი მაღაზია! </p>
           
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Admin notification for regular cake orders
  adminOrderNotification: (orderData: {
    orderId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    cakeName: string;
    quantity: number;
    totalPrice: number;
    orderDate: string;
    notes?: string;
  }) => ({
    subject: `🎂 NEW CAKE ORDER #${orderData.orderId} - ${orderData.customerName}`,
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
            <p>Order #${orderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>⚠️ ACTION REQUIRED</h2>
              <p>A new cake order has been placed and requires your attention.</p>
            </div>
            
            <div class="order-details">
              <h3>📋 ORDER INFORMATION</h3>
              <p><strong>Order ID:</strong> #${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Status:</strong> <span class="status">PENDING</span></p>
            </div>
            
            <div class="cake-info">
              <h3>🍰 CAKE DETAILS</h3>
              <p><strong>Cake Name:</strong> ${orderData.cakeName}</p>
              <p><strong>Quantity:</strong> ${orderData.quantity}</p>
              ${orderData.notes ? `<p><strong>Special Notes:</strong> ${orderData.notes}</p>` : ''}
            </div>
            
            <div class="customer-info">
              <h3>👤 CUSTOMER INFORMATION</h3>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
              <p><strong>Email:</strong> ${orderData.customerEmail || 'Not provided'}</p>
              <p><strong>Address:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              <strong>TOTAL AMOUNT: ₾${orderData.totalPrice.toFixed(2)}</strong>
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
  }),

  // Admin notification for custom cake orders
  adminCustomCakeNotification: (orderData: {
    orderId: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    address: string;
    design: string;
    flavor: string;
    filling?: string;
    glaze?: string;
    shape?: string;
    decorations: string[];
    text?: string;
    quantity: number;
    deliveryDate: string;
    deliveryTime?: string;
    totalPrice: number;
    orderDate: string;
    notes?: string;
    imageUrl?: string;
  }) => ({
    subject: `🎨 NEW CUSTOM CAKE ORDER #${orderData.orderId} - ${orderData.customerName}`,
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
            <p>Order #${orderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>⚠️ ACTION REQUIRED</h2>
              <p>A new custom cake order has been placed and requires your immediate attention.</p>
            </div>
            
            <div class="order-details">
              <h3>📋 ORDER INFORMATION</h3>
              <p><strong>Order ID:</strong> #${orderData.orderId}</p>
              <p><strong>Order Date:</strong> ${orderData.orderDate}</p>
              <p><strong>Status:</strong> <span class="status">PENDING</span></p>
            </div>
            
            <div class="cake-info">
              <h3>🍰 CUSTOM CAKE SPECIFICATIONS</h3>
              <p><strong>Design:</strong> ${orderData.design}</p>
              <p><strong>Flavor:</strong> ${orderData.flavor}</p>
              <p><strong>Filling:</strong> ${orderData.filling || 'Not specified'}</p>
              <p><strong>Glaze:</strong> ${orderData.glaze || 'Not specified'}</p>
              <p><strong>Shape:</strong> ${orderData.shape || 'Not specified'}</p>
              <p><strong>Quantity:</strong> ${orderData.quantity}</p>
              ${orderData.text ? `<p><strong>Special Text:</strong> "${orderData.text}"</p>` : ''}
              ${orderData.notes ? `<p><strong>Additional Notes:</strong> ${orderData.notes}</p>` : ''}
            </div>
            
            ${orderData.decorations.length > 0 ? `
            <div class="custom-details">
              <h3>✨ DECORATIONS</h3>
              <p>${orderData.decorations.map(dec => `<span class="decoration-tag">${dec}</span>`).join(' ')}</p>
            </div>
            ` : ''}
            
            <div class="custom-details">
              <h3>📅 DELIVERY INFORMATION</h3>
              <p><strong>Delivery Date:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${orderData.deliveryTime ? `<p><strong>Delivery Time:</strong> ${orderData.deliveryTime}</p>` : ''}
            </div>
            
            ${orderData.imageUrl ? `
            <div class="image-preview">
              <h3>🖼️ REFERENCE IMAGE</h3>
              <img src="${orderData.imageUrl}" alt="Reference Image" />
            </div>
            ` : ''}
            
            <div class="customer-info">
              <h3>👤 CUSTOMER INFORMATION</h3>
              <p><strong>Name:</strong> ${orderData.customerName}</p>
              <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
              <p><strong>Email:</strong> ${orderData.customerEmail || 'Not provided'}</p>
              <p><strong>Address:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              <strong>TOTAL AMOUNT: ₾${orderData.totalPrice.toFixed(2)}</strong>
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
  })
};

// Send email function
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


type RegularOrderData = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  cakeName: string;
  quantity: number;
  totalPrice: number;
  orderDate: string;
};

type CustomCakeOrderData = {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  design: string;
  flavor: string;
  filling?: string;
  glaze?: string;
  shape?: string;
  decorations: string[];
  text?: string;
  quantity: number;
  deliveryDate: string;
  deliveryTime?: string;
  totalPrice: number;
  orderDate: string;
};

export async function sendOrderConfirmation(orderData: RegularOrderData | CustomCakeOrderData, isCustomCake: boolean = false) {
  try {
    if (!orderData.customerEmail) {
      console.log('No customer email provided, skipping email');
      return { success: false, error: 'No customer email provided' };
    }

    let emailContent;
    if (isCustomCake && 'design' in orderData) {
      emailContent = emailTemplates.customCakeConfirmation(orderData as CustomCakeOrderData);
    } else if ('cakeName' in orderData) {
      emailContent = emailTemplates.regularOrderConfirmation(orderData as RegularOrderData);
    } else {
      return { success: false, error: 'Invalid order data type' };
    }

    const result = await sendEmail(
      orderData.customerEmail,
      emailContent.subject,
      emailContent.html
    );

    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send admin notification email
export async function sendAdminNotification(orderData: RegularOrderData | CustomCakeOrderData, isCustomCake: boolean = false) {
  try {
    const adminEmail = 'Lappetit2019@gmail.com';
    
    let emailContent;
    if (isCustomCake && 'design' in orderData) {
      emailContent = emailTemplates.adminCustomCakeNotification(orderData as CustomCakeOrderData);
    } else if ('cakeName' in orderData) {
      emailContent = emailTemplates.adminOrderNotification(orderData as RegularOrderData);
    } else {
      return { success: false, error: 'Invalid order data type' };
    }

    const result = await sendEmail(
      adminEmail,
      emailContent.subject,
      emailContent.html
    );

    return result;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
