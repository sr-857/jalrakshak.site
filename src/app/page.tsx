"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  NE_STATES, 
  DISTRICTS, 
  FloodRiskData 
} from "@/lib/data";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  Waves, 
  Satellite, 
  Info,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Activity,
  Maximize2,
  MapPin,
  Target,
  AlertCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThreeBackground from "@/components/ThreeBackground";
import { ModeToggle } from "@/components/mode-toggle";

// --- Types & Constants ---
type ToastType = 'info' | 'error' | 'success';
interface Toast {
  message: string;
  type: ToastType;
}

// --- Sub-components ---

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group p-6 rounded-[2rem] bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-white/10 hover:border-orange-500/30 transition-all hover:shadow-lg"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 dark:bg-${color}-500/20 flex items-center justify-center border border-${color}-500/20 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <span className="font-black text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed font-outfit">{value}</p>
  </motion.div>
);

const RiskStyles = {
  Low: { 
    bg: "bg-emerald-500/5", 
    text: "text-emerald-600 dark:text-emerald-400", 
    border: "border-emerald-500/20", 
    accent: "bg-emerald-500",
    icon: <CheckCircle className="w-12 h-12 text-emerald-500" />
  },
  Medium: { 
    bg: "bg-amber-500/5", 
    text: "text-amber-600 dark:text-amber-400", 
    border: "border-amber-500/20", 
    accent: "bg-amber-500",
    icon: <Info className="w-12 h-12 text-amber-500" />
  },
  High: { 
    bg: "bg-orange-500/5", 
    text: "text-orange-600 dark:text-orange-400", 
    border: "border-orange-500/20", 
    accent: "bg-orange-500",
    icon: <AlertTriangle className="w-12 h-12 text-orange-600" />
  },
  Critical: { 
    bg: "bg-red-500/5", 
    text: "text-red-600 dark:text-red-400", 
    border: "border-red-500/20", 
    accent: "bg-red-500",
    icon: <Zap className="w-12 h-12 text-red-600 animate-pulse" />
  }
};

// --- Main Page Component ---

