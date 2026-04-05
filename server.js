require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
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
const PROGRAMS_DIR = path.join(ROOT, 'programs');

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

// ─── Program Discovery ─────────────────────────────────────────────────────

const programManifests = {};
const contentCache = {};

function discoverPrograms() {
  console.log('Discovering programs...');

  // Scan a directory for subdirs containing program.json
  function scanDir(baseDir) {
    if (!fs.existsSync(baseDir)) return;
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dirPath = path.join(baseDir, entry.name);
      const manifestPath = path.join(dirPath, 'program.json');
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const programId = manifest.id || entry.name;
        manifest._basePath = dirPath;
        programManifests[programId] = manifest;
        console.log(`  Found program: ${manifest.name} (${programId})`);
      } catch (e) {
        console.warn(`  Could not load manifest for ${entry.name}:`, e.message);
      }
    }
  }

  // Primary: programs/ directory
  scanDir(PROGRAMS_DIR);

  // Secondary: top-level ##-* directories (e.g. 02-LeanAISigma/)
  const rootEntries = fs.readdirSync(ROOT, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (!entry.isDirectory() || !/^\d{2}-/.test(entry.name)) continue;
    const dirPath = path.join(ROOT, entry.name);
    const manifestPath = path.join(dirPath, 'program.json');
    if (!fs.existsSync(manifestPath)) continue;
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const programId = manifest.id || entry.name;
      manifest._basePath = dirPath;
      programManifests[programId] = manifest;
      console.log(`  Found program: ${manifest.name} (${programId})`);
    } catch (e) {
      console.warn(`  Could not load manifest for ${entry.name}:`, e.message);
    }
  }

  console.log(`  Total programs discovered: ${Object.keys(programManifests).length}\n`);
}

// ─── Markdown file reader (program-scoped) ──────────────────────────────────

function readMdFile(programId, relativePath) {
  const manifest = programManifests[programId];
  const basePath = manifest && manifest._basePath ? manifest._basePath : path.join(PROGRAMS_DIR, programId);
  const fp = path.join(basePath, relativePath);
  if (!fs.existsSync(fp)) return '';
  return fs.readFileSync(fp, 'utf8');
}

// ─── Markdown parsers ────────────────────────────────────────────────────────

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

// ─── Load all program content at startup ────────────────────────────────────

function loadAllProgramContent() {
  console.log('Loading program content...');
  for (const [programId, manifest] of Object.entries(programManifests)) {
    console.log(`  Loading content for: ${manifest.name}`);
    const cache = {
      modules: {},
      assessments: {},
      scenarios: [],
      glossary: [],
      exercises: [],
      studyPlan: null,
      domains: null
    };

    // Load curriculum modules from manifest
    if (manifest.modules && Array.isArray(manifest.modules)) {
      for (const mod of manifest.modules) {
        const md = readMdFile(programId, mod.file);
        if (md) {
          cache.modules[mod.id] = {
            ...mod,
            ...parseCurriculumModule(md)
          };
        }
      }
    }

    // Load assessment domain files from manifest
    if (manifest.assessments && manifest.assessments.domainFiles) {
      for (const [domainNum, filePath] of Object.entries(manifest.assessments.domainFiles)) {
        const md = readMdFile(programId, filePath);
        if (md) {
          cache.assessments[domainNum] = parseAssessmentQuestions(md);
        }
      }
    }

    // Load exam scenarios from manifest
    if (manifest.assessments && manifest.assessments.scenarioFile) {
      const scenarioMd = readMdFile(programId, manifest.assessments.scenarioFile);
      if (scenarioMd) {
        cache.scenarios = parseExamScenarios(scenarioMd);
      }
    }

    // Load glossary from manifest
    if (manifest.resources && manifest.resources.glossary) {
      const glossaryMd = readMdFile(programId, manifest.resources.glossary);
      if (glossaryMd) {
        cache.glossary = parseGlossary(glossaryMd);
      }
    }

    // Load exercises from manifest
    if (manifest.resources && manifest.resources.exercises) {
      const exerciseMd = readMdFile(programId, manifest.resources.exercises);
      if (exerciseMd) {
        cache.exercises = parseExercises(exerciseMd);
      }
    }

    contentCache[programId] = cache;

    console.log(`    Modules: ${Object.keys(cache.modules).length}`);
    console.log(`    Assessment domains: ${Object.keys(cache.assessments).length}`);
    console.log(`    Exam scenarios: ${cache.scenarios.length}`);
    console.log(`    Glossary terms: ${cache.glossary.length}`);
    console.log(`    Exercises: ${cache.exercises.length}`);
  }
  console.log('All program content loaded.\n');
}

