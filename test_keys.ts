import 'dotenv/config';

async function testOpenRouter() {
  const apiKey = process.env.NVIDIA_CHAT_API_KEY;
  if (!apiKey) return;
  const baseUrl = apiKey.startsWith('sk-or-') ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://integrate.api.nvidia.com/v1/chat/completions';
  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct', messages: [{ role: 'user', content: 'Say hello in one word' }] })
    });
    if (res.ok) console.log('✅ OpenRouter LLMs are WORKING');
    else console.log('❌ OpenRouter Error:', await res.text());
  } catch (e) {
    console.log('❌ OpenRouter Exception:', e.message);
  }
}

async function testElevenLabs() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: { 'xi-api-key': apiKey }
    });
    if (res.ok) console.log('✅ ElevenLabs Audio is WORKING');
    else console.log('❌ ElevenLabs Error:', await res.text());
  } catch (e) {
    console.log('❌ ElevenLabs Exception:', e.message);
  }
}

async function testGoogleMaps() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=23.0225,72.5714&radius=1000&type=hospital&key=${apiKey}`);
    const data = await res.json();
    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') console.log('✅ Google Maps Geolocation is WORKING');
    else console.log(`❌ Google Maps Error: ${data.status} - ${data.error_message || ''}`);
  } catch (e) {
    console.log('❌ Google Maps Exception:', e.message);
  }
}

async function testTwilio() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const phone = process.env.TWILIO_PHONE_NUMBER;
  if (phone === '+1YOUR_TWILIO_NUMBER') {
    console.log('❌ Twilio Error: You forgot to put in your real Twilio Phone Number!');
  } else {
    try {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        method: 'GET',
        headers: { 'Authorization': `Basic ${auth}` }
      });
      if (res.ok) console.log('✅ Twilio Credentials are WORKING');
      else console.log('❌ Twilio Error: Invalid SID or Auth Token');
    } catch (e) {
      console.log('❌ Twilio Exception:', e.message);
    }
  }
}

async function runTests() {
  console.log('--- FINAL DIAGNOSTIC CHECK ---\n');
  await testOpenRouter();
  await testElevenLabs();
  await testGoogleMaps();
  await testTwilio();
  console.log('\n--- TESTS COMPLETE ---');
}
runTests();
