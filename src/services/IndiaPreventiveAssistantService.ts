import { Patient, CulturalRecommendationItem, FestivalGuidance, MultiVersionRecommendationReport } from '../types';

export class IndiaPreventiveAssistantService {
  /**
   * Generates a dynamic, culturally tailored preventive healthcare report for an Indian patient
   * across Diet, Exercise, Medication, Hydration, Mental Wellness, Sleep, and Seasonal Advice.
   */
  public generateCulturalReport(
    patient: Patient,
    activeFestival?: string,
    overrideLang?: 'Gujarati' | 'Hindi' | 'Marathi' | 'English'
  ): MultiVersionRecommendationReport {
    const lang = overrideLang || patient.preferredLanguage || 'English';
    const region = patient.region || 'Gujarat';
    const foodPref = patient.foodPreference || 'Vegetarian';
    const religion = patient.religion || 'Hindu';
    const festival = activeFestival || (patient.festivalCalendar && patient.festivalCalendar[0]) || 'Navratri';

    const categories = this.buildCategories(patient, lang, region, foodPref, religion);
    const festivalGuidance = this.buildFestivalGuidance(festival, lang, patient);
    const versions = this.buildFourVersions(patient, categories, festivalGuidance, lang);

    return {
      language: lang,
      patientProfileSummary: {
        name: patient.name,
        region,
        foodPreference: foodPref,
        activeFestival: festival,
      },
      categories,
      festivalGuidance,
      versions,
    };
  }

  private buildCategories(
    patient: Patient,
    lang: string,
    region: string,
    foodPref: string,
    religion: string
  ): CulturalRecommendationItem[] {
    const isDiabetic = patient.conditions.some((c) => /diabet/i.test(c)) || (patient.vitals.hba1c > 6.5);
    const isHypertensive = patient.conditions.some((c) => /hyper|bp/i.test(c)) || (patient.vitals.bpSystolic > 130);

    // 1. DIET
    const dietItem = this.getDietRecommendation(region, foodPref, religion, isDiabetic, isHypertensive, lang);

    // 2. EXERCISE
    const exerciseItem = this.getExerciseRecommendation(region, lang, patient.vitals.bmi);

    // 3. MEDICATION
    const medItem = this.getMedicationRecommendation(lang, isDiabetic, isHypertensive);

    // 4. HYDRATION
    const hydrationItem = this.getHydrationRecommendation(region, lang);

    // 5. MENTAL WELLNESS
    const mentalItem = this.getMentalWellnessRecommendation(lang);

    // 6. SLEEP
    const sleepItem = this.getSleepRecommendation(lang);

    // 7. SEASONAL ADVICE
    const seasonalItem = this.getSeasonalAdvice(region, lang);

    return [dietItem, exerciseItem, medItem, hydrationItem, mentalItem, sleepItem, seasonalItem];
  }

