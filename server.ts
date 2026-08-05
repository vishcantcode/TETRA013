import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { runIntakeAgent } from './src/services/agents/intakeAgent';
import { runTriageAgent } from './src/services/agents/triageAgent';
import { runActionOrchestrator } from './src/services/agents/actionOrchestrator';
import { runEmpathyAgent } from './src/services/agents/empathyAgent';
import { callElevenLabsSTT, callElevenLabsTTS } from './src/services/agents/nvidiaClient';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Stage 7: Gemini Clinical Reasoning API Proxy (Server-Side Secret API Key Protection)
  app.post('/api/cdss/reasoning', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, predictions, rules, warnings, referrals, vitals } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are the AI Clinical Reasoning module of HealthSense AI Clinical Decision Support System (CDSS).
Given the following patient data and CDSS findings:

PATIENT: ${patient?.name || 'Unknown'}, Age ${patient?.age || 50}, Gender ${patient?.gender || 'Unspecified'}
VITALS: HbA1c ${vitals?.hba1c}%, BP ${vitals?.bpSystolic}/${vitals?.bpDiastolic} mmHg, BMI ${vitals?.bmi} kg/m², Fasting Glucose ${vitals?.glucose} mg/dL

ML RISK PREDICTIONS:
${JSON.stringify(predictions || [], null, 2)}

CLINICAL RULE RECOMMENDATIONS:
${JSON.stringify(rules || [], null, 2)}

EARLY WARNING ALERTS:
${JSON.stringify(warnings || [], null, 2)}

SPECIALIST REFERRALS:
${JSON.stringify(referrals || [], null, 2)}

TASK:
Provide structured clinical reasoning in valid JSON matching this exact structure:
{
  "executiveSummary": "1-2 sentence high-level clinical summary of cardiometabolic risk.",
  "clinicalSynthesis": "Paragraph synthesizing ML predictions, feature importance, and diagnostic gaps.",
  "doctorSummaryMarkdown": "Markdown formatted summary for attending physician.",
  "patientFriendlySummaryMarkdown": "Markdown formatted summary for patient in simple, non-jargon language.",
  "whyRecommendationsMade": ["Reason 1", "Reason 2", "Reason 3"],
  "followUpAdvice": "Follow-up timeline and advice."
}

