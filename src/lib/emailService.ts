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
    filling?: string | null;
    glaze?: string | null;
    shape?: string | null;
    decorations: string[];
    text?: string | null;
    quantity: number;
    deliveryDate: string;
    deliveryTime?: string | null;
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
    subject: `ახალი ტორტის შეკვეთა #${orderData.orderId} - ${orderData.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ახალი ტორტის შეკვეთა</title>
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
            <h1>ახალი ტორტის შეკვეთა მიღებულია!</h1>
            <p>შეკვეთა #${orderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>ყურადღება საჭიროა</h2>
              <p>ახალი ტორტის შეკვეთა განთავსებულია და თქვენი ყურადღება საჭიროებს.</p>
            </div>
            
            <div class="order-details">
              <h3>შეკვეთის ინფორმაცია</h3>
              <p><strong>შეკვეთის ნომერი:</strong> #${orderData.orderId}</p>
              <p><strong>შეკვეთის თარიღი:</strong> ${orderData.orderDate}</p>
              <p><strong>სტატუსი:</strong> <span class="status">მიმდინარე</span></p>
            </div>
            
            <div class="cake-info">
              <h3>ტორტის დეტალები</h3>
              <p><strong>ტორტის სახელი:</strong> ${orderData.cakeName}</p>
              <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
              ${orderData.notes ? `<p><strong>სპეციალური შენიშვნები:</strong> ${orderData.notes}</p>` : ''}
            </div>
            
            <div class="customer-info">
              <h3>კლიენტის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${orderData.customerName}</p>
              <p><strong>ტელეფონი:</strong> ${orderData.customerPhone}</p>
              <p><strong>ელ-ფოსტა:</strong> ${orderData.customerEmail || 'არ არის მითითებული'}</p>
              <p><strong>მისამართი:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              <strong>საერთო თანხა: ₾${orderData.totalPrice.toFixed(2)}</strong>
            </div>
            
            <div class="order-details">
              <h3>შემდეგი ნაბიჯები</h3>
              <ol>
                <li>გადახედეთ ზემოთ მოცემული შეკვეთის დეტალები</li>
                <li>დაუკავშირდით კლიენტს შეკვეთის დასადასტურებლად</li>
                <li>განაახლეთ შეკვეთის სტატუსი ადმინ პანელში</li>
                <li>დაიწყეთ ტორტის მომზადება</li>
              </ol>
            </div>
            
            <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>ეს არის ავტომატური შეტყობინება თქვენი ტორტის შეკვეთის სისტემიდან.</p>
              <p>შეკვეთა მიღებულია: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Admin notification for contact form submissions
  adminContactNotification: (contactData: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    subject: string;
    message: string;
    contactDate: string;
  }) => ({
    subject: `ახალი კონტაქტის ფორმა - ${contactData.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ახალი კონტაქტის ფორმა</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .contact-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .message-content { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .customer-info { background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #b3d9ff; }
          .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .highlight { color: #d90b6b; font-weight: bold; }
          .status { display: inline-block; background: #17a2b8; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ახალი კონტაქტის ფორმა</h1>
            <p>თემა: ${contactData.subject}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>ყურადღება საჭიროა</h2>
              <p>ახალი კონტაქტის ფორმა მიღებულია და თქვენი ყურადღება საჭიროებს.</p>
            </div>
            
            <div class="contact-details">
              <h3>შეტყობინების ინფორმაცია</h3>
              <p><strong>თემა:</strong> ${contactData.subject}</p>
              <p><strong>თარიღი:</strong> ${contactData.contactDate}</p>
              <p><strong>სტატუსი:</strong> <span class="status">ახალი</span></p>
            </div>
            
            <div class="message-content">
              <h3>შეტყობინების შინაარსი</h3>
              <p><strong>შეტყობინება:</strong></p>
              <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-top: 10px;">
                ${contactData.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div class="customer-info">
              <h3>კლიენტის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${contactData.customerName}</p>
              <p><strong>ელ-ფოსტა:</strong> ${contactData.customerEmail}</p>
              ${contactData.customerPhone ? `<p><strong>ტელეფონი:</strong> ${contactData.customerPhone}</p>` : ''}
            </div>
            
            <div class="contact-details">
              <h3>შემდეგი ნაბიჯები</h3>
              <ol>
                <li>გადახედეთ ზემოთ მოცემული შეტყობინების შინაარსი</li>
                <li>უპასუხეთ კლიენტს ელ-ფოსტით ან ტელეფონით</li>
                <li>განაახლეთ კონტაქტის სტატუსი თქვენს სისტემაში</li>
                <li>დაიცავით საჭიროების შემთხვევაში</li>
              </ol>
            </div>
            
            <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>ეს არის ავტომატური შეტყობინება თქვენი კონტაქტის ფორმის სისტემიდან.</p>
              <p>შეტყობინება მიღებულია: ${new Date().toLocaleString()}</p>
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
    filling?: string | null;
    glaze?: string | null;
    shape?: string | null;
    decorations: string[];
    text?: string | null;
    quantity: number;
    deliveryDate: string;
    deliveryTime?: string | null;
    totalPrice: number;
    orderDate: string;
    notes?: string;
    imageUrl?: string;
  }) => ({
    subject: `ახალი მორგებული ტორტის შეკვეთა #${orderData.orderId} - ${orderData.customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ახალი მორგებული ტორტის შეკვეთა</title>
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
            <h1>ახალი მორგებული ტორტის შეკვეთა მიღებულია!</h1>
            <p>შეკვეთა #${orderData.orderId}</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>ყურადღება საჭიროა</h2>
              <p>ახალი მორგებული ტორტის შეკვეთა განთავსებულია და თქვენი მყისიერი ყურადღება საჭიროებს.</p>
            </div>
            
            <div class="order-details">
              <h3>შეკვეთის ინფორმაცია</h3>
              <p><strong>შეკვეთის ნომერი:</strong> #${orderData.orderId}</p>
              <p><strong>შეკვეთის თარიღი:</strong> ${orderData.orderDate}</p>
              <p><strong>სტატუსი:</strong> <span class="status">მიმდინარე</span></p>
            </div>
            
            <div class="cake-info">
              <h3>მორგებული ტორტის სპეციფიკაციები</h3>
              <p><strong>დიზაინი:</strong> ${orderData.design}</p>
              <p><strong>გემო:</strong> ${orderData.flavor}</p>
              <p><strong>შევსება:</strong> ${orderData.filling || 'არ არის მითითებული'}</p>
              <p><strong>გლაზური:</strong> ${orderData.glaze || 'არ არის მითითებული'}</p>
              <p><strong>ფორმა:</strong> ${orderData.shape || 'არ არის მითითებული'}</p>
              <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
              ${orderData.text ? `<p><strong>სპეციალური ტექსტი:</strong> "${orderData.text}"</p>` : ''}
              ${orderData.notes ? `<p><strong>დამატებითი შენიშვნები:</strong> ${orderData.notes}</p>` : ''}
            </div>
            
            ${orderData.decorations.length > 0 ? `
            <div class="custom-details">
              <h3>დეკორაციები</h3>
              <p>${orderData.decorations.map(dec => `<span class="decoration-tag">${dec}</span>`).join(' ')}</p>
            </div>
            ` : ''}
            
            <div class="custom-details">
              <h3>მიწოდების ინფორმაცია</h3>
              <p><strong>მიწოდების თარიღი:</strong> ${new Date(orderData.deliveryDate).toLocaleDateString('ka-GE', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              ${orderData.deliveryTime ? `<p><strong>მიწოდების დრო:</strong> ${orderData.deliveryTime}</p>` : ''}
            </div>
            
            ${orderData.imageUrl ? `
            <div class="image-preview">
              <h3>რეფერენსის სურათი</h3>
              <img src="${orderData.imageUrl}" alt="Reference Image" />
            </div>
            ` : ''}
            
            <div class="customer-info">
              <h3>კლიენტის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${orderData.customerName}</p>
              <p><strong>ტელეფონი:</strong> ${orderData.customerPhone}</p>
              <p><strong>ელ-ფოსტა:</strong> ${orderData.customerEmail || 'არ არის მითითებული'}</p>
              <p><strong>მისამართი:</strong> ${orderData.address}</p>
            </div>
            
            <div class="total">
              <strong>საერთო თანხა: ₾${orderData.totalPrice.toFixed(2)}</strong>
            </div>
            
            <div class="order-details">
              <h3>შემდეგი ნაბიჯები</h3>
              <ol>
                <li>გადახედეთ ზემოთ მოცემული მორგებული ტორტის სპეციფიკაციები</li>
                <li>დაუკავშირდით კლიენტს დიზაინის დეტალების გასარკვევად</li>
                <li>დაადასტურეთ რომ დიზაინი შესაძლებელია და დრო</li>
                <li>განაახლეთ შეკვეთის სტატუსი ადმინ პანელში</li>
                <li>დაიწყეთ მორგებული ტორტის შექმნის პროცესი</li>
              </ol>
            </div>
            
            <div class="footer" style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p>ეს არის ავტომატური შეტყობინება თქვენი მორგებული ტორტის შეკვეთის სისტემიდან.</p>
              <p>შეკვეთა მიღებულია: ${new Date().toLocaleString()}</p>
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
  filling?: string | null;
  glaze?: string | null;
  shape?: string | null;
  decorations: string[];
  text?: string | null;
  quantity: number;
  deliveryDate: string;
  deliveryTime?: string | null;
  totalPrice: number;
  orderDate: string;
};

type ContactFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
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
export async function sendAdminNotification(orderData: RegularOrderData | CustomCakeOrderData | ContactFormData, isCustomCake: boolean = false) {
  try {
    const adminEmail = 'Lappetit2019@gmail.com';
    
    let emailContent;
    
    // Check if this is a contact form submission
    if ('notes' in orderData && orderData.notes && orderData.notes.includes('Contact Form - Subject:')) {
      const notesParts = orderData.notes.split('\n\n');
      if (notesParts.length >= 2) {
        const subjectLine = notesParts[0];
        const messageLine = notesParts[1];
        const subject = subjectLine.replace('Contact Form - Subject: ', '');
        const message = messageLine.replace('Message: ', '');
        
        const contactData = {
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          subject: subject,
          message: message,
          contactDate: 'orderDate' in orderData ? (orderData.orderDate as string) : new Date().toISOString()
        };
        emailContent = emailTemplates.adminContactNotification(contactData);
      } else {
        // Fallback for contact form
        emailContent = emailTemplates.adminContactNotification({
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone,
          subject: 'Contact Form Message',
          message: orderData.notes,
          contactDate: 'orderDate' in orderData ? (orderData.orderDate as string) : new Date().toISOString()
        });
      }
    } else if (isCustomCake && 'design' in orderData) {
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
