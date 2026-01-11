export const NE_STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Sikkim",
  "Tripura"
];

export const DISTRICTS: Record<string, string[]> = {
  "Arunachal Pradesh": ["Itanagar", "Tawang", "West Kameng", "East Kameng", "Papum Pare"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Barpeta", "Dhubri"],
  "Manipur": ["Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur"],
  "Meghalaya": ["East Khasi Hills", "West Garo Hills", "Ri-Bhoi", "Jaintia Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"]
};

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface FloodRiskData {
  riskLevel: RiskLevel;
  confidence: number;
  signals: {
    rainfall: string;
    riverLevel: string;
    satelliteInference: string;
  };
  alerts: {
    en: string;
    hi: string;
    as: string;
    bn: string;
  };
}

export const MOCK_RISK_DATA: Record<string, FloodRiskData> = {
  "High": {
    riskLevel: "High",
    confidence: 87,
    signals: {
      rainfall: "+45% above normal (last 24h)",
      riverLevel: "Rising (0.5m/hr at gauging station)",
      satelliteInference: "Increased surface water detected in low-lying zones"
    },
    alerts: {
      en: "URGENT: High flood risk detected in your area. Please move to higher ground if you are in a low-lying zone. Keep emergency supplies ready.",
      hi: "अत्यंत आवश्यक: आपके क्षेत्र में बाढ़ का उच्च जोखिम पाया गया है। यदि आप निचले इलाके में हैं तो कृपया ऊंचे स्थानों पर चले जाएं।",
      as: "জৰুৰী: আপোনাৰ অঞ্চলত বানপানীৰ উচ্চ আশংকা ধৰা পৰিছে। অনুগ্ৰহ কৰি ওখ ঠাইলৈ যাওক।",
      bn: "জরুরি: আপনার এলাকায় বন্যার উচ্চ ঝুঁকি শনাক্ত হয়েছে। অনুগ্রহ করে উঁচু স্থানে আশ্রয় নিন।"
    }
  },
  "Medium": {
    riskLevel: "Medium",
    confidence: 72,
    signals: {
      rainfall: "+15% above normal (last 24h)",
      riverLevel: "Rising slowly",
      satelliteInference: "Minor water accumulation in traditional basins"
    },
    alerts: {
      en: "CAUTION: Moderate flood risk. Residents in low-lying areas should stay alert and monitor local news.",
      hi: "सावधानी: मध्यम बाढ़ का खतरा। निचले इलाकों के निवासियों को सतर्क रहना चाहिए।",
      as: "সাৱধান: মজলীয়া বানপানীৰ আশংকা। সতৰ্ক থাকক।",
      bn: "সতর্কতা: মাঝারি বন্যার ঝুঁকি। নিচু এলাকার বাসিন্দাদের সতর্ক থাকা উচিত।"
    }
  },
  "Critical": {
    riskLevel: "Critical",
    confidence: 96,
    signals: {
      rainfall: "+120% above normal (Extreme Event)",
      riverLevel: "Above Danger Level (2.1m over limit)",
      satelliteInference: "Major flooding confirmed in residential sectors"
    },
    alerts: {
      en: "EMERGENCY: Critical flood levels reached. Immediate evacuation recommended for designated zones. Do not cross flooded roads.",
      hi: "आपातकालीन: बाढ़ का स्तर गंभीर है। तुरंत सुरक्षित स्थानों पर जाएँ।",
      as: "জৰুৰীকালীন অৱস্থা: বানপানীৰ মাত্ৰা অতি সংকটজনক। নিৰাপদ স্থানলৈ যাওক।",
      bn: "জরুরি অবস্থা: বন্যার মাত্রা অত্যন্ত সংকটজনক। অবিলম্বে নিরাপদ স্থানে সরে যান।"
    }
  },
  "Low": {
    riskLevel: "Low",
    confidence: 94,
    signals: {
      rainfall: "Normal levels",
      riverLevel: "Stable",
      satelliteInference: "No significant changes in water spread"
    },
    alerts: {
      en: "Status: Normal. No immediate flood threat detected. Stay tuned for further updates.",
      hi: "स्थिति: सामान्य। बाढ़ का कोई तात्कालिक खतरा नहीं है। अपडेट के लिए बने रहें।",
      as: "স্থিতি: স্বাভাৱিক। বানপানীৰ কোনো তৎকালিন ভাবুকি নাই।",
      bn: "স্থিতি: স্বাভাবিক। বন্যার কোনো তাৎক্ষণিক ঝুঁকি নেই।"
    }
  }
};
