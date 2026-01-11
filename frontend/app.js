/**
 * JalRakshak: A Voice-First Flood Guardian for the North East
 * Frontend Logic (Vanilla JS)
 */

// --- Constants & Data ---
const NE_STATES = ["Arunachal Pradesh", "Assam", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Sikkim", "Tripura"];
const DISTRICTS = {
    "Assam": ["Dhubri", "Barpeta", "Dhemaji", "Dibrugarh", "Golaghat", "Jorhat", "Kamrup", "Lakhimpur", "Morigaon", "Nagaon"],
    "Arunachal Pradesh": ["Changlang", "East Siang", "Papum Pare", "Lohit"],
    "Meghalaya": ["East Khasi Hills", "West Garo Hills", "Ri-Bhoi"],
    "Manipur": ["Imphal East", "Imphal West", "Thoubal"],
    "Mizoram": ["Aizawl", "Lunglei"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Sikkim": ["East Sikkim", "South Sikkim"],
    "Tripura": ["West Tripura", "Dhalai"]
};

const MOCK_ALERTS = {
    en: "Severe flood risk detected in your area. Water levels are rising fast. Please evacuate to the nearest relief camp immediately. Stay safe.",
    as: "আপোনাৰ অঞ্চলত বানপানীৰ ভয়াৱহ আশংকা ধৰা পৰিছে। পানীৰ স্তৰ দ্ৰুতগতিত বৃদ্ধি পাইছে। অনুগ্ৰহ কৰি লগে লগে ওচৰৰ সাহায্য শিবিৰলৈ যাওক।",
    bn: "আপনার এলাকায় ভয়াবহ বন্যার ঝুঁকি শনাক্ত করা হয়েছে। জলের স্তর দ্রুত বাড়ছে। অনুগ্রহ করে অবিলম্বে নিকটস্থ ত্রাণ শিবিরে চলে যান।",
    hi: "आपके क्षेत्र में बाढ़ का गंभीर खतरा पाया गया है। जल स्तर तेजी से बढ़ रहा है। कृपया तुरंत नजदीकी राहत शिविर में चले जाएं।"
};

// --- App State ---
let state = {
    selectedState: "",
    selectedDistrict: "",
    isDemoMode: false,
    activeLang: 'en',
    isPlaying: false,
    confidence: 0,
    riskLevel: 'LOW'
};

// --- DOM Elements ---
const el = {
    stateSelect: document.getElementById('state-select'),
    districtSelect: document.getElementById('district-select'),
    btnAnalyze: document.getElementById('btn-analyze'),
    btnLocation: document.getElementById('btn-location'),
    locationStatus: document.getElementById('location-status'),
    coordsText: document.getElementById('coords-text'),
    demoCheckbox: document.getElementById('demo-mode-checkbox'),
    views: {
        selection: document.getElementById('selection-view'),
        dashboard: document.getElementById('dashboard-view')
    },
    displayLocation: document.getElementById('display-location'),
    riskCard: document.getElementById('risk-card'),
    riskLevel: document.getElementById('risk-level'),
    riskIcon: document.getElementById('risk-icon'),
    confidencePct: document.getElementById('confidence-pct'),
    valRain: document.getElementById('val-rain'),
    valRiver: document.getElementById('val-river'),
    valSar: document.getElementById('val-sar'),
    btnSarRun: document.getElementById('btn-sar-run'),
    radarViz: document.getElementById('radar-viz'),
    alertText: document.getElementById('alert-display-text'),
    playBtn: document.getElementById('play-alert-btn'),
    vizBars: document.getElementById('viz-bars'),
    volSlider: document.getElementById('vol-slider'),
    langTabs: document.querySelectorAll('.tab-btn'),
    toast: document.getElementById('toast-notify'),
    backBtn: document.querySelector('.back-btn'),
    jumpAlerts: document.getElementById('jump-to-alerts')
};

// --- Global Error Handlers ---
window.addEventListener("error", (e) => {
    console.error("Global error:", e.message);
    showToast("Interface Error. System auto-recovering...");
});

window.addEventListener("unhandledrejection", (e) => {
    console.error("Unhandled promise rejection:", e.reason);
    showToast("Background process failed. Please retry.");
});

// --- Initialization ---
function init() {
    populateStates();
    setupEventListeners();
    console.log("JalRakshak Frontend Initialized. Bharat-centric Edition.");
    
    // Welcome Toast with Indian Accent/Spirit
    setTimeout(() => {
        showToast("Namaste! JalRakshak is ready to protect your region. 🇮🇳");
    }, 1000);
}

function populateStates() {
    NE_STATES.sort().forEach(s => {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = s;
        el.stateSelect.appendChild(opt);
    });
}

function setupEventListeners() {
    el.stateSelect.addEventListener('change', handleStateChange);
    el.districtSelect.addEventListener('change', handleDistrictChange);
    el.btnAnalyze.addEventListener('click', () => safeAPICall(generateRiskReport));
    el.btnLocation.addEventListener('click', () => safeAPICall(handleGeolocation));
    el.demoCheckbox.addEventListener('change', toggleDemoMode);
    el.backBtn.addEventListener('click', resetToSelection);
    el.btnSarRun.addEventListener('click', () => safeAPICall(runSarInference));
    el.playBtn.addEventListener('click', toggleVoiceAlert);
    el.jumpAlerts.addEventListener('click', () => document.getElementById('alerts-container').scrollIntoView({ behavior: 'smooth' }));

    el.langTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            el.langTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeLang = tab.dataset.lang;
            updateAlertUI();
        });
    });
}

