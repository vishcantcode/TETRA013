<div align="center">

<img src="https://img.shields.io/badge/TETRA013-HealthSense%20AI-05966F?style=for-the-badge&logo=heart&logoColor=white" alt="TETRA013"/>

# 🏥 TETRA013 — HealthSense AI
### *Autonomous Multi-Modal Clinical Decision Support System*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Nemotron-76B900?style=flat-square&logo=nvidia&logoColor=white)](https://build.nvidia.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> **Transforming reactive healthcare into proactive, autonomous, AI-driven clinical intelligence.**

[🚀 Quick Start](#-setup--installation) • [🧠 Architecture](#-architecture-the-multi-agent-pipeline) • [✨ Features](#-features) • [💻 Tech Stack](#-tech-stack) • [🏆 Hackathon](#-hackathon-submission)

</div>

---

## 🌟 Overview

**TETRA013 / HealthSense AI** is a next-generation, futuristic Clinical Decision Support System (CDSS) that goes far beyond traditional symptom trackers. It is a fully autonomous, multi-modal, agentic platform that:

- **Ingests 6 modalities of clinical data** — personal history, family history, vitals, lab reports, lifestyle signals, and real-time biometrics
- **Reasons across multiple AI models simultaneously** via a parallel multi-agent pipeline
- **Dispatches autonomous emergency responses** — locating the nearest hospital, calling an ambulance via Twilio, and notifying Community Health Workers (CHWs)
- **Explains every clinical decision** using an Explainable AI (XAI) engine with confidence scores and medical rationale

During a critical emergency, HealthSense doesn't just record data — **it thinks, speaks, locates, and acts.**

---

## 🧠 Architecture: The Multi-Agent Pipeline

HealthSense is powered by a robust 4-agent AI architecture leveraging **OpenRouter** and **NVIDIA NIM** for near-instantaneous clinical reasoning.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TETRA013 AGENTIC PIPELINE                        │
│                                                                     │
│  [Patient Input]                                                    │
│       │                                                             │
│       ▼                                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Agent 1: Intake Agent (Llama 3.1 8B)                       │   │
│  │  • Extracts structured vitals & symptoms from conversation   │   │
│  │  • Multi-language support (Hindi, Tamil, Telugu + 10 more)  │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                        │
│                             ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Agent 2: Clinical Triage Agent (Nemotron 3 Super 120B)     │   │
│  │  • Analyzes against ICMR, WHO, ESC, ADA, AHA guidelines     │   │
│  │  • Severity scoring: Standard / Priority / Emergency         │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │                                        │
│                ┌────────────┴────────────┐                          │
│                ▼                         ▼                           │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ Agent 3: Action         │  │ Agent 4: Empathy Voice Agent     │  │
│  │ Orchestrator            │  │ (ElevenLabs TTS/STT)             │  │
│  │ • Reverse geolocation   │  │ • Human-like calming voice       │  │
│  │ • Nearest hospital      │  │ • Real-time reassurance          │  │
│  │ • Twilio ambulance call │  │ • Multilingual audio output      │  │
│  │ • CHW SMS alerts        │  └──────────────────────────────────┘  │
│  └─────────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Services

| Service | Role | Model / Provider |
|---|---|---|
| **Intake Agent** | NLP symptom extraction from chat | Llama 3.1 8B (OpenRouter) |
| **Clinical Triage Engine** | Severity classification & rule matching | Nemotron 3 Super 120B (NVIDIA NIM) |
| **Gemini Reasoning** | Multi-modal analysis & clinical reports | Google Gemini |
| **Empathy Agent** | Voice-based patient reassurance | ElevenLabs TTS/STT |
| **Action Orchestrator** | Emergency dispatch & geolocation | Twilio + Google Maps API |
| **XAI Engine** | Explainable confidence scores | Internal rule engine |

---

## ✨ Features

### 🏥 Clinical Decision Support (CDSS)
- **6-Modality Input Console** — personal history, family history, vitals, lab reports, lifestyle, and real-time biometrics
- **Evidence-Based Rule Engine** — built against ICMR, WHO, ESC, ADA, AHA, and ACC clinical guidelines
- **Confidence Scoring** — every clinical recommendation is assigned a calibrated confidence percentage with medical rationale
- **Early Warning Command Center** — real-time alert system for deteriorating vitals and emerging risk signals

### 🤖 Multi-Agent AI
- **Parallel AI Reasoning** — simultaneous queries to Llama, Nemotron, and Gemini for cross-validated clinical insights
- **Multi-Model Intelligence** — intelligent result fusion from multiple LLMs to reduce hallucination risk
- **Agentic Autonomy** — pipeline acts without human-in-the-loop for emergency dispatch scenarios

### 🌐 Emergency Response
- **Autonomous Ambulance Dispatch** — Twilio voice calls to the nearest hospital automatically
- **Geolocation Intelligence** — reverse-geocodes user location and finds the closest real-world medical facility via Google Maps
- **CHW Notification** — SMS alerts to registered Community Health Workers in under 5 seconds

### 🎨 Futuristic UI/UX
- **Glassmorphic HUD Interface** — premium, calm light-mode design with deep glassmorphism panels
- **Interactive 3D Neural Background** — canvas-rendered biomarker particle constellation with live mouse-parallax
- **Micro-Animation System** — smooth hover states, glowing borders, floating elements
- **Responsive Adaptive Layout** — adapts seamlessly from mobile to widescreen clinical workstations

### 👥 Multi-Role Platform
- **Doctor Dashboard** — full CDSS console, ML predictions, patient registry, explainable AI, drug interaction engine
- **Patient Portal** — Smart Intake Chat, AI Health Companion, Digital Health Twin, care plan viewer
- **Caregiver View** — simplified status monitoring and medication management
- **Admin Dashboard** — population health analytics, system-wide monitoring

### 📊 Advanced Analytics
- **ML Risk Prediction Dashboard** — Gradient Boosting, SVM, Neural Net ensemble risk scores for diabetes, CKD, CVD, stroke
- **Population Health Analytics** — cohort-level trend analysis and early risk stratification
- **Digital Health Twin** — patient-specific 3D organ health visualization
- **Printable Clinical Reports** — auto-generated physician summaries with confidence bands

---

## 💻 Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS v4 + Custom CSS |
| Animations | CSS Keyframes + Canvas 2D API |
| State | React Context + Hooks |
| i18n | Custom translation system (12 languages) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + tsx |
| API Server | Express-style server.ts |
| Real-time | WebSocket support |

### AI / ML
| Provider | Models Used |
|---|---|
| NVIDIA NIM (OpenRouter) | Nemotron 3 Super 120B — Clinical Triage |
| OpenRouter | Meta Llama 3.1 8B Instruct — Intake Agent |
| Google AI | Gemini 2.5 Flash/Pro — Multi-modal reasoning |
| ElevenLabs | TTS (Aria voice) + STT — Voice Agent |

### Integrations
| Service | Purpose |
|---|---|
| Twilio | Autonomous ambulance dispatch + CHW SMS |
| Google Maps Places API | Real-time nearest hospital geolocation |
| Web Bluetooth API | IoT vital device integration (BP cuff, SpO2) |

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- API keys (see below)

### 1. Clone the Repository

```bash
git clone https://github.com/vishcantcode/TETRA013.git
cd TETRA013
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Fill in the following keys in your `.env` file:

| Variable | Service | Purpose |
|---|---|---|
| `NVIDIA_NLP_API_KEY` | OpenRouter | Llama 3.1 8B Intake Agent |
| `NVIDIA_CHAT_API_KEY` | OpenRouter/NVIDIA | Nemotron Clinical Triage |
| `GEMINI_API_KEY` | Google AI | Gemini multi-modal reasoning |
| `ELEVENLABS_API_KEY` | ElevenLabs | TTS/STT Voice Agent |
| `GOOGLE_MAPS_API_KEY` | Google Cloud | Hospital geolocation (Places API) |
| `TWILIO_ACCOUNT_SID` | Twilio | Emergency dispatch |
| `TWILIO_AUTH_TOKEN` | Twilio | Emergency dispatch |
| `TWILIO_PHONE_NUMBER` | Twilio | Ambulance calling number |

> ⚠️ **Google Maps** requires the **Places API** enabled with billing active.

### 3. Run the Application

```bash
# Start the frontend dev server
npm run dev

# In a separate terminal, start the backend agent server
npx tsx server.ts
```

The app will be live at **[http://localhost:5173](http://localhost:5173)**

---

## 📁 Project Structure

```
TETRA013/
├── src/
│   ├── components/
│   │   ├── doctor/          # Doctor CDSS dashboard, ML predictions, XAI
│   │   ├── patient/         # Patient portal, Smart Intake, Health Twin
│   │   ├── caregiver/       # Caregiver monitoring view
│   │   ├── common/          # Shared AI modals, food scanner, drug engine
│   │   ├── modals/          # Registration, vitals, reports modals
│   │   └── demo/            # Hackathon presentation mode
│   ├── services/
│   │   ├── agents/          # Intake, Triage, Empathy, Action agents
│   │   ├── cdss/            # Clinical rule engine, confidence, XAI
│   │   └── rules/           # Disease-specific clinical rules (DM, CKD, CVD…)
│   ├── context/             # App-wide React context providers
│   ├── types/               # TypeScript type definitions
│   └── i18n/                # Multi-language translations
├── server.ts                # Node.js backend agent server
├── index.html
├── vite.config.ts
└── package.json
```

---

## 🏆 Hackathon Submission

**TETRA013** was built as a high-stakes hackathon project after completely pivoting from a static form-based approach based on mentor feedback. The system was re-engineered ground-up into a fully autonomous, scalable, and production-grade Clinical Decision Support System.

### What makes TETRA013 stand out:

| Dimension | Achievement |
|---|---|
| **AI Depth** | 4-agent pipeline with 3 different LLM providers running in parallel |
| **Clinical Validity** | Evidence-based rules aligned to ICMR, WHO, AHA, ADA, ESC guidelines |
| **Autonomy** | No human-in-the-loop for emergency dispatch — system acts in under 10 seconds |
| **UI/UX** | Futuristic glassmorphic design with 3D neural canvas background |
| **Accessibility** | 12-language support including Hindi, Tamil, Telugu, Bengali |
| **Scale** | Supports Doctor, Patient, Caregiver, and Admin roles in a single platform |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for real-world clinical impact**

*TETRA013 — Because every second in healthcare matters.*

</div>