  private getDietRecommendation(
    region: string,
    foodPref: string,
    religion: string,
    isDiabetic: boolean,
    isHypertensive: boolean,
    lang: string
  ): CulturalRecommendationItem {
    if (region === 'Gujarat' || lang === 'Gujarati') {
      return {
        id: 'c-diet-1',
        category: 'Diet',
        title: lang === 'Gujarati' ? 'ગુજરાતી ડાયાબિટીસ નેચરલ ડાયેટ પ્લોન' : 'Gujarati Glycemic Balance Meal Plan',
        reason: isDiabetic ? 'Elevated HbA1c & Fasting Glucose requires low glycemic index staple carbohydrates.' : 'Preventive metabolic optimization.',
        expectedBenefit: 'Reduces post-prandial glycemic spikes by 35-40 mg/dL and lowers lipid absorption.',
        suggestedFrequency: 'Daily meals (Lunch & Dinner)',
        recommendedOptions: [
          lang === 'Gujarati' ? 'બાજરા રોટલો અને મોરૈયો' : 'Bajra Rotla & Moraiyo (Barnyard Millet)',
          lang === 'Gujarati' ? 'મલ્ટિગ્રેન થેપલા (ઓછા તેલ વાળા)' : 'Multigrain Methi Thepla (Minimal Oil)',
          lang === 'Gujarati' ? 'ઓછા તેલવાળું લીલું ઊંધિયું' : 'Low-Oil Green Undhiyu (Without fried Muthiya)',
          lang === 'Gujarati' ? 'દૂધી-મગની દાળ અને ખાખરા' : 'Lauki Moong Dal & Whole Wheat Khakhra',
        ],
        itemsToAvoid: [
          lang === 'Gujarati' ? 'મીઠા વાળો ફાફડા અને જલેબી' : 'Sugary Farsan (Jalebi, Fafda, Fried Gathiya)',
          lang === 'Gujarati' ? 'ખાંડ વાળી ગુજરાતી દાળ' : 'Sugary Gujarati Dal (Use Stevia or Jaggery limits)',
          lang === 'Gujarati' ? 'સાબુદાણાની તળેલી ખીચડી' : 'Deep Fried Sabudana Vada',
        ],
        doctorAlignedTip: lang === 'Gujarati'
          ? 'દરેક ભોજન સાથે એક વાટકી મોળી છાશ અથવા સુવાદાણાનું પાણી લો.'
          : 'Pair Bajra Rotla with roasted flaxseeds and unsweetened cumin Chaas.',
        culturalNote: 'Tailored for traditional Gujarati household culinary habits.',
      };
    } else if (region === 'Maharashtra' || lang === 'Marathi') {
      return {
        id: 'c-diet-1',
        category: 'Diet',
        title: lang === 'Marathi' ? 'महाराष्ट्रीयन संतुलित आहार योजना' : 'Maharashtrian Low-Glycemic Cardio Diet',
        reason: 'Optimizes vascular pressure and blood sugar levels using indigenous coarse grains.',
        expectedBenefit: 'Decreases arterial stiffness and lowers nocturnal glucose levels.',
        suggestedFrequency: 'Daily meals',
        recommendedOptions: [
          lang === 'Marathi' ? 'જ્વારી અથવા બાજરીચી ભાકરી' : 'Jowar / Bajri Bhakri with garlic paste',
          lang === 'Marathi' ? 'મેથી પીઠલ અને ઉસળ' : 'Methi Pithla & Sprouted Matki Usal',
          lang === 'Marathi' ? 'સોલકઢી (ઓછા મીઠા વાળી)' : 'Solkadhi (Kokum & unsweetened coconut extract)',
          lang === 'Marathi' ? 'વરણ ભાત (બ્રાઉન રાઇસ સ્ટીમ્ડ)' : 'Steamed Brown Rice Varan with Ghee (1 tsp)',
        ],
        itemsToAvoid: [
          lang === 'Marathi' ? 'તળેલા વડા પાઉં અને ભજીયા' : 'Fried Vada Pav and Kanda Bhajji',
          lang === 'Marathi' ? 'સાબુદાણા વડા' : 'Deep-fried Sabudana Vada',
          lang === 'Marathi' ? 'ચટપટી મિસળ' : 'Excessively spicy/oily Misal Rassa',
        ],
        doctorAlignedTip: lang === 'Marathi'
          ? 'भाकरीसोबत मेथी किंवा शेवग्याची पाने खावीत.'
          : 'Consume Jowar Bhakri with drumstick leaf soup for natural fiber and potassium.',
        culturalNote: 'Adapted for traditional Maharashtrian dietary preferences.',
      };
    } else {
      // North / General / Hindi
      return {
        id: 'c-diet-1',
        category: 'Diet',
        title: lang === 'Hindi' ? 'भारतीय पौष्टिक एवं कम शर्करा आहार' : 'North Indian Heart-Healthy Diabetic Diet',
        reason: 'Controls fasting sugar and blood pressure with traditional complex carbohydrates.',
        expectedBenefit: 'Reduces blood pressure by 6 mmHg and maintains stable insulin responsiveness.',
        suggestedFrequency: '3 Meals daily',
        recommendedOptions: [
          lang === 'Hindi' ? 'मिस्सी रोटी (चना एवं गेहूं)' : 'Missi Roti (Chana + Barley + Wheat)',
          lang === 'Hindi' ? 'लौकी रायता एवं चना दाल' : 'Lauki Raita & Roasted Chana Dal',
          lang === 'Hindi' ? 'सरसों का साग (कम घी वाला)' : 'Sarson ka Saag with minimal white butter',
          lang === 'Hindi' ? 'दलिया खीर (बिना चीनी)' : 'Sugar-free Oats / Oats Dalia Kheer',
        ],
        itemsToAvoid: [
          lang === 'Hindi' ? 'मैदे की पूरी एवं भटूरे' : 'Refined Maida Puri, Bhature & Samosa',
          lang === 'Hindi' ? 'गाजर का हलवा (ज्यादा चीनी वाला)' : 'Heavy Ghee Sweets & Gulab Jamun',
          lang === 'Hindi' ? 'मलाईदार पनीर मखनवाला' : 'Butter Chicken / Heavy Cream Gravies',
        ],
        doctorAlignedTip: lang === 'Hindi'
          ? 'दाल में तड़का लगाते समय केवल 1 छोटा चम्मच गाय का घी प्रयोग करें।'
          : 'Limit ghee tempering to 1 teaspoon per meal and incorporate fenugreek seeds.',
        culturalNote: 'Formulated for North Indian regional dietary patterns.',
      };
    }
  }

