# 🚀 CareerPilot AI — Autonomous Job Discovery & Career Copilot

> **SerpApi India Hackathon 2026 — AI Agents Track**  
> An autonomous end-to-end career intelligence engine designed for students, freshers, and early-career developers across India. Powered by live anti-hallucination Google search engines via **SerpApi**.

---

## 🌟 The Problem
1. **The Keyword Disconnect**: 70%+ of Indian graduates apply with generic resumes, failing algorithmic ATS gatekeepers.
2. **Fake Internship Exploitation**: Students constantly fall victim to fraudulent "offer letters" demanding ₹1,000–₹5,000 upfront "registration/training fees" or direct selections without interviews.
3. **Application Black Hole**: Resumes disappear into applicant tracking systems with zero recruiter outreach or targeted preparation.

---

## 🧠 Core Agentic Architecture & Killer Features

### 1. 🛡️ OpportunityShield — Autonomous Fraud & Authenticity Investigator
- **Autonomous Multi-Signal Investigation**: Cross-examines companies using SerpApi Google Search and real-world complaint discussions.
- **Tri-Part Evidence Report**:
  - ✅ **Confirmed**: Official career portals, absence of upfront fee demands, verified corporate domains.
  - ❌ **Contradicted**: Payment requests (training/deposit), free email domains (`@gmail.com`), direct selection scams.
  - ❓ **Unverified**: High stipend anomalies and unverified physical office records.

### 2. 🎯 Resume-Driven ATS Discovery & Anti-Hallucination Pipeline
- **PDF Resume Ingestion**: Automatically extracts technical skills, candidate name, preferred city, and target roles directly from uploaded PDF resumes.
- **Strict Location & Role Matching**: Powered by live SerpApi `google_jobs` with city-prioritized rankings (Indore, Mumbai, Pune, Bangalore, etc.).
- **Deterministic 4-Pillar ATS Scoring Engine (0–100)**:
  - 🧩 **Skills Match (45 pts)**: Verified intersection of candidate tech stack vs. demanded job requirements + extra candidate bonus skills.
  - 🎯 **Role Relevance (25 pts)**: Exact title alignment.
  - 🛡️ **Fresher Gatekeeper (20 pts)**: Strict experience audit rejecting senior-level postings.
  - ⏱️ **Recency (10 pts)**: Prioritizes active postings from the last 24–48 hours.

### 3. ⚡ AI Career Copilot Suite (For Every Job)
- **🤝 Recruiter Intel & 1-Click Outreach**: Queries SerpApi to identify real Technical Recruiters, HR Leads, and Engineering Managers on LinkedIn for that specific employer. Generates personalized cold email pitches and 300-char LinkedIn InMail notes.
- **📄 1-Click Tailored Full Resume (PDF)**: Uses client-side `jsPDF` to compile a complete, production-ready, ATS-optimized A4 resume tailored with quantified accomplishment bullets for that exact target company.
- **🎙️ 7-Question Pre-Interview Simulator**: 7 technical, system design, debugging, and STAR behavioral drill challenges tailored to the company's tech stack with expert benchmark answer rubrics.

### 4. 📋 Application Pipeline Tracker & AI Follow-Up Generator
- **Full Funnel Management**: Tracks applications across *Applied/Waiting*, *Shortlisted*, *Interview*, *Selected*, and *Rejected*.
- **Autonomous Follow-Up Mailer**: 1-click tailored email follow-ups with 3 strategic outreach tones (*Polite Inquiry*, *Value-Add Update*, *Decision Timeline*).

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, jsPDF
- **Backend**: Node.js (ESM), Express.js, Multer, PDF-Parse
- **AI & Search Infrastructure**: **SerpApi** (Google Jobs Engine, Google Search API)
- **Security & Storage**: JWT Authentication, Bcrypt

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- SerpApi API Key ([Get free API key](https://serpapi.com))

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
SERPAPI_API_KEY=your_serpapi_api_key_here
JWT_SECRET=super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 👥 Hackathon Team
- **Project**: CareerPilot AI
- **Track**: AI Agents Track
- **Event**: SerpApi India Hackathon 2026