// ─── Default progress builder (from manifest study plan) ────────────────────

function buildDefaultProgress(manifest) {
  const progress = {
    modulesRead: {},
    streak: { currentStreak: 0, longestStreak: 0, lastActivity: null, activityDates: [] },
    studyPlan: {
      currentPhase: 1,
      checkpoints: {}
    },
    exercises: {}
  };

  if (manifest && manifest.studyPlan && manifest.studyPlan.phases) {
    for (const phase of manifest.studyPlan.phases) {
      progress.studyPlan.checkpoints[phase.id] = {
        items: phase.items.map(item => item.id),
        completed: []
      };
    }
  }

  return progress;
}

// ─── Per-user store factory ─────────────────────────────────────────────────

// Cache open stores so we don't re-read files on every request
const storeCache = {};

function getUserStores(userId) {
  if (storeCache[userId]) return storeCache[userId];
  const dir = getUserDataDir(userId);
  const stores = {
    quizHistory: new DataStore(dir, 'quiz-history.json', []),
    notes:       new DataStore(dir, 'notes.json', []),
    progress:    new ObjectStore(dir, 'progress.json', {}),
  };
  storeCache[userId] = stores;
  return stores;
}

// Per-program store cache
const programStoreCache = {};

function getUserProgramStores(userId, programId) {
  const cacheKey = `${userId}:${programId}`;
  if (programStoreCache[cacheKey]) return programStoreCache[cacheKey];
  const dir = path.join(DATA_DIR, 'users', userId, 'programs', programId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const manifest = programManifests[programId];
  const defaultProg = buildDefaultProgress(manifest);
  const stores = {
    quizHistory: new DataStore(dir, 'quiz-history.json', []),
    notes:       new DataStore(dir, 'notes.json', []),
    progress:    new ObjectStore(dir, 'progress.json', JSON.parse(JSON.stringify(defaultProg))),
  };
  programStoreCache[cacheKey] = stores;
  return stores;
}

function getUserEnrollmentStore(userId) {
  const dir = getUserDataDir(userId);
  return new DataStore(dir, 'enrollment.json', []);
}

// ─── Data migration (old flat format to program-scoped) ─────────────────────

function migrateUserData() {
  console.log('Checking for user data migrations...');
  const usersDir = path.join(DATA_DIR, 'users');
  if (!fs.existsSync(usersDir)) {
    console.log('  No users directory found, skipping migration.\n');
    return;
  }
  const userDirs = fs.readdirSync(usersDir, { withFileTypes: true });
  let migrated = 0;
  for (const entry of userDirs) {
    if (!entry.isDirectory()) continue;
    const userId = entry.name;
    const userDir = path.join(usersDir, userId);
    const oldProgressPath = path.join(userDir, 'progress.json');
    const newProgramDir = path.join(userDir, 'programs', 'claude-university');
    const newProgressPath = path.join(newProgramDir, 'progress.json');

    // Only migrate if old format exists AND new format does NOT
    if (fs.existsSync(oldProgressPath) && !fs.existsSync(newProgressPath)) {
      console.log(`  Migrating user ${userId} to program-scoped format...`);
      if (!fs.existsSync(newProgramDir)) fs.mkdirSync(newProgramDir, { recursive: true });

      // Copy progress.json
      try {
        fs.copyFileSync(oldProgressPath, newProgressPath);
      } catch (e) {
        console.warn(`    Could not copy progress.json: ${e.message}`);
      }

      // Copy quiz-history.json if it exists
      const oldQuizPath = path.join(userDir, 'quiz-history.json');
      if (fs.existsSync(oldQuizPath)) {
        try {
          fs.copyFileSync(oldQuizPath, path.join(newProgramDir, 'quiz-history.json'));
        } catch (e) {
          console.warn(`    Could not copy quiz-history.json: ${e.message}`);
        }
      }

      // Copy notes.json if it exists
      const oldNotesPath = path.join(userDir, 'notes.json');
      if (fs.existsSync(oldNotesPath)) {
        try {
          fs.copyFileSync(oldNotesPath, path.join(newProgramDir, 'notes.json'));
        } catch (e) {
          console.warn(`    Could not copy notes.json: ${e.message}`);
        }
      }

      // Create enrollment.json
      const enrollmentPath = path.join(userDir, 'enrollment.json');
      if (!fs.existsSync(enrollmentPath)) {
        const enrollment = [{
          programId: 'claude-university',
          enrolledAt: new Date().toISOString(),
          status: 'active'
        }];
        try {
          fs.writeFileSync(enrollmentPath, JSON.stringify(enrollment, null, 2), 'utf8');
        } catch (e) {
          console.warn(`    Could not create enrollment.json: ${e.message}`);
        }
      }

      migrated++;
      console.log(`    Done.`);
    }
  }
  if (migrated === 0) {
    console.log('  No migrations needed.');
  } else {
    console.log(`  Migrated ${migrated} user(s).`);
  }
  console.log('');
}

// ─── Authentication Middleware ───────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  req.stores = getUserStores(req.session.userId);
  next();
}