  private getExerciseRecommendation(region: string, lang: string, bmi: number): CulturalRecommendationItem {
    return {
      id: 'c-ex-2',
      category: 'Exercise',
      title: lang === 'Gujarati' ? 'રાત્રિ ભોજન બાદ ૧૦૦૦ કદમ (શતાપવલી) અને યોગ'
        : lang === 'Marathi' ? 'संध्याकाळचे शतपावली आणि योगासने'
        : lang === 'Hindi' ? 'शतपावली टहलना एवं कपालभाति प्राणायाम'
        : 'Shatapavali (Post-Dinner 100-Step Walk) & Yoga Routine',
      reason: 'Sedentary post-dinner period accelerates nocturnal glucose spikes.',
      expectedBenefit: 'Promotes muscle glucose clearance and reduces resting heart rate.',
      suggestedFrequency: 'Daily (20 mins morning Yoga + 15 mins post-dinner Shatapavali)',
      recommendedOptions: [
        'Shatapavali (Light 15-min post-meal brisk walk)',
        'Surya Namaskar (5-10 rounds at sunrise)',
        'Anulom Vilom & Kapalbhati Pranayama (15 mins)',
        'Garba / Folk dance steps walk during festive seasons',
      ],
      itemsToAvoid: [
        'Immediate lying down after dinner',
        'Strenuous weight lifting during acute blood pressure spikes (>160 mmHg)',
      ],
      doctorAlignedTip: 'Never sit continuously for more than 45 minutes; practice light leg stretch intervals.',
      culturalNote: 'Incorporates traditional Indian Shatapavali habit practiced across generations.',
    };
  }

