# WhatsApp Notification Setup Guide

## Current Status
მხოლოდ `ADMIN_WHATSAPP_PHONE` ცვლადით შეტყობინებები მხოლოდ ლოგირდება (development რეჟიმში). რეალური გაგზავნისთვის საჭიროა ერთ-ერთი API-ის კონფიგურაცია.

## Option 1: Twilio WhatsApp API (რეკომენდებული)

### Setup Steps:
1. შექმენით ანგარიში [Twilio](https://www.twilio.com/)
2. გადადით WhatsApp Sandbox-ში
3. დაამატეთ თქვენი ნომერი sandbox-ში
4. მიიღეთ Twilio WhatsApp ნომერი

### .env Configuration:
```env
ADMIN_WHATSAPP_PHONE="+995599332050"  # უნდა იყოს ფორმატი: +995XXXXXXXXX (სფეისების გარეშე)
TWILIO_ACCOUNT_SID="your_account_sid_here"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"  # Twilio-ს WhatsApp ნომერი
```

## Option 2: Meta WhatsApp Business API

### Setup Steps:
1. შექმენით [Meta for Developers](https://developers.facebook.com/) ანგარიში
2. შექმენით WhatsApp Business App
3. მიიღეთ Access Token და Phone Number ID

### .env Configuration:
```env
ADMIN_WHATSAPP_PHONE="+995599332050"  # უნდა იყოს ფორმატი: +995XXXXXXXXX (სფეისების გარეშე)
WHATSAPP_ACCESS_TOKEN="your_access_token_here"
WHATSAPP_PHONE_NUMBER_ID="your_phone_number_id_here"
```

## Important Notes:

1. **Phone Number Format**: 
   - ❌ არასწორი: `"+995 599 33 20 50"` (სფეისებით)
   - ✅ სწორი: `"+995599332050"` (სფეისების გარეშე)

2. **Development Mode**: 
   - თუ არც Twilio და არც Meta API არ არის კონფიგურირებული, შეტყობინებები მხოლოდ console-ში ლოგირდება
   - ეს საკმარისია development-ისთვის, მაგრამ production-ში არ იმუშავებს

3. **Testing**:
   - Survey-ის დასრულებისას შეამოწმეთ console-ში (development რეჟიმში)
   - Production-ში შეამოწმეთ Twilio/Meta dashboard-ში

## Quick Fix for Your .env:

შეცვალეთ:
```env
ADMIN_WHATSAPP_PHONE="+995 599 33 20 50"
```

შემდეგში:
```env
ADMIN_WHATSAPP_PHONE="+995599332050"
```

(სფეისების მოშორება)