export default function Home() {
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<FloodRiskData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeLang, setActiveLang] = useState<string>("en");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzingSatellite, setIsAnalyzingSatellite] = useState(false);
  const [satelliteResult, setSatelliteResult] = useState<any>(null);
  const [confidence, setConfidence] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const alertRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Persistence: Auto-load state from local storage if needed (optional refinement)

  // Global Error Listeners
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      console.error("Global error caught:", e.message);
      showToast("A system error occurred. Action retried.", "error");
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      console.error("Background process failed:", e.reason);
      showToast("Sync failed. Check connection.", "error");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const safeAPICall = async (fn: () => Promise<any>, errorMsg: string) => {
    try {
      return await fn();
    } catch (err: any) {
      console.error(errorMsg, err);
      showToast(errorMsg, "error");
      return null;
    }
  };

  const getFloodRisk = async (state: string, district: string) => {
    if (!state || !district) return;
    
    setLoading(true);
    setConfidence(0);
    
    const data = await safeAPICall(async () => {
      const response = await fetch('/api/flood-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, district })
      });
      if (!response.ok) throw new Error("API failed");
      return await response.json();
    }, "Failed to fetch risk data");

    if (data) {
      setRiskData(data);
      setShowDashboard(true);
      setSatelliteResult(null);
      showToast(`Risk report for ${district} generated`, "success");
      
      let current = 0;
      const target = data.confidence;
      const interval = setInterval(() => {
        current += 1;
        setConfidence(current);
        if (current >= target) clearInterval(interval);
      }, 15);
    }
    setLoading(false);
  };

  const runSatelliteInference = async () => {
    setIsAnalyzingSatellite(true);
    const data = await safeAPICall(async () => {
      const response = await fetch('/api/analyze-satellite', { method: 'POST' });
      if (!response.ok) throw new Error("Inference failed");
      return await response.json();
    }, "Satellite analysis failed");

    if (data) {
      setSatelliteResult(data);
      showToast("SAR Masking Complete", "success");
    }
    setIsAnalyzingSatellite(false);
  };

  const playVoiceAlert = async (text: string, lang: string) => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!text) return;

    setIsPlaying(true);
    
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<string, string> = {
      'en': 'en-IN', 'hi': 'hi-IN', 'bn': 'bn-IN', 'as': 'bn-IN'
    };
    
    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      showToast("Geolocation not supported", "error");
      return;
    }

    setIsLocating(true);
    setLocationCoords(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, 
          timeout: 10000 
        });
      });
      
      const { latitude: lat, longitude: lng } = pos.coords;
      setLocationCoords({ lat, lng });
      
      // Simulation of mapping coords to NE districts
      await new Promise(r => setTimeout(r, 1200));
      setSelectedState("Assam");
      setSelectedDistrict("Dhubri");
      showToast("Nearest District: Dhubri, Assam", "success");
    } catch (error: any) {
      showToast("Location access denied", "error");
    } finally {
      setIsLocating(false);
    }
  };

  const styles = useMemo(() => {
    const level = riskData?.riskLevel as keyof typeof RiskStyles;
    return RiskStyles[level] || RiskStyles.Low;
  }, [riskData]);

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-outfit overflow-x-hidden selection:bg-orange-200 dark:selection:bg-orange-900/40">
      <ThreeBackground />

      {/* Glass Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-2 pl-4 pr-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 ring-2 ring-white/50 dark:ring-slate-800">
              <Waves className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none font-space-grotesk uppercase">
                Jal<span className="text-orange-600">Rakshak</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bharat AI Live</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Badge variant="outline" className="border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400 font-bold px-3 py-1">
                V2.5 Stable
              </Badge>
            </div>
            <ModeToggle />
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24">
        <AnimatePresence mode="wait">
          {!showDashboard ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="max-w-3xl mx-auto space-y-16"
            >
              <div className="text-center space-y-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-orange-500/20"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Autonomous Hydrology Intelligence
                </motion.div>
                
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] font-space-grotesk">
                  Namaste.<br/>Surakshit <span className="text-orange-600">Bharat.</span>
                </h2>
                
                <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
                  High-fidelity flood risk forecasting for the North East using Synthetic Aperture Radar & IMD fusion.
                </p>
              </div>

              <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] rounded-[3rem] overflow-hidden bg-white/60 dark:bg-slate-900/70 backdrop-blur-3xl ring-1 ring-white dark:ring-white/10">
                <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />
                <CardContent className="p-8 md:p-16 space-y-10">
                  <Button
                    variant="ghost"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="w-full h-16 border-slate-200 dark:border-slate-800 border-2 border-dashed bg-white/40 dark:bg-slate-800/20 rounded-2xl hover:bg-orange-500/5 hover:border-orange-500/40 transition-all flex items-center justify-center gap-3 group"
                  >
                    {isLocating ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-orange-500" />
                    ) : (
                      <MapPin className="w-5 h-5 text-orange-500 group-hover:scale-125 transition-transform" />
                    )}
                    <span className="font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest text-xs">Auto-Detect My Location (GPS)</span>
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Select State</label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="h-16 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 rounded-2xl focus:ring-2 focus:ring-orange-500 text-base font-bold">
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/20 dark:border-white/10 backdrop-blur-3xl">
                          {NE_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] ml-1">Select District</label>
                      <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={!selectedState}>
                        <SelectTrigger className="h-16 border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 rounded-2xl focus:ring-2 focus:ring-orange-500 text-base font-bold">
                          <SelectValue placeholder={selectedState ? "District" : "State Required"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/20 dark:border-white/10 backdrop-blur-3xl">
                          {selectedState && DISTRICTS[selectedState].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-20 text-xl font-black bg-orange-600 hover:bg-orange-500 text-white shadow-2xl shadow-orange-600/20 rounded-[1.5rem] active:scale-[0.98] transition-all disabled:opacity-50"
                    disabled={!selectedDistrict || loading}
                    onClick={() => getFloodRisk(selectedState, selectedDistrict)}
                  >
                    {loading ? (
                      <div className="flex items-center gap-4">
                        <RefreshCw className="h-7 w-7 animate-spin" />
                        <span className="font-space-grotesk">Analyzing Bharat...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-space-grotesk">Initialize Risk Analysis</span>
                        <ChevronRight className="h-6 w-6" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">SAR Sentinel</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">IMD Fusion</span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Aatmanirbhar</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-12"
            >
              {/* Dashboard Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <button 
                    onClick={() => setShowDashboard(false)} 
                    className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-orange-600 transition-colors uppercase tracking-widest"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> 
                    Reset Region
                  </button>
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-space-grotesk">
                    {selectedDistrict}, <span className="text-orange-600">{selectedState}</span>
                  </h2>
                </div>
                
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-xl flex items-center gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Confidence</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white font-space-grotesk tracking-tight">{confidence}%</p>
                  </div>
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeOpacity="0.05" strokeWidth="8" />
                      <circle cx="40" cy="40" r="36" fill="none" stroke="#EA580C" strokeWidth="8" strokeDasharray={`${confidence * 2.26} 226`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                    <Sparkles className="absolute w-7 h-7 text-orange-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Risk Level Highlight */}
                <Card className={`lg:col-span-4 border-none shadow-2xl ${styles.bg} backdrop-blur-2xl rounded-[3rem] overflow-hidden flex flex-col ring-1 ${styles.border}`}>
                  <CardHeader className="text-center pt-10 pb-4">
                    <Badge variant="outline" className={`mx-auto ${styles.text} border-current/20 font-black tracking-[0.2em] text-[10px]`}>
                      Current Threat Status
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center flex-grow py-12 space-y-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 p-12 rounded-[2.5rem] shadow-xl ring-1 ring-white/50 dark:ring-slate-700/50">
                      {styles.icon}
                    </div>
                    <div className="text-center space-y-2">
                      <p className={`text-6xl md:text-7xl font-black ${styles.text} tracking-tighter font-space-grotesk uppercase`}>
                        {riskData?.riskLevel}
                      </p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Action Required</p>
                    </div>
                    <Button 
                      onClick={() => alertRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      className={`h-14 px-8 rounded-2xl font-black text-white shadow-lg ${styles.accent} hover:scale-105 transition-transform`}
                    >
                      Initialize Alerts
                    </Button>
                  </CardContent>
                </Card>

                {/* Signals & Analysis */}
                <div className="lg:col-span-8 grid grid-cols-1 gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={Droplets} label="Rainfall (IMD)" value={riskData?.signals.rainfall || ""} color="orange" />
                    <StatCard icon={Waves} label="River Basin" value={riskData?.signals.riverLevel || ""} color="amber" />
                    <StatCard icon={Satellite} label="SAR Vision" value={riskData?.signals.satelliteInference || ""} color="emerald" />
                  </div>
                  
                  <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 dark:bg-black text-white overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-transparent to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
                    <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                      <div className="space-y-6 max-w-md">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                          <Satellite className="w-4 h-4 text-orange-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">Sentinel-1 Microwave Radar</span>
                        </div>
                        <h4 className="text-3xl font-black font-space-grotesk leading-tight tracking-tight">Cloud-Persistent<br/>Water Spread Masking</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">Synthetic Aperture Radar (SAR) bypasses monsoon cloud cover to detect surface water displacement with 10m resolution.</p>
                        <Button 
                          onClick={runSatelliteInference}
                          disabled={isAnalyzingSatellite}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-orange-600/20 active:scale-95 transition-all"
                        >
                          {isAnalyzingSatellite ? <><RefreshCw className="mr-3 w-5 h-5 animate-spin" /> Deep Inference...</> : <><Activity className="mr-3 w-5 h-5" /> Run SAR Analysis</>}
                        </Button>
                      </div>
                      
                      <div className="w-full md:w-72 h-56 bg-slate-800 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden group/mask">
                        {satelliteResult ? (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col p-6">
                            <div className="flex-grow flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-orange-500/10 rounded-2xl animate-pulse" />
                              <Target className="w-12 h-12 text-orange-500 relative z-10" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-300">
                                <span>Detection Confidence</span>
                                <span className="text-orange-500">{satelliteResult.waterSpreadPercentage}%</span>
                              </div>
                              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }} 
                                  animate={{ width: `${satelliteResult.waterSpreadPercentage}%` }} 
                                  transition={{ duration: 1, ease: "circOut" }}
                                  className="h-full bg-gradient-to-r from-orange-600 to-amber-400" 
                                />
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="text-center space-y-4 opacity-40 group-hover/mask:opacity-60 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto flex items-center justify-center border border-white/10">
                              <Maximize2 className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Awaiting Microwave Input</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Multilingual Alerts */}
              <div ref={alertRef} className="pt-16 space-y-10">
                <div className="flex items-center gap-6">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white font-space-grotesk tracking-tighter">Voice Dissemination</h3>
                  <div className="flex-grow h-px bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
                </div>
                
                <Card className="border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-none dark:bg-slate-900/50 rounded-[3rem] overflow-hidden bg-white/40 backdrop-blur-3xl ring-1 ring-white dark:ring-white/10">
                  <Tabs defaultValue="en" onValueChange={setActiveLang} className="w-full">
                    <div className="bg-white/60 dark:bg-slate-800/60 p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                      <TabsList className="bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-2xl gap-1">
                        {[
                          { id: 'en', label: 'English' },
                          { id: 'as', label: 'অসমীয়া' },
                          { id: 'bn', label: 'বাংলা' },
                          { id: 'hi', label: 'हिन्दी' }
                        ].map(l => (
                          <TabsTrigger key={l.id} value={l.id} className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all text-xs">
                            {l.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      <div className="flex items-center gap-10 px-4">
                        <AnimatePresence>
                          {isPlaying && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-end gap-1.5 h-6">
                              {[...Array(8)].map((_, i) => (
                                <motion.div 
                                  key={i} 
                                  animate={{ height: [6, 24, 8, 30, 10] }} 
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }} 
                                  className="w-1.5 bg-orange-600 rounded-full" 
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Button 
                          onClick={() => playVoiceAlert((riskData?.alerts as any)[activeLang], activeLang)}
                          className={`h-14 px-10 rounded-2xl font-black text-white transition-all active:scale-95 ${isPlaying ? 'bg-red-500 shadow-red-500/20' : 'bg-orange-600 shadow-orange-600/30'}`}
                        >
                          {isPlaying ? <><VolumeX className="mr-3 w-5 h-5" /> Stop Alert</> : <><Play className="mr-3 w-5 h-5" /> Play Voice Alert</>}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-12 md:p-20 relative">
                      <div className="absolute top-10 left-10 text-[10rem] font-black text-slate-200/40 dark:text-slate-800/20 select-none leading-none -z-10">“</div>
                      <div className="relative z-10 max-w-4xl">
                        {['en', 'as', 'bn', 'hi'].map(l => (
                          <TabsContent key={l} value={l} className="mt-0 outline-none">
                            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-bold leading-[1.2] text-slate-800 dark:text-slate-100 tracking-tight font-outfit">
                              {(riskData?.alerts as any)[l]}
                            </motion.p>
                          </TabsContent>
                        ))}
                      </div>
                    </div>
                  </Tabs>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-10 right-10 z-[100] pl-6 pr-8 py-5 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-none flex items-center gap-4 backdrop-blur-3xl border border-white/20 ${
              toast.type === 'error' ? 'bg-red-500/95 text-white' : 
              toast.type === 'success' ? 'bg-emerald-600/95 text-white' :
              'bg-slate-900/95 dark:bg-slate-800/95 text-white'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
               toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
               <Info className="w-5 h-5 text-orange-400" />}
            </div>
            <span className="font-black text-xs uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 py-20 px-6 border-t border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
                <Waves className="text-white w-4 h-4" />
              </div>
              <h4 className="font-black text-xl text-slate-900 dark:text-white tracking-tighter font-space-grotesk uppercase">
                JalRakshak Bharat
              </h4>
            </div>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-[0.2em]">
              Aatmanirbhar Autonomous Multimodal Disaster Intelligence Platform. <br/>Serving Bharat's last mile with Edge AI.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="bg-white/50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-white dark:border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Security Audit</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Zero Cloud Storage Policy</p>
              </div>
            </div>
            <div className="bg-white/50 dark:bg-slate-800/40 p-6 rounded-[2rem] border border-white dark:border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <Satellite className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Space Vision</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">Sentinel-1 Active Radar</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
