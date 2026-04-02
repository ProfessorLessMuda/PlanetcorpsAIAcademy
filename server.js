require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { marked } = require('marked');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3009;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_DIR = path.join(ROOT, 'sessions');

// ─── Security Middleware ────────────────────────────────────────────────────

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      scriptSrc: ["'self'"]
    }
  }
}));

// HTTPS redirect in production (Azure terminates SSL at load balancer)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.hostname + req.originalUrl);
    }
    next();
  });
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(ROOT, 'public')));

// ─── Session Configuration ──────────────────────────────────────────────────

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

app.use(session({
  store: new FileStore({
    path: SESSIONS_DIR,
    ttl: 86400 * 7,   // 7 days
    retries: 0,
    logFn: () => {}   // suppress noisy logs
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 days
    sameSite: 'lax'
  }
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                     // 10 attempts per window
  message: { error: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ─── User Store ─────────────────────────────────────────────────────────────

function loadUsers() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]', 'utf8');
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// ─── Per-User DataStore ─────────────────────────────────────────────────────

function getUserDataDir(userId) {
  const dir = path.join(DATA_DIR, 'users', userId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

class DataStore {
  constructor(baseDir, filename, defaultData = []) {
    this.filePath = path.join(baseDir, filename);
    this.data = defaultData;
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } else {
        this.save();
      }
    } catch (e) {
      console.warn(`Could not load ${this.filePath}:`, e.message);
    }
  }
  save() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }
  getAll() { return this.data; }
  getById(id) { return Array.isArray(this.data) ? this.data.find(d => d.id === id) : null; }
  add(item) {
    if (!item.id) item.id = uuidv4();
    if (Array.isArray(this.data)) { this.data.push(item); this.save(); }
    return item;
  }
  update(id, changes) {
    if (!Array.isArray(this.data)) return null;
    const idx = this.data.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.data[idx] = { ...this.data[idx], ...changes, id };
    this.save();
    return this.data[idx];
  }
  remove(id) {
    if (!Array.isArray(this.data)) return false;
    const before = this.data.length;
    this.data = this.data.filter(d => d.id !== id);
    if (this.data.length < before) { this.save(); return true; }
    return false;
  }
  query(fn) { return Array.isArray(this.data) ? this.data.filter(fn) : []; }
}

class ObjectStore {
  constructor(baseDir, filename, defaultData = {}) {
    this.filePath = path.join(baseDir, filename);
    this.data = defaultData;
    this.load();
  }
  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      } else {
        this.save();
      }
    } catch (e) {
      console.warn(`Could not load ${this.filePath}:`, e.message);
    }
  }
  save() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }
  get() { return this.data; }
  set(data) { this.data = data; this.save(); return this.data; }
  merge(partial) { this.data = { ...this.data, ...partial }; this.save(); return this.data; }
}

// ─── Default data for new users ─────────────────────────────────────────────

const defaultPrograms = [
  {
    id: 'claude-certified-architect',
    name: 'Claude Certified Architect – Foundations',
    description: '5-domain certification covering agentic architecture, tool design, Claude Code, prompt engineering, and reliability.',
    builtIn: true,
    modules: [
      { id: 'module-01', title: 'Agentic Architecture & Orchestration', file: 'curriculum_module-01-agentic-architecture.md', domain: 1, weight: 27 },
      { id: 'module-02', title: 'Tool Design & MCP Integration', file: 'curriculum_module-02-tool-design-mcp.md', domain: 2, weight: 18 },
      { id: 'module-03', title: 'Claude Code Configuration & Workflows', file: 'curriculum_module-03-claude-code-workflows.md', domain: 3, weight: 20 },
      { id: 'module-04', title: 'Prompt Engineering & Structured Output', file: 'curriculum_module-04-prompt-engineering.md', domain: 4, weight: 20 },
      { id: 'module-05', title: 'Context Management & Reliability', file: 'curriculum_module-05-context-reliability.md', domain: 5, weight: 15 }
    ],
    created: new Date().toISOString()
  }
];