CRITICAL RULES:
1. Do NEVER recalculate risk percentages (use provided ML predictions).
2. Doctor summary must use medical terms (ICD-10, titration).
3. Patient summary must use simple, accessible language.
4. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      // Clean JSON tags if present
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // Doctor AI Copilot Endpoint
  app.post('/api/copilot/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, query, conversationHistory } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are HealthSense AI Doctor Copilot, a professional clinical assistant for attending physicians.
You are NOT a general chatbot or conversational AI.
You assist doctors by analyzing patient vitals, lab reports, risk scores, and clinical guidelines.

Patient context:
Name: ${patient?.name || 'Patient'}
MRN: ${patient?.mrn || 'N/A'}
Age: ${patient?.age}, Gender: ${patient?.gender}
Vitals: HbA1c ${patient?.vitals?.hba1c}%, BP ${patient?.vitals?.bpSystolic}/${patient?.vitals?.bpDiastolic} mmHg, BMI ${patient?.vitals?.bmi} kg/m², Fasting Glucose ${patient?.vitals?.glucose} mg/dL, LDL ${patient?.vitals?.ldl} mg/dL
Conditions: ${patient?.conditions?.join(', ') || 'None listed'}
Risk Score: ${patient?.riskScore}% (${patient?.riskLevel})

TASK: Respond to the physician's query: "${query}"

Return a valid JSON object matching this schema:
{
  "executiveSummary": "1-2 sentence high-level clinical summary.",
  "evidenceCards": [
    { "title": "Param Name", "value": "Value", "status": "critical" | "warning" | "normal" | "info", "source": "Source" }
  ],
  "clinicalReasoning": [
    "Step 1 logic...",
    "Step 2 logic..."
  ],
  "keyFindings": ["Finding 1", "Finding 2"],
  "supportingFactors": ["Factor 1", "Factor 2"],
  "suggestedActions": [
    { "action": "Action description", "urgency": "High" | "Routine", "category": "Lab" | "Medication" | "Referral" }
  ],
  "guidelineSummary": "Concise summary of relevant ADA/KDIGO/ACC guidelines without reproducing copyrighted text.",
  "clinicalDocumentDraft": {
    "type": "SOAP" | "DischargeSummary" | "ReferralLetter" | "FollowUpPlan" | "None",
    "content": "Full text formatted document if requested, else null"
  }
}

CRITICAL RULES:
1. Do NEVER make a final diagnosis. Include differential diagnostic considerations if relevant.
2. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // Patient AI Companion Endpoint
  app.post('/api/patient-companion/chat', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient, query } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are HealthSense AI Caregiver & Companion, a warm, caring, empathetic, and interactive AI best friend for ${patient?.name || 'Friend'}.
You are not just a static Q&A tool—you are a friendly, conversational companion who is always here to talk about ANYTHING.

YOUR PERSONALITY & GUIDELINES:
1. Talk like a genuine, warm, caring friend & personal health caretaker.
2. You can chat about ANYTHING: daily life, how the patient feels today, family, hobbies, general questions, weather, motivation, sports, emotional support, food, exercise, or health reports!
3. Translate complex health concepts (like HbA1c, BP, LDL) into simple, everyday language without medical jargon.
4. Always be supportive, uplifting, and interactive. Feel free to ask how they are doing or how their day went.
5. SAFETY GUARDRAIL: Never diagnose diseases or prescribe medications. Kindly remind them to check with their primary physician (${patient?.primaryDoctor || 'their doctor'}) for medical prescriptions.

Return a valid JSON object matching this schema:
{
  "simpleExplanation": "Warm, friendly, conversational response talking directly to ${patient?.name || 'Friend'} (2-4 sentences).",
  "keyTakeaways": [
    "Key takeaway or caring point 1",
    "Key takeaway or caring point 2"
  ],
  "practicalTip": "Practical, easy advice or friendly daily tip.",
  "encouragement": "Uplifting, warm, encouraging closing words with emojis! 😊",
  "followUpQuestions": [
    "Engaging follow-up question 1",
    "Engaging follow-up question 2"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: query,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        ...parsed,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Daily Health Planner Endpoint
  app.post('/api/health-planner/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { patient } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the AI Daily Health Planner engine for HealthSense AI.
Generate personalized, actionable daily health tasks tailored strictly to the patient's profile:
- Patient Name: ${patient?.name || 'Patient'}
- Age: ${patient?.age}
- BMI: ${patient?.vitals?.bmi} kg/m² (Weight: ${patient?.vitals?.weightKg} kg)
- Risk Level: ${patient?.riskLevel} (${patient?.riskScore}% cardiometabolic risk)
- Diseases / Conditions: ${patient?.conditions?.join(', ') || 'None listed'}
- Primary Doctor: ${patient?.primaryDoctor}
- Active Medications: ${patient?.medications?.map((m: any) => m.name + ' ' + m.strength).join(', ') || 'None'}

TASK:
Generate 7-9 highly targeted daily health tasks for today. Include essential tasks such as:
1. Physical activity tailored to age & BMI (e.g., "Walk 30 minutes at moderate pace")
2. Hydration goal (e.g., "Drink 2.5L water throughout the day")
3. Blood pressure monitoring (e.g., "Check BP & log morning reading")
4. Blood glucose check if diabetic/prediabetic (e.g., "Check Blood Sugar before breakfast")
5. Sleep hygiene target (e.g., "Sleep before 11:00 PM for cellular recovery")
6. Medication adherence (e.g., "Take Morning & Night Prescribed Medicines")
7. Lab screening check if overdue (e.g., "Complete HbA1c Lab Test this week")
8. Mental wellness / Mindfulness (e.g., "10-Minute Deep Breathing & Meditation")

Return valid JSON with schema:
{
  "tasks": [
    {
      "id": "task-1",
      "title": "Short descriptive action title (e.g. Walk 30 minutes)",
      "priority": "High" | "Medium" | "Low",
      "time": "07:30 AM",
      "category": "Exercise" | "Hydration" | "Vitals Check" | "Medication" | "Sleep" | "Lab Check" | "Mental Health" | "Nutrition",
      "completed": false,
      "reasoning": "Clear explanation referencing patient's Age (${patient?.age}), BMI (${patient?.vitals?.bmi}), or Disease (${patient?.conditions?.join('/')})",
      "encouragingMessage": "Enthusiastic, encouraging message celebrating task completion!",
      "points": 15,
      "iconType": "walk" | "water" | "bp" | "sugar" | "sleep" | "meds" | "lab" | "meditation" | "generic"
    }
  ]
}

CRITICAL RULES:
1. Ensure priorities are realistic (High for critical vitals/meds, Medium for exercise/hydration, Low for sleep/meditation).
2. Times must be distributed nicely across the day (Morning, Afternoon, Evening, Night).
3. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Generate personalized daily health plan for ${patient?.name || 'this patient'}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ tasks: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        tasks: parsed.tasks || [],
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Indian Diet Planner Endpoint
  app.post('/api/diet-planner/generate', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { region, dietType, conditions, isBudgetFriendly, patient, language } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const languageNames: Record<string, string> = {
        hi: 'Hindi (हिंदी)',
        gu: 'Gujarati (ગુજરાતી)',
        mr: 'Marathi (मराठी)',
        en: 'English',
      };
      const targetLangName = languageNames[language] || 'English';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
You are the Chief Clinical AI Clinical Nutritionist & Indian Diet Specialist at HealthSense AI.
Generate an authentic, nutritionally balanced, culturally precise, and clinically safe Indian meal plan.

PARAMETERS:
- Cuisine Region: ${region || 'Gujarati'} (Gujarati, Maharashtrian, Punjabi, South Indian, North Indian, Jain)
- Diet Preference: ${dietType || 'Vegetarian'} (Vegetarian, Non Vegetarian, Jain)
- Target Health Conditions: ${conditions?.length ? conditions.join(', ') : 'General Wellness'} (Diabetes, Hypertension, CKD, Heart Disease, Weight Loss, Weight Gain)
- Economic Preference: ${isBudgetFriendly ? 'Budget Friendly (Focus on low-cost, nutrient-dense local staples like millets, whole pulses, seasonal vegetables, homemade curd, sprouts)' : 'Standard'}
- Patient Profile (if available): Age ${patient?.age || 45}, BMI ${patient?.vitals?.bmi || 24.5} kg/m²
- TARGET OUTPUT LANGUAGE: ${targetLangName} (${language || 'en'}). Write dish descriptions, benefits, clinical rationale, cooking tips, and safety warnings in ${targetLangName}!

CLINICAL & REGIONAL RULES:
1. Authentic Indian Dishes: Use real regional dish names matching ${region} (e.g., Gujarati: Handvo, Bajra Rotla, Methi Muthiya; Maharashtrian: Thalipeeth, Bhakri, Poha, Usal; South Indian: Ragi Dosa, Vegetable Uttapam, Sambhar, Rasam; Punjabi: Missi Roti, Palak Paneer, Rajma; Jain: No onion, no garlic, no root vegetables).
2. Safety Guardrails for Conditions:
   - Chronic Kidney Disease (CKD): STRICT LOW SODIUM & LOW POTASSIUM/PHOSPHORUS. Avoid bananas, coconut water, potatoes, raw tomatoes, high protein.
   - Diabetes: Low Glycemic Index (GI), complex carbs (Jowar/Bajra/Ragi/Oats), high soluble fiber. NO refined sugar, white bread, or maida.
   - Hypertension: Low sodium (< 2g/day), DASH principles, high magnesium/potassium (if no CKD).
   - Heart Disease: Zero trans-fats, low saturated fat, omega-3 rich seeds (flax/chia), soluble fiber.
3. Budget-Friendly Options: Focus on affordable local superfoods like Bajra, Jowar, Ragi, Moong Dal, Chana, Palak, Curd, and Mustard/Til seeds instead of expensive imports.
4. Mandatory Dietitian Warning: Always include a clear disclaimer recommending professional dietitian consultation for complex conditions.

JSON SCHEMA OUTPUT:
{
  "plan": {
    "id": "diet-plan-1",
    "title": "Title describing the plan e.g. Personalized ${region} ${dietType} Clinical Plan for ${conditions?.join('/') || 'Health'}",
    "region": "${region}",
    "dietType": "${dietType}",
    "conditions": ${JSON.stringify(conditions || [])},
    "isBudgetFriendly": ${!!isBudgetFriendly},
    "totalCalories": 1650,
    "totalProtein": 65,
    "totalCarbs": 210,
    "totalFat": 45,
    "totalFiber": 35,
    "breakfast": {
      "dishName": "Authentic dish name",
      "quantity": "Serving size e.g. 2 Oats Moong Dal Chillas + Green Chutney",
      "description": "Brief description of dish ingredients",
      "benefits": "Key health benefit tailored to condition",
      "calories": 350,
      "protein": 14,
      "carbs": 48,
      "fat": 8,
      "fiber": 8,
      "cookingTip": "Low-oil or steamer tip"
    },
    "morningSnack": {
      "dishName": "Snack name e.g. Roasted Makhana or Sprouts Salad or Buttermilk",
      "quantity": "e.g. 1 Cup",
      "description": "Brief description",
      "benefits": "Nutritional benefit",
      "calories": 120,
      "protein": 5,
      "carbs": 18,
      "fat": 3,
      "fiber": 4
    },
    "lunch": {
      "dishName": "Full Indian Lunch",
      "quantity": "e.g. 2 Jowar Roti + 1 Bowl Lauki Chana Dal + 1 Cup Curd + Cucumber Salad",
      "description": "Detailed meal items",
      "benefits": "Glycemic and blood pressure management benefits",
      "calories": 550,
      "protein": 22,
      "carbs": 75,
      "fat": 14,
      "fiber": 12
    },
    "eveningSnack": {
      "dishName": "Evening drink/snack e.g. Roasted Chana with Lemon Jeera Water",
      "quantity": "1 Small Bowl",
      "description": "Snack details",
      "benefits": "Energy boost without insulin spike",
      "calories": 180,
      "protein": 8,
      "carbs": 24,
      "fat": 4,
      "fiber": 5
    },
    "dinner": {
      "dishName": "Light Indian Dinner",
      "quantity": "e.g. 1 Bowl Vegetable Khichdi made with Foxtail Millet & Moong Dal + Steamed Subzi",
      "description": "Dinner items",
      "benefits": "Easy night digestion and sleep quality support",
      "calories": 450,
      "protein": 16,
      "carbs": 65,
      "fat": 10,
      "fiber": 8
    },
    "hydrationPlan": {
      "targetLiters": 2.5,
      "recommendedBeverages": ["Jeera Water", "Unsalted Chaas", "Warm Lemon Water", "Tulsi Tea"],
      "hydrationTips": "Drink 1 glass of water 30 mins before major meals. Avoid cold iced water."
    },
    "foodsToAvoid": [
      {
        "foodItem": "Deep Fried Puri / Farsan",
        "reason": "High in trans-fats and refined calories causing arterial inflammation and glucose spikes.",
        "category": "Fried Foods"
      },
      {
        "foodItem": "Excessive Salt & Packaged Pickles (Achar)",
        "reason": "High sodium elevates blood pressure and strains renal glomerular filtration.",
        "category": "Sodium Rich"
      }
    ],
    "healthyAlternatives": [
      {
        "unhealthyFood": "White Rice",
        "healthyAlternative": "Hand-pounded Brown Rice / Jowar Rotla / Foxtail Millet",
        "benefit": "Lower Glycemic Index reduces postprandial glucose spikes by 40%."
      },
      {
        "unhealthyFood": "Fried Sev & Namkeen",
        "healthyAlternative": "Roasted Chana / Roasted Makhana with Black Pepper",
        "benefit": "Higher protein and fiber with minimal saturated fats."
      }
    ],
    "clinicalRationale": "Detailed multi-sentence explanation of why these specific regional ingredients were selected for the user's condition and budget.",
    "dietitianNotice": "⚠️ CLINICAL NOTICE: This AI-generated meal plan provides general nutritional guidance tailored to Indian culinary preferences. Patients with Chronic Kidney Disease (CKD), severe heart failure, or brittle diabetes should consult a registered clinical dietitian for exact potassium, electrolyte, and fluid restriction protocols."
  }
}

OUTPUT ONLY VALID JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Generate Indian meal plan for region ${region}, diet ${dietType}, conditions ${conditions?.join(', ')}.`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ plan: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        plan: parsed.plan || null,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // AI Food & Nutrition Scanner Endpoint
  app.post('/api/food-scanner/analyze', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { imageBase64, dishNameHint, patient, language } = req.body;

      if (!apiKey) {
        return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
      }

      const languageNames: Record<string, string> = {
        hi: 'Hindi (हिंदी)',
        gu: 'Gujarati (ગુજરાતી)',
        mr: 'Marathi (मराठी)',
        en: 'English',
      };
      const targetLangName = languageNames[language] || 'English';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const patientConditions = patient?.conditions?.join(', ') || 'General Wellness (Diabetes, Hypertension, CKD, Heart Disease)';

      const systemInstruction = `
You are the Lead AI Food Scientist & Clinical Nutritionist at HealthSense AI.
Analyze the food item provided in the image (or dish text hint) and perform a comprehensive nutrition & clinical suitability assessment.

PATIENT CONTEXT:
- Known Conditions: ${patientConditions}
- Patient Age: ${patient?.age || 48}, BMI: ${patient?.vitals?.bmi || 25.2} kg/m²
- TARGET OUTPUT LANGUAGE: ${targetLangName} (${language || 'en'}). Write dish names, portion descriptions, reasoning, benefits, and advice in ${targetLangName}!

REQUIREMENTS:
1. Identify Dish Name accurately (e.g. "Samosa with Sweet Chutney", "Masala Dosa with Sambhar & Coconut Chutney", "Puri Bhaji", "Palak Paneer with Missi Roti", "Butter Chicken with Naan", "Grilled Chicken Salad", "Handvo").
2. AI Confidence score (e.g. 92, 95, 88).
3. Portion Size estimate (e.g. "1 medium portion (~200g)").
4. Estimate Macro & Micronutrients:
   - Calories (kcal)
   - Protein (g)
   - Carbohydrates (g)
   - Fat (g)
   - Fiber (g)
   - Sugar (g)
   - Sodium (mg)
5. Evaluate Condition Suitability for EACH of these 4 specific medical conditions:
   - Diabetes
   - Hypertension
   - CKD (Chronic Kidney Disease)
   - Heart Disease
   For each condition, assign status ("Suitable", "Moderate", "High Risk", or "Avoid") and provide a clear 1-2 sentence medical reasoning based on glycemic index, sodium, potassium/phosphorus (for CKD), or saturated fat.
6. Provide 2-3 Healthier Alternatives with dish name, description, benefits, and estimated calories.
7. Provide clinical rationale explaining why the meal has this score and how the user can modify preparation (e.g. air-frying, less salt, baking, portion control).
8. Disclaimer: Always state that values are AI visual estimates and not exact laboratory measurements.

JSON SCHEMA OUTPUT:
{
  "result": {
    "dishName": "Identified Dish Name",
    "confidence": 92,
    "portionSize": "1 plate (~220g)",
    "macros": {
      "calories": 380,
      "protein": 8,
      "carbs": 48,
      "fat": 18,
      "fiber": 4,
      "sugar": 6,
      "sodium": 650
    },
    "conditionSuitability": [
      {
        "condition": "Diabetes",
        "status": "High Risk",
        "reasoning": "High refined carbohydrates and fried batter cause rapid postprandial blood glucose spikes."
      },
      {
        "condition": "Hypertension",
        "status": "Moderate",
        "reasoning": "Contains moderate sodium levels (~650mg) from fried dough seasoning and chutneys."
      },
      {
        "condition": "CKD",
        "status": "Moderate",
        "reasoning": "Potato filling contains moderate potassium; portion control is advised."
      },
      {
        "condition": "Heart Disease",
        "status": "Avoid",
        "reasoning": "Deep frying produces trans-fats and saturated fats that elevate LDL cholesterol."
      }
    ],
    "healthierAlternatives": [
      {
        "dishName": "Baked Vegetable Samosa or Steamed Handvo",
        "description": "Made with whole wheat batter and baked or air-fried with minimal oil.",
        "benefits": "Reduces fat content by 70% while preserving authentic spice flavor.",
        "estimatedCalories": 180
      },
      {
        "dishName": "Sprouted Moong Chaat with Lemon Juice",
        "description": "Fresh boiled moong sprouts seasoned with cumin, coriander, and fresh lemon.",
        "benefits": "Provides high fiber (8g) and protein (12g) with minimal glycemic impact.",
        "estimatedCalories": 140
      }
    ],
    "rationale": "Detailed explanation of nutritional findings and cooking adjustments.",
    "summaryNote": "Overall health verdict and actionable portion tip.",
    "disclaimer": "⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method."
  }
}

OUTPUT ONLY VALID JSON.
`;

      const contentsList: any[] = [];

      if (imageBase64) {
        // Strip data URI header if present
        const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp|jpg);base64,/, '');
        contentsList.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
        contentsList.push(`Analyze this food image. ${dishNameHint ? 'Dish hint: ' + dishNameHint : ''}`);
      } else {
        contentsList.push(`Analyze this food dish: ${dishNameHint || 'Indian Samosa with Chutney'}`);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: contentsList,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (!text) return res.json({ result: null, isAiGenerated: false });

      const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
      return res.json({
        result: parsed.result || null,
        isAiGenerated: true,
      });
    } catch (err) {
      console.error('API Error:', err);
      return res.status(500).json({ error: 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });


  // ==========================================
  // AGENTIC PIPELINE ENDPOINTS (NVIDIA NIM)
  // ==========================================

  app.post('/api/agents/orchestrate', async (req, res) => {
    try {
      const { text, audioBase64, patientId, patientProfile } = req.body;
      
      let inputText = text;
      
      if (audioBase64) {
        const cleanAudio = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
        inputText = await callElevenLabsSTT(cleanAudio);
      }
      
      if (!inputText) {
        return res.status(400).json({ error: 'No text or audio provided.' });
      }

      console.log('Running Intake Agent...');
      const intake = await runIntakeAgent(inputText);
      
      const profile = patientProfile || {
        name: 'Ramesh',
        age: 55,
        gender: 'Male',
        conditions: ['Hypertension'],
      };

      console.log('Running Triage Agent...');
      const triage = await runTriageAgent(intake, profile);

      console.log('Running Action Orchestrator...');
      const orchestration = await runActionOrchestrator(triage, profile);

      console.log('Running Empathy Agent...');
      const spokenText = await runEmpathyAgent(triage);
      
      console.log('Running ElevenLabs TTS...');
      let audio = null;
      try {
        audio = await callElevenLabsTTS(spokenText);
      } catch (ttsErr) {
        console.error('ElevenLabs TTS Failed:', ttsErr);
      }

      return res.json({
        intake,
        triage,
        orchestration,
        empathy: {
          spokenText,
          audioBase64: audio,
        }
      });
    } catch (err: any) {
      console.error('Agent Pipeline Error:', err);
      return res.status(500).json({ error: err?.message || 'Clinical Engine Unavailable - Real-time processing failed.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthSense AI CDSS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