// ─── Program Middleware ─────────────────────────────────────────────────────

function requireProgram(req, res, next) {
  const { programId } = req.params;
  if (!contentCache[programId]) {
    return res.status(404).json({ error: 'Program not found' });
  }
  req.programId = programId;
  req.programCache = contentCache[programId];
  req.programManifest = programManifests[programId];
  const userId = req.session.userId;
  req.programStores = getUserProgramStores(userId, programId);
  next();
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

// ─── API: Stats (consumed by LaunchPad — no auth required) ──────────────────

app.get('/api/stats', (req, res) => {
  // Public endpoint for LaunchPad integration — returns aggregate stats
  // If not logged in, return zeros
  if (!req.session.userId) {
    return res.json({ totalModules: 0, modulesCompleted: 0, quizzesTaken: 0, avgScore: 0, studyStreak: 0 });
  }
  const userId = req.session.userId;
  const enrollmentStore = getUserEnrollmentStore(userId);
  const enrollments = enrollmentStore.getAll().filter(e => e.status === 'active');

  let totalModules = 0;
  let modulesCompleted = 0;
  let quizzesTaken = 0;
  let totalScore = 0;
  let bestStreak = 0;

  for (const enrollment of enrollments) {
    const manifest = programManifests[enrollment.programId];
    if (!manifest) continue;
    const programStores = getUserProgramStores(userId, enrollment.programId);
    const progress = programStores.progress.get();
    const quizHistory = programStores.quizHistory.getAll();

    const moduleCount = manifest.modules ? manifest.modules.length : 0;
    totalModules += moduleCount;

    const modulesRead = Object.keys(progress.modulesRead || {});
    modulesCompleted += modulesRead.filter(m => (progress.modulesRead[m].percentComplete || 0) >= 100).length;

    quizzesTaken += quizHistory.length;
    totalScore += quizHistory.reduce((s, q) => s + q.percentage, 0);

    const streak = (progress.streak || {}).currentStreak || 0;
    if (streak > bestStreak) bestStreak = streak;
  }

  const avgScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

  res.json({
    totalModules,
    modulesCompleted,
    quizzesTaken,
    avgScore,
    studyStreak: bestStreak
  });
});

// ─── All remaining API routes require authentication ────────────────────────

app.use('/api', (req, res, next) => {
  // Skip auth routes and stats
  if (req.path.startsWith('/auth/') || req.path === '/stats') return next();
  requireAuth(req, res, next);
});

// ─── API: Academy — Program listing and enrollment ──────────────────────────

app.get('/api/academy/programs', (req, res) => {
  const userId = req.session.userId;
  const enrollmentStore = getUserEnrollmentStore(userId);
  const enrollments = enrollmentStore.getAll();
  const programs = Object.entries(programManifests).map(([programId, manifest]) => {
    const enrollment = enrollments.find(e => e.programId === programId);
    return {
      id: programId,
      name: manifest.name,
      shortName: manifest.shortName || manifest.name,
      description: manifest.description || '',
      icon: manifest.icon || '',
      color: manifest.color || '#4a7c59',
      version: manifest.version || '1.0.0',
      builtIn: manifest.builtIn || false,
      domainCount: manifest.domains ? Object.keys(manifest.domains).length : 0,
      moduleCount: manifest.modules ? manifest.modules.length : 0,
      enrolled: !!enrollment,
      enrollmentStatus: enrollment ? enrollment.status : null,
      enrolledAt: enrollment ? enrollment.enrolledAt : null
    };
  });
  res.json(programs);
});

app.post('/api/academy/enroll/:programId', (req, res) => {
  const { programId } = req.params;
  if (!programManifests[programId]) {
    return res.status(404).json({ error: 'Program not found' });
  }
  const userId = req.session.userId;
  const enrollmentStore = getUserEnrollmentStore(userId);
  const enrollments = enrollmentStore.getAll();
  const existing = enrollments.find(e => e.programId === programId);
  if (existing) {
    if (existing.status === 'active') {
      return res.json({ message: 'Already enrolled', enrollment: existing });
    }
    // Re-activate if previously inactive
    existing.status = 'active';
    existing.reactivatedAt = new Date().toISOString();
    enrollmentStore.update(existing.id, existing);
    return res.json({ message: 'Enrollment reactivated', enrollment: existing });
  }
  const enrollment = enrollmentStore.add({
    programId,
    enrolledAt: new Date().toISOString(),
    status: 'active'
  });
  // Initialize program stores (creates default progress)
  getUserProgramStores(userId, programId);
  res.json({ message: 'Enrolled successfully', enrollment });
});

app.get('/api/academy/enrollment', (req, res) => {
  const userId = req.session.userId;
  const enrollmentStore = getUserEnrollmentStore(userId);
  const enrollments = enrollmentStore.getAll();
  const result = enrollments.map(enrollment => {
    const manifest = programManifests[enrollment.programId];
    if (!manifest) {
      return { ...enrollment, programName: 'Unknown Program', progress: null };
    }
    const programStores = getUserProgramStores(userId, enrollment.programId);
    const progress = programStores.progress.get();
    const quizHistory = programStores.quizHistory.getAll();

    // Build progress summary
    const moduleCount = manifest.modules ? manifest.modules.length : 0;
    const modulesRead = Object.keys(progress.modulesRead || {});
    const completedModules = modulesRead.filter(m => (progress.modulesRead[m].percentComplete || 0) >= 100).length;
    const avgScore = quizHistory.length > 0
      ? Math.round(quizHistory.reduce((s, q) => s + q.percentage, 0) / quizHistory.length)
      : 0;

    return {
      ...enrollment,
      programName: manifest.name,
      programShortName: manifest.shortName || manifest.name,
      programIcon: manifest.icon || '',
      programColor: manifest.color || '#4a7c59',
      progressSummary: {
        totalModules: moduleCount,
        modulesCompleted: completedModules,
        quizzesTaken: quizHistory.length,
        avgScore,
        studyStreak: (progress.streak || {}).currentStreak || 0
      }
    };
  });
  res.json(result);
});

// ─── API: Program-scoped routes ─────────────────────────────────────────────

// Dashboard
app.get('/api/programs/:programId/dashboard', requireProgram, (req, res) => {
  const stores = req.programStores;
  const manifest = req.programManifest;
  const cache = req.programCache;
  const progress = stores.progress.get();
  const quizHistory = stores.quizHistory.getAll();

  const domainEntries = manifest.domains || {};
  const domainMastery = [];

  for (const [d, domainInfo] of Object.entries(domainEntries)) {
    const domainNum = parseInt(d);
    const domainQuizzes = quizHistory.filter(q => q.domain === domainNum);
    const avgQuiz = domainQuizzes.length > 0
      ? domainQuizzes.reduce((s, q) => s + q.percentage, 0) / domainQuizzes.length : 0;
    // Find the module matching this domain
    const manifestModule = (manifest.modules || []).find(m => m.domain === domainNum);
    const moduleId = manifestModule ? manifestModule.id : `module-0${d}`;
    const readPct = (progress.modulesRead?.[moduleId]?.percentComplete) || 0;
    const mastery = Math.round(0.7 * avgQuiz + 0.3 * readPct);
    domainMastery.push({
      domain: domainNum, name: domainInfo.name, weight: domainInfo.weight,
      quizAvg: Math.round(avgQuiz), sectionsRead: Math.round(readPct), mastery
    });
  }

  const totalWeight = domainMastery.reduce((s, d) => s + d.weight, 0);
  const overallMastery = totalWeight > 0
    ? Math.round(domainMastery.reduce((s, d) => s + d.mastery * d.weight, 0) / totalWeight) : 0;

  const domainNames = {};
  for (const [d, info] of Object.entries(domainEntries)) {
    domainNames[d] = info.name;
  }

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
    totalCorrect
  });
});