  private getMedicationRecommendation(lang: string, isDiabetic: boolean, isHypertensive: boolean): CulturalRecommendationItem {
    return {
      id: 'c-med-3',
      category: 'Medication',
      title: lang === 'Gujarati' ? 'સમયસર દવા અને ભોજન સમયપત્રક'
        : lang === 'Hindi' ? 'भोजन एवं दवाइयों का सही समय'
        : 'Meal-Aligned Precision Medication Routine',
      reason: 'Prevents hypoglycemia and ensures optimal therapeutic blood concentration.',
      expectedBenefit: 'Prevents missed doses and reduces gastric irritation by 80%.',
      suggestedFrequency: 'Daily at fixed morning/night meal times',
      recommendedOptions: [
        'Take Metformin with first bite of breakfast / dinner',
        'Take Thyroid medications (Levothyroxine) at 6:00 AM with warm water on empty stomach',
        'BP medications (Amlodipine/Lisinopril) at bedtime for nocturnal hypertension control',
      ],
      itemsToAvoid: [
        'Taking diabetes pills on empty fasting stomach without food intake',
        'Consuming grapefruit juice or heavy sour buttermilk directly with statin pills',
      ],
      doctorAlignedTip: 'Set smartphone alarm or use a daily pill box labeled Morning/Night.',
      culturalNote: 'Synchronized with Indian meal rhythms (Naashta, Dopahar ka Khana, Raat ka Khana).',
    };
  }

  private getHydrationRecommendation(region: string, lang: string): CulturalRecommendationItem {
    return {
      id: 'c-hyd-4',
      category: 'Hydration',
      title: lang === 'Gujarati' ? 'દેશી છાશ અને લીંબુ પાણી હાઇડ્રેશન'
        : lang === 'Hindi' ? 'ताज़ा छाछ एवं नीबू पानी पेय'
        : 'Ayurvedic Herb & Buttermilk Hydration Plan',
      reason: 'Sustains kidney electrolyte balance (eGFR) and digestive enzyme secretion.',
      expectedBenefit: 'Helps excrete excess sodium and reduces body heat & acidity.',
      suggestedFrequency: '2.5 to 3.0 Liters daily',
      recommendedOptions: [
        'Fresh Masala Chaas with roasted cumin powder & mint leaves',
        'Unsweetened Lemon Water (Nimbu Pani) with pinch of rock salt',
        'Coconut Water (Nariyal Pani) once daily (if renal potassium permits)',
        'Coriander & Copper-infused morning water',
      ],
      itemsToAvoid: [
        'Commercially packaged sugary Rooh Afza or bottled sherbets',
        'Carbonated fizzy soft drinks during hot weather',
      ],
      doctorAlignedTip: 'Always carry a steel water bottle when stepping outdoors for work.',
      culturalNote: 'Uses natural traditional cooling beverages suitable for Indian summer & humid seasons.',
    };
  }

  private getMentalWellnessRecommendation(lang: string): CulturalRecommendationItem {
    return {
      id: 'c-ment-5',
      category: 'Mental Wellness',
      title: lang === 'Gujarati' ? 'ધ્યાન અને પ્રણાયામ દ્વારા માનસિક શાંતિ'
        : lang === 'Hindi' ? 'संध्याकालीन ध्यान एवं भ्रामरी प्राणायाम'
        : 'Sandhya Meditation & Pranayama Stress Reduction',
      reason: 'Occupational and family stress increases serum cortisol and vasospasms.',
      expectedBenefit: 'Calms sympathetic nerve hyperactivity and improves nocturnal restorative sleep.',
      suggestedFrequency: '10-15 minutes twice daily (Morning & Evening Sandhya)',
      recommendedOptions: [
        'Bhramari & Om Chanting for vagal nerve stimulation',
        'Guided Yoga Nidra relaxation before bedtime',
        '10-minute mindful garden sitting or terrace evening walk',
      ],
      itemsToAvoid: [
        'Watching news television or scrolling social media before sleep',
        'Caffeine or strong tea after 6:00 PM',
      ],
      doctorAlignedTip: 'Practice 4-7-8 deep diaphragmatic breathing when feeling anxious.',
      culturalNote: 'Rooted in Indian Sandhya Vandanam and Yogic breathwork practices.',
    };
  }

