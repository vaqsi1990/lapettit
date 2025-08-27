# Email Setup Guide for La Pettit

## Overview
This application now includes automatic email confirmation for both regular cake orders and custom cake orders using Nodemailer.

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Database
DATABASE_URL="your_postgresql_connection_string"

# Email Configuration (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# Contact Information
CONTACT_EMAIL="info@lapettit.com"

# Base URL
BASE_URL="http://localhost:3000"
```

## Gmail Setup Instructions

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication if not already enabled

### 2. Generate App Password
- Go to Google Account > Security
- Under "2-Step Verification", click "App passwords"
- Generate a new app password for "Mail"
- Use this password in your `EMAIL_PASSWORD` variable

### 3. Alternative Email Providers
If you prefer to use other email providers, update the `transporter` configuration in `src/lib/emailService.ts`:

```typescript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// For custom SMTP server
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Features

### Regular Cake Orders
- Order confirmation with cake details
- Customer information
- Order total and status
- Next steps information

### Custom Cake Orders
- Detailed custom cake specifications
- Design, flavor, filling, glaze, shape
- Decorations list
- Delivery information
- Custom text (if provided)

## Email Templates

The email templates are located in `src/lib/emailService.ts` and include:
- Responsive HTML design
- Brand colors matching your website
- Professional formatting
- Georgian language support where applicable

## Testing

To test the email functionality:
1. Set up your environment variables
2. Place a test order through your website
3. Check your email for the confirmation
4. Check the console for email sending logs

## Troubleshooting

### Common Issues:
1. **"Invalid login" error**: Check your app password is correct
2. **"Less secure app access"**: Use app passwords instead
3. **Email not sending**: Check console logs for errors
4. **Spam folder**: Check if emails are going to spam

### Debug Mode:
The email service logs all activities to the console. Check your terminal/console for:
- Email sending success/failure
- Error messages
- Email IDs when successful

## Security Notes

- Never commit your `.env.local` file to version control
- Use app passwords instead of your main password
- Consider using environment-specific email accounts for production
- Monitor email sending logs for any suspicious activity
