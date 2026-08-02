# HealthSense: Agentic Architecture Implementation Plan (No Mocks)

Based on your requirement, we are building a scalable, multi-agent architecture using **NVIDIA NIM APIs** (NVIDIA's free tier for generative AI and microservices). We are also expanding the "Action Orchestrator" to handle dynamic, real-world responses for both emergencies and non-emergencies, moving far beyond a simple hardcoded SMS.

## User Review Required

Please review this advanced agent architecture and the real-life scenario below. If this aligns with your vision for the final product, we will lock this in as the blueprint for the codebase.

---

## 1. The "Real-Life" Scenario: Preventing a Rural Stroke (The Demo Pitch)

To convince the judges, you need to walk them through a real-life scenario where every step is powered by a **real API**, proving the system is a live, autonomous agent.

**The Setup:**
Meet Ramesh (55, rural farmer). He has a history of unmanaged high blood pressure. One evening, he experiences sudden numbness in his left arm and slurred speech. His son, who doesn't know medical jargon, pulls out the HealthSense app.

### Step 1: Smart Intake (Real API)
*   **The Action:** The son taps the microphone and says, *"My dad's left arm is numb and he is speaking weirdly."*
*   **The Real APIs Used:** 
    1.  **NVIDIA NIM ASR (Automatic Speech Recognition):** Converts the audio to text.
    2.  **NVIDIA NIM `meta/llama-3.1-8b-instruct` (NLP Agent):** Parses the unstructured text and extracts the core medical entities. 
    *   *Result:* `{ symptoms: ["numbness in left arm", "slurred speech"], duration: "acute" }`

### Step 2: Clinical Triage & Reasoning (Real API)
*   **The Action:** The extracted symptoms are combined with Ramesh's existing profile (55yo, Hypertensive) and sent to the reasoning engine.
*   **The Real API Used:** 
    *   **NVIDIA NIM `meta/llama-3.1-70b-instruct` (Clinical Agent):** Acts as the medical brain. 
    *   *Result:* The AI determines this is not just fatigue. It outputs a strict JSON: `{ priority: "HIGH", diagnosis_risk: "Ischemic Stroke", confidence: "94%" }`.

### Step 3: Autonomous Orchestration (Real API)
*   **The Action:** Because the priority is "HIGH", the backend Action Orchestrator immediately takes over. It does not wait for a doctor to look at a dashboard.
*   **The Real APIs Used:**
    1.  **Geolocation API (e.g., Google Maps / OpenStreetMap):** Instantly calculates the distance to the nearest stroke-capable hospital.
    2.  **Twilio Programmable SMS / Voice API:** The backend fires a real Twilio request. An automated SMS and Voice Call are immediately dispatched to the local Community Health Worker and the nearest ambulance driver: *"Emergency stroke alert at coordinates X, Y. Patient Ramesh, 55. Dispatch immediately."*

### Step 4: Empathetic Patient Feedback (Real API)
*   **The Action:** While the ambulance is dispatched, the app needs to keep the son calm and provide first aid instructions.
*   **The Real APIs Used:**
    1.  **NVIDIA NIM `meta/llama-3.1-8b-instruct` (Empathy Agent):** Generates a calm, instructional response based on the stroke risk.
    2.  **NVIDIA NIM TTS (Text-to-Speech):** Reads the instruction out loud so the son doesn't have to read while panicking.
    *   *Audio Plays:* *"We have detected severe symptoms. An ambulance has been dispatched and is 12 minutes away. Please make Ramesh sit down, keep him calm, and do not give him food or water."*

---

## 2. Dynamic Action Orchestrator Breakdown

Instead of just hardcoding one emergency contact, the Action Orchestrator dynamically decides what to do based on the severity:

### Scenario A: True Emergency (Priority: HIGH) -> (As described in the Ramesh scenario above)

### Scenario B: Urgent, But Not Emergency (Priority: MEDIUM)
*Example: Patient has a sudden, persistent spike in blood pressure over 3 days.*
1.  **Automated Scheduling:** The agent checks the local primary care doctor's calendar (via a mock calendar API) and automatically reserves a slot within the next 48 hours.
2.  **Referral Generation:** Generates a clinical referral note for the doctor, explaining exactly why the AI escalated the case.
3.  **Patient Nudge:** The Empathy Agent sends a WhatsApp/SMS nudge via Twilio: *"Your blood pressure is staying higher than usual. We've booked a quick checkup with Dr. Sharma tomorrow at 10 AM to adjust your medication."*

### Scenario C: Routine / Preventive (Priority: NORMAL)
*Example: Patient logs normal daily metrics.*
1.  **Digital Twin Update:** The data is quietly logged to the patient's "Digital Twin" in the database to improve longitudinal intelligence.
2.  **Proactive Health Nudges:** The agent analyzes the trend and suggests a personalized lifestyle tweak via the UI. (e.g., *"Great job keeping your glucose stable this week! Based on the local weather, it's a great evening for a 20-minute walk."*)

---

## 3. Strict "No Fallback" Policy
To prove scalability:
*   We will remove all static JSON mock files.
*   If an NVIDIA API call fails, we throw a strict HTTP 500 error: `"Clinical Engine Unavailable - Real-time processing failed."`
*   The frontend will show a graceful but real error state, proving the system relies 100% on live AI computation.

## Next Steps

1.  **Prepare `.env`:** Please obtain your NVIDIA API keys (`NVIDIA_API_KEY`) and Twilio API keys (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) for real SMS/calls.
2.  **Codebase Integration:** We will start by building the `Action Orchestrator` logic and the NVIDIA API clients inside `packages/api`.
