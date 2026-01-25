# Technical Architecture Document: JalRakshak

**Project:** JalRakshak – Flood Risk Intelligence for North Eastern India  
**Prepared For:** DRISHTI-NE Hackathon, IIM Shillong  
**Version:** 1.0

---

## 1. System Overview

JalRakshak is a web-based decision support tool designed to improve flood risk communication in the North Eastern Region (NER) of India. The system addresses a specific gap: the difficulty of conveying actionable flood warnings to communities with limited literacy or connectivity.

The platform accepts a user-selected district, evaluates historical and reference rainfall data, and generates a risk category. This output is then converted into a voice alert in the user's preferred language. The focus is on last-mile accessibility, not predictive modeling.

---

## 2. High-Level Workflow

```
User → Web Frontend → API Layer → AI Logic → Data Store → Risk Output → Voice Alert
```

| Stage | Description |
|-------|-------------|
| **User** | Selects a state and district from a list. |
| **Web Frontend** | Browser-based interface; no login required. |
| **API Layer** | Receives location input, queries data, returns structured response. |
| **AI Logic** | Applies rule-based and feature-weighted classification. |
| **Data Store** | Pre-loaded, curated datasets from public sources. |
| **Risk Output** | Returns risk category (Low / Medium / High) with confidence indicator. |
| **Voice Alert** | Generates spoken advisory in regional language. |

---

## 3. System Components

### a) Frontend
- Browser-based, responsive interface.
- No user registration or authentication.
- Manual district selection via dropdowns.
- Demo mode for controlled testing.
- Multilingual display (Assamese, Bengali, Hindi, English).

### b) API Layer
- Stateless endpoints accepting district identifiers.
- Returns: risk level, confidence band, alert text, and data summary.
- No external API dependencies during inference.

### c) AI / ML Logic Layer
- Hybrid approach: rule-based thresholds combined with feature-weighted classification.
- Features include: rainfall ratio, departure from normal, and historical excess.
- Logic is interpretable and auditable.
- No opaque models; all decision factors are traceable.

---

## 4. Data Sources

All data is sourced from verified Indian public repositories:

| Source | Data Type |
|--------|-----------|
| India Meteorological Department (IMD) | District-wise rainfall (actual, normal, departure) |
| Central Water Commission (CWC) | River level reference data |
| Assam State Disaster Management Authority (ASDMA) | District baselines and historical flood events |
| Open Government Data India (OGD) | Supplementary geographic and administrative data |

**Data Integrity Statement:**  
- No synthetic or fabricated data.  
- No private or scraped sources.  
- All datasets are publicly accessible and verifiable.

---

## 5. Data Flow & Processing Logic

1. User selects state and district from the interface.
2. API retrieves corresponding historical and reference data from the data store.
3. Data is cleaned and normalized (handling missing values, unit conversion).
4. AI logic evaluates feature patterns against defined thresholds.
5. Risk category is assigned based on weighted scoring.
6. Alert text is generated and passed to the voice synthesis module.

---

## 6. Voice Alert Generation

- Text-to-speech conversion using standard browser APIs.
- Supports Assamese, Bengali, Hindi, and English.
- Designed for low-literacy accessibility.
- Alerts are under 45 seconds, suitable for radio broadcast or mobile playback.

---

## 7. Privacy & Responsible AI

- **No personal data collected or stored.**
- No user identity tracking or authentication.
- No location history or device fingerprinting.
- All processing is session-based and stateless.
- Aligned with the Digital Personal Data Protection (DPDP) Act, 2023.

---

## 8. Design Principles

| Principle | Implementation |
|-----------|----------------|
| Explainability | All risk decisions are traceable to input features. |
| Public Data Only | No proprietary or restricted data sources. |
| Lightweight | No heavy infrastructure dependencies. |
| Browser-First | Accessible on standard devices without installation. |
| Pilot-Ready | Deployable with minimal onboarding. |

---

## 9. Deployment Readiness

- Suitable for use by District Disaster Management Authorities (DDMAs).
- No specialized hardware required.
- No training or onboarding necessary for end-users.
- Can be piloted in a controlled district setting within days.

---

## 10. Summary

JalRakshak is a focused, deployable system designed for practical flood risk communication in the NER. Its architecture prioritizes simplicity, transparency, and accessibility over technical complexity. By relying on verified public data and explainable logic, the system is suitable for government deployment and academic scrutiny.

The strength of this architecture lies in its feasibility: it can be tested, audited, and scaled without dependency on proprietary technology or speculative claims.

---

*Document prepared for DRISHTI-NE Round 2 evaluation.*
