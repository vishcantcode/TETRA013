export interface MedicalTermMapping {
  term: string;
  plainName: string;
  simpleExplanation: string;
}

export interface RegionalDietPlan {
  region: 'Gujarati' | 'Punjabi' | 'South Indian' | 'Maharashtrian' | 'Rajasthani';
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  foodsToAvoid: string[];
  budgetFriendlyAlternative: string;
}

export interface LabCostEstimate {
  testName: string;
  loincCode: string;
  govtPhcPrice: string;
  privateLabPrice: string;
  pmJayEligible: boolean;
}

export class CustomerExperienceUtils {
  // 1. Plain Language Mappings for Technical Terminology
  public static medicalTermMap: Record<string, MedicalTermMapping> = {
    hba1c: {
      term: 'HbA1c',
      plainName: '3-Month Average Blood Sugar',
      simpleExplanation: 'Measures your average blood sugar level over the past 90 days.'
    },
    systolicbp: {
      term: 'Systolic BP',
      plainName: 'Upper Blood Pressure Number',
      simpleExplanation: 'Pressure in your blood vessels when your heart beats.'
    },
    diastolicbp: {
      term: 'Diastolic BP',
      plainName: 'Lower Blood Pressure Number',
      simpleExplanation: 'Pressure in your blood vessels when your heart rests between beats.'
    },
    egfr: {
      term: 'eGFR',
      plainName: 'Kidney Filter Score',
      simpleExplanation: 'Shows how well your kidneys are filtering waste from your blood.'
    },
    uacr: {
      term: 'UACR',
      plainName: 'Urine Kidney Protein Test',
      simpleExplanation: 'Checks if small amounts of protein are leaking into your urine.'
    },
    bmi: {
      term: 'BMI',
      plainName: 'Body Weight to Height Ratio',
      simpleExplanation: 'Indicates whether your weight is healthy for your height.'
    },
    hypertension: {
      term: 'Hypertension',
      plainName: 'High Blood Pressure',
      simpleExplanation: 'Your blood pressure is consistently higher than normal.'
    },
    hyperglycemia: {
      term: 'Hyperglycemia',
      plainName: 'High Blood Sugar',
      simpleExplanation: 'Your blood glucose level is higher than recommended.'
    },
    ckd: {
      term: 'Chronic Kidney Disease',
      plainName: 'Long-term Kidney Health Condition',
      simpleExplanation: 'Gradual loss of kidney filtering efficiency over time.'
    }
  };

  // 2. "Why Am I At Risk?" Explanations
  public static getRiskReasons(disease: string, score: number): string[] {
    if (score < 30) return ['Normal blood sugar and BP', 'Healthy physical activity level', 'Balanced diet'];
    if (disease === 'diabetes') {
      return [
        'Elevated 3-Month Average Blood Sugar (HbA1c > 7.0%)',
        'Fasting Blood Glucose above 126 mg/dL',
        'Higher body weight (BMI > 25 kg/m²)',
        'Low daily physical activity (< 150 mins/week)'
      ];
    }
    if (disease === 'hypertension') {
      return [
        'Upper Blood Pressure above 140 mmHg',
        'Higher dietary sodium (salt) intake',
        'Increased vascular arterial stiffness',
        'Lack of aerobic exercise'
      ];
    }
    if (disease === 'ckd') {
      return [
        'Reduced Kidney Filter Score (eGFR < 60 mL/min)',
        'Long-standing High Blood Sugar affecting renal blood vessels',
        'High blood pressure strain on nephron filters'
      ];
    }
    return ['Elevated metabolic biomarkers', 'Multiple co-existing risk factors'];
  }