const defaultProgress = {
  modulesRead: {},
  streak: { currentStreak: 0, longestStreak: 0, lastActivity: null, activityDates: [] },
  studyPlan: {
    currentPhase: 1,
    checkpoints: {
      'phase-1': { items: ['read-exam-guide', 'read-domains', 'skim-glossary', 'study-module-01', 'study-module-03', 'assess-domain-01', 'assess-domain-03'], completed: [] },
      'phase-2': { items: ['study-module-02', 'study-module-04', 'exercise-1', 'exercise-3', 'assess-domain-02', 'assess-domain-04'], completed: [] },
      'phase-3': { items: ['study-module-05', 'revisit-module-03-cicd', 'exercise-2', 'exercise-4', 'assess-domain-05'], completed: [] },
      'phase-4': { items: ['full-scenario-practice', 'timed-mock-exam', 'review-weak-domains', 'score-80-plus'], completed: [] }
    }
  },
  exercises: {}
};

// ─── Per-user store factory ─────────────────────────────────────────────────

// Cache open stores so we don't re-read files on every request
const storeCache = {};

function getUserStores(userId) {
  if (storeCache[userId]) return storeCache[userId];
  const dir = getUserDataDir(userId);
  const stores = {
    programs:    new DataStore(dir, 'programs.json', JSON.parse(JSON.stringify(defaultPrograms))),
    quizHistory: new DataStore(dir, 'quiz-history.json', []),
    notes:       new DataStore(dir, 'notes.json', []),
    progress:    new ObjectStore(dir, 'progress.json', JSON.parse(JSON.stringify(defaultProgress))),
  };
  storeCache[userId] = stores;
  return stores;
}

// ─── Authentication Middleware ───────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.stores = getUserStores(req.session.userId);
  next();
}

// ─── Auth Routes ────────────────────────────────────────────────────────────

app.post('/api/auth/register', authLimiter, async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  const emailLower = email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLower)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const users = loadUsers();
  if (users.find(u => u.email === emailLower)) {
    return res.status(409).json({ error: 'Account already exists' });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = {
    id: uuidv4(),
    email: emailLower,
    displayName: (displayName || emailLower.split('@')[0]).trim().slice(0, 50),
    passwordHash: hash,
    created: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);

  // Auto-login after registration
  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, displayName: user.displayName });
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email === email.toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  req.session.userId = user.id;
  res.json({ id: user.id, email: user.email, displayName: user.displayName });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const users = loadUsers();
  const user = users.find(u => u.id === req.session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }
  res.json({ id: user.id, email: user.email, displayName: user.displayName });
});

// ─── Markdown parsers ────────────────────────────────────────────────────────

const contentCache = {
  modules: {},
  assessments: {},
  scenarios: [],
  glossary: [],
  exercises: [],
  studyPlan: null,
  domains: null
};

function readMdFile(filename) {
  const fp = path.join(ROOT, filename);
  if (!fs.existsSync(fp)) return '';
  return fs.readFileSync(fp, 'utf8');
}

function parseAssessmentQuestions(md) {
  const questions = [];
  const blocks = md.split(/^---$/m).filter(b => b.trim());
  for (const block of blocks) {
    const qMatch = block.match(/## Question (\d+)/);
    if (!qMatch) continue;
    const num = parseInt(qMatch[1]);
    const scenarioMatch = block.match(/\*\*Scenario:\*\*\s*([\s\S]*?)(?=\n\n[A-D]\))/);
    const scenario = scenarioMatch ? scenarioMatch[1].trim() : '';
    const options = [];
    const optRegex = /^([A-D])\)\s*(.+)$/gm;
    let m;
    while ((m = optRegex.exec(block)) !== null) {
      options.push({ letter: m[1], text: m[2].trim() });
    }
    const answerMatch = block.match(/\*\*Answer:\*\*\s*([A-D])/);
    const answer = answerMatch ? answerMatch[1] : '';
    const explMatch = block.match(/\*\*Explanation:\*\*\s*([\s\S]*?)(?=\n\n\*\*Task|\s*$)/);
    const explanation = explMatch ? explMatch[1].trim() : '';
    const taskMatch = block.match(/\*\*Task Statement:\*\*\s*([\d.]+)/);
    const taskStatement = taskMatch ? taskMatch[1] : '';
    questions.push({ num, scenario, options, answer, explanation, taskStatement });
  }
  return questions;
}

