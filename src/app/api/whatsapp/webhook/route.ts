import { NextRequest, NextResponse } from "next/server";
import { whatsAppService, WhatsAppWebhookPayload } from "@/lib/whatsapp-service";

// Webhook verification token (should be stored in environment variables)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token_here';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Check the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Respond with the challenge token from the request
        return new NextResponse(challenge, { status: 200 });
      } else {
        // Respond with '403 Forbidden' if verify tokens do not match
        return NextResponse.json(
          { error: 'Forbidden', message: 'Verify token mismatch' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Bad Request', message: 'Missing required parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in WhatsApp webhook verification:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Webhook verification failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: WhatsAppWebhookPayload = await request.json();

    // Validate payload structure
    if (!payload.object || payload.object !== 'whatsapp_business_account') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Process the webhook message asynchronously
    // We don't want to block the webhook response
    setImmediate(() => {
      whatsAppService.processWebhookMessage(payload)
        .catch(error => console.error('Error processing webhook message:', error));
    });

    // Return 200 OK immediately to acknowledge receipt
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    console.error('Error processing WhatsApp webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