  private getSleepRecommendation(lang: string): CulturalRecommendationItem {
    return {
      id: 'c-sleep-6',
      category: 'Sleep',
      title: lang === 'Gujarati' ? '૭.૫ કલાકની નિયમિત ઊંઘ અને શયન નિયમો'
        : lang === 'Hindi' ? '7.5 घंटे की गहरी नींद एवं शयन नियम'
        : '7.5-Hour Circadian Alignment Sleep Hygiene',
      reason: 'Inadequate sleep triggers insulin resistance and elevates morning fasting BP.',
      expectedBenefit: 'Lowers baseline inflammation markers and stabilizes morning cortisol.',
      suggestedFrequency: 'Every night (Target bedtime 10:00 PM - 10:30 PM)',
      recommendedOptions: [
        'Warm foot bath (Pada Abhyanga) with warm sesame oil before bed',
        'Warm Haldi Doodh (Turmeric Skimmed Milk with black pepper) 30 mins before sleeping',
        'Keep bedroom dark and ventilated',
      ],
      itemsToAvoid: [
        'Late-night dinner after 9:30 PM',
        'Using smartphones or mobile screens while lying in bed',
      ],
      doctorAlignedTip: 'Maintain consistent sleep and wake-up times even on weekends.',
      culturalNote: 'Incorporates traditional Indian Ayurveda nighttime soothing rituals.',
    };
  }

  private getSeasonalAdvice(region: string, lang: string): CulturalRecommendationItem {
    return {
      id: 'c-seas-7',
      category: 'Seasonal Advice',
      title: lang === 'Gujarati' ? 'ઋતુચર્યા અને ચોમાસા-શિયાળાની સંભાળ'
        : lang === 'Hindi' ? 'ऋतुचर्या: मानसून एवं शीतकालीन स्वास्थ्य सलाह'
        : 'Ritucharya (Indian Seasonal Care Guidelines)',
      reason: 'Seasonal temperature variations alter blood pressure, joint stiffness, and infection vulnerability.',
      expectedBenefit: 'Prevents seasonal viral fevers, waterborne GI infections, and winter BP surges.',
      suggestedFrequency: 'Seasonally updated guidance',
      recommendedOptions: [
        'Monsoon: Drink boiled warm water; avoid street food & raw unwashed salad vegetables',
        'Winter: Consume warm Til-Jaggery, Bajra soup, and absorb 15 mins morning sunlight for Vitamin D',
        'Summer: Wear breathable cotton clothing and drink Kadha/Chaas to prevent heat stroke',
      ],
      itemsToAvoid: [
        'Eating cold leftover food during rainy monsoon season',
        'Exposing head and chest to cold early morning air without warm scarves in winter',
      ],
      doctorAlignedTip: 'Get annual flu vaccination before the onset of monsoon rains.',
      culturalNote: 'Follows classic Ayurvedic Ritucharya seasonal health management.',
    };
  }

