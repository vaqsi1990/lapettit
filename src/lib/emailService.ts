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
    cakePersonalization?: {
      name?: string;
      age?: string;
      position?: string;
      productType?: string;
      pieces?: number | null;
      fillings?: string[];
      hasMarzipan?: boolean;
      marzipanPrice?: number | null;
      hasCream?: boolean;
      creamPrice?: number | null;
    };
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
          body { font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 18px; }
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
            <h2>გამარჯობა ${orderData.customerName}!</h2>
            <p>თქვენი შეკვეთა მიღებულია და მზადდება. ჩვენ გამოგიგზავნით შეტყობინებას, როცა პროდუქტი მზადაა მიღებადობისთვის</p>
            
            <div class="order-details">
              <h3> შეკვეთილი პროდუქტი</h3>
              <p><strong>შეკვეთილი პროდუქტის კოდი:</strong> #${orderData.orderId}</p>
              <p><strong>შეკვეთილი პროდუქტის თარიღი:</strong> ${orderData.orderDate}</p>
              <p><strong>სტატუსი:</strong> <span class="highlight">მიმდინარე</span></p>
            </div>
            
            <div class="cake-info">
              <h3> პროდუქტის დეტალები</h3>
              <p><strong>პროდუქტის სახელი:</strong> ${orderData.cakeName}</p>
              <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
              ${orderData.cakePersonalization ? `
                <div style="background: #f0f0ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6;">
                  <h4 style="color: #8b5cf6; margin: 0 0 10px 0;">ტორტის პერსონალიზაცია</h4>
                  ${orderData.cakePersonalization.productType ? `<p><strong>ტორტის ტიპი:</strong> ${orderData.cakePersonalization.productType === 'FULL_CAKE' ? 'სრული ტორტი' : orderData.cakePersonalization.productType === 'SET' ? 'ნაკრები' : orderData.cakePersonalization.productType === 'INDIVIDUAL_SLICE' ? 'ინდივიდუალური ნაჭერი' : orderData.cakePersonalization.productType}</p>` : ''}
                  ${orderData.cakePersonalization.pieces ? `<p><strong>ზომა:</strong> ${orderData.cakePersonalization.pieces} ნაჭერი</p>` : ''}
                  ${orderData.cakePersonalization.fillings && orderData.cakePersonalization.fillings.length > 0 ? `<p><strong>შიგთავსი:</strong> ${orderData.cakePersonalization.fillings.map(f => {
                    const fillingMap: { [key: string]: string } = {
                      'fruit': 'ხილის ტორტი',
                      'chocolate': 'შოკოლადის ტორტი',
                      'pistachio': 'ფისტის საფირმო ტორტი',
                      'black': 'შავი საფირმო ტორტი'
                    };
                    return fillingMap[f] || f;
                  }).join(', ')}</p>` : ''}
                  ${orderData.cakePersonalization.hasMarzipan ? `<p><strong>მარცეპანი:</strong> დიახ</p>` : ''}
                  ${orderData.cakePersonalization.hasCream ? `<p><strong>კრემი:</strong> დიახ</p>` : ''}
                  ${orderData.cakePersonalization.name ? `<p><strong>სახელი ტორტზე:</strong> ${orderData.cakePersonalization.name}</p>` : ''}
                  ${orderData.cakePersonalization.age ? `<p><strong>ასაკი ტორტზე:</strong> ${orderData.cakePersonalization.age}</p>` : ''}
                  ${orderData.cakePersonalization.position ? `<p><strong>პოზიცია:</strong> ${orderData.cakePersonalization.position === 'bottom' ? 'ქვევით' : orderData.cakePersonalization.position === 'center' ? 'ცენტრში' : 'ზევით'}</p>` : ''}
                </div>
              ` : ''}
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
            
          
           
            
            <p>თუ გაქვთ კითხვები, გთხოვთ დაგვიკავშირდეთ ტელეფონზე +995 599 332 050 ან ელ-ფოსტაზე Lappetit2019@gmail.com</p>
          </div>
          
          <div class="footer">
            <p>მადლობა, რომ აირჩიეთ ჩვენი სერვისი!</p>
            <p>Lappetit - ყველაზე კარგი ტორტები თქვენთვის</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Admin notification for regular orders
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
    receiptImageUrl?: string;
    notes?: string;
    cakePersonalization?: {
      name?: string;
      age?: string;
      position?: string;
      productType?: string;
      pieces?: number | null;
      fillings?: string[];
      hasMarzipan?: boolean;
      marzipanPrice?: number | null;
      hasCream?: boolean;
      creamPrice?: number | null;
    };
  }) => ({
    subject: `New Order #${orderData.orderId} - ${orderData.cakeName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order Notification</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .cake-info { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .total { font-size: 24px; font-weight: bold; color: #d90b6b; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 18px; }
          .highlight { color: #d90b6b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ახალი შეკვეთა</h1>
            <p>New order received!</p>
          </div>
          
          <div class="content">
            <h2>ახალი შეკვეთა მიღებულია!</h2>
            <p>შეკვეთა #${orderData.orderId} მიღებულია და მზადდება</p>
            
            <div class="order-details">
              <h3> შეკვეთის დეტალები</h3>
              <p><strong>შეკვეთის კოდი:</strong> #${orderData.orderId}</p>
              <p><strong>შეკვეთის თარიღი:</strong> ${orderData.orderDate}</p>
              <p><strong>სტატუსი:</strong> <span class="highlight">მიმდინარე</span></p>
            </div>
            
            <div class="cake-info">
              <h3> პროდუქტის დეტალები</h3>
              <p><strong>პროდუქტის სახელი:</strong> ${orderData.cakeName}</p>
              <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
              ${orderData.cakePersonalization ? `
                <div style="background: #f0f0ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6;">
                  <h4 style="color: #8b5cf6; margin: 0 0 10px 0;">ტორტის პერსონალიზაცია</h4>
                  ${orderData.cakePersonalization.productType ? `<p><strong>ტორტის ტიპი:</strong> ${orderData.cakePersonalization.productType === 'FULL_CAKE' ? 'სრული ტორტი' : orderData.cakePersonalization.productType === 'SET' ? 'ნაკრები' : orderData.cakePersonalization.productType === 'INDIVIDUAL_SLICE' ? 'ინდივიდუალური ნაჭერი' : orderData.cakePersonalization.productType}</p>` : ''}
                  ${orderData.cakePersonalization.pieces ? `<p><strong>ზომა:</strong> ${orderData.cakePersonalization.pieces} ნაჭერი</p>` : ''}
                  ${orderData.cakePersonalization.fillings && orderData.cakePersonalization.fillings.length > 0 ? `<p><strong>შიგთავსი:</strong> ${orderData.cakePersonalization.fillings.map(f => {
                    const fillingMap: { [key: string]: string } = {
                      'fruit': 'ხილის ტორტი',
                      'chocolate': 'შოკოლადის ტორტი',
                      'pistachio': 'ფისტის საფირმო ტორტი',
                      'black': 'შავი საფირმო ტორტი'
                    };
                    return fillingMap[f] || f;
                  }).join(', ')}</p>` : ''}
                  ${orderData.cakePersonalization.hasMarzipan ? `<p><strong>მარცეპანი:</strong> დიახ</p>` : ''}
                  ${orderData.cakePersonalization.hasCream ? `<p><strong>კრემი:</strong> დიახ</p>` : ''}
                  ${orderData.cakePersonalization.name ? `<p><strong>სახელი ტორტზე:</strong> ${orderData.cakePersonalization.name}</p>` : ''}
                  ${orderData.cakePersonalization.age ? `<p><strong>ასაკი ტორტზე:</strong> ${orderData.cakePersonalization.age}</p>` : ''}
                  ${orderData.cakePersonalization.position ? `<p><strong>პოზიცია:</strong> ${orderData.cakePersonalization.position === 'bottom' ? 'ქვევით' : orderData.cakePersonalization.position === 'center' ? 'ცენტრში' : 'ზევით'}</p>` : ''}
                </div>
              ` : ''}
            </div>
            
            <div class="order-details">
              <h3> მომხმარებლის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${orderData.customerName}</p>
              <p><strong>ელ-ფოსტა:</strong> ${orderData.customerEmail}</p>
              <p><strong>ტელეფონი:</strong> ${orderData.customerPhone}</p>
              <p><strong>მისამართი:</strong> ${orderData.address}</p>
            </div>
            
            ${orderData.notes ? `
              <div class="order-details" style="background: #fff9e6; border-left: 4px solid #f59e0b;">
                <h3>დამატებითი შენიშვნები</h3>
                <p style="white-space: pre-wrap; margin: 0;">${orderData.notes}</p>
              </div>
            ` : ''}
            
            <div class="total">
              ჯამი: ₾${orderData.totalPrice.toFixed(2)}
            </div>
            
            ${orderData.receiptImageUrl ? `
              <div class="order-details" style="margin-top: 20px;">
                <h3>ჩეკის სურათი/PDF</h3>
                ${orderData.receiptImageUrl.toLowerCase().includes('.pdf') || orderData.receiptImageUrl.toLowerCase().endsWith('.pdf') ? `
                  <p><strong>PDF ფაილი:</strong></p>
                  <p>
                    <a href="${orderData.receiptImageUrl}" target="_blank" download style="color: #d90b6b; text-decoration: underline; font-weight: bold; margin-right: 15px;">გახსენით PDF ფაილი</a>
                    <a href="${orderData.receiptImageUrl}" download style="color: #d90b6b; text-decoration: underline; font-weight: bold;">გადმოწერეთ PDF ფაილი</a>
                  </p>
                ` : `
                  <p><strong>ჩეკის სურათი:</strong></p>
                  <div style="margin-top: 15px; text-align: center;">
                    <img src="${orderData.receiptImageUrl}" alt="Receipt" style="max-width: 100%; height: auto; border-radius: 8px; border: 2px solid #ffd6e7;" />
                  </div>
                  <p style="margin-top: 10px;">
                    <a href="${orderData.receiptImageUrl}" target="_blank" style="color: #d90b6b; font-weight: bold; font-size: 18px; text-decoration: underline; margin-right: 15px;">გახსენი სურათი ან პდფ ფაილი</a>
                    <a href="${orderData.receiptImageUrl}" download style="color: #d90b6b; font-weight: bold; font-size: 18px; text-decoration: underline;">გადმოწერე სურათი ან პდფ ფაილი</a>
                  </p>
                `}
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>გთხოვთ გადახედოთ შეკვეთას ადმინ პანელში</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Contact form notification
  adminContactNotification: (contactData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    subject: string;
    message: string;
    contactDate: string;
  }) => ({
    subject: `Contact Form: ${contactData.subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d90b6b, #ff6b9d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .contact-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d90b6b; }
          .message { background: #fff5f7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffd6e7; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 18px; }
          .highlight { color: #d90b6b; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>კონტაქტის ფორმა</h1>
            <p>New contact form submission</p>
          </div>
          
          <div class="content">
            <h2>ახალი კონტაქტის ფორმა მიღებულია!</h2>
            
            <div class="contact-details">
              <h3> კონტაქტის ინფორმაცია</h3>
              <p><strong>სახელი:</strong> ${contactData.customerName}</p>
              <p><strong>ელ-ფოსტა:</strong> ${contactData.customerEmail}</p>
              <p><strong>ტელეფონი:</strong> ${contactData.customerPhone}</p>
              <p><strong>თარიღი:</strong> ${contactData.contactDate}</p>
            </div>
            
            <div class="message">
              <h3> შეტყობინება</h3>
              <p><strong>თემა:</strong> ${contactData.subject}</p>
              <p><strong>შეტყობინება:</strong></p>
              <p>${contactData.message}</p>
            </div>
          </div>
          
          <div class="footer">
            <p>გთხოვთ გადახედოთ შეტყობინებას</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Type definitions
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
  receiptImageUrl?: string;
  notes?: string;
  cakePersonalization?: {
    name?: string;
    age?: string;
    position?: string;
    productType?: string;
    pieces?: number | null;
    fillings?: string[];
    hasMarzipan?: boolean;
    marzipanPrice?: number | null;
    hasCream?: boolean;
    creamPrice?: number | null;
  };
};

type ContactFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  orderDate: string;
};

// Send order confirmation email
export async function sendOrderConfirmation(orderData: RegularOrderData) {
  try {
    const emailContent = emailTemplates.regularOrderConfirmation(orderData);

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

// Send order rejection email
export async function sendOrderRejection(orderData: RegularOrderData) {
  try {
    const emailContent = {
      subject: `Order Rejection #${orderData.orderId} - ${orderData.cakeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Rejection</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .cake-info { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 18px; }
            .highlight { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>შეკვეთა ვერ იქნა მიღებული</h1>
              <p>Order Rejection Notice</p>
            </div>
            
            <div class="content">
              <h2>გამარჯობა ${orderData.customerName}!</h2>
              <p>სამწუხაროდ, თქვენი შეკვეთა #${orderData.orderId} ვერ იქნა მიღებული ტექნიკური მიზეზების გამო.</p>
              
              <div class="order-details">
                <h3>შეკვეთის დეტალები</h3>
                <p><strong>შეკვეთის კოდი:</strong> #${orderData.orderId}</p>
                <p><strong>შეკვეთის თარიღი:</strong> ${orderData.orderDate}</p>
                <p><strong>სტატუსი:</strong> <span class="highlight">უარყოფილი</span></p>
              </div>
              
              <div class="cake-info">
                <h3>პროდუქტის დეტალები</h3>
                <p><strong>პროდუქტის სახელი:</strong> ${orderData.cakeName}</p>
                <p><strong>რაოდენობა:</strong> ${orderData.quantity}</p>
                <p><strong>ფასი:</strong> ₾${orderData.totalPrice.toFixed(2)}</p>
              </div>
              
              <div class="order-details">
                <h3>რა მოხდება შემდეგ?</h3>
                <ul>
                  <li>მაღაზიიდან მალე დაგიკავშირდებათ</li>
                  <li>დეტალები განიხილება და ალტერნატიული ვარიანტები შემოგთავაზებთ</li>
                  <li>თუ გსურთ, შეგიძლიათ ახალი შეკვეთა გააკეთოთ</li>
                </ul>
              </div>
              
              <p><strong>დაგვიკავშირდით:</strong></p>
              <p>ტელეფონი: +995 555 123 456</p>
              <p>ელ-ფოსტა: Lappetit2019@gmail.com</p>
            </div>
            
            <div class="footer">
              <p>მადლობა, რომ აირჩიეთ ჩვენი სერვისი!</p>
              <p>Lappetit - ყველაზე კარგი ტორტები თქვენთვის</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await sendEmail(
      orderData.customerEmail,
      emailContent.subject,
      emailContent.html
    );

    return result;
  } catch (error) {
    console.error('Error sending order rejection email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send admin notification email
export async function sendAdminNotification(orderData: RegularOrderData | ContactFormData) {
  try {
    const adminEmails = ['Lappetit2019@gmail.com'];
    
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
          subject: 'Contact Form Submission',
          message: orderData.notes,
          contactDate: 'orderDate' in orderData ? (orderData.orderDate as string) : new Date().toISOString()
        });
      }
    } else if ('cakeName' in orderData) {
      emailContent = emailTemplates.adminOrderNotification(orderData as RegularOrderData);
    } else {
      return { success: false, error: 'Invalid order data type' };
    }

    // Send to all admin emails
    const results = await Promise.all(
      adminEmails.map(adminEmail => 
        sendEmail(adminEmail, emailContent.subject, emailContent.html)
      )
    );

    // Check if all emails were sent successfully
    const allSuccessful = results.every(result => result.success);
    
    if (allSuccessful) {
      return { success: true, message: 'All admin notifications sent successfully' };
    } else {
      return { success: false, error: 'Some admin notifications failed to send' };
    }
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}