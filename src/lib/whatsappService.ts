// WhatsApp notification service
// You can use services like Twilio, WhatsApp Business API, or other providers

export async function sendWhatsAppNotification(message: string, phoneNumber?: string) {
  try {
    // Default admin phone number (format: +995XXXXXXXXX)
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || phoneNumber || '+995555123456';
    
    // For now, we'll use a simple approach
    // In production, integrate with WhatsApp Business API or Twilio
    
    // Option 1: Using Twilio WhatsApp API
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${adminPhone}`,
        body: message
      });

      return { success: true, message: 'WhatsApp notification sent via Twilio' };
    }

    // Option 2: Using WhatsApp Business API (Meta)
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminPhone.replace('+', ''),
            type: 'text',
            text: { body: message }
          })
        }
      );

      if (response.ok) {
        return { success: true, message: 'WhatsApp notification sent via Meta API' };
      }
    }

    // Fallback: Log the message (for development)
    console.log('WhatsApp Notification (would be sent):', {
      to: adminPhone,
      message: message
    });

    return { 
      success: true, 
      message: 'WhatsApp notification logged (configure WhatsApp service for production)',
      logged: true
    };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Format survey completion message for WhatsApp
export function formatSurveyCompletionMessage(sessionId: string, productName?: string) {
  const baseMessage = `🔔 ახალი Survey დასრულდა!\n\n`;
  const sessionInfo = `Session ID: ${sessionId}\n`;
  const productInfo = productName ? `პროდუქტი: ${productName}\n` : '';
  const actionMessage = `გთხოვთ გადახედოთ ადმინ პანელში: ${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/admin`;
  
  return `${baseMessage}${sessionInfo}${productInfo}${actionMessage}`;
}

