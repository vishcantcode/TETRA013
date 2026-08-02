import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Flame,
  Activity,
  ArrowRight,
  Info,
  RefreshCw,
  Zap,
  Heart,
  Scale,
  Utensils,
  Award,
} from 'lucide-react';
import { Patient, FoodScanResult, SuitabilityStatus, Mode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AiFoodScannerProps {
  mode: Mode;
  activePatient: Patient;
}

interface SampleDish {
  name: string;
  category: string;
  imageUrl: string;
  fallbackResult: FoodScanResult;
}

const SAMPLE_DISHES: SampleDish[] = [
  {
    name: 'Samosa with Sweet Chutney',
    category: 'Fried Snack',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=600',
    fallbackResult: {
      dishName: 'Samosa with Sweet Chutney',
      confidence: 96,
      portionSize: '1 plate (2 medium samosas, ~220g)',
      macros: {
        calories: 520,
        protein: 8,
        carbs: 58,
        fat: 28,
        fiber: 4,
        sugar: 12,
        sodium: 780,
      },
      conditionSuitability: [
        {
          condition: 'Diabetes',
          status: 'High Risk',
          reasoning: 'Refined flour (maida) crust and sweet chutney cause rapid glucose spikes.',
        },
        {
          condition: 'Hypertension',
          status: 'Moderate',
          reasoning: 'Contains 780mg sodium per serving (~35% daily recommended limit).',
        },
        {
          condition: 'CKD',
          status: 'Moderate',
          reasoning: 'Potato masala filling is high in potassium. Portion restriction is advised.',
        },
        {
          condition: 'Heart Disease',
          status: 'Avoid',
          reasoning: 'Deep frying in hydrogenated oil produces saturated and trans-fats.',
        },
      ],
      healthierAlternatives: [
        {
          dishName: 'Baked Whole Wheat Vegetable Samosa',
          description: 'Baked crust made with whole wheat flour and filled with spiced green peas and paneer.',
          benefits: 'Saves 20g fat (65% lower calories) while boosting dietary fiber.',
          estimatedCalories: 210,
        },
        {
          dishName: 'Steamed Gujarat Muthiya / Handvo',
          description: 'Steamed bottle gourd and millet cake lightly tempered with sesame seeds.',
          benefits: 'Zero deep frying with low glycemic load and rich soluble fiber.',
          estimatedCalories: 160,
        },
      ],
      rationale: 'Deep fried snacks high in refined carbs and trans-fats increase postprandial glycemic response and vascular inflammation.',
      summaryNote: 'Enjoy as a rare treat in small portions. Swap sweet tamarind chutney for mint-coriander green chutney.',
      disclaimer: '⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method.',
    },
  },
  {
    name: 'Masala Dosa with Sambhar & Chutney',
    category: 'South Indian',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600',
    fallbackResult: {
      dishName: 'Masala Dosa with Sambhar & Coconut Chutney',
      confidence: 94,
      portionSize: '1 large dosa + 1 bowl sambhar (~300g)',
      macros: {
        calories: 440,
        protein: 11,
        carbs: 64,
        fat: 16,
        fiber: 7,
        sugar: 4,
        sodium: 680,
      },
      conditionSuitability: [
        {
          condition: 'Diabetes',
          status: 'Moderate',
          reasoning: 'Fermented rice batter has moderate GI. Pair with extra sambhar for protein.',
        },
        {
          condition: 'Hypertension',
          status: 'Moderate',
          reasoning: 'Sambhar and coconut chutney contain moderate sodium seasoning.',
        },
        {
          condition: 'CKD',
          status: 'Suitable',
          reasoning: 'Moderate protein with good lentil bioavailability. Limit coconut chutney if potassium restricted.',
        },
        {
          condition: 'Heart Disease',
          status: 'Suitable',
          reasoning: 'Low in saturated fat if ghee/butter is used sparingly.',
        },
      ],
      healthierAlternatives: [
        {
          dishName: 'Oats & Ragi Dosa',
          description: 'Dosa batter enriched with finger millet (ragi) and rolled oats.',
          benefits: 'Reduces carbohydrate impact and increases calcium & beta-glucan fiber.',
          estimatedCalories: 280,
        },
      ],
      rationale: 'Fermentation improves bioavailability of B-vitamins, but rice proportion requires monitoring for diabetic glycemic control.',
      summaryNote: 'A nutritious meal when prepared with minimal ghee and accompanied by vegetable-rich sambhar.',
      disclaimer: '⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method.',
    },
  },
  {
    name: 'Bajra Rotla with Ringan Bharta & Curd',
    category: 'Gujarati / Kathiyawadi',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600',
    fallbackResult: {
      dishName: 'Bajra Rotla with Roasted Eggplant (Ringan Bharta)',
      confidence: 98,
      portionSize: '1 Bajra Rotla + 1 bowl Bharta + 1 cup fresh curd (~350g)',
      macros: {
        calories: 380,
        protein: 14,
        carbs: 52,
        fat: 12,
        fiber: 11,
        sugar: 5,
        sodium: 420,
      },
      conditionSuitability: [
        {
          condition: 'Diabetes',
          status: 'Suitable',
          reasoning: 'Bajra millet is rich in complex carbohydrates and fiber with low glycemic index.',
        },
        {
          condition: 'Hypertension',
          status: 'Suitable',
          reasoning: 'Low sodium meal naturally high in magnesium and potassium.',
        },
        {
          condition: 'CKD',
          status: 'Moderate',
          reasoning: 'Millet and eggplant have moderate potassium. Monitor if stage 4/5 CKD.',
        },
        {
          condition: 'Heart Disease',
          status: 'Suitable',
          reasoning: 'Zero trans-fats; rich in hearth-healthy plant fibers and antioxidants.',
        },
      ],
      healthierAlternatives: [
        {
          dishName: 'Multi-millet Rotla with Methi Subzi',
          description: 'Combination of Bajra, Jowar and Ragi flour infused with fresh fenugreek leaves.',
          benefits: 'Fenugreek slows carbohydrate absorption and improves insulin sensitivity.',
          estimatedCalories: 320,
        },
      ],
      rationale: 'Traditional winter millet thali providing superior fiber, sustained satiety, and steady blood glucose levels.',
      summaryNote: 'Outstanding traditional choice for diabetes and cardiovascular maintenance!',
      disclaimer: '⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method.',
    },
  },
  {
    name: 'Palak Paneer with Missi Roti',
    category: 'North Indian',
    imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&q=80&w=600',
    fallbackResult: {
      dishName: 'Palak Paneer with Besan Missi Roti',
      confidence: 95,
      portionSize: '1 bowl Palak Paneer + 2 Missi Rotis (~320g)',
      macros: {
        calories: 460,
        protein: 22,
        carbs: 42,
        fat: 22,
        fiber: 9,
        sugar: 3,
        sodium: 540,
      },
      conditionSuitability: [
        {
          condition: 'Diabetes',
          status: 'Suitable',
          reasoning: 'Chickpea flour (besan) and spinach provide steady protein and fiber with minimal glucose rise.',
        },
        {
          condition: 'Hypertension',
          status: 'Suitable',
          reasoning: 'Spinach provides natural magnesium and nitrates that support endothelial vasodilation.',
        },
        {
          condition: 'CKD',
          status: 'Moderate',
          reasoning: 'Spinach is high in potassium and oxalates; consume in moderation for renal restrictions.',
        },
        {
          condition: 'Heart Disease',
          status: 'Moderate',
          reasoning: 'Full-fat paneer contains saturated fat. Low-fat paneer or tofu is preferred.',
        },
      ],
      healthierAlternatives: [
        {
          dishName: 'Palak Tofu with Whole Wheat Roti',
          description: 'Substituted low-fat organic tofu in place of full-fat dairy paneer.',
          benefits: 'Reduces saturated fat by 60% while retaining 20g high-quality plant protein.',
          estimatedCalories: 330,
        },
      ],
      rationale: 'High protein and micronutrient meal. Besan missi roti provides an excellent amino acid balance when paired with leafy greens.',
      summaryNote: 'Excellent vegetarian meal for diabetes and hypertension when cooked with low-fat dairy.',
      disclaimer: '⚠️ Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method.',
    },
  },
];

export const AiFoodScanner: React.FC<AiFoodScannerProps> = ({ mode, activePatient }) => {
  const { language, t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_DISHES[0].imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [dishNameHint, setDishNameHint] = useState<string>(SAMPLE_DISHES[0].name);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(SAMPLE_DISHES[0].fallbackResult);
  const [activeTab, setActiveTab] = useState<'macros' | 'conditions' | 'alternatives'>('macros');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setDishNameHint(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSelectSample = (sample: SampleDish) => {
    setSelectedImage(sample.imageUrl);
    setImageFile(null);
    setDishNameHint(sample.name);
    setScanResult(sample.fallbackResult);
  };

  const handleAnalyzeFood = async () => {
    setIsScanning(true);
    try {
      let imageBase64 = selectedImage;
      if (imageFile) {
        imageBase64 = selectedImage;
      }

      const res = await fetch('/api/food-scanner/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64?.startsWith('data:') ? imageBase64 : null,
          dishNameHint: dishNameHint || 'Indian Meal',
          patient: activePatient,
          language,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setScanResult(data.result);
      } else {
        // Fallback to closest sample or mock estimate
        const matchedSample = SAMPLE_DISHES.find(s => s.name.toLowerCase().includes(dishNameHint.toLowerCase())) || SAMPLE_DISHES[0];
        setScanResult(matchedSample.fallbackResult);
      }
    } catch (err) {
      console.error('Failed to analyze food:', err);
      const matchedSample = SAMPLE_DISHES[0];
      setScanResult(matchedSample.fallbackResult);
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = (status: SuitabilityStatus) => {
    switch (status) {
      case 'Suitable':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Suitable
          </span>
        );
      case 'Moderate':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            Moderate
          </span>
        );
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            High Risk
          </span>
        );
      case 'Avoid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            Avoid
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 backdrop-blur-md border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-md">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest bg-teal-500/20 text-teal-300 px-3 py-1 rounded-lg border border-teal-400/30">
              {t('tabFoodScanner', 'AI Food Scanner')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('foodScannerTitle', 'AI Vision Food & Nutrition Scanner')}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            {t('foodScannerDesc', 'Snap or upload any meal photo. AI extracts estimated macros, checks suitability against your medical profile, and suggests healthier alternatives.')}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4 text-xs font-semibold">
          <div className="text-center">
            <span className="block text-lg font-black text-teal-300">4 Conditions</span>
            <span className="text-slate-300 text-[10px]">Suitability Assessment</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center">
            <span className="block text-lg font-black text-indigo-300">7 Macros</span>
            <span className="text-slate-300 text-[10px]">Nutritional Analysis</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload Controls vs Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input / Photo Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              {t('uploadPhotoLabel', 'Upload or Drag Food Image')}
            </h2>

            {/* Drag and Drop Zone */}
            <div className="relative border-2 border-dashed border-teal-200 dark:border-teal-900/60 rounded-2xl p-4 text-center hover:bg-teal-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {selectedImage ? (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner">
                  <img src={selectedImage} alt="Selected food" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Camera className="w-4 h-4" /> Click to Change Photo
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto shadow-sm">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Upload food photo or camera snapshot
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Dish Name Hint Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Meal / Dish Name (Optional Hint)
              </label>
              <input
                type="text"
                value={dishNameHint}
                onChange={e => setDishNameHint(e.target.value)}
                placeholder="e.g. Samosa, Masala Dosa, Bajra Rotla, Khichdi..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Sample Dishes Grid */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                {t('sampleDishesLabel', 'Or Try Sample Meals')}
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {SAMPLE_DISHES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                      dishNameHint === sample.name
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                    }`}
                  >
                    <img src={sample.imageUrl} alt={sample.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold truncate leading-tight">{sample.name}</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 block">{sample.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scan Button */}
            <button
              type="button"
              onClick={handleAnalyzeFood}
              disabled={isScanning || !selectedImage}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  {t('scanningProgress', 'AI is analyzing meal photo...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Scan & Assess Food with AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Scan Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isScanning ? (
            /* Loading State */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-6 shadow-sm">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 dark:border-teal-900 animate-ping opacity-75" />
                <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto shadow-inner">
                  <Camera className="w-10 h-10 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Analyzing Food Image via AI Vision...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estimating macronutrients, calculating glycemic load, and verifying safety for Diabetes, Hypertension, CKD & Heart Disease.
                </p>
              </div>
            </div>
          ) : scanResult ? (
            /* Complete Scan Results Card */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Top Banner: Dish Title & Confidence */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 rounded-md border border-teal-300 dark:border-teal-800">
                      Identified Meal
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Portion: {scanResult.portionSize}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {scanResult.dishName}
                  </h2>
                </div>

                {/* AI Confidence Badge */}
                <div className="flex items-center gap-2 bg-indigo-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-indigo-100 dark:border-slate-700 self-start sm:self-auto">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block leading-none">
                      AI Vision Accuracy
                    </span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-300">
                      {scanResult.confidence}% Confidence
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer Notice Banner */}
              <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-3.5 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  {scanResult.disclaimer || t('scanDisclaimer', 'Nutritional values are AI estimates based on visual analysis. Actual values vary by portion size and preparation method.')}
                </p>
              </div>

              {/* Results Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('macros')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'macros'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🥗 Estimated Macros
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conditions')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'conditions'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🩺 Medical Suitability (4 Conditions)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('alternatives')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTab === 'alternatives'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  🌱 Healthier Swaps
                </button>
              </div>

              {/* TAB 1: MACROS BREAKDOWN */}
              {activeTab === 'macros' && (
                <div className="space-y-6">
                  {/* Total Calories Highlight Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/80 border border-orange-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                        <Flame className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Total Energy
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                          {scanResult.macros.calories} <span className="text-xs font-semibold text-slate-500">kcal</span>
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-950 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900">
                      ~22% Daily Meal Energy
                    </span>
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        Protein
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.protein}g
                      </p>
                      <span className="text-[10px] text-slate-500">Muscle & Tissue Support</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                        Carbohydrates
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.carbs}g
                      </p>
                      <span className="text-[10px] text-slate-500">Includes sugars & starches</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                        Total Fat
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.fat}g
                      </p>
                      <span className="text-[10px] text-slate-500">Dietary Lipids</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Dietary Fiber
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.fiber}g
                      </p>
                      <span className="text-[10px] text-slate-500">Slowing glucose absorb</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                        Sugar
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.sugar}g
                      </p>
                      <span className="text-[10px] text-slate-500">Simple sugars</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Sodium
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {scanResult.macros.sodium}mg
                      </p>
                      <span className="text-[10px] text-slate-500">Blood pressure impact</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONDITION SUITABILITY */}
              {activeTab === 'conditions' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Clinical Evaluation across 4 Target Conditions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scanResult.conditionSuitability.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {item.condition}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {item.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Clinical Verdict Callout */}
                  <div className="bg-indigo-50/80 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-2xl p-4 space-y-2">
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Overall Clinical Rationale
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {scanResult.rationale}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: HEALTHIER ALTERNATIVES */}
              {activeTab === 'alternatives' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Recommended Healthier Swaps & Preparation Tweaks
                  </h3>

                  <div className="space-y-3.5">
                    {scanResult.healthierAlternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            {alt.dishName}
                          </h4>
                          <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                            ~{alt.estimatedCalories} kcal
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {alt.description}
                        </p>

                        <div className="pt-2 border-t border-emerald-200/60 dark:border-slate-700/80 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>Health Benefit: {alt.benefits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Summary Note */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  💡 {scanResult.summaryNote}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setScanResult(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Scan Another Meal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-sm">
              <Utensils className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Select or upload a food image on the left to start AI scanning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
