/**
 * Twilio Service — Step 3 of the Agentic Pipeline
 *
 * Uses Twilio Programmable SMS and Voice APIs for real-world emergency dispatch.
 * Uses dynamic import() because the project is ESM ("type": "module").
 */

interface TwilioClient {
  messages: { create: (options: any) => Promise<any> };
  calls:    { create: (options: any) => Promise<any> };
}

let client: TwilioClient | null = null;

async function getTwilioClient(): Promise<TwilioClient> {
  if (!client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken  = process.env.TWILIO_AUTH_TOKEN;

    if (
      !accountSid ||
      accountSid === 'YOUR_TWILIO_SID' ||
      accountSid === 'YOUR_TWILIO_ACCOUNT_SID' ||
      !authToken  ||
      authToken   === 'YOUR_TWILIO_AUTH_TOKEN'
    ) {
      throw new Error('Twilio credentials are not configured.');
    }

    try {
      // Dynamic import — required for ESM projects ("type": "module")
      const twilioModule = await import('twilio');
      const twilio = twilioModule.default;
      client = twilio(accountSid, authToken) as unknown as TwilioClient;
    } catch (err: any) {
      throw new Error(`Twilio client failed to initialize: ${err?.message || 'Module error'}`);
    }
  }
  return client as TwilioClient;
}

function getFromNumber(): string {
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber || fromNumber === '+1YOUR_TWILIO_NUMBER' || fromNumber === 'YOUR_TWILIO_PHONE_NUMBER') {
    throw new Error('Twilio phone number is not configured.');
  }
  return fromNumber;
}

/**
 * Send an SMS message using Twilio.
 */
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    const twilioClient = await getTwilioClient();
    await twilioClient.messages.create({
      body: message,
      from: getFromNumber(),
      to,
    });
    console.log(`Twilio SMS sent to ${to}`);
    return true;
  } catch (error: any) {
    const msg = error?.message || 'Twilio SMS dispatch failed.';
    console.error('Twilio SMS Error:', msg);
    throw new Error(
      msg.includes('Twilio credentials') || msg.includes('phone number')
        ? msg
        : `Twilio SMS dispatch error: ${msg}`
    );
  }
}

/**
 * Initiate an automated Voice call using Twilio TwiML <Say>.
 */
export async function initiateVoiceCall(to: string, ttsScript: string): Promise<boolean> {
  try {
    const twilioClient = await getTwilioClient();

    const twimlBinUrl = process.env.TWILIO_TWIML_BIN_URL;
    if (!twimlBinUrl) {
      throw new Error('TWILIO_TWIML_BIN_URL is not configured in .env');
    }

    // Trial accounts require a hosted URL — inline twiml parameter is not allowed
    await twilioClient.calls.create({
      url: twimlBinUrl,
      from: getFromNumber(),
      to,
    });
    console.log(`Twilio Voice call initiated to ${to}`);
    return true;
  } catch (error: any) {
    const msg = error?.message || 'Twilio Voice dispatch failed.';
    console.error('Twilio Voice Error:', msg);
    throw new Error(
      msg.includes('Twilio credentials') || msg.includes('phone number')
        ? msg
        : `Twilio Voice dispatch error: ${msg}`
    );
  }
}