  private buildFestivalGuidance(festival: string, lang: string, patient: Patient): FestivalGuidance {
    if (festival === 'Navratri') {
      return {
        festivalName: 'Navratri Garba & Fasting Guidelines',
        specialAdvice: [
          lang === 'Gujarati' ? 'ગરબા રમતી વખતે દર ૩૦ મિનિટે પાણી અથવા છાશ પીવો.' : 'Hydrate with lemon water every 30 minutes of Garba dancing.',
          'If observing Upvas (fasting), do not remain on empty stomach for >4 hours to avoid hypoglycemia.',
        ],
        dietaryAdjustments: [
          'Choose baked Moraiyo (Barnyard millet) or Rajgira (Amaranth) rotli over fried Kutu Puri.',
          'Limit Sabudana Vada; opt for roasted peanuts and cucumber cucumber salads.',
        ],
        fastingOrFeastingSafetyTips: [
          'Diabetic patients taking Insulin or Sulfonylureas must consult doctor before complete waterless fasting.',
        ],
        medicationTimingNote: 'Take morning diabetes medications with early morning Rajgira breakfast, not on empty stomach.',
      };
    } else if (festival === 'Ramadan') {
      return {
        festivalName: 'Ramadan Suhoor & Iftar Health Protocol',
        specialAdvice: [
          'Break fast at Iftar with 1 Date + 2 glasses of water before heavy meal.',
          'Avoid heavy fried Samosas and Pakoras at Iftar to prevent gastric reflux and sugar spikes.',
        ],
        dietaryAdjustments: [
          'At Suhoor (Pre-dawn meal), consume complex slow-digesting oats, multigrain roti, and lentils.',
          'Drink 1.5 Liters of water gradually between Iftar and Suhoor.',
        ],
        fastingOrFeastingSafetyTips: [
          'Test blood glucose at 12:00 PM and 4:00 PM. If glucose drops < 70 mg/dL, break fast immediately per medical guidelines.',
        ],
        medicationTimingNote: 'Shift morning medication dose to Iftar and reduced evening dose to Suhoor after physician review.',
      };
    } else {
      // Diwali / Default
      return {
        festivalName: 'Diwali Healthy Celebration Guide',
        specialAdvice: [
          'Enjoy festival sweets made with Stevia or natural Dates instead of refined sugar & Mawa.',
          'Wear N95 mask if air quality index (AQI) degrades due to firecracker smoke.',
        ],
        dietaryAdjustments: [
          'Limit Mithai intake to 1 small piece per day after a fiber-rich meal.',
          'Opt for roasted dry fruits (Almonds, Walnuts) instead of deep-fried Namkeen.',
        ],
        fastingOrFeastingSafetyTips: [
          'Do not skip regular meals before attending festive dinners to prevent overeating.',
        ],
        medicationTimingNote: 'Maintain regular medication schedule despite late-night festive family gatherings.',
      };
    }
  }

