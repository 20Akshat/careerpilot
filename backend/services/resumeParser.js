// Comprehensive tech skills dictionary for resume parsing
const SKILL_KEYWORDS = {
  // Frontend
  'react': 'React', 'reactjs': 'React', 'react.js': 'React',
  'vue': 'Vue.js', 'vuejs': 'Vue.js', 'vue.js': 'Vue.js',
  'angular': 'Angular', 'angularjs': 'Angular',
  'next.js': 'Next.js', 'nextjs': 'Next.js',
  'nuxt': 'Nuxt.js',
  'javascript': 'JavaScript', 'js': 'JavaScript',
  'typescript': 'TypeScript', 'ts': 'TypeScript',
  'html': 'HTML', 'html5': 'HTML',
  'css': 'CSS', 'css3': 'CSS',
  'tailwind': 'Tailwind CSS', 'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'sass': 'SASS', 'scss': 'SCSS',
  'redux': 'Redux',
  'webpack': 'Webpack', 'vite': 'Vite',
  // Backend
  'node': 'Node.js', 'nodejs': 'Node.js', 'node.js': 'Node.js',
  'express': 'Express.js', 'expressjs': 'Express.js',
  'python': 'Python',
  'django': 'Django', 'flask': 'Flask', 'fastapi': 'FastAPI',
  'java': 'Java', 'spring': 'Spring Boot', 'springboot': 'Spring Boot',
  'php': 'PHP', 'laravel': 'Laravel',
  'golang': 'Go', 'go lang': 'Go',
  'rust': 'Rust',
  'ruby': 'Ruby', 'rails': 'Ruby on Rails',
  'c++': 'C++', 'cpp': 'C++',
  'c#': 'C#', '.net': '.NET', 'dotnet': '.NET',
  // Database
  'mongodb': 'MongoDB', 'mongo': 'MongoDB',
  'mysql': 'MySQL', 'postgresql': 'PostgreSQL', 'postgres': 'PostgreSQL',
  'sqlite': 'SQLite',
  'redis': 'Redis',
  'firebase': 'Firebase',
  'supabase': 'Supabase',
  'graphql': 'GraphQL',
  // Cloud & DevOps
  'aws': 'AWS', 'amazon web services': 'AWS',
  'gcp': 'GCP', 'google cloud': 'GCP',
  'azure': 'Azure',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
  'ci/cd': 'CI/CD', 'cicd': 'CI/CD',
  'github actions': 'GitHub Actions',
  'jenkins': 'Jenkins',
  'terraform': 'Terraform',
  'linux': 'Linux',
  // Mobile
  'flutter': 'Flutter', 'dart': 'Dart',
  'react native': 'React Native',
  'android': 'Android', 'kotlin': 'Kotlin',
  'swift': 'Swift', 'ios': 'iOS',
  // AI/ML
  'machine learning': 'Machine Learning', 'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'scikit-learn': 'Scikit-learn', 'sklearn': 'Scikit-learn',
  'numpy': 'NumPy', 'pandas': 'Pandas',
  'nlp': 'NLP', 'natural language processing': 'NLP',
  'computer vision': 'Computer Vision',
  'langchain': 'LangChain',
  'openai': 'OpenAI API',
  // Tools
  'git': 'Git', 'github': 'GitHub', 'gitlab': 'GitLab',
  'jira': 'Jira', 'figma': 'Figma',
  'postman': 'Postman',
  'rest api': 'REST APIs', 'restful': 'REST APIs',
  'microservices': 'Microservices',
  'agile': 'Agile', 'scrum': 'Scrum',
  // Security
  'cybersecurity': 'Cybersecurity',
  'ethical hacking': 'Ethical Hacking',
  'penetration testing': 'Penetration Testing',
  'kali linux': 'Kali Linux',
  // Data
  'sql': 'SQL',
  'power bi': 'Power BI',
  'tableau': 'Tableau',
  'excel': 'Excel',
  'data analysis': 'Data Analysis',
}

// Role detection based on keyword frequency + presence
const ROLE_PATTERNS = [
  { role: 'AI/ML Engineer',          keywords: ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'nlp', 'ai', 'artificial intelligence'] },
  { role: 'Data Scientist',          keywords: ['data science', 'data scientist', 'statistics', 'pandas', 'numpy', 'matplotlib', 'jupyter'] },
  { role: 'Data Analyst',            keywords: ['data analysis', 'power bi', 'tableau', 'excel', 'sql', 'data analyst'] },
  { role: 'DevOps Engineer',         keywords: ['docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'devops'] },
  { role: 'Cloud Engineer',          keywords: ['aws', 'azure', 'gcp', 'cloud', 'ec2', 's3', 'lambda'] },
  { role: 'Cybersecurity Analyst',   keywords: ['cybersecurity', 'ethical hacking', 'penetration testing', 'kali', 'security', 'firewall', 'soc'] },
  { role: 'Android Developer',       keywords: ['android', 'kotlin', 'android studio', 'java android'] },
  { role: 'Flutter Developer',       keywords: ['flutter', 'dart'] },
  { role: 'React Native Developer',  keywords: ['react native'] },
  { role: 'iOS Developer',           keywords: ['swift', 'ios', 'xcode'] },
  { role: 'Full Stack Developer',    keywords: ['full stack', 'fullstack', 'mern', 'mean', 'frontend', 'backend'] },
  { role: 'Frontend Developer',      keywords: ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'frontend', 'front-end', 'ui developer'] },
  { role: 'Backend Developer',       keywords: ['node', 'django', 'flask', 'spring', 'api', 'backend', 'back-end', 'server'] },
  { role: 'Blockchain Developer',    keywords: ['blockchain', 'solidity', 'web3', 'ethereum', 'smart contract'] },
  { role: 'Software Engineer',       keywords: ['software engineer', 'software developer', 'software development'] },
]

export function parseResumeText(text) {
  const lower = text.toLowerCase()

  // ── Extract Skills ──────────────────────────────────────────────
  const foundSkills = new Set()
  for (const [keyword, label] of Object.entries(SKILL_KEYWORDS)) {
    // Match whole word or surrounded by spaces/newlines/commas
    const regex = new RegExp(`(?<![a-z])${keyword.replace('.', '\\.').replace('+', '\\+')}(?![a-z])`, 'i')
    if (regex.test(lower)) {
      foundSkills.add(label)
    }
  }

  // ── Detect Target Role ──────────────────────────────────────────
  let detectedRole = 'Software Engineer'
  let maxScore = 0

  for (const { role, keywords } of ROLE_PATTERNS) {
    const score = keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0)
    if (score > maxScore) {
      maxScore = score
      detectedRole = role
    }
  }

  // ── Extract Name (first line heuristic) ─────────────────────────
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const nameLine = lines[0] || ''
  const name = nameLine.length < 50 && /^[a-zA-Z\s]+$/.test(nameLine) ? nameLine : ''

  // ── Extract Location hint ────────────────────────────────────────
  const CITIES = ['mumbai', 'delhi', 'bengaluru', 'bangalore', 'hyderabad', 'chennai',
    'pune', 'kolkata', 'ahmedabad', 'indore', 'jaipur', 'noida', 'gurgaon',
    'chandigarh', 'kochi', 'surat', 'remote']
  let detectedCity = ''
  for (const city of CITIES) {
    if (lower.includes(city)) {
      detectedCity = city.charAt(0).toUpperCase() + city.slice(1)
      break
    }
  }

  return {
    name,
    skills: [...foundSkills],
    targetRole: detectedRole,
    location: detectedCity ? `${detectedCity}, India` : '',
    skillCount: foundSkills.size
  }
}