function parseExamScenarios(md) {
  const scenarios = [];
  const scenarioBlocks = md.split(/^## Scenario \d+/m).filter(b => b.trim());
  const headerMatches = [...md.matchAll(/^## Scenario (\d+):\s*(.+)$/gm)];
  for (let i = 0; i < headerMatches.length; i++) {
    const num = parseInt(headerMatches[i][1]);
    const name = headerMatches[i][2].trim();
    const block = scenarioBlocks[i + 1] || scenarioBlocks[i] || '';
    const contextMatch = block.match(/\*\*Context:\*\*\s*([\s\S]*?)(?=\*\*Domains)/);
    const context = contextMatch ? contextMatch[1].trim() : '';
    const domainsMatch = block.match(/\*\*Domains tested:\*\*\s*(.+)/);
    const domains = domainsMatch ? domainsMatch[1].trim() : '';
    const questions = [];
    const qBlocks = block.split(/^### Question/m).filter(b => b.trim());
    for (const qb of qBlocks) {
      const qNumMatch = qb.match(/^[\s]*(\d+\.\d+)/);
      if (!qNumMatch) continue;
      const qNum = qNumMatch[1];
      const scenarioMatch = qb.match(/(?:^.*\n)([\s\S]*?)(?=\n[A-D]\))/);
      const scenario = scenarioMatch ? scenarioMatch[1].trim().replace(/^\*\*Scenario:\*\*\s*/, '') : '';
      const options = [];
      const optRegex = /^([A-D])\)\s*(.+)$/gm;
      let m;
      while ((m = optRegex.exec(qb)) !== null) {
        options.push({ letter: m[1], text: m[2].trim() });
      }
      const answerMatch = qb.match(/\*\*Answer:\*\*\s*([A-D])/);
      const answer = answerMatch ? answerMatch[1] : '';
      const explMatch = qb.match(/\*\*Explanation:\*\*\s*([\s\S]*?)(?=\n\n\*\*Task|\s*$)/);
      const explanation = explMatch ? explMatch[1].trim() : '';
      const taskMatch = qb.match(/\*\*Task Statement:\*\*\s*([\d.]+)/);
      const taskStatement = taskMatch ? taskMatch[1] : '';
      questions.push({ num: qNum, scenario, options, answer, explanation, taskStatement });
    }
    scenarios.push({ num, name, context, domains, questions });
  }
  return scenarios;
}

function parseGlossary(md) {
  const entries = [];
  const lines = md.split('\n');
  let currentTerm = null;
  let currentDef = '';
  for (const line of lines) {
    const m = line.match(/^\*\*(.+?)\*\*\s*[—–-]+\s*(.+)/);
    if (m) {
      if (currentTerm) {
        entries.push(buildGlossaryEntry(currentTerm, currentDef));
      }
      currentTerm = m[1].trim();
      currentDef = m[2].trim();
    } else if (currentTerm && line.trim() && !line.startsWith('#') && !line.startsWith('---')) {
      currentDef += ' ' + line.trim();
    } else if (!line.trim() && currentTerm) {
      entries.push(buildGlossaryEntry(currentTerm, currentDef));
      currentTerm = null;
      currentDef = '';
    }
  }
  if (currentTerm) entries.push(buildGlossaryEntry(currentTerm, currentDef));
  return entries;
}

function buildGlossaryEntry(term, def) {
  const domainMatches = [...def.matchAll(/Domain\s*(\d)/g)];
  const domains = [...new Set(domainMatches.map(m => parseInt(m[1])))];
  const taskMatches = [...def.matchAll(/Task\s*([\d.]+)/g)];
  const taskStatements = [...new Set(taskMatches.map(m => m[1]))];
  const cleanDef = def.replace(/\s*\([^)]*Domain[^)]*\)\s*$/, '').trim();
  return { term, definition: cleanDef, domains, taskStatements };
}

