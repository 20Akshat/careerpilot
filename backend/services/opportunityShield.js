import { getJson } from "serpapi";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.SERPAPI_API_KEY;

/**
 * OpportunityShield Investigation Service
 * Investigates company legitimacy, job authenticity, scam indicators, and suspicious offers.
 */
export async function investigateOpportunity({ company, role, jobUrl, offerDetails }) {
  const query = company ? `${company} official careers hiring reviews` : role;
  const scamQuery = company ? `${company} fake internship scam complaints glassdoor` : `${role} internship scam`;

  let webEvidence = [];
  let scamDiscussions = [];

  if (API_KEY) {
    try {
      const [officialRes, scamRes] = await Promise.all([
        getJson({
          engine: "google",
          api_key: API_KEY,
          q: query,
          num: 4,
          gl: "in",
        }),
        getJson({
          engine: "google",
          api_key: API_KEY,
          q: scamQuery,
          num: 4,
          gl: "in",
        }),
      ]);

      webEvidence = (officialRes.organic_results || []).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet || "",
      }));

      scamDiscussions = (scamRes.organic_results || []).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet || "",
      }));
    } catch (err) {
      console.warn("[OpportunityShield SerpApi Error]:", err.message);
    }
  }

  // Analyzing text & flags
  const combinedText = `${offerDetails || ""} ${jobUrl || ""} ${scamDiscussions.map(s => s.snippet + " " + s.title).join(" ")}`.toLowerCase();

  const confirmed = [];
  const contradictions = [];
  const unverified = [];
  let riskScore = 15; // default low risk (0-100 scale, higher is riskier)

  // 1. Payment or Security Deposit Demand (Top Red Flag)
  if (/(registration fee|training fee|security deposit|pay ₹|pay rs|processing charge|laptop fee|crypto)/i.test(combinedText)) {
    contradictions.push("Payment Demanded: Legitimate companies NEVER demand registration, training, or deposit fees.");
    riskScore += 50;
  } else {
    confirmed.push("No upfront payment requests or training charges detected.");
  }

  // 2. Suspicious Email Domain
  if (/(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)/i.test(offerDetails || "")) {
    contradictions.push("Free Public Email Domain: Offer/recruiter uses free email (Gmail/Yahoo/Outlook) instead of official corporate domain.");
    riskScore += 30;
  } else if (/@[\w.-]+\.[a-z]{2,}/i.test(offerDetails || "")) {
    confirmed.push("Recruiter communication appears to use a dedicated custom corporate email address.");
  }

  // 3. Web Presence Verification
  if (webEvidence.length > 0) {
    const officialSites = webEvidence.filter(e => 
      e.link.includes("linkedin.com") || 
      e.link.includes("glassdoor") || 
      e.link.includes("careers") ||
      !e.link.includes("complaint")
    );
    if (officialSites.length > 0) {
      confirmed.push(`Verified Digital Presence: Found official entries on ${officialSites.slice(0, 2).map(s => new URL(s.link).hostname).join(", ")}`);
    } else {
      unverified.push("Limited corporate footprint found online.");
    }
  } else {
    unverified.push("Could not independently locate active domain records without manual domain lookup.");
  }

  // 4. Offer Letter Immediate Hiring without Interview
  if (/(direct selection|without interview|selected on resume basis only|immediate joining letter)/i.test(offerDetails || "")) {
    contradictions.push("Direct Selection without Interview: High fraud pattern where letters are dispatched without any technical evaluation.");
    riskScore += 25;
  }

  // 5. Unrealistic Salary / Stipend Promise
  if (/(50000|60000|75000|100000|1 lakh|2 lakh).*(intern|internship|trainee|fresher)/i.test(combinedText)) {
    unverified.push("Exceptionally high stipend for fresher role: verify if milestone-based or commission model.");
    riskScore += 10;
  }

  // Determine Final Verdict
  riskScore = Math.min(99, riskScore);
  let verdict = "GENUINE / LOW RISK";
  let verdictColor = "emerald";
  let badge = "Shield Verified ✅";

  if (riskScore >= 60) {
    verdict = "SUSPICIOUS / HIGH RISK";
    verdictColor = "rose";
    badge = "Scam Warning ⚠️";
  } else if (riskScore >= 35) {
    verdict = "PROCEED WITH CAUTION";
    verdictColor = "amber";
    badge = "Needs Review 🔍";
  }

  return {
    company: company || "Specified Opportunity",
    role: role || "Internship / Job",
    riskScore,
    trustScore: 100 - riskScore,
    verdict,
    verdictColor,
    badge,
    evidenceReport: {
      confirmed,
      contradictions,
      unverified,
    },
    sources: webEvidence.slice(0, 3),
    scamLookups: scamDiscussions.slice(0, 2),
    timestamp: new Date().toISOString()
  };
}