// Curriculum
app.get('/api/programs/:programId/curriculum', requireProgram, (req, res) => {
  const stores = req.programStores;
  const cache = req.programCache;
  const progress = stores.progress.get();
  const modules = Object.values(cache.modules).map(m => ({
    id: m.id, title: m.title, domain: m.domain, weight: m.weight,
    sections: m.sections,
    progress: progress.modulesRead?.[m.id] || { sectionsCompleted: [], percentComplete: 0 }
  }));
  res.json(modules);
});

app.get('/api/programs/:programId/curriculum/:moduleId', requireProgram, (req, res) => {
  const cache = req.programCache;
  const mod = cache.modules[req.params.moduleId];
  if (!mod) {
    return res.status(404).json({ error: 'Module not found' });
  }
  const progress = req.programStores.progress.get();
  res.json({
    id: mod.id, title: mod.title, domain: mod.domain, weight: mod.weight,
    html: mod.html, toc: mod.toc, sections: mod.sections,
    progress: progress.modulesRead?.[mod.id] || { sectionsCompleted: [], percentComplete: 0 }
  });
});

app.put('/api/programs/:programId/curriculum/:moduleId/progress', requireProgram, (req, res) => {
  const { sectionId, completed } = req.body;
  const cache = req.programCache;
  const mod = cache.modules[req.params.moduleId];
  if (!mod) return res.status(404).json({ error: 'Module not found' });
  const stores = req.programStores;
  const progress = stores.progress.get();
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
  stores.progress.set(progress);
  recordActivity(stores);
  res.json(modProgress);
});

