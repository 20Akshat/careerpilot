import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { createRequire } from "module";
import { searchJobs, searchResources } from "./services/serpapiService.js";
import { evaluateJobMatch } from "./services/matchingService.js";
import { registerUser, loginUser, verifyToken } from "./services/authService.js";
import { parseResumeText } from "./services/resumeParser.js";
import { investigateOpportunity } from "./services/opportunityShield.js";
import { getRecruiterIntel, optimizeResumeATS, getInterviewSimulatorDrill } from "./services/careerCopilotService.js";

// pdf-parse uses CJS — use createRequire in ESM
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ error: "Authentication required" });
  try {
    req.user = verifyToken(auth.split(" ")[1]);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "CareerPilot AI", timestamp: new Date().toISOString() });
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "Name, email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  try {
    const result = await registerUser(email, password, name);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });
  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ─── RESUME PARSE ─────────────────────────────────────────────────────────────
app.post("/api/resume/parse", upload.single("resume"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (req.file.mimetype !== "application/pdf")
    return res.status(400).json({ error: "Only PDF files are supported" });
  try {
    let rawText = "";
    if (PDFParse && typeof PDFParse === "function") {
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        rawText = result.text || "";
      } catch (err) {
        // Fallback if class constructor fails
        const legacy = await PDFParse(req.file.buffer);
        rawText = legacy.text || "";
      }
    }

    if (!rawText || rawText.trim().length < 20) {
      return res.json({
        success: true,
        isImageBased: true,
        skills: [], targetRole: "", location: "", name: "", skillCount: 0,
        message: "Image-based or unreadable PDF detected. Please fill details manually."
      });
    }

    const parsed = parseResumeText(rawText);
    console.log(`[Resume] Extracted: ${parsed.name} | ${parsed.skillCount} skills | Role: ${parsed.targetRole} | Location: ${parsed.location}`);
    res.json({ success: true, isImageBased: false, rawText, ...parsed });
  } catch (err) {
    console.error("[Resume Error]:", err.message);
    res.json({
      success: true,
      isImageBased: true,
      skills: [], targetRole: "", location: "", name: "", skillCount: 0,
      message: "Could not read this PDF automatically. Please fill details manually."
    });
  }
});

// ─── PIPELINE (Protected) ─────────────────────────────────────────────────────
app.post("/api/pipeline", requireAuth, async (req, res) => {
  const { targetRole, skills, location } = req.body;
  if (!targetRole || !skills)
    return res.status(400).json({ error: "targetRole and skills are required." });

  const parsedSkills = Array.isArray(skills)
    ? skills : String(skills).split(",").map(s => s.trim()).filter(Boolean);
  const searchLocation = location?.trim() || "India";

  console.log(`\n[${req.user.email}] → ${targetRole} in ${searchLocation}`);
  try {
    const rawJobs = await searchJobs({ query: targetRole, location: searchLocation });
    const evaluatedJobs = rawJobs
      .map(job => ({ ...job, evaluation: evaluateJobMatch({ targetRole, skills: parsedSkills }, job) }))
      .sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

    let learningResources = [];
    if (evaluatedJobs[0]?.evaluation?.missingSkills?.length > 0)
      learningResources = await searchResources(evaluatedJobs[0].evaluation.missingSkills[0]);

    return res.json({ success: true, query: { targetRole, skills: parsedSkills, location: searchLocation }, totalFound: evaluatedJobs.length, learningResources, jobs: evaluatedJobs });
  } catch (error) {
    return res.status(500).json({ error: "Pipeline failed", details: error.message });
  }
});

// ─── DEMO PIPELINE (No auth) ──────────────────────────────────────────────────
app.post("/api/pipeline/demo", async (req, res) => {
  const { targetRole, skills, location } = req.body;
  if (!targetRole || !skills)
    return res.status(400).json({ error: "targetRole and skills required" });

  const parsedSkills = Array.isArray(skills) ? skills : String(skills).split(",").map(s => s.trim()).filter(Boolean);
  const searchLocation = location?.trim() || "India";

  try {
    const rawJobs = await searchJobs({ query: targetRole, location: searchLocation });
    const evaluatedJobs = rawJobs
      .map(job => ({ ...job, evaluation: evaluateJobMatch({ targetRole, skills: parsedSkills }, job) }))
      .sort((a, b) => b.evaluation.matchScore - a.evaluation.matchScore);

    let learningResources = [];
    if (evaluatedJobs[0]?.evaluation?.missingSkills?.length > 0)
      learningResources = await searchResources(evaluatedJobs[0].evaluation.missingSkills[0]);

    return res.json({ success: true, totalFound: evaluatedJobs.length, learningResources, jobs: evaluatedJobs });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── OPPORTUNITY SHIELD INVESTIGATION ───────────────────────────────────────
app.post("/api/shield/investigate", async (req, res) => {
  const { company, role, jobUrl, offerDetails } = req.body;
  if (!company && !role && !offerDetails && !jobUrl) {
    return res.status(400).json({ error: "Please provide company name, job URL, or offer details to investigate." });
  }

  try {
    const report = await investigateOpportunity({ company, role, jobUrl, offerDetails });
    return res.json({ success: true, report });
  } catch (err) {
    console.error("[Shield Error]:", err.message);
    return res.status(500).json({ error: "Failed to complete investigation", details: err.message });
  }
});

// ─── COPILOT 1: RECRUITER INTEL & OUTREACH ──────────────────────────────────
app.post("/api/copilot/recruiter-intel", async (req, res) => {
  const { company, role, candidateName, matchedSkills } = req.body;
  if (!company) return res.status(400).json({ error: "Company name is required." });
  try {
    const intel = await getRecruiterIntel({ company, role, candidateName, matchedSkills });
    return res.json({ success: true, ...intel });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── COPILOT 2: 1-CLICK RESUME ATS OPTIMIZER ────────────────────────────────
app.post("/api/copilot/optimize-resume", async (req, res) => {
  const { jobTitle, company, jobDescription, candidateSkills, currentResumeText, candidateName, candidateEmail, candidatePhone } = req.body;
  try {
    const optimized = await optimizeResumeATS({ jobTitle, company, jobDescription, candidateSkills, currentResumeText, candidateName, candidateEmail, candidatePhone });
    return res.json({ success: true, ...optimized });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── COPILOT 3: PRE-INTERVIEW SIMULATOR ─────────────────────────────────────
app.post("/api/copilot/interview-drill", async (req, res) => {
  const { company, role, matchedSkills } = req.body;
  if (!company) return res.status(400).json({ error: "Company name is required." });
  try {
    const drill = await getInterviewSimulatorDrill({ company, role, matchedSkills });
    return res.json({ success: true, ...drill });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CareerPilot AI Backend → http://localhost:${PORT}`);
  console.log(`🔐 POST /api/auth/register  |  POST /api/auth/login`);
  console.log(`📄 POST /api/resume/parse   (PDF upload)`);
  console.log(`🛡️ POST /api/shield/investigate (OpportunityShield)`);
  console.log(`🤝 POST /api/copilot/*      (Recruiter, Resume ATS, Interview)`);
  console.log(`📡 POST /api/pipeline       (JWT required)`);
});