  // 3. "What Should I Do Now?" Actions (TODAY vs THIS WEEK)
  public static getActionableSteps(score: number) {
    return {
      today: [
        'Walk briskly for 30 minutes in the morning or evening',
        'Reduce salt intake (avoid papad, pickles, and packaged snacks)',
        'Drink 8-10 glasses of clean water throughout the day',
        'Take your prescribed daily morning and night medications'
      ],
      thisWeek: [
        'Visit your local Primary Health Centre (PHC) for a routine blood test',
        'Get a diabetic eye examination if recommended',
        'Check kidney function test (Urine UACR & Serum Creatinine)',
        'Review blood pressure log with your PHC doctor or ASHA worker'
      ]
    };
  }

  // 4. Regional Indian Diet Personalization
  public static regionalDiets: Record<string, RegionalDietPlan> = {
    Gujarati: {
      region: 'Gujarati',
      breakfast: 'Khakra made with Jowar/Bajra, Handvo (steamed with vegetables), Mint tea without sugar',
      lunch: 'Rotla (Bajra/Jowar), Tuver Dal (low jaggery/sugar), Bhindi or Lauki Sabzi, Salad',
      dinner: 'Khichdi (Bajra and Moong dal), Butter-milk (Chaas with roasted cumin)',
      snacks: 'Roasted Chana, Kurmura (Puffed Rice) with roasted peanuts',
      foodsToAvoid: ['Sweetened Kadhi', 'Fried Farsan (Fafdsa, Jalebi)', 'Excessive Jaggery in Dal'],
      budgetFriendlyAlternative: 'Replace wheat roti with locally available Bajra or Jowar Rotla'
    },
    Punjabi: {
      region: 'Punjabi',
      breakfast: 'Missi Roti with curd, Sprouted Moong Chaat, Green Tea',
      lunch: 'Rajma or Chole (cooked in minimal oil), Missi Roti, Cucumber-Tomato Salad',
      dinner: 'Sarson ka Saag or Palak Paneer, 1 Jowar Roti, Plain Curd',
      snacks: 'Roasted Makhana, Buttermilk with Roasted Cumin',
      foodsToAvoid: ['Butter Naan', 'Deep-fried Bhature', 'Sweet Lassi with Cream'],
      budgetFriendlyAlternative: 'Use whole Kala Chana or Rajma instead of processed paneer'
    },
    'South Indian': {
      region: 'South Indian',
      breakfast: 'Rava/Ragi Idli with Sambhar (rich in vegetables), Coconut-Mint Chutney',
      lunch: 'Brown Rice or Foxtail Millet Rice, Vegetable Sambhar, Keerai (Spinach) Poriyal',
      dinner: 'Multi-grain Dosa or Ragi Dosa, Tomato-Onion Uttapam, Rasam',
      snacks: 'Boiled Chana sundal, Roasted Spiced Peanuts',
      foodsToAvoid: ['Polished White Parotta', 'Deep-fried Medu Vada', 'Sweetened Coffee'],
      budgetFriendlyAlternative: 'Use Foxtail Millet or Ragi instead of white polished rice'
    }
  };

  // 5. Cost Estimator Data for Indian Diagnostics
  public static testCosts: LabCostEstimate[] = [
    { testName: 'HbA1c (Average Blood Sugar)', loincCode: '4548-4', govtPhcPrice: 'FREE', privateLabPrice: '₹250 - ₹400', pmJayEligible: true },
    { testName: 'Fasting Blood Glucose', loincCode: '1558-6', govtPhcPrice: 'FREE', privateLabPrice: '₹50 - ₹100', pmJayEligible: true },
    { testName: 'Serum Creatinine (Kidney Check)', loincCode: '2160-0', govtPhcPrice: 'FREE', privateLabPrice: '₹150 - ₹250', pmJayEligible: true },
    { testName: 'Urine UACR (Kidney Protein)', loincCode: '33914-3', govtPhcPrice: 'FREE', privateLabPrice: '₹300 - ₹500', pmJayEligible: true },
    { testName: 'ECG (Heart Rhythm Check)', loincCode: '11524-6', govtPhcPrice: 'FREE', privateLabPrice: '₹200 - ₹350', pmJayEligible: true }
  ];
}