// Assessments
app.get('/api/programs/:programId/assessments/domains', requireProgram, (req, res) => {
  const cache = req.programCache;
  const manifest = req.programManifest;
  const quizHistory = req.programStores.quizHistory.getAll();
  const domainEntries = manifest.domains || {};
  const domains = [];
  for (const [d, domainInfo] of Object.entries(domainEntries)) {
    const domainNum = parseInt(d);
    const qs = cache.assessments[d] || [];
    const history = quizHistory.filter(q => q.domain === domainNum && q.type === 'domain');
    const lastAttempt = history.length > 0 ? history[history.length - 1] : null;
    domains.push({
      domain: domainNum, name: domainInfo.name, questionCount: qs.length,
      lastScore: lastAttempt ? lastAttempt.percentage : null,
      attempts: history.length
    });
  }
  res.json(domains);
});

app.get('/api/programs/:programId/assessments/domain/:num', requireProgram, (req, res) => {
  const d = parseInt(req.params.num);
  const cache = req.programCache;
  const questions = cache.assessments[d];
  if (!questions) return res.status(404).json({ error: 'Domain not found' });
  const safe = questions.map(q => ({
    num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
  }));
  res.json({ domain: d, questions: safe });
});

app.get('/api/programs/:programId/assessments/scenarios', requireProgram, (req, res) => {
  const cache = req.programCache;
  const safe = cache.scenarios.map(s => ({
    num: s.num, name: s.name, context: s.context, domains: s.domains,
    questionCount: s.questions.length,
    questions: s.questions.map(q => ({
      num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
    }))
  }));
  res.json(safe);
});

app.get('/api/programs/:programId/assessments/exam-simulation', requireProgram, (req, res) => {
  const cache = req.programCache;
  const shuffled = [...cache.scenarios].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 4);
  const safe = selected.map(s => ({
    num: s.num, name: s.name, context: s.context, domains: s.domains,
    questions: s.questions.map(q => ({
      num: q.num, scenario: q.scenario, options: q.options, taskStatement: q.taskStatement
    }))
  }));
  res.json(safe);
});