function parseCurriculumModule(md) {
  const html = marked(md);
  const toc = [];
  const headingRegex = /<h([2-3])\s*(?:id="([^"]*)")?\s*>(.+?)<\/h[2-3]>/g;
  let m;
  while ((m = headingRegex.exec(html)) !== null) {
    const level = parseInt(m[1]);
    const text = m[3].replace(/<[^>]+>/g, '');
    const id = m[2] || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, text, level });
  }
  const sectionRegex = /### (\d+\.\d+)/g;
  const sections = [];
  while ((m = sectionRegex.exec(md)) !== null) {
    sections.push(m[1]);
  }
  let htmlWithIds = html.replace(/<h([2-3])>(.+?)<\/h[2-3]>/g, (match, level, text) => {
    const id = text.replace(/<[^>]+>/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return `<h${level} id="${id}">${text}</h${level}>`;
  });
  return { html: htmlWithIds, toc, sections };
}

function parseExercises(md) {
  const exercises = [];
  const blocks = md.split(/^## Exercise \d+/m).filter(b => b.trim());
  const headerMatches = [...md.matchAll(/^## Exercise (\d+):\s*(.+)$/gm)];
  for (let i = 0; i < headerMatches.length; i++) {
    const num = parseInt(headerMatches[i][1]);
    const title = headerMatches[i][2].trim();
    const block = blocks[i + 1] || '';
    const domainsMatch = block.match(/\*\*Domains practiced:\*\*\s*(.+)/);
    const domains = domainsMatch ? domainsMatch[1].trim() : '';
    const taskMatch = block.match(/\*\*Task statements:\*\*\s*(.+)/);
    const taskStatements = taskMatch ? taskMatch[1].trim() : '';
    const criteria = [];
    const criteriaSection = block.match(/### Success Criteria\n([\s\S]*?)(?=\n---|\n## |$)/);
    if (criteriaSection) {
      const criteriaLines = criteriaSection[1].match(/^- .+$/gm) || [];
      criteriaLines.forEach((line, idx) => {
        criteria.push({ id: `ex${num}-criteria-${idx}`, text: line.replace(/^- /, '') });
      });
    }
    const html = marked(block);
    exercises.push({ num, title, domains, taskStatements, criteria, html });
  }
  return exercises;
}

// ─── Load and cache all content at startup ──────────────────────────────────

function loadContent() {
  console.log('Loading curriculum content...');

  const programs = defaultPrograms;
  const builtIn = programs.find(p => p.builtIn);
  if (builtIn) {
    for (const mod of builtIn.modules) {
      const md = readMdFile(mod.file);
      if (md) {
        contentCache.modules[mod.id] = {
          ...mod,
          ...parseCurriculumModule(md)
        };
      }
    }
  }

  for (let d = 1; d <= 5; d++) {
    const md = readMdFile(`assessments_domain-0${d}-questions.md`);
    if (md) {
      contentCache.assessments[d] = parseAssessmentQuestions(md);
    }
  }

  const scenarioMd = readMdFile('assessments_exam-scenarios.md');
  if (scenarioMd) {
    contentCache.scenarios = parseExamScenarios(scenarioMd);
  }

  const glossaryMd = readMdFile('docs_key-concepts-glossary.md');
  if (glossaryMd) {
    contentCache.glossary = parseGlossary(glossaryMd);
  }

  const exerciseMd = readMdFile('docs_hands-on-exercises.md');
  if (exerciseMd) {
    contentCache.exercises = parseExercises(exerciseMd);
  }

  console.log(`  Modules: ${Object.keys(contentCache.modules).length}`);
  console.log(`  Assessment domains: ${Object.keys(contentCache.assessments).length}`);
  console.log(`  Exam scenarios: ${contentCache.scenarios.length}`);
  console.log(`  Glossary terms: ${contentCache.glossary.length}`);
  console.log(`  Exercises: ${contentCache.exercises.length}`);
  console.log('Content loaded.\n');
}

// ─── Activity tracking helper ───────────────────────────────────────────────

function recordActivity(stores) {
  const progress = stores.progress.get();
  const today = new Date().toISOString().split('T')[0];
  if (!progress.streak) {
    progress.streak = { currentStreak: 0, longestStreak: 0, lastActivity: null, activityDates: [] };
  }
  if (progress.streak.lastActivity === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (progress.streak.lastActivity === yesterday) {
    progress.streak.currentStreak++;
  } else {
    progress.streak.currentStreak = 1;
  }
  progress.streak.lastActivity = today;
  if (progress.streak.currentStreak > progress.streak.longestStreak) {
    progress.streak.longestStreak = progress.streak.currentStreak;
  }
  if (!progress.streak.activityDates.includes(today)) {
    progress.streak.activityDates.push(today);
  }
  stores.progress.set(progress);
}

// ─── API: Stats (consumed by LaunchPad — no auth required) ──────────────────

app.get('/api/stats', (req, res) => {
  // Public endpoint for LaunchPad integration — returns aggregate stats
  // If not logged in, return zeros
  if (!req.session.userId) {
    return res.json({ totalModules: 5, modulesCompleted: 0, quizzesTaken: 0, avgScore: 0, studyStreak: 0 });
  }
  const stores = getUserStores(req.session.userId);
  const progress = stores.progress.get();
  const quizHistory = stores.quizHistory.getAll();
  const modulesRead = Object.keys(progress.modulesRead || {});
  const completedModules = modulesRead.filter(m => (progress.modulesRead[m].percentComplete || 0) >= 100).length;
  const avgScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)
    : 0;
  res.json({
    totalModules: 5,
    modulesCompleted: completedModules,
    quizzesTaken: quizHistory.length,
    avgScore,
    studyStreak: (progress.streak || {}).currentStreak || 0
  });
});

// ─── All remaining API routes require authentication ────────────────────────

app.use('/api', (req, res, next) => {
  // Skip auth routes and stats
  if (req.path.startsWith('/auth/') || req.path === '/stats') return next();
  requireAuth(req, res, next);
});

// ─── API: Dashboard ─────────────────────────────────────────────────────────

app.get('/api/dashboard', (req, res) => {
  const stores = req.stores;
  const progress = stores.progress.get();
  const quizHistory = stores.quizHistory.getAll();
  const domainNames = {
    1: 'Agentic Architecture', 2: 'Tool Design & MCP',
    3: 'Claude Code Workflows', 4: 'Prompt Engineering',
    5: 'Context & Reliability'
  };
  const domainWeights = { 1: 27, 2: 18, 3: 20, 4: 20, 5: 15 };
  const domainMastery = [];
  for (let d = 1; d <= 5; d++) {
    const domainQuizzes = quizHistory.filter(q => q.domain === d);
    const avgQuiz = domainQuizzes.length > 0
      ? domainQuizzes.reduce((s, q) => s + q.percentage, 0) / domainQuizzes.length : 0;
    const moduleId = `module-0${d}`;
    const readPct = (progress.modulesRead?.[moduleId]?.percentComplete) || 0;
    const mastery = Math.round(0.7 * avgQuiz + 0.3 * readPct);
    domainMastery.push({
      domain: d, name: domainNames[d], weight: domainWeights[d],
      quizAvg: Math.round(avgQuiz), sectionsRead: Math.round(readPct), mastery
    });
  }
  const overallMastery = domainMastery.length > 0
    ? Math.round(domainMastery.reduce((s, d) => s + d.mastery * d.weight, 0) / 100) : 0;
  const recentQuizzes = quizHistory.slice(-5).reverse().map(q => ({
    id: q.id, domain: q.domain, domainName: domainNames[q.domain] || q.type,
    date: q.date, score: q.score, total: q.total, percentage: q.percentage
  }));
  const totalCorrect = quizHistory.reduce((s, q) => s + q.score, 0);
  const totalAnswered = quizHistory.reduce((s, q) => s + q.total, 0);
  res.json({
    domainMastery, overallMastery,
    streak: progress.streak || { currentStreak: 0, longestStreak: 0 },
    recentQuizzes,
    studyPlanPhase: progress.studyPlan?.currentPhase || 1,
    totalQuestionsAnswered: totalAnswered,
    totalCorrect,
    programs: stores.programs.getAll().length
  });
});

// ─── API: Programs ──────────────────────────────────────────────────────────

app.get('/api/programs', (req, res) => {
  res.json(req.stores.programs.getAll());
});

app.post('/api/programs', (req, res) => {
  const { name, description } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name required' });
  }
  const program = req.stores.programs.add({
    name: name.trim().slice(0, 200),
    description: (description || '').trim().slice(0, 1000),
    builtIn: false, modules: [], created: new Date().toISOString()
  });
  res.json(program);
});

app.delete('/api/programs/:id', (req, res) => {
  const prog = req.stores.programs.getById(req.params.id);
  if (!prog) return res.status(404).json({ error: 'Not found' });
  if (prog.builtIn) return res.status(400).json({ error: 'Cannot delete built-in program' });
  req.stores.programs.remove(req.params.id);
  res.json({ ok: true });
});

app.post('/api/programs/:id/modules', (req, res) => {
  const prog = req.stores.programs.getById(req.params.id);
  if (!prog) return res.status(404).json({ error: 'Not found' });
  if (prog.builtIn) return res.status(400).json({ error: 'Cannot modify built-in program' });
  const { title, content } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title required' });
  }
  const mod = {
    id: uuidv4(),
    title: title.trim().slice(0, 200),
    content: (content || '').slice(0, 50000),
    created: new Date().toISOString()
  };
  prog.modules.push(mod);
  req.stores.programs.update(prog.id, { modules: prog.modules });
  res.json(mod);
});

// ─── API: Curriculum ────────────────────────────────────────────────────────

app.get('/api/curriculum', (req, res) => {
  const progress = req.stores.progress.get();
  const modules = Object.values(contentCache.modules).map(m => ({
    id: m.id, title: m.title, domain: m.domain, weight: m.weight,
    sections: m.sections,
    progress: progress.modulesRead?.[m.id] || { sectionsCompleted: [], percentComplete: 0 }
  }));
  res.json(modules);
});

app.get('/api/curriculum/:moduleId', (req, res) => {
  const mod = contentCache.modules[req.params.moduleId];
  if (!mod) {
    const programs = req.stores.programs.getAll();
    for (const p of programs) {
      const cm = p.modules.find(m => m.id === req.params.moduleId);
      if (cm && cm.content) {
        const html = marked(cm.content);
        return res.json({ id: cm.id, title: cm.title, html, toc: [], sections: [], custom: true });
      }
    }
    return res.status(404).json({ error: 'Module not found' });
  }
  const progress = req.stores.progress.get();
  res.json({
    id: mod.id, title: mod.title, domain: mod.domain, weight: mod.weight,
    html: mod.html, toc: mod.toc, sections: mod.sections,
    progress: progress.modulesRead?.[mod.id] || { sectionsCompleted: [], percentComplete: 0 }
  });
});

app.put('/api/curriculum/:moduleId/progress', (req, res) => {
  const { sectionId, completed } = req.body;
  const mod = contentCache.modules[req.params.moduleId];
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  const progress = req.stores.progress.get();
  if (!progress.modulesRead) progress.modulesRead = {};
  if (!progress.modulesRead[mod.id]) {
    progress.modulesRead[mod.id] = { sectionsCompleted: [], percentComplete: 0, lastRead: null };
  }
  const modProgress = progress.modulesRead[mod.id];
  if (completed && !modProgress.sectionsCompleted.includes(sectionId)) {
    modProgress.sectionsCompleted.push(sectionId);
  } else if (!completed) {
    modProgress.sectionsCompleted = modProgress.sectionsCompleted.filter(s => s !== sectionId);
  }
  modProgress.percentComplete = mod.sections.length > 0
    ? Math.round((modProgress.sectionsCompleted.length / mod.sections.length) * 100) : 0;
  modProgress.lastRead = new Date().toISOString();
  req.stores.progress.set(progress);
  recordActivity(req.stores);
  res.json(modProgress);
});

// ─── API: Assessments ───────────────────────────────────────────────────────

app.get('/api/assessments/domains', (req, res) => {
  const quizHistory = req.stores.quizHistory.getAll();
  const domainNames = {
    1: 'Agentic Architecture & Orchestration', 2: 'Tool Design & MCP Integration',
    3: 'Claude Code Configuration & Workflows', 4: 'Prompt Engineering & Structured Output',
    5: 'Context Management & Reliability'
  };
  const domains = [];
  for (let d = 1; d <= 5; d++) {
    const qs = contentCache.assessments[d] || [];
    const history = quizHistory.filter(q => q.domain === d && q.type === 'domain');
    const lastAttempt = history.length > 0 ? history[history.length - 1] : null;
    domains.push({
      domain: d, name: domainNames[d], questionCount: qs.length,
      lastScore: lastAttempt ? lastAttempt.percentage : null,
      attempts: history.length
    });
  }
  res.json(domains);
});

app.get('/api/assessments/domain/:num', (req, res) => {
  const d = parseInt(req.params.num);
  const questions = contentCache.assessments[d];
  if (!questions) return res.status(404).json({ error: 'Domain not found' });
  const safe = questions.map(q => ({
    num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
  }));
  res.json({ domain: d, questions: safe });
});

app.get('/api/assessments/scenarios', (req, res) => {
  const safe = contentCache.scenarios.map(s => ({
    num: s.num, name: s.name, context: s.context, domains: s.domains,
    questionCount: s.questions.length,
    questions: s.questions.map(q => ({
      num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
    }))
  }));
  res.json(safe);
});

app.get('/api/assessments/exam-simulation', (req, res) => {
  const shuffled = [...contentCache.scenarios].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  const safe = selected.map(s => ({
    num: s.num, name: s.name, context: s.context, domains: s.domains,
    questions: s.questions.map(q => ({
      num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
    }))
  }));
  res.json(safe);
});

app.post('/api/assessments/submit', (req, res) => {
  const { type, domain, scenarioNums, answers, timeSpentSeconds } = req.body;
  let correctAnswers = [];
  if (type === 'domain') {
    correctAnswers = (contentCache.assessments[domain] || []).map(q => ({
      questionNum: q.num, correct: q.answer, explanation: q.explanation, taskStatement: q.taskStatement
    }));
  } else if (type === 'scenario' || type === 'exam-simulation') {
    const nums = scenarioNums || [];
    for (const sn of nums) {
      const scenario = contentCache.scenarios.find(s => s.num === sn);
      if (scenario) {
        for (const q of scenario.questions) {
          correctAnswers.push({
            questionNum: q.num, correct: q.answer, explanation: q.explanation, taskStatement: q.taskStatement
          });
        }
      }
    }
  }
  const results = [];
  let score = 0;
  for (const ans of (answers || [])) {
    const ca = correctAnswers.find(c => String(c.questionNum) === String(ans.questionNum));
    const isCorrect = ca ? ans.selected === ca.correct : false;
    if (isCorrect) score++;
    results.push({
      questionNum: ans.questionNum, selected: ans.selected,
      correct: ca ? ca.correct : '?', isCorrect,
      explanation: ca ? ca.explanation : '', taskStatement: ca ? ca.taskStatement : ''
    });
  }
  const total = answers ? answers.length : 0;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const record = {
    id: uuidv4(), type: type || 'domain', domain: domain || null,
    date: new Date().toISOString(), score, total, percentage,
    answers: results, timeSpentSeconds: timeSpentSeconds || 0
  };
  req.stores.quizHistory.add(record);
  recordActivity(req.stores);
  res.json(record);
});

// ─── API: Quiz History ──────────────────────────────────────────────────────

app.get('/api/quiz-history', (req, res) => {
  res.json(req.stores.quizHistory.getAll());
});

// ─── API: Glossary ──────────────────────────────────────────────────────────

app.get('/api/glossary', (req, res) => {
  res.json(contentCache.glossary);
});

// ─── API: Study Plan ────────────────────────────────────────────────────────

app.get('/api/study-plan', (req, res) => {
  const progress = req.stores.progress.get();
  res.json(progress.studyPlan || defaultProgress.studyPlan);
});

app.put('/api/study-plan', (req, res) => {
  const { phase, itemId, completed } = req.body;
  const progress = req.stores.progress.get();
  if (!progress.studyPlan) progress.studyPlan = JSON.parse(JSON.stringify(defaultProgress.studyPlan));
  const phaseKey = `phase-${phase}`;
  const cp = progress.studyPlan.checkpoints[phaseKey];
  if (!cp) return res.status(400).json({ error: 'Invalid phase' });
  if (completed && !cp.completed.includes(itemId)) {
    cp.completed.push(itemId);
  } else if (!completed) {
    cp.completed = cp.completed.filter(i => i !== itemId);
  }
  const phases = Object.keys(progress.studyPlan.checkpoints);
  for (let i = phases.length - 1; i >= 0; i--) {
    const p = progress.studyPlan.checkpoints[phases[i]];
    if (p.completed.length > 0) {
      progress.studyPlan.currentPhase = i + 1;
      break;
    }
  }
  req.stores.progress.set(progress);
  recordActivity(req.stores);
  res.json(progress.studyPlan);
});

// ─── API: Exercises ─────────────────────────────────────────────────────────

app.get('/api/exercises', (req, res) => {
  const progress = req.stores.progress.get();
  const exercises = contentCache.exercises.map(ex => ({
    ...ex,
    completedCriteria: (progress.exercises?.[`exercise-${ex.num}`]?.completed) || []
  }));
  res.json(exercises);
});

app.put('/api/exercises/:num/checklist', (req, res) => {
  const { criteriaId, completed } = req.body;
  const progress = req.stores.progress.get();
  if (!progress.exercises) progress.exercises = {};
  const key = `exercise-${req.params.num}`;
  if (!progress.exercises[key]) progress.exercises[key] = { completed: [] };
  const ex = progress.exercises[key];
  if (completed && !ex.completed.includes(criteriaId)) {
    ex.completed.push(criteriaId);
  } else if (!completed) {
    ex.completed = ex.completed.filter(c => c !== criteriaId);
  }
  req.stores.progress.set(progress);
  recordActivity(req.stores);
  res.json(ex);
});

// ─── API: Notes ─────────────────────────────────────────────────────────────

app.get('/api/notes', (req, res) => {
  const { targetId } = req.query;
  if (targetId) {
    res.json(req.stores.notes.query(n => n.targetId === targetId));
  } else {
    res.json(req.stores.notes.getAll());
  }
});

app.post('/api/notes', (req, res) => {
  const { targetId, sectionId, content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content required' });
  }
  const note = req.stores.notes.add({
    targetId: (targetId || '').slice(0, 200),
    sectionId: (sectionId || '').slice(0, 200),
    content: content.slice(0, 10000),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  });
  res.json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const note = req.stores.notes.update(req.params.id, {
    ...req.body, updated: new Date().toISOString()
  });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  req.stores.notes.remove(req.params.id);
  res.json({ ok: true });
});

// ─── Start server ───────────────────────────────────────────────────────────

loadContent();

app.listen(PORT, () => {
  console.log(`Claude University running at http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Stats API: http://localhost:${PORT}/api/stats\n`);
});
