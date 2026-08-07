/**
 * Geolocation Service — Step 3 of the Agentic Pipeline
 *
 * Uses Google Maps Places API (New) v1 to dynamically find the nearest
 * hospital and its phone number, then uses the Distance Matrix API for ETA.
 */

export interface HospitalInfo {
  name: string;
  address: string;
  distance: string;
  eta: string;
  phone: string;
}

function getApiKey(): string {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env
      ? (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY
      : undefined);

  if (
    !apiKey ||
    apiKey === 'YOUR_GOOGLE_MAPS_KEY' ||
    apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' ||
    apiKey === 'YOUR_VITE_GOOGLE_MAPS_API_KEY'
  ) {
    throw new Error('Google Maps API key is not configured.');
  }
  return apiKey;
}

export async function findNearestHospital(
  lat: number,
  lng: number,
  specialty?: string
): Promise<HospitalInfo> {
  const apiKey = getApiKey();

  try {
    // ── Step 1: Nearby Search (New) ─────────────────────────────────────────
    // POST https://places.googleapis.com/v1/places:searchNearby
    // Field mask requests only what we need — avoids billing for unused fields.
    const nearbySearchUrl = 'https://places.googleapis.com/v1/places:searchNearby';

    const nearbyBody = {
      includedTypes: ['hospital'],
      maxResultCount: 1,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 15000.0,
        },
      },
    };

    const nearbyRes = await fetch(nearbySearchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // Request only the fields we actually need to minimise API cost
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber',
      },
      body: JSON.stringify(nearbyBody),
    });

    if (!nearbyRes.ok) {
      const errText = await nearbyRes.text();
      throw new Error(`Places API (Nearby Search) error ${nearbyRes.status}: ${errText}`);
    }

    const nearbyData = await nearbyRes.json();

    if (!nearbyData.places || nearbyData.places.length === 0) {
      throw new Error(
        `No hospitals found matching criteria "${specialty}" within 15 km.`
      );
    }

    const place = nearbyData.places[0];
    const hospitalName: string = place.displayName?.text || 'Unknown Hospital';
    const address: string = place.formattedAddress || 'Unknown Address';
    const destLat: number = place.location?.latitude;
    const destLng: number = place.location?.longitude;

    // Prefer internationalPhoneNumber for Twilio (E.164 compatible)
    const phone: string =
      place.internationalPhoneNumber ||
      place.nationalPhoneNumber ||
      '';

    if (!phone) {
      // Non-fatal — many hospitals don't have a number in Google Places.
      // The orchestrator will skip the voice call but still send the CHW SMS.
      console.warn(`Warning: ${hospitalName} has no registered phone in Google Places. Voice call will be skipped.`);
    }

    // ── Step 2: Distance Matrix API (unchanged — not part of Places API New) ─
    let distance = 'Unknown';
    let eta = 'Unknown';

    try {
      const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${destLat},${destLng}&key=${apiKey}`;
      const matrixRes = await fetch(matrixUrl);
      const matrixData = await matrixRes.json();

      if (
        matrixData.rows &&
        matrixData.rows[0].elements &&
        matrixData.rows[0].elements[0].status === 'OK'
      ) {
        distance = matrixData.rows[0].elements[0].distance.text;
        eta = matrixData.rows[0].elements[0].duration.text;
      }
    } catch {
      // Non-fatal — ETA can be unknown, hospital info is still usable
      console.warn('Distance Matrix API call failed — ETA will be unknown.');
    }

    return { name: hospitalName, address, phone, distance, eta };

  } catch (error: any) {
    const msg = error?.message || 'Google Maps service query failed.';
    throw new Error(
      msg.includes('Google Maps API key') ? msg : `Google Maps Geolocation Error: ${msg}`
    );
  }
}
