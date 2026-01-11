# JalRakshak: A Voice-First Flood Guardian for the North East

**JalRakshak** is an AI-powered disaster communication system designed for the annual flooding challenges in Assam and the North East. It converts complex Indian public climate records and satellite water-spread data into real, multilingual voice alerts for last-mile usability.

## 🚀 Vision
In the North East, flood alerts are often delayed or too technical for rural communities. JalRakshak bridges this gap by providing **localized, actionable, and audible** risk communication.

## 🛠 Tech Stack
- **Frontend**: HTML5, CSS3 (Glassmorphism), JavaScript (Standalone) / Next.js (Live Demo)
- **AI/ML**: 
  - **Vision**: Pretrained U-Net for Satellite Water Mask Interpretation (Sentinel-1 SAR)
  - **NLP**: Multilingual Risk Text Generation (English, Assamese, Bengali, Hindi)
  - **TTS**: Web Speech API & Cloud TTS integration for voice alerts
- **Data**: Public records from IMD (Rainfall) and CWC (River Levels)

## 📦 Folder Structure
```text
/JalRakshak
    /frontend
        index.html    # Glassmorphism UI
        style.css     # Responsive styles
        app.js        # Core logic & API integration
    /data
        rainfall.csv      # Real IMD rainfall history sample
        river_levels.csv  # Real CWC river gauge data sample
        flood_masks/      # Placeholder for satellite inference masks
    README.md
    requirements.txt
    Architecture_Doc.md
```

## 🧠 Core AI Feature: Satellite Water Mask Interpretation
The system accepts Sentinel-1 SAR imagery (radar) which can see through clouds during monsoon.
1. **Preprocessing**: SAR backscatter normalization.
2. **Inference**: A segmentation model (U-Net) identifies water pixels.
3. **Output**: Returns % water spread, risk severity, and confidence score.

## 📊 Dataset Sources
- **IMD (India Meteorological Department)**: Rainfall history and departures.
- **CWC (Central Water Commission)**: Real-time river levels and danger mark records.
- **Sentinel-1 (Copernicus)**: SAR GRD satellite imagery for flood mapping.

## ⚡️ Quick Start
1. Open `JalRakshak/frontend/index.html` in any modern browser.
2. Select a State (e.g., Assam) and District (e.g., Dibrugarh).
3. Click **Check Flood Risk** to see the AI fusion result.
4. Click **Play Voice Alert** to hear the localized risk communication.

## 🛡 Responsible AI & Privacy
- **Zero Personal Data**: We do not collect names, phone numbers, or locations.
- **Transparency**: Risk scores include a confidence percentage.
- **Bias Mitigation**: Dataset includes diverse North-East topography to ensure regional accuracy.

---
**Submission for IndiaAI Mission | Built for North East Pilot Testing**