app.post('/api/programs/:programId/assessments/submit', requireProgram, (req, res) => {
  const { type, domain, scenarioNums, answers, timeSpentSeconds } = req.body;
  const cache = req.programCache;
  let correctAnswers = [];
  if (type === 'domain') {
    correctAnswers = (cache.assessments[domain] || []).map(q => ({
      questionNum: q.num, correct: q.answer, explanation: q.explanation, taskStatement: q.taskStatement
    }));
  } else if (type === 'scenario' || type === 'exam-simulation') {
    const nums = scenarioNums || [];
    for (const sn of nums) {
      const scenario = cache.scenarios.find(s => s.num === sn);
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
  req.programStores.quizHistory.add(record);
  recordActivity(req.programStores);
  res.json(record);
});

// Quiz History
app.get('/api/programs/:programId/quiz-history', requireProgram, (req, res) => {
  res.json(req.programStores.quizHistory.getAll());
});

// Glossary
app.get('/api/programs/:programId/glossary', requireProgram, (req, res) => {
  res.json(req.programCache.glossary);
});

// Study Plan
app.get('/api/programs/:programId/study-plan', requireProgram, (req, res) => {
  const stores = req.programStores;
  const manifest = req.programManifest;
  const progress = stores.progress.get();
  const defaultProg = buildDefaultProgress(manifest);
  const studyPlan = progress.studyPlan || defaultProg.studyPlan;

  // Attach phase metadata from manifest
  const phases = [];
  if (manifest.studyPlan && manifest.studyPlan.phases) {
    for (const phase of manifest.studyPlan.phases) {
      const checkpoint = studyPlan.checkpoints[phase.id] || { items: phase.items.map(i => i.id), completed: [] };
      phases.push({
        id: phase.id,
        name: phase.name,
        description: phase.description || '',
        milestone: phase.milestone || '',
        items: phase.items,
        completed: checkpoint.completed
      });
    }
  }

  res.json({
    currentPhase: studyPlan.currentPhase || 1,
    checkpoints: studyPlan.checkpoints,
    phases
  });
});

app.put('/api/programs/:programId/study-plan', requireProgram, (req, res) => {
  const { phase, itemId, completed } = req.body;
  const stores = req.programStores;
  const manifest = req.programManifest;
  const progress = stores.progress.get();
  const defaultProg = buildDefaultProgress(manifest);
  if (!progress.studyPlan) progress.studyPlan = JSON.parse(JSON.stringify(defaultProg.studyPlan));
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
  stores.progress.set(progress);
  recordActivity(stores);
  res.json(progress.studyPlan);
});

// Exercises
app.get('/api/programs/:programId/exercises', requireProgram, (req, res) => {
  const stores = req.programStores;
  const cache = req.programCache;
  const progress = stores.progress.get();
  const exercises = cache.exercises.map(ex => ({
    ...ex,
    completedCriteria: (progress.exercises?.[`exercise-${ex.num}`]?.completed) || []
  }));
  res.json(exercises);
});

app.put('/api/programs/:programId/exercises/:num/checklist', requireProgram, (req, res) => {
  const { criteriaId, completed } = req.body;
  const stores = req.programStores;
  const progress = stores.progress.get();
  if (!progress.exercises) progress.exercises = {};
  const key = `exercise-${req.params.num}`;
  if (!progress.exercises[key]) progress.exercises[key] = { completed: [] };
  const ex = progress.exercises[key];
  if (completed && !ex.completed.includes(criteriaId)) {
    ex.completed.push(criteriaId);
  } else if (!completed) {
    ex.completed = ex.completed.filter(c => c !== criteriaId);
  }
  stores.progress.set(progress);
  recordActivity(stores);
  res.json(ex);
});

// Notes
app.get('/api/programs/:programId/notes', requireProgram, (req, res) => {
  const { targetId } = req.query;
  if (targetId) {
    res.json(req.programStores.notes.query(n => n.targetId === targetId));
  } else {
    res.json(req.programStores.notes.getAll());
  }
});

app.post('/api/programs/:programId/notes', requireProgram, (req, res) => {
  const { targetId, sectionId, content } = req.body;
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Content required' });
  }
  const note = req.programStores.notes.add({
    targetId: (targetId || '').slice(0, 200),
    sectionId: (sectionId || '').slice(0, 200),
    content: content.slice(0, 10000),
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  });
  res.json(note);
});

app.put('/api/programs/:programId/notes/:id', requireProgram, (req, res) => {
  const note = req.programStores.notes.update(req.params.id, {
    ...req.body, updated: new Date().toISOString()
  });
  if (!note) return res.status(404).json({ error: 'Not found' });
  res.json(note);
});

app.delete('/api/programs/:programId/notes/:id', requireProgram, (req, res) => {
  req.programStores.notes.remove(req.params.id);
  res.json({ ok: true });
});

// ─── Admin API (local only) ──────────────────────────────────────────────────

function requireLocal(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Admin not available in production' });
  }
  next();
}

function git(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 30000 }).trim();
}