// --- Handlers ---

function handleStateChange(e) {
    state.selectedState = e.target.value;
    el.districtSelect.innerHTML = '<option value="">Choose District</option>';
    
    if (state.selectedState) {
        el.districtSelect.disabled = false;
        DISTRICTS[state.selectedState].sort().forEach(d => {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            el.districtSelect.appendChild(opt);
        });
    } else {
        el.districtSelect.disabled = true;
    }
    validateInput();
}

function handleDistrictChange(e) {
    state.selectedDistrict = e.target.value;
    validateInput();
}

function validateInput() {
    el.btnAnalyze.disabled = !(state.selectedState && state.selectedDistrict);
}

function toggleDemoMode(e) {
    state.isDemoMode = e.target.checked;
    if (state.isDemoMode) {
        showToast("Demo Mode Enabled: Auto-filling fields.");
        el.stateSelect.value = "Assam";
        handleStateChange({ target: { value: "Assam" } });
        el.districtSelect.value = "Dhubri";
        handleDistrictChange({ target: { value: "Dhubri" } });
    } else {
        showToast("Demo Mode Disabled.");
    }
}

async function handleGeolocation() {
    if (!navigator.geolocation) {
        showToast("Browser doesn't support GPS.");
        return;
    }

    el.btnLocation.innerHTML = '<i class="spin" data-lucide="refresh-cw"></i> Finding You...';
    lucide.createIcons();

    try {
        const pos = await new Promise((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 });
        });
        
        const { latitude: lat, longitude: lng } = pos.coords;
        el.coordsText.textContent = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
        el.locationStatus.classList.remove('hidden');
        showToast("Location captured via GPS.");

        // Simulate local mapping
        await sleep(1000);
        el.stateSelect.value = "Assam";
        handleStateChange({ target: { value: "Assam" } });
        el.districtSelect.value = "Dhubri";
        handleDistrictChange({ target: { value: "Dhubri" } });
        showToast("Auto-mapped to nearest district: Dhubri.");

    } catch (err) {
        console.error(err);
        showToast("GPS failed. Please select manually.");
    } finally {
        el.btnLocation.innerHTML = '<i data-lucide="navigation"></i> Auto-Detect My District';
        lucide.createIcons();
    }
}

