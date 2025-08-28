# Admin Notification System for La Pettit

## Overview

This system automatically sends detailed email notifications to **vaqsii23@gmail.com** whenever someone places a cake order or custom cake order on your website. The notifications include comprehensive order details to help you manage orders efficiently.

## Features

### 🎂 Regular Cake Order Notifications
- **Order Information**: Order ID, date, status
- **Cake Details**: Cake name, quantity, special notes
- **Customer Information**: Name, phone, email, address
- **Financial Details**: Total amount
- **Action Items**: Clear next steps for order processing

### 🎨 Custom Cake Order Notifications
- **Order Information**: Order ID, date, status
- **Custom Specifications**: Design, flavor, filling, glaze, shape
- **Decorations**: List of requested decorations
- **Special Requests**: Custom text, additional notes
- **Delivery Information**: Date and time
- **Reference Images**: If customer uploaded an image
- **Customer Information**: Complete contact details
- **Financial Details**: Total amount
- **Action Items**: Specific steps for custom cake creation

## How It Works

### 1. Automatic Triggering
- **Regular Orders**: When someone places an order through `/api/order`
- **Custom Orders**: When someone submits a custom cake request through `/api/custom-cake`

### 2. Dual Email System
- **Customer Confirmation**: Customer receives order confirmation email
- **Admin Notification**: You receive detailed notification at vaqsii23@gmail.com

### 3. Real-time Delivery
- Emails are sent immediately when orders are placed
- No manual intervention required
- System continues working even if emails fail

## Email Templates

### Admin Notification Features
- **Professional Design**: Branded with your website colors
- **Clear Structure**: Organized sections for easy reading
- **Action-Oriented**: Includes specific next steps
- **Mobile Responsive**: Works on all devices
- **Visual Elements**: Icons and styling for better readability

### Email Content Sections
1. **Header**: Clear indication of new order
2. **Action Required**: Urgent notification section
3. **Order Details**: Basic order information
4. **Product Specifications**: Cake or custom cake details
5. **Customer Information**: Contact and delivery details
6. **Financial Summary**: Total amount
7. **Next Steps**: Action items for order processing
8. **Footer**: System information and timestamp

## Setup Instructions

### 1. Environment Configuration
Create a `.env.local` file in your project root:

```env
# Email Configuration (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Contact Information
CONTACT_EMAIL="info@lapettit.com"

# Base URL
BASE_URL="http://localhost:3000"
```

### 2. Gmail App Password Setup
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this password in your `EMAIL_PASSWORD` variable

### 3. Testing the System
Run the test script to verify everything works:

```bash
# Set environment variables
source .env.local

# Run test
node test-admin-notification.js
```

## File Structure

```
src/
├── lib/
│   └── emailService.ts          # Email service with admin notification templates
├── app/api/
│   ├── order/route.ts           # Regular order API with admin notifications
│   └── custom-cake/route.ts     # Custom cake API with admin notifications
└── components/                   # Order forms and UI components

test-admin-notification.js        # Test script for verification
ADMIN_NOTIFICATION_README.md      # This documentation
EMAIL_SETUP.md                    # General email setup guide
```

## Technical Details

### Email Service Functions
- `sendAdminNotification()`: Sends admin notifications
- `sendOrderConfirmation()`: Sends customer confirmations
- `sendEmail()`: Core email sending function

### API Integration
- **Order API**: Automatically sends admin notification for regular orders
- **Custom Cake API**: Automatically sends admin notification for custom orders
- **Error Handling**: Order processing continues even if emails fail

### Email Templates
- **HTML-based**: Professional, responsive design
- **CSS Styling**: Inline styles for email client compatibility
- **Dynamic Content**: Order details populated automatically
- **Brand Consistency**: Matches your website design

## Monitoring and Troubleshooting

### Success Indicators
- ✅ Order confirmation emails sent to customers
- ✅ Admin notification emails sent to vaqsii23@gmail.com
- ✅ Console logs show successful email delivery

### Common Issues
1. **Emails not sending**: Check environment variables and Gmail app password
2. **Spam folder**: Check if notifications are going to spam
3. **Order processing fails**: Check database connection and API logs

### Debug Information
- All email activities are logged to console
- Check terminal/console for success/failure messages
- Email IDs are logged when successful

## Security Features

- **App Passwords**: Uses Gmail app passwords instead of main password
- **Environment Variables**: Sensitive data stored in .env.local (not committed)
- **Error Handling**: System continues working even if emails fail
- **Input Validation**: All order data is validated before processing

## Customization Options

### Email Content
- Modify templates in `src/lib/emailService.ts`
- Add/remove fields as needed
- Customize styling and branding

### Notification Recipients
- Change admin email address in `sendAdminNotification()` function
- Add multiple recipients if needed
- Set up different notifications for different order types

### Email Timing
- Currently sends immediately when orders are placed
- Can be modified to send at specific times
- Batch notifications possible with additional development

## Support and Maintenance

### Regular Checks
- Monitor email delivery success rates
- Check console logs for any errors
- Verify admin notifications are received

### Updates
- Keep Gmail app passwords current
- Monitor for any email service changes
- Update templates as business needs change

## Benefits

1. **Immediate Awareness**: Know about orders as soon as they're placed
2. **Complete Information**: All order details in one email
3. **Professional Communication**: Branded, professional notifications
4. **Efficient Processing**: Clear action items for order management
5. **Customer Satisfaction**: Automatic customer confirmations
6. **Business Growth**: Better order management leads to improved service

---

**Note**: This system is designed to work automatically. Once set up, you'll receive detailed notifications for every order without any manual intervention. Make sure to check your email regularly to stay on top of new orders!