app.get('/api/admin/status', requireLocal, (req, res) => {
  try {
    const branch = git('git rev-parse --abbrev-ref HEAD');
    const localCommit = git('git log -1 --format="%h|%s|%ci"');
    const [localHash, localMsg, localDate] = localCommit.split('|');

    let mainCommit = { hash: '', message: '', date: '' };
    try {
      const mc = git('git log main -1 --format="%h|%s|%ci"');
      const [mHash, mMsg, mDate] = mc.split('|');
      mainCommit = { hash: mHash, message: mMsg, date: mDate };
    } catch (e) { /* main may not exist */ }

    let aheadCommits = [];
    try {
      const ahead = git('git log main..HEAD --format="%h|%s|%ci"');
      if (ahead) {
        aheadCommits = ahead.split('\n').map(line => {
          const [hash, message, date] = line.split('|');
          return { hash, message, date };
        });
      }
    } catch (e) { /* no commits ahead */ }

    let changedFiles = [];
    try {
      const diff = git('git diff main..HEAD --name-status');
      if (diff) {
        changedFiles = diff.split('\n').map(line => {
          const [status, ...fileParts] = line.split('\t');
          return { status: status.trim(), file: fileParts.join('\t') };
        });
      }
    } catch (e) { /* no diff */ }

    let uncommitted = [];
    try {
      const status = git('git status --porcelain');
      if (status) {
        uncommitted = status.split('\n').map(l => l.trim()).filter(Boolean);
      }
    } catch (e) { /* clean */ }

    res.json({
      environment: 'local',
      branch,
      localCommit: { hash: localHash, message: localMsg, date: localDate },
      mainCommit,
      aheadCommits,
      changedFiles,
      uncommitted,
      productionUrl: 'https://academy.planetcorps.ai'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get status', details: err.message });
  }
});

app.post('/api/admin/deploy', requireLocal, async (req, res) => {
  try {
    const log = [];
    const branch = git('git rev-parse --abbrev-ref HEAD');

    // Check for uncommitted changes
    const status = git('git status --porcelain');
    if (status) {
      return res.status(400).json({ error: 'Uncommitted changes. Commit before deploying.', uncommitted: status.split('\n') });
    }

    // Check if there are changes to deploy
    let ahead = '';
    try { ahead = git(`git log main..${branch} --oneline`); } catch (e) {}
    if (!ahead) {
      return res.json({ ok: true, message: 'Nothing to deploy — dev is up to date with main.', log: [] });
    }

    // Merge to main
    log.push('Switching to main...');
    git('git checkout main');
    log.push(`Merging ${branch} into main...`);
    git(`git merge ${branch} --no-edit`);
    log.push('Merge complete.');

    // Push to GitHub
    log.push('Pushing to GitHub...');
    try {
      git('git push origin main');
      log.push('GitHub push complete.');
    } catch (e) {
      log.push('GitHub push failed: ' + e.message);
    }

    // Push to Azure
    log.push('Deploying to Azure...');
    try {
      git('git push azure main:master');
      log.push('Azure deployment complete.');
    } catch (e) {
      log.push('Azure push failed: ' + e.message);
    }

    // Switch back to dev
    log.push(`Switching back to ${branch}...`);
    git(`git checkout ${branch}`);
    log.push('Done.');

    res.json({ ok: true, message: 'Deployment successful!', log });
  } catch (err) {
    // Try to switch back to dev on error
    try { git('git checkout dev'); } catch (e) {}
    res.status(500).json({ error: 'Deployment failed', details: err.message });
  }
});

// ─── Start server ───────────────────────────────────────────────────────────

// Auto-switch to dev branch for local development
if (process.env.NODE_ENV !== 'production') {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    if (branch === 'main') {
      execSync('git checkout dev', { cwd: ROOT });
      console.log('  Auto-switched to dev branch for local development');
    }
  } catch (e) { /* not a git repo or dev doesn't exist */ }
}

discoverPrograms();
loadAllProgramContent();
migrateUserData();

app.listen(PORT, () => {
  const programList = Object.entries(programManifests)
    .map(([id, m]) => `    - ${m.name} (${id})`)
    .join('\n');
  console.log(`PlanetCorps AI Academy running at http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Stats API: http://localhost:${PORT}/api/stats`);
  if (programList) {
    console.log(`  Programs:\n${programList}`);
  } else {
    console.log('  No programs discovered.');
  }
  console.log('');
});