async function generateRiskReport() {
    el.btnAnalyze.disabled = true;
    el.btnAnalyze.innerHTML = '<i class="spin" data-lucide="refresh-cw"></i> AI Analyzing...';
    lucide.createIcons();

    await sleep(1500);

    // Prepare Dashboard State
    state.riskLevel = state.isDemoMode ? 'CRITICAL' : 'HIGH';
    state.confidence = state.isDemoMode ? 98 : 84;

    el.views.selection.classList.remove('active');
    el.views.dashboard.classList.add('active');
    
    el.displayLocation.innerHTML = `${state.selectedDistrict}, <span>${state.selectedState}</span>`;
    
    updateRiskUI();
    animateConfidence();
    updateAlertUI();
    
    el.btnAnalyze.disabled = false;
    el.btnAnalyze.innerHTML = '<span>Check Local Flood Risk</span> <i data-lucide="chevron-right"></i>';
    lucide.createIcons();
    
    showToast("Risk report generated successfully.");
}

async function runSarInference() {
    el.btnSarRun.disabled = true;
    el.btnSarRun.textContent = "Processing SAR Mask...";
    el.radarViz.querySelector('.radar-line').style.opacity = "1";
    
    await sleep(2500);
    
    el.valSar.textContent = state.isDemoMode ? "Active Inundation (12%)" : "Partial Water-spread (4%)";
    el.radarViz.querySelector('.radar-line').style.opacity = "0";
    el.btnSarRun.textContent = "AI Scan Complete";
    showToast("Satellite vision inference finished.");
}

// --- UI Updates ---

function updateRiskUI() {
    const risk = state.riskLevel;
    el.riskCard.className = `main-card risk-${risk.toLowerCase()}`;
    el.riskLevel.textContent = risk;
    
    const icon = risk === 'CRITICAL' ? 'zap' : (risk === 'HIGH' ? 'alert-triangle' : 'shield-check');
    el.riskIcon.setAttribute('data-lucide', icon);
    
    el.valRain.textContent = state.isDemoMode ? "420mm (24h Trend)" : "210mm (Past 24h)";
    el.valRiver.textContent = state.isDemoMode ? "14.2m (Danger +3m)" : "11.5m (Rising)";
    el.valSar.textContent = "Scan Required";
    
    lucide.createIcons();
}

function animateConfidence() {
    let current = 0;
    const target = state.confidence;
    const interval = setInterval(() => {
        current += 1;
        el.confidencePct.textContent = current;
        if (current >= target) clearInterval(interval);
    }, 20);
}

function updateAlertUI() {
    el.alertText.textContent = MOCK_ALERTS[state.activeLang] || "Analyzing...";
}

function toggleVoiceAlert() {
    if (state.isPlaying) {
        window.speechSynthesis.cancel();
        stopAlertUI();
    } else {
        startVoiceAlert();
    }
}

function startVoiceAlert() {
    const text = MOCK_ALERTS[state.activeLang];
    if (!text) return;

    state.isPlaying = true;
    el.playBtn.innerHTML = '<i data-lucide="square"></i> <span>STOP ALERT</span>';
    el.vizBars.classList.remove('hidden');
    lucide.createIcons();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Mapping for Indian localized voices
    const voices = {
        en: 'en-IN',
        as: 'hi-IN', // Fallback as browser support for Assamese is limited, using nearby phonetics
        bn: 'bn-IN',
        hi: 'hi-IN'
    };

    utterance.lang = voices[state.activeLang] || 'en-IN';
    utterance.volume = parseFloat(el.volSlider.value);
    utterance.rate = 0.85;

    utterance.onend = stopAlertUI;
    utterance.onerror = stopAlertUI;

    window.speechSynthesis.speak(utterance);
}

function stopAlertUI() {
    state.isPlaying = false;
    el.playBtn.innerHTML = '<i data-lucide="play"></i> <span>PLAY ALERT</span>';
    el.vizBars.classList.add('hidden');
    lucide.createIcons();
}

function resetToSelection() {
    window.speechSynthesis.cancel();
    stopAlertUI();
    el.views.dashboard.classList.remove('active');
    el.views.selection.classList.add('active');
}

// --- Utilities ---

async function safeAPICall(fn) {
    try {
        await fn();
    } catch (err) {
        console.error("API Error:", err);
        showToast("Process failed. Please try again.");
    }
}

function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.remove('hidden');
    setTimeout(() => el.toast.classList.add('hidden'), 3500);
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

// Start App
init();
