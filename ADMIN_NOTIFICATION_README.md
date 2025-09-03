# Admin Notification System

## Overview
The admin notification system has been updated to send notifications to multiple admin email addresses when new orders or contact form submissions are received. Additionally, a customer notification system has been implemented to inform customers when their orders are approved or rejected.

## Changes Made

### 1. Admin Email Addresses
- **Admin Email**: `Lappetit2019@gmail.com` (notifications sent twice for redundancy)

### 2. Updated Email Service (`src/lib/emailService.ts`)
- Modified `sendAdminNotification()` function to send emails to both addresses
- Uses `Promise.allSettled()` to handle multiple email sends concurrently
- Provides detailed logging of success/failure for each email address
- Enhanced email templates with clearer instructions about admin page access

### 3. Enhanced Email Templates
- Added prominent notification about needing to access the admin page
- Updated "Next Steps" sections to include admin page access instructions
- Improved visual styling for urgent notifications

### 4. Customer Notification System
- **Order Approval Emails**: Customers receive confirmation emails when their orders are approved
- **Order Rejection Emails**: Customers receive rejection emails when their orders are rejected
- **Professional Templates**: Both approval and rejection emails use professional, branded templates
- **Contact Information**: Rejection emails include contact information for alternative options
- **Real-time Toast Notifications**: On-screen toast notifications appear immediately when orders are rejected
- **Status Polling**: Automatic polling checks order status every 10 seconds after submission
- **Rejection UI**: Detailed rejection message replaces waiting screen when orders are rejected

## What Triggers Notifications

### Regular Cake Orders (`/api/order`)
- When a customer places a regular cake order
- Admin email receives notification twice for redundancy

### Custom Cake Orders (`/api/custom-cake`)
- When a customer places a custom cake order
- Admin email receives notification twice for redundancy

### Contact Form Submissions (`/api/contact`)
- When someone submits the contact form
- Admin email receives notification twice for redundancy

## Email Content Includes

### For Regular Orders:
- Order ID and date
- Customer information (name, phone, email, address)
- Cake details (name, quantity)
- Total price
- Special notes (if any)
- Clear instructions to access admin page

### For Custom Orders:
- All regular order information plus:
- Custom specifications (design, flavor, filling, glaze, shape)
- Decorations list
- Delivery date and time
- Reference image (if provided)
- Special text (if any)

### For Contact Forms:
- Customer name, email, phone
- Subject and message content
- Submission date

## Real-time Toast Notification System

### How It Works
- **Automatic Polling**: After order submission, the system automatically checks order status every 10 seconds
- **Toast Notifications**: When an order is rejected, customers immediately see a toast notification
- **UI Updates**: The waiting message is replaced with a detailed rejection message
- **Contact Information**: Rejection UI includes store contact details for follow-up

### Toast Message
When an order is rejected, customers see:
```
"თქვენი შეკვეთა ვერ იქნა მიღებული. მაღაზიიდან მალე დაგიკავშირდებათ დეტალების გასარკვევად."
```

### Rejection UI Features
- **Visual Indicators**: Red icon and styling to clearly indicate rejection
- **Step-by-step Information**: Explains what happens next
- **Contact Details**: Provides phone and email for customer support
- **Action Buttons**: Options to return to main page or create new order

### API Endpoints
- **Customer Orders API**: `/api/orders/customer?email={email}` - Retrieves orders by customer email
- **Order Status Update**: `/api/orders` (PUT) - Updates order status and triggers notifications

## Testing

### Test Scripts
Two test scripts are available:

1. **Admin Notification Test** (`test-admin-notification.js`):
   - Tests admin email notifications
   - Verifies email delivery to both addresses

2. **Order Rejection Toast Test** (`test-order-rejection-toast.js`):
   - Tests order creation and rejection
   - Verifies customer orders API functionality
   - Tests both regular and custom cake orders

```bash
# Make sure your environment variables are set
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASSWORD="your-app-password"

# Run the admin notification test
node test-admin-notification.js

# Run the order rejection toast test
node test-order-rejection-toast.js
```

The tests will:
- **Admin Notification Test**:
  - Send a test notification to both admin email addresses
  - Report success/failure for each address
  - Provide a summary of results

- **Order Rejection Toast Test**:
  - Create test orders (regular and custom cake)
  - Reject the orders via admin API
  - Test the customer orders API
  - Verify the complete rejection flow

## Environment Variables Required

Make sure these are set in your `.env.local` file:
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

## Admin Page Access

The admin page is located at `/admin` and requires authentication. When admins receive notifications, they should:

1. Click the admin page link or navigate to `/admin`
2. Review the new order/contact submission
3. Take appropriate action (approve, contact customer, etc.)

## Error Handling

- If one email address fails, the other will still receive the notification
- Detailed error logging is provided in the console
- The system continues to function even if email notifications fail
- Order creation is not affected by email notification failures

## Future Enhancements

Potential improvements could include:
- Email preferences for different types of notifications
- SMS notifications for urgent orders
- Slack/Discord integration
- Notification frequency controls
- Custom notification templates per admin
