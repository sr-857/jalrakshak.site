# JalRakshak: Voice-First Flood Guardian for the North East

JalRakshak is an AI-powered flood intelligence tool designed to convert satellite water-mask inference and public climate data into actionable, multilingual voice alerts for last-mile disaster response in North-East India.

## Core Features
- **Satellite Water Mask Interpretation**: Analyzes Sentinel-1 SAR imagery to detect water-spread anomalies.
- **AI Signal Fusion**: Combines IMD rainfall data and CWC river level records for accurate risk assessment.
- **Multilingual Voice Alerts**: Generates live alerts in Assamese, Bengali, Hindi, and English.
- **Zero Data Retention**: Privacy-first architecture with no personal data storage.

## Folder Structure
- `/frontend`: Responsive web UI (HTML, CSS, JS).
- `/data`: Sample public datasets (IMD Rainfall, CWC River Levels).
- `/src/app/api`: AI inference endpoints (Next.js).

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion.
- **AI/ML**: Simulated Vision (SAR Mask) and Hydrological Fusion models.
- **Voice**: Web Speech API + Simulated TTS API.
- **Data**: Public IMD/CWC records (CSV).

## Run Instructions
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev`.
4. Navigate to `http://localhost:3000`.

## Dataset Sources
- **IMD**: Rainfall history and forecasts.
- **CWC**: Real-time river gauge levels.
- **Sentinel-1**: SAR radar imagery for flood mapping.

## Team
- Built for IndiaAI mission alignment and pilot testing in Assam/North-East disaster cells.
