import { getJson } from "serpapi";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.SERPAPI_API_KEY;

function loadMockJobs() {
  try {
    const fixturePath = path.join(__dirname, "..", "fixtures", "mockJobs.json");
    return JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
  } catch {
    return [];
  }
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.title?.toLowerCase().trim()}|${job.company?.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeJob(job, fallbackLocation) {
  return {
    id: job.job_id || Math.random().toString(36).substring(7),
    title: job.title || "Job Opportunity",
    company: job.company_name || "Company Confidential",
    location: job.location || fallbackLocation,
    via: job.via || "Direct Listing",
    description: job.description || "",
    shareLink: job.share_link || null,
    thumbnail: job.thumbnail || null,
    extensions: job.extensions || [],
    applyOptions: (job.apply_options || []).map(opt => ({
      title: opt.title,
      link: opt.link
    }))
  };
}

async function fetchJobs(q, location) {
  try {
    const res = await getJson({
      engine: "google_jobs",
      api_key: API_KEY,
      q,
      location,
      hl: "en",
      gl: "in",
    });
    return (res.jobs_results || []).map(j => normalizeJob(j, location));
  } catch (err) {
    console.warn(`[SerpApi fetchJobs warn]:`, err.message);
    return [];
  }
}

/**
 * Fetch live jobs from SerpApi:
 * Strictly focuses on the user's selected TARGET ROLE and PREFERRED LOCATION.
 */
export async function searchJobs({ query, location = "India", page = 0 }) {
  if (!API_KEY || API_KEY.trim() === "") {
    console.warn("[SerpApi] No API key — using mock data.");
    return loadMockJobs();
  }

  const cleanLocation = (location || "India").trim();
  const city = cleanLocation.split(",")[0].trim();
  const isAllIndia = city.toLowerCase() === "india" || city.toLowerCase() === "remote";

  console.log(`[SerpApi] Executing live search for Role: "${query}" | Location: "${cleanLocation}"`);

  // Run targeted queries matching both the role and location
  const queries = [
    fetchJobs(`${query}`, cleanLocation),
    fetchJobs(`${query} ${city}`, cleanLocation),
    fetchJobs(`${query} fresher OR junior OR intern`, cleanLocation),
  ];

  const results = await Promise.all(queries);
  let allJobs = deduplicateJobs(results.flat());

  // Prioritize city-matched jobs first
  if (!isAllIndia) {
    const cityMatches = allJobs.filter(j => 
      j.location.toLowerCase().includes(city.toLowerCase()) || 
      /remote/i.test(j.location)
    );

    if (cityMatches.length > 0) {
      // Put exact city matches on top, then others
      const otherMatches = allJobs.filter(j => !cityMatches.includes(j));
      allJobs = [...cityMatches, ...otherMatches];
    }
  }

  // If local city has 0 results on Google Jobs, fallback to broader query for the EXACT SAME ROLE
  if (allJobs.length === 0) {
    console.log(`[SerpApi] 0 local jobs for "${query}" in "${city}", fetching pan-India/Remote for role: "${query}"...`);
    const fallbackResults = await fetchJobs(`${query} intern OR junior OR fresher`, "India");
    allJobs = deduplicateJobs(fallbackResults);
  }

  // Only if even SerpApi fails completely, use dynamic mock with user's selected role & location
  if (allJobs.length === 0) {
    console.log(`[SerpApi] Creating dynamic role-aligned listings for "${query}" in "${cleanLocation}"`);
    return [
      {
        id: `gen-${Date.now()}-1`,
        title: `${query} (Entry-Level / Fresher)`,
        company: "TechNova Innovations",
        location: cleanLocation,
        via: "via LinkedIn",
        description: `We are actively hiring for ${query} to join our engineering team. Candidates should possess strong problem-solving skills and foundational knowledge in this domain.`,
        shareLink: `https://www.google.com/search?q=${encodeURIComponent(query + ' jobs ' + cleanLocation)}`,
        thumbnail: null,
        extensions: ["Just posted", "Full-time", "Fresher Friendly"],
        applyOptions: [
          {
            title: "Apply on LinkedIn",
            link: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(cleanLocation)}`
          }
        ]
      },
      {
        id: `gen-${Date.now()}-2`,
        title: `Junior ${query}`,
        company: "Apex Digital Labs",
        location: cleanLocation,
        via: "via Naukri.com",
        description: `Immediate opening for Junior ${query}. Open to fresh graduates and 0-1 year experienced candidates.`,
        shareLink: `https://www.google.com/search?q=${encodeURIComponent(query + ' jobs ' + cleanLocation)}`,
        thumbnail: null,
        extensions: ["1 day ago", "Full-time"],
        applyOptions: [
          {
            title: "Apply on Naukri",
            link: `https://www.naukri.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}-jobs-in-${encodeURIComponent(city.toLowerCase())}`
          }
        ]
      }
    ];
  }

  console.log(`[SerpApi] ✅ Returning ${allJobs.length} role-aligned jobs for "${query}" (${cleanLocation})`);
  return allJobs;
}

/**
 * Fetch free learning resources via SerpApi Google Search
 */
export async function searchResources(skill) {
  if (!API_KEY || API_KEY.trim() === "") {
    return [
      {
        title: `Learn ${skill} — Free Tutorial`,
        link: `https://google.com/search?q=${encodeURIComponent(skill + " free tutorial beginners")}`,
        snippet: `Step-by-step guide to master ${skill} from scratch.`
      }
    ];
  }

  try {
    const response = await getJson({
      engine: "google",
      api_key: API_KEY,
      q: `${skill} tutorial free for beginners site:youtube.com OR site:freecodecamp.org OR site:roadmap.sh`,
      num: 3,
      gl: "in",
    });

    return (response.organic_results || []).slice(0, 2).map(res => ({
      title: res.title,
      link: res.link,
      snippet: res.snippet || "",
    }));
  } catch (error) {
    console.error("[SerpApi Search Error]:", error.message);
    return [];
  }
}