  private buildFourVersions(
    patient: Patient,
    categories: CulturalRecommendationItem[],
    festival: FestivalGuidance,
    lang: string
  ) {
    const diet = categories.find((c) => c.category === 'Diet');
    const ex = categories.find((c) => c.category === 'Exercise');

    // 1. Doctor Version
    const doctorVersion = `CLINICAL PREVENTIVE SUMMARY FOR DR. ASSISTANT
Patient: ${patient.name} | Region: ${patient.region || 'Gujarat'} | Lang: ${lang}
Primary Diagnosis: ${patient.conditions.join(', ')} (HbA1c: ${patient.vitals.hba1c}%, BP: ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic} mmHg)

CULTURAL NUTRITION TARGET:
- Prescribed Staple: ${diet?.recommendedOptions.join(', ')}
- Items Restricted: ${diet?.itemsToAvoid?.join(', ')}
- Clinical Goal: Lower postprandial glucose spike by 30-40 mg/dL & sodium < 2000 mg/day.

PHYSICAL ACTIVITY & HABITS:
- Prescribed regime: ${ex?.title} (${ex?.suggestedFrequency}).
- Festival Adaptation (${festival.festivalName}): ${festival.medicationTimingNote}

REFERRAL / MONITORING: Repeat HbA1c in 90 days; monitor BP log twice weekly.`;

    // 2. Patient Version
    const patientVersion = lang === 'Gujarati'
      ? `નમસ્તે ${patient.name}જી, તમારા સ્વાસ્થ્ય અને આનંદમય જીવન માટે ખાસ ગુજરાતી માર્ગદર્શન:

૧. આહાર (ડાયેટ): ${diet?.title}
• ઉત્તમ ખોરાક: ${diet?.recommendedOptions.join(', ')}
• પરેજી (ન ખાવું): ${diet?.itemsToAvoid?.join(', ')}

૨. કસરત: ${ex?.title} - રોજ રાત્રે જમ્યા પછી ૧૫ મિનિટ ચાલો.

૩. તહેવાર માર્ગદર્શન (${festival.festivalName}):
• ${festival.specialAdvice.join('\n• ')}

ડૉક્ટરની સલાહ: દવાઓ સમયસર લો અને રોજ ૨.૫ લિટર મોળી છાશ અથવા પાણી પીવો.`
      : lang === 'Hindi'
      ? `नमस्ते ${patient.name} जी, आपके बेहतर स्वास्थ्य के लिए सांस्कृतिक स्वास्थ्य सलाह:

1. आहार (Diet): ${diet?.title}
• उत्तम भोजन: ${diet?.recommendedOptions.join(', ')}
• परहेज (परहेज करें): ${diet?.itemsToAvoid?.join(', ')}

2. व्यायाम: ${ex?.title} - भोजन के बाद 15 मिनट शतपावली टहलें।

3. त्यौहार सलाह (${festival.festivalName}):
• ${festival.specialAdvice.join('\n• ')}

डॉक्टर संदेश: दवाइयां समय पर लें और रोजाना 2.5 लीटर पानी व ताज़ा छाछ पिएं।`
      : `Dear ${patient.name}, here is your personalized Indian Preventive Health Plan:

1. CULTURAL DIET: ${diet?.title}
• Recommended Staples: ${diet?.recommendedOptions.join(', ')}
• Foods to Limit: ${diet?.itemsToAvoid?.join(', ')}

2. PHYSICAL ACTIVITY: ${ex?.title} - Practice 15-min post-dinner walk (Shatapavali) daily.

3. FESTIVAL CARE (${festival.festivalName}):
• ${festival.specialAdvice.join('\n• ')}

Doctor's Note: Take your medications on time with meals and maintain 2.5L daily hydration.`;

    // 3. Voice Friendly Version
    const voiceFriendlyVersion = lang === 'Gujarati'
      ? `નમસ્તે ${patient.name}. આજે તમારા ડૉક્ટરે તમને દરરોજ બાજરાનો રોટલો, લીલું ઊંધિયું અને મલ્ટિગ્રેન થેપલા ખાવાની સલાહ આપી છે. જલેબી અને ફાફડા જેવા તળેલા ફરસણથી દૂર રહો. રાત્રે જમ્યા પછી ૧૫ મિનિટ જરૂર ચાલો અને દિવસમાં ૨.૫ લિટર છાશ અથવા પાણી પીવો.`
      : lang === 'Hindi'
      ? `नमस्ते ${patient.name}. आपके डॉक्टर ने आपको मिस्सी रोटी, लौकी रायता और मूंग दाल खाने की सलाह दी है। समोसा, पूरी और ज्यादा मिठाई खाने से बचें। रात के खाने के बाद 15 मिनट टहलें और समय पर दवाइयां लें।`
      : `Hello ${patient.name}. Your doctor recommends eating Bajra Rotla, green vegetables, and multigrain chapati. Avoid sugary sweets and fried snacks. Remember to walk for 15 minutes after dinner and drink 2.5 liters of water daily. Stay healthy!`;

    // 4. WhatsApp Friendly Version
    const whatsappFriendlyVersion = `🟢 *HEALTHSENSE PREVENTIVE CARE REPORT*
👤 *Patient:* ${patient.name} (${patient.region || 'India'})
🌐 *Language:* ${lang}

🥗 *RECOMMENDED INDIAN DIET:*
${diet?.recommendedOptions.map((o) => `  ✅ ${o}`).join('\n')}

❌ *ITEMS TO AVOID:*
${diet?.itemsToAvoid?.map((o) => `  ⚠️ ${o}`).join('\n')}

🚶 *DAILY EXERCISE:*
  🏃 ${ex?.title}

🎉 *FESTIVAL SPECIAL ADVICE (${festival.festivalName}):*
${festival.specialAdvice.map((a) => `  ✨ ${a}`).join('\n')}

💧 *HYDRATION:* 2.5 - 3.0 Liters Daily (Masala Chaas & Nimbu Pani)
💊 *MEDICATIONS:* Take on time as prescribed by your doctor.

_HealthSense CDSS - India-First Clinical Companion_`;

    return {
      doctorVersion,
      patientVersion,
      voiceFriendlyVersion,
      whatsappFriendlyVersion,
    };
  }
}

export const indiaPreventiveAssistant = new IndiaPreventiveAssistantService();
