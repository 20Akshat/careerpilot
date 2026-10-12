/**
 * Anti-Hallucination & Deterministic Matching Engine
 * Compares student profile against listing without inventing data.
 */

export function extractExperienceRequirements(text) {
  const content = text.toLowerCase();
  
  // High-risk senior patterns (2+ to 10+ years)
  const seniorPattern = /([2-9]|\d{2})\s*\+?\s*(years?|yrs?)/i;
  const matchSenior = content.match(seniorPattern);

  // Fresher friendly patterns
  const fresherPattern = /(intern|internship|trainee|fresher|entry[\s-]level|fresh graduate|0[\s-–to]+1\s*(years?|yrs?)|no experience required)/i;
  const isFresher = fresherPattern.test(content);

  if (matchSenior && !isFresher) {
    return {
      requiredYears: parseInt(matchSenior[1], 10),
      isFresherEligible: false,
      tag: "Experienced (Risk of Rejection)",
      confidence: "HIGH"
    };
  }

  if (isFresher) {
    return {
      requiredYears: 0,
      isFresherEligible: true,
      tag: "Verified Fresher Friendly",
      confidence: "HIGH"
    };
  }

  return {
    requiredYears: null,
    isFresherEligible: true,
    tag: "Eligibility Unspecified",
    confidence: "MEDIUM"
  };
}

export function evaluateJobMatch(profile, job) {
  const candidateSkills = (profile.skills || []).map(s => s.toLowerCase().trim()).filter(Boolean);
  const combinedJobText = `${job.title} ${job.description} ${(job.extensions || []).join(" ")}`.toLowerCase();

  // 1. Skill Analysis
  // Extract all tech skills mentioned in the job listing
  const KNOWN_SKILLS = [
    'react', 'vue', 'angular', 'next.js', 'javascript', 'typescript', 'html', 'css',
    'tailwind', 'bootstrap', 'node.js', 'node', 'express', 'python', 'django', 'flask',
    'fastapi', 'java', 'spring', 'sql', 'mysql', 'postgresql', 'postgres', 'mongodb',
    'redis', 'aws', 'docker', 'kubernetes', 'git', 'github', 'graphql', 'c++', 'c#',
    'flutter', 'react native', 'android', 'ios', 'machine learning', 'deep learning',
    'ci/cd', 'linux', 'figma', 'postman', 'rest api', 'supabase', 'firebase'
  ];

  // Skills the company actually asked for in this job
  const jobDemandedSkills = KNOWN_SKILLS.filter(skill => {
    const rx = new RegExp(`(?<![a-z])${skill.replace('.', '\\.').replace('+', '\\+')}(?![a-z])`, 'i');
    return rx.test(combinedJobText);
  });

  // Matched: Candidate has AND Job asks for
  const matchedSkills = candidateSkills.filter(s => combinedJobText.includes(s));

  // Truly Missing: Job specifically demands it, but candidate does NOT have it!
  const missingSkills = jobDemandedSkills.filter(demanded => !candidateSkills.some(cs => cs.includes(demanded) || demanded.includes(cs)));

  // Extra Bonus: Candidate has it, but this specific job didn't even ask for it (Good thing!)
  const extraSkills = candidateSkills.filter(cs => !matchedSkills.includes(cs));

  // Skill Score: Higher if you match what company asked + bonus for extra skills
  const matchRatio = jobDemandedSkills.length > 0
    ? (matchedSkills.length / jobDemandedSkills.length)
    : (matchedSkills.length > 0 ? 0.9 : 0.4);
  const skillScore = Math.min(45, Math.round(matchRatio * 40 + Math.min(5, extraSkills.length)));

  // 2. Role Title Relevance (Max 25 Points)
  const targetRole = (profile.targetRole || "").toLowerCase().trim();
  const jobTitle = (job.title || "").toLowerCase();
  let roleScore = 10;
  if (targetRole && jobTitle.includes(targetRole)) {
    roleScore = 25;
  } else if (targetRole.split(" ").some(word => word.length > 2 && jobTitle.includes(word))) {
    roleScore = 18;
  }

  // 3. Eligibility Gatekeeper (Max 20 Points)
  const expCheck = extractExperienceRequirements(job.title + " " + job.description);
  let eligibilityScore = 10;
  if (expCheck.tag === "Verified Fresher Friendly") {
    eligibilityScore = 20;
  } else if (expCheck.tag === "Experienced (Risk of Rejection)") {
    eligibilityScore = 0;
  }

  // 4. Posting Recency (Max 10 Points)
  let recencyScore = 5;
  const isRecent = (job.extensions || []).some(ext => /(hour|hours|day|days|today|yesterday|just posted)/i.test(ext));
  if (isRecent) recencyScore = 10;

  // Total Match Score (0 - 100)
  const totalScore = Math.min(100, skillScore + roleScore + eligibilityScore + recencyScore);

  // Verified Apply Link (Never hallucinated)
  const applyUrl = (job.applyOptions && job.applyOptions.length > 0)
    ? job.applyOptions[0].link
    : job.shareLink;

  return {
    jobId: job.id,
    matchScore: totalScore,
    scoreBreakdown: {
      skillScore,
      roleScore,
      eligibilityScore,
      recencyScore
    },
    matchedSkills,
    missingSkills,
    extraSkills,
    experienceAudit: expCheck,
    applyUrl,
    verifiedSource: {
      platform: job.via || "Google Jobs Index",
      hasDirectApply: Boolean(job.applyOptions && job.applyOptions.length > 0),
      isGroundTruth: true
    }
  };
}
