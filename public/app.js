/* ============================================================
   Claude University - Frontend Application
   Complete SPA dashboard for study, assessment, and progress
   ============================================================ */

// --------------- Utilities ---------------

function esc(str) {
  if (str == null) return '';
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// --------------- Domain metadata ---------------

const DOMAIN_COLORS = {
  1: '#FF6B6B',
  2: '#4ECDC4',
  3: '#45B7D1',
  4: '#96CEB4',
  5: '#FFEAA7'
};

const DOMAIN_NAMES = {
  1: 'Agentic Architecture',
  2: 'Tool Design & MCP',
  3: 'Claude Code Workflows',
  4: 'Prompt Engineering',
  5: 'Context & Reliability'
};

// --------------- SVG Progress Ring ---------------

function progressRing(percent, color, size = 90, strokeWidth = 7) {
  const p = Math.round(percent) || 0;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p / 100) * c;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="${strokeWidth}" />
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"
      transform="rotate(-90 ${size / 2} ${size / 2})" style="transition: stroke-dashoffset 0.8s ease" />
    <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
      font-family="Syne" font-weight="800" font-size="${size / 4.5}px" fill="${color}">${p}%</text>
  </svg>`;
}

// --------------- Modal System ---------------

function showModal(title, bodyHtml, onSubmit) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="modal">
      <h2 class="modal-title">${esc(title)}</h2>
      <div id="modal-body">${bodyHtml}</div>
      <div class="flex gap-12" style="margin-top:20px;justify-content:flex-end">
        <button class="btn-secondary" id="modal-cancel">Cancel</button>
        <button class="btn-primary" id="modal-submit">Submit</button>
      </div>
    </div>`;
  overlay.classList.remove('hidden');
  overlay.style.display = 'flex';

  overlay.querySelector('#modal-cancel').addEventListener('click', hideModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideModal();
  });
  overlay.querySelector('#modal-submit').addEventListener('click', () => {
    if (onSubmit) onSubmit();
  });
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
}

// --------------- View Switching ---------------

let currentView = 'dashboard';

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
});

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
  const viewEl = document.getElementById(`view-${name}`);
  if (viewEl) viewEl.classList.add('active');
  currentView = name;
  loadView(name);
}

function loadView(name) {
  switch (name) {
    case 'dashboard': loadDashboard(); break;
    case 'programs': loadPrograms(); break;
    case 'curriculum': loadCurriculum(); break;
    case 'assessments': loadAssessments(); break;
    case 'glossary': loadGlossary(); break;
    case 'study-plan': loadStudyPlan(); break;
    case 'exercises': loadExercises(); break;
  }
}

// ===============================================================
//  DASHBOARD
// ===============================================================

async function loadDashboard() {
  const el = document.getElementById('view-dashboard');
  el.innerHTML = '<p class="text-muted text-center">Loading dashboard...</p>';
  try {
    const d = await api('/api/dashboard');

    const modulesRead = d.domainMastery
      ? d.domainMastery.reduce((s, dm) => s + (dm.modulesRead || 0), 0)
      : 0;

    const quizCount = d.recentQuizzes ? d.recentQuizzes.length : 0;
    const avgScore = d.totalQuestionsAnswered
      ? Math.round((d.totalCorrect / d.totalQuestionsAnswered) * 100)
      : 0;

    // Stat cards
    const stats = [
      { label: 'Overall Mastery', value: `${Math.round(d.overallMastery || 0)}%` },
      { label: 'Modules Read', value: modulesRead },
      { label: 'Quizzes Taken', value: quizCount },
      { label: 'Avg Score', value: `${avgScore}%` },
      { label: 'Study Streak', value: `${(d.streak && d.streak.currentStreak) || 0} day${((d.streak && d.streak.currentStreak) || 0) !== 1 ? 's' : ''}` }
    ];

    let html = '<div class="stat-grid">';
    stats.forEach(s => {
      html += `<div class="stat-card"><div class="stat-value">${esc(String(s.value))}</div><div class="stat-label">${esc(s.label)}</div></div>`;
    });
    html += '</div>';

    // Domain mastery rings
    html += '<h3 class="mt-20 mb-20">Domain Mastery</h3><div class="domain-grid">';
    if (d.domainMastery && d.domainMastery.length) {
      d.domainMastery.forEach(dm => {
        const num = dm.domain || dm.domainNum || 0;
        const color = DOMAIN_COLORS[num] || '#888';
        const name = DOMAIN_NAMES[num] || `Domain ${num}`;
        const pct = Math.round(dm.mastery || dm.percentage || 0);
        html += `<div class="domain-card text-center">
          ${progressRing(pct, color)}
          <div style="margin-top:8px;font-weight:600;font-size:0.85rem">${esc(name)}</div>
        </div>`;
      });
    } else {
      for (let i = 1; i <= 5; i++) {
        html += `<div class="domain-card text-center">
          ${progressRing(0, DOMAIN_COLORS[i])}
          <div style="margin-top:8px;font-weight:600;font-size:0.85rem">${esc(DOMAIN_NAMES[i])}</div>
        </div>`;
      }
    }
    html += '</div>';

    // Recent quizzes table
    if (d.recentQuizzes && d.recentQuizzes.length) {
      html += '<h3 class="mt-20 mb-20">Recent Quizzes</h3>';
      html += '<table style="width:100%;border-collapse:collapse">';
      html += '<thead><tr style="text-align:left;opacity:0.6"><th style="padding:8px">Date</th><th style="padding:8px">Type</th><th style="padding:8px">Score</th><th style="padding:8px">%</th></tr></thead><tbody>';
      d.recentQuizzes.slice(0, 10).forEach(q => {
        const pct = q.percentage != null ? q.percentage : (q.total ? Math.round(q.score / q.total * 100) : 0);
        html += `<tr style="border-top:1px solid rgba(255,255,255,0.06)">
          <td style="padding:8px">${esc(formatDate(q.date))}</td>
          <td style="padding:8px">${esc(q.type || q.domain || '')}</td>
          <td style="padding:8px">${q.score}/${q.total}</td>
          <td style="padding:8px;color:${pct >= 70 ? '#4ECDC4' : '#FF6B6B'}">${pct}%</td>
        </tr>`;
      });
      html += '</tbody></table>';
    }

    // Quick actions
    html += '<h3 class="mt-20 mb-20">Quick Actions</h3><div class="flex gap-16">';
    html += `<button class="btn-primary" onclick="switchView('assessments')">Take a Quiz</button>`;
    html += `<button class="btn-secondary" onclick="switchView('curriculum')">Continue Reading</button>`;
    html += `<button class="btn-secondary" id="review-weak-btn">Review Weak Areas</button>`;
    html += '</div>';

    el.innerHTML = html;

    // Review weak areas — find weakest domain
    const weakBtn = document.getElementById('review-weak-btn');
    if (weakBtn) {
      weakBtn.addEventListener('click', () => {
        let weakest = 1;
        let lowest = 100;
        if (d.domainMastery && d.domainMastery.length) {
          d.domainMastery.forEach(dm => {
            const pct = dm.mastery || dm.percentage || 0;
            if (pct < lowest) { lowest = pct; weakest = dm.domain || dm.domainNum || 1; }
          });
        }
        assessmentAutoStartDomain = weakest;
        switchView('assessments');
      });
    }
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading dashboard: ${esc(err.message)}</p>`;
  }
}

let assessmentAutoStartDomain = null;

// ===============================================================
//  PROGRAMS
// ===============================================================

async function loadPrograms() {
  const el = document.getElementById('view-programs');
  el.innerHTML = '<p class="text-muted text-center">Loading programs...</p>';
  try {
    const programs = await api('/api/programs');

    let html = '<div class="flex gap-12 mb-20" style="justify-content:space-between;align-items:center">';
    html += '<h2>Study Programs</h2>';
    html += '<button class="btn-primary" id="add-program-btn">+ Add Program</button>';
    html += '</div>';

    html += '<div class="card-grid">';
    programs.forEach(p => {
      const modCount = p.modules ? p.modules.length : 0;
      html += `<div class="card">
        <h3 style="margin-bottom:8px">${esc(p.name)}</h3>
        <p class="text-muted" style="margin-bottom:12px">${esc(p.description || '')}</p>
        <p style="font-size:0.85rem;opacity:0.7">${modCount} module${modCount !== 1 ? 's' : ''}</p>`;

      if (p.modules && p.modules.length) {
        html += '<ul style="margin:12px 0 0;padding-left:20px;font-size:0.85rem">';
        p.modules.slice(0, 5).forEach(m => {
          html += `<li style="margin-bottom:4px">${esc(m.title || m.name || m.id)}</li>`;
        });
        if (p.modules.length > 5) html += `<li class="text-muted">+${p.modules.length - 5} more</li>`;
        html += '</ul>';
      }

      if (!p.builtIn) {
        html += `<div class="flex gap-12" style="margin-top:16px">
          <button class="btn-secondary add-module-btn" data-id="${esc(String(p.id))}">+ Add Module</button>
          <button class="btn-secondary delete-program-btn" data-id="${esc(String(p.id))}" style="color:#FF6B6B">Delete</button>
        </div>`;
      }

      html += '</div>';
    });
    html += '</div>';

    el.innerHTML = html;

    // Add program
    document.getElementById('add-program-btn').addEventListener('click', () => {
      showModal('Create Program', `
        <label style="display:block;margin-bottom:12px">
          <span style="font-size:0.85rem;opacity:0.7">Name</span>
          <input class="form-input" id="prog-name" placeholder="Program name" />
        </label>
        <label style="display:block">
          <span style="font-size:0.85rem;opacity:0.7">Description</span>
          <textarea class="form-textarea" id="prog-desc" rows="3" placeholder="Description"></textarea>
        </label>
      `, async () => {
        const name = document.getElementById('prog-name').value.trim();
        const description = document.getElementById('prog-desc').value.trim();
        if (!name) return;
        await api('/api/programs', { method: 'POST', body: { name, description } });
        hideModal();
        loadPrograms();
      });
    });

    // Add module buttons
    el.querySelectorAll('.add-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        showModal('Add Module', `
          <label style="display:block;margin-bottom:12px">
            <span style="font-size:0.85rem;opacity:0.7">Title</span>
            <input class="form-input" id="mod-title" placeholder="Module title" />
          </label>
          <label style="display:block">
            <span style="font-size:0.85rem;opacity:0.7">Content (Markdown)</span>
            <textarea class="form-textarea" id="mod-content" rows="8" placeholder="Module content in markdown"></textarea>
          </label>
        `, async () => {
          const title = document.getElementById('mod-title').value.trim();
          const content = document.getElementById('mod-content').value.trim();
          if (!title) return;
          await api(`/api/programs/${id}/modules`, { method: 'POST', body: { title, content } });
          hideModal();
          loadPrograms();
        });
      });
    });

    // Delete buttons
    el.querySelectorAll('.delete-program-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this program?')) return;
        await api(`/api/programs/${btn.dataset.id}`, { method: 'DELETE' });
        loadPrograms();
      });
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading programs: ${esc(err.message)}</p>`;
  }
}

// ===============================================================
//  CURRICULUM
// ===============================================================

let curriculumState = 'list';
let curriculumModuleId = null;

async function loadCurriculum() {
  if (curriculumState === 'reader' && curriculumModuleId) {
    loadCurriculumReader(curriculumModuleId);
  } else {
    curriculumState = 'list';
    loadCurriculumList();
  }
}

async function loadCurriculumList() {
  const el = document.getElementById('view-curriculum');
  el.innerHTML = '<p class="text-muted text-center">Loading curriculum...</p>';
  try {
    const modules = await api('/api/curriculum');

    let html = '<h2 class="mb-20">Curriculum Modules</h2><div class="card-grid">';
    modules.forEach(m => {
      const pct = m.progress ? Math.round(m.progress.percentComplete || 0) : 0;
      const domainNum = m.domain || 0;
      const color = DOMAIN_COLORS[domainNum] || '#888';
      html += `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <h3 style="flex:1">${esc(m.title)}</h3>
          <span class="domain-pill" style="background:${color};color:#000;margin-left:8px;white-space:nowrap;padding:2px 8px;border-radius:12px;font-size:0.75rem;font-weight:700">D${domainNum}</span>
        </div>
        <p class="text-muted" style="font-size:0.85rem;margin-bottom:12px">Weight: ${m.weight || 0}%</p>
        <div style="background:rgba(255,255,255,0.06);border-radius:6px;height:8px;margin-bottom:16px;overflow:hidden">
          <div style="width:${pct}%;height:100%;background:${color};border-radius:6px;transition:width 0.5s ease"></div>
        </div>
        <div class="flex gap-12" style="justify-content:space-between;align-items:center">
          <span class="text-muted" style="font-size:0.85rem">${pct}% complete</span>
          <button class="btn-primary study-module-btn" data-id="${esc(String(m.id))}">Study</button>
        </div>
      </div>`;
    });
    html += '</div>';

    el.innerHTML = html;

    el.querySelectorAll('.study-module-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        curriculumState = 'reader';
        curriculumModuleId = btn.dataset.id;
        loadCurriculumReader(btn.dataset.id);
      });
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading curriculum: ${esc(err.message)}</p>`;
  }
}

async function loadCurriculumReader(moduleId) {
  const el = document.getElementById('view-curriculum');
  el.innerHTML = '<p class="text-muted text-center">Loading module...</p>';
  try {
    const m = await api(`/api/curriculum/${moduleId}`);
    const completed = m.progress && m.progress.sectionsCompleted ? m.progress.sectionsCompleted : [];

    // Build TOC
    let tocHtml = '';
    if (m.toc && m.toc.length) {
      m.toc.forEach(item => {
        const indent = (item.level || 1) > 1 ? `padding-left:${(item.level - 1) * 16}px` : '';
        tocHtml += `<div class="toc-item" data-id="${esc(item.id || item.slug || '')}" style="${indent}">
          ${esc(item.text || item.title || '')}
        </div>`;
      });
    }

    // Build content with section checkboxes
    let contentHtml = m.html || '<p class="text-muted">No content available.</p>';

    // Inject checkboxes before each section heading
    if (m.sections && m.sections.length) {
      m.sections.forEach(sec => {
        const secId = sec.id || sec.slug || '';
        const isCompleted = completed.includes(secId);
        const checkbox = `<label class="section-check flex gap-12" style="align-items:center;margin:16px 0 8px;cursor:pointer">
          <input type="checkbox" class="section-checkbox checkpoint-check" data-section="${esc(secId)}" ${isCompleted ? 'checked' : ''} />
          <span style="font-size:0.8rem;opacity:0.6">Mark section complete</span>
        </label>`;
        // Try to inject checkbox after the heading with matching id
        const anchor = `id="${secId}"`;
        if (contentHtml.includes(anchor)) {
          contentHtml = contentHtml.replace(
            new RegExp(`(<[^>]*${anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>.*?<\/[^>]+>)`, 's'),
            `$1${checkbox}`
          );
        }
      });
    }

    let html = `
      <div style="margin-bottom:16px">
        <button class="btn-secondary" id="curriculum-back-btn">&larr; Back to Modules</button>
      </div>
      <div class="reader-layout">
        <aside class="reader-toc">
          <h4 style="margin-bottom:12px;opacity:0.6;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Contents</h4>
          ${tocHtml}
        </aside>
        <main class="reader-content">
          <div class="md-body">${contentHtml}</div>
        </main>
      </div>`;

    el.innerHTML = html;

    // Back button
    document.getElementById('curriculum-back-btn').addEventListener('click', () => {
      curriculumState = 'list';
      curriculumModuleId = null;
      loadCurriculumList();
    });

    // TOC click to scroll
    el.querySelectorAll('.toc-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const target = el.querySelector(`[id="${id}"]`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        el.querySelectorAll('.toc-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // Scroll tracking for TOC highlight
    const readerContent = el.querySelector('.reader-content');
    if (readerContent && m.toc && m.toc.length) {
      readerContent.addEventListener('scroll', () => {
        const headings = [];
        m.toc.forEach(item => {
          const heading = el.querySelector(`[id="${item.id || item.slug || ''}"]`);
          if (heading) headings.push({ id: item.id || item.slug, el: heading });
        });

        let activeId = '';
        for (const h of headings) {
          const rect = h.el.getBoundingClientRect();
          const containerRect = readerContent.getBoundingClientRect();
          if (rect.top <= containerRect.top + 80) {
            activeId = h.id;
          }
        }

        el.querySelectorAll('.toc-item').forEach(i => {
          i.classList.toggle('active', i.dataset.id === activeId);
        });
      });
    }

    // Section checkboxes
    el.querySelectorAll('.section-checkbox').forEach(cb => {
      cb.addEventListener('change', async () => {
        const sectionId = cb.dataset.section;
        await api(`/api/curriculum/${moduleId}/progress`, {
          method: 'PUT',
          body: { sectionId, completed: cb.checked }
        });
      });
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading module: ${esc(err.message)}</p>`;
  }
}

// ===============================================================
//  ASSESSMENTS
// ===============================================================

let assessmentState = 'hub';
let quizState = null;

async function loadAssessments() {
  if (assessmentState === 'quiz' && quizState) {
    renderQuizQuestion();
  } else if (assessmentState === 'results' && quizState) {
    renderQuizResults();
  } else {
    assessmentState = 'hub';
    loadAssessmentHub();
  }
}

async function loadAssessmentHub() {
  const el = document.getElementById('view-assessments');
  el.innerHTML = '<p class="text-muted text-center">Loading assessments...</p>';
  try {
    const domains = await api('/api/assessments/domains');

    let html = '<h2 class="mb-20">Assessment Hub</h2>';

    // Domain quiz cards
    html += '<div class="card-grid">';
    domains.forEach(d => {
      const num = d.domain;
      const color = DOMAIN_COLORS[num] || '#888';
      const name = d.name || DOMAIN_NAMES[num] || `Domain ${num}`;
      const lastStr = d.lastScore != null ? `Last: ${d.lastScore}%` : 'Not attempted';
      html += `<div class="card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <span style="width:12px;height:12px;border-radius:50%;background:${color};display:inline-block"></span>
          <h3>${esc(name)}</h3>
        </div>
        <p class="text-muted" style="font-size:0.85rem;margin-bottom:4px">${d.questionCount} questions</p>
        <p style="font-size:0.85rem;margin-bottom:16px;color:${d.lastScore != null && d.lastScore >= 70 ? '#4ECDC4' : 'inherit'}">${esc(lastStr)}</p>
        <button class="btn-primary start-domain-quiz" data-domain="${num}">Start Quiz</button>
      </div>`;
    });
    html += '</div>';

    // Exam simulation card
    html += `<div class="card mt-20" style="max-width:480px">
      <h3 style="margin-bottom:8px">Exam Simulation</h3>
      <p class="text-muted" style="font-size:0.85rem;margin-bottom:16px">Random 4 of 6 scenarios with timed conditions</p>
      <button class="btn-primary" id="start-exam-sim">Start Exam Simulation</button>
    </div>`;

    // Quiz history link
    html += `<div class="mt-20"><button class="btn-secondary" id="show-quiz-history">View Full Quiz History</button></div>`;

    el.innerHTML = html;

    // Start domain quiz
    el.querySelectorAll('.start-domain-quiz').forEach(btn => {
      btn.addEventListener('click', () => startDomainQuiz(parseInt(btn.dataset.domain)));
    });

    // Exam simulation
    document.getElementById('start-exam-sim').addEventListener('click', startExamSimulation);

    // Quiz history
    document.getElementById('show-quiz-history').addEventListener('click', showQuizHistory);

    // Auto-start a specific domain if triggered from dashboard
    if (assessmentAutoStartDomain) {
      const d = assessmentAutoStartDomain;
      assessmentAutoStartDomain = null;
      startDomainQuiz(d);
    }
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading assessments: ${esc(err.message)}</p>`;
  }
}

async function startDomainQuiz(domainNum) {
  const el = document.getElementById('view-assessments');
  el.innerHTML = '<p class="text-muted text-center">Loading questions...</p>';
  try {
    const data = await api(`/api/assessments/domain/${domainNum}`);
    quizState = {
      type: 'domain',
      domain: domainNum,
      questions: data.questions || [],
      currentIndex: 0,
      answers: [],
      selectedOption: null,
      startTime: Date.now()
    };
    assessmentState = 'quiz';
    renderQuizQuestion();
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading quiz: ${esc(err.message)}</p>`;
  }
}

async function startExamSimulation() {
  const el = document.getElementById('view-assessments');
  el.innerHTML = '<p class="text-muted text-center">Loading exam simulation...</p>';
  try {
    const scenarios = await api('/api/assessments/exam-simulation');
    // Flatten scenario questions
    const questions = [];
    const scenarioNums = [];
    scenarios.forEach(s => {
      if (!scenarioNums.includes(s.num)) scenarioNums.push(s.num);
      if (s.questions) {
        s.questions.forEach(q => {
          questions.push({ ...q, scenarioContext: s.context, scenarioName: s.name });
        });
      }
    });

    quizState = {
      type: 'exam-simulation',
      domain: null,
      scenarioNums,
      questions,
      currentIndex: 0,
      answers: [],
      selectedOption: null,
      startTime: Date.now()
    };
    assessmentState = 'quiz';
    renderQuizQuestion();
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading exam: ${esc(err.message)}</p>`;
  }
}

function renderQuizQuestion() {
  const el = document.getElementById('view-assessments');
  if (!quizState || !quizState.questions.length) {
    el.innerHTML = '<p class="text-muted">No questions available.</p>';
    return;
  }

  const q = quizState.questions[quizState.currentIndex];
  const total = quizState.questions.length;
  const current = quizState.currentIndex + 1;
  const pct = Math.round((current / total) * 100);

  const isLast = quizState.currentIndex >= total - 1;

  let html = `<div class="quiz-container">
    <div class="quiz-progress" style="margin-bottom:16px">
      <div class="quiz-progress-fill" style="width:${pct}%"></div>
    </div>
    <p class="text-muted" style="margin-bottom:8px;font-size:0.85rem">Question ${current} of ${total}</p>`;

  // Scenario context (for exam simulations)
  if (q.scenarioContext) {
    html += `<div class="quiz-scenario" style="margin-bottom:16px">
      <p style="font-size:0.8rem;opacity:0.6;margin-bottom:4px">${esc(q.scenarioName || 'Scenario')}</p>
      <p style="font-size:0.9rem">${esc(q.scenarioContext)}</p>
    </div>`;
  }

  // Question text
  html += `<div style="margin-bottom:20px">
    <p style="font-size:1rem;line-height:1.6">${esc(q.scenario || q.question || q.text || '')}</p>`;
  if (q.taskStatement) {
    html += `<p class="text-muted" style="font-size:0.8rem;margin-top:8px">Task: ${esc(q.taskStatement)}</p>`;
  }
  html += '</div>';

  // Options
  html += '<div class="quiz-options">';
  const options = q.options || [];
  options.forEach(opt => {
    const letter = opt.letter || opt.key || '';
    const text = opt.text || '';
    const isSelected = quizState.selectedOption === letter;
    html += `<button class="quiz-option${isSelected ? ' selected' : ''}" data-letter="${esc(letter)}">
      <strong>${esc(letter)}.</strong> ${esc(text)}
    </button>`;
  });
  html += '</div>';

  // Navigation
  html += `<div class="flex gap-12" style="margin-top:20px;justify-content:flex-end">
    <button class="btn-secondary" id="quiz-back-hub">Quit</button>
    <button class="quiz-btn btn-primary" id="quiz-next" ${!quizState.selectedOption ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>${isLast ? 'Submit All Answers' : 'Next Question'}</button>
  </div>`;

  html += '</div>';
  el.innerHTML = html;

  // Option click
  el.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      quizState.selectedOption = btn.dataset.letter;
      el.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
      btn.classList.add('selected');
      const nextBtn = document.getElementById('quiz-next');
      if (nextBtn) { nextBtn.disabled = false; nextBtn.style.opacity = '1'; nextBtn.style.cursor = 'pointer'; }
    });
  });

  // Next / Submit
  document.getElementById('quiz-next').addEventListener('click', async () => {
    if (!quizState.selectedOption) return;

    // Record answer
    const q = quizState.questions[quizState.currentIndex];
    quizState.answers.push({
      questionNum: q.num || quizState.currentIndex + 1,
      selected: quizState.selectedOption
    });
    quizState.selectedOption = null;

    if (quizState.currentIndex < quizState.questions.length - 1) {
      quizState.currentIndex++;
      renderQuizQuestion();
    } else {
      // Submit all answers
      await submitQuiz();
    }
  });

  // Quit
  document.getElementById('quiz-back-hub').addEventListener('click', () => {
    if (!confirm('Quit this quiz? Your progress will be lost.')) return;
    assessmentState = 'hub';
    quizState = null;
    loadAssessmentHub();
  });
}

async function submitQuiz() {
  const el = document.getElementById('view-assessments');
  el.innerHTML = '<p class="text-muted text-center">Submitting answers...</p>';
  try {
    const timeSpent = Math.round((Date.now() - quizState.startTime) / 1000);
    const body = {
      type: quizState.type,
      domain: quizState.domain,
      scenarioNums: quizState.scenarioNums || undefined,
      answers: quizState.answers,
      timeSpentSeconds: timeSpent
    };
    const result = await api('/api/assessments/submit', { method: 'POST', body });
    quizState.results = result;
    assessmentState = 'results';
    renderQuizResults();
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error submitting quiz: ${esc(err.message)}</p>`;
  }
}

function renderQuizResults() {
  const el = document.getElementById('view-assessments');
  if (!quizState || !quizState.results) {
    assessmentState = 'hub';
    loadAssessmentHub();
    return;
  }

  const r = quizState.results;
  const pct = r.percentage != null ? r.percentage : (r.total ? Math.round(r.score / r.total * 100) : 0);
  const pass = pct >= 70;

  let html = `<div class="quiz-container">
    <div class="text-center mb-20">
      ${progressRing(pct, pass ? '#4ECDC4' : '#FF6B6B', 140, 10)}
      <h2 style="margin-top:12px">${r.score} / ${r.total}</h2>
      <p style="font-size:1.1rem;margin-top:8px;color:${pass ? '#4ECDC4' : '#FF6B6B'};font-weight:700">${pass ? 'PASSED' : 'NEEDS REVIEW'}</p>
      <p class="text-muted" style="font-size:0.85rem;margin-top:4px">${Math.round((Date.now() - quizState.startTime) / 1000)}s elapsed</p>
    </div>

    <h3 class="mb-20">Question Review</h3>`;

  if (r.answers && r.answers.length) {
    r.answers.forEach((a, i) => {
      const icon = a.isCorrect ? '<span style="color:#4ECDC4;font-weight:700">&#10003;</span>' : '<span style="color:#FF6B6B;font-weight:700">&#10007;</span>';
      html += `<div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600">Q${a.questionNum || i + 1}</span>
          ${icon}
        </div>
        <p style="font-size:0.85rem;margin-bottom:4px">Your answer: <strong>${esc(a.selected)}</strong> ${!a.isCorrect ? ` | Correct: <strong>${esc(a.correct)}</strong>` : ''}</p>`;

      if (a.taskStatement) {
        html += `<p class="text-muted" style="font-size:0.8rem;margin-bottom:4px">Task: ${esc(a.taskStatement)}</p>`;
      }

      if (a.explanation) {
        html += `<details style="margin-top:8px">
          <summary style="cursor:pointer;font-size:0.85rem;color:#45B7D1">Show Explanation</summary>
          <p style="font-size:0.85rem;margin-top:8px;line-height:1.5;opacity:0.85">${esc(a.explanation)}</p>
        </details>`;
      }

      html += '</div>';
    });
  }

  html += `<div class="flex gap-12" style="margin-top:20px">
    <button class="btn-primary" id="retake-quiz">Retake Quiz</button>
    <button class="btn-secondary" id="back-to-hub">Back to Hub</button>
    <button class="btn-secondary" id="review-curriculum-btn">Review Curriculum</button>
  </div>`;
  html += '</div>';

  el.innerHTML = html;

  document.getElementById('retake-quiz').addEventListener('click', () => {
    if (quizState.type === 'exam-simulation') {
      startExamSimulation();
    } else {
      startDomainQuiz(quizState.domain);
    }
  });

  document.getElementById('back-to-hub').addEventListener('click', () => {
    assessmentState = 'hub';
    quizState = null;
    loadAssessmentHub();
  });

  document.getElementById('review-curriculum-btn').addEventListener('click', () => {
    assessmentState = 'hub';
    quizState = null;
    curriculumState = 'list';
    switchView('curriculum');
  });
}

async function showQuizHistory() {
  const el = document.getElementById('view-assessments');
  el.innerHTML = '<p class="text-muted text-center">Loading quiz history...</p>';
  try {
    const history = await api('/api/quiz-history');

    let html = '<div style="margin-bottom:16px"><button class="btn-secondary" id="history-back">&larr; Back to Hub</button></div>';
    html += '<h2 class="mb-20">Quiz History</h2>';

    if (!history || !history.length) {
      html += '<p class="text-muted">No quizzes taken yet.</p>';
    } else {
      html += '<table style="width:100%;border-collapse:collapse">';
      html += '<thead><tr style="text-align:left;opacity:0.6"><th style="padding:8px">Date</th><th style="padding:8px">Type</th><th style="padding:8px">Domain</th><th style="padding:8px">Score</th><th style="padding:8px">%</th></tr></thead><tbody>';
      history.forEach(q => {
        const pct = q.percentage != null ? q.percentage : (q.total ? Math.round(q.score / q.total * 100) : 0);
        html += `<tr style="border-top:1px solid rgba(255,255,255,0.06)">
          <td style="padding:8px">${esc(formatDate(q.date))}</td>
          <td style="padding:8px">${esc(q.type || '')}</td>
          <td style="padding:8px">${q.domain ? DOMAIN_NAMES[q.domain] || `Domain ${q.domain}` : 'Mixed'}</td>
          <td style="padding:8px">${q.score}/${q.total}</td>
          <td style="padding:8px;color:${pct >= 70 ? '#4ECDC4' : '#FF6B6B'}">${pct}%</td>
        </tr>`;
      });
      html += '</tbody></table>';
    }

    el.innerHTML = html;
    document.getElementById('history-back').addEventListener('click', () => {
      assessmentState = 'hub';
      loadAssessmentHub();
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading history: ${esc(err.message)}</p>`;
  }
}

// ===============================================================
//  GLOSSARY
// ===============================================================

let glossaryData = [];
let glossarySearch = '';
let glossaryDomainFilter = null;

async function loadGlossary() {
  const el = document.getElementById('view-glossary');
  el.innerHTML = '<p class="text-muted text-center">Loading glossary...</p>';
  try {
    glossaryData = await api('/api/glossary');
    glossarySearch = '';
    glossaryDomainFilter = null;
    renderGlossary();
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading glossary: ${esc(err.message)}</p>`;
  }
}

function renderGlossary() {
  const el = document.getElementById('view-glossary');

  // Filter data
  let filtered = glossaryData;

  if (glossarySearch) {
    const q = glossarySearch.toLowerCase();
    filtered = filtered.filter(g =>
      (g.term && g.term.toLowerCase().includes(q)) ||
      (g.definition && g.definition.toLowerCase().includes(q))
    );
  }

  if (glossaryDomainFilter != null) {
    filtered = filtered.filter(g =>
      g.domains && g.domains.includes(glossaryDomainFilter)
    );
  }

  let html = '<h2 class="mb-20">Key Concepts Glossary</h2>';

  // Search
  html += `<input class="search-input" id="glossary-search" type="text" placeholder="Search terms..." value="${esc(glossarySearch)}" style="margin-bottom:16px;width:100%;max-width:400px" />`;

  // Domain filter pills
  html += '<div class="filter-pills" style="margin-bottom:20px">';
  html += `<button class="pill${glossaryDomainFilter == null ? ' active' : ''}" data-domain="all">All</button>`;
  for (let i = 1; i <= 5; i++) {
    html += `<button class="pill${glossaryDomainFilter === i ? ' active' : ''}" data-domain="${i}">Domain ${i}</button>`;
  }
  html += '</div>';

  // Cards
  html += `<p class="text-muted" style="font-size:0.85rem;margin-bottom:12px">${filtered.length} term${filtered.length !== 1 ? 's' : ''}</p>`;
  html += '<div class="glossary-grid">';
  filtered.forEach(g => {
    html += `<div class="glossary-card">
      <div class="glossary-term">${esc(g.term)}</div>
      <div class="glossary-def">${esc(g.definition)}</div>`;
    if (g.domains && g.domains.length) {
      html += '<div style="margin-top:8px">';
      g.domains.forEach(d => {
        const color = DOMAIN_COLORS[d] || '#888';
        html += `<span class="domain-pill" style="background:${color};color:#000;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:700;margin-right:4px">D${d}</span>`;
      });
      html += '</div>';
    }
    html += '</div>';
  });
  html += '</div>';

  el.innerHTML = html;

  // Search handler
  const searchInput = document.getElementById('glossary-search');
  searchInput.addEventListener('input', (e) => {
    glossarySearch = e.target.value;
    renderGlossary();
    // Restore focus and cursor position
    const newInput = document.getElementById('glossary-search');
    if (newInput) {
      newInput.focus();
      newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
    }
  });

  // Domain pills
  el.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const d = pill.dataset.domain;
      glossaryDomainFilter = d === 'all' ? null : parseInt(d);
      renderGlossary();
    });
  });
}

// ===============================================================
//  STUDY PLAN
// ===============================================================

const PHASE_META = {
  1: { title: 'Foundations', goal: 'Understand the ecosystem and vocabulary', milestone: 'Able to explain all 5 domains and their task statements' },
  2: { title: 'Applied Patterns', goal: 'Build implementation skills', milestone: 'Can build agentic workflows and pass domain quizzes at 70%+' },
  3: { title: 'Production & Reliability', goal: 'Production judgment and edge case handling', milestone: 'Comfortable with CI/CD patterns, observability, and exercises' },
  4: { title: 'Exam Readiness', goal: 'Confidence and speed under exam conditions', milestone: 'Consistently scoring 80%+ on timed mock exams' }
};

const ITEM_LABELS = {
  'read-exam-guide': 'Read Exam Guide Summary',
  'read-domains': 'Read Domains & Task Statements',
  'skim-glossary': 'Skim Key Concepts Glossary',
  'study-module-01': 'Study Module 01: Agentic Architecture',
  'study-module-02': 'Study Module 02: Tool Design & MCP',
  'study-module-03': 'Study Module 03: Claude Code Workflows',
  'study-module-04': 'Study Module 04: Prompt Engineering',
  'study-module-05': 'Study Module 05: Context & Reliability',
  'revisit-module-03-cicd': 'Revisit Module 03: CI/CD Deep Dive',
  'assess-domain-01': 'Take Domain 1 Assessment',
  'assess-domain-02': 'Take Domain 2 Assessment',
  'assess-domain-03': 'Take Domain 3 Assessment',
  'assess-domain-04': 'Take Domain 4 Assessment',
  'assess-domain-05': 'Take Domain 5 Assessment',
  'exercise-1': 'Complete Exercise 1',
  'exercise-2': 'Complete Exercise 2',
  'exercise-3': 'Complete Exercise 3',
  'exercise-4': 'Complete Exercise 4',
  'full-scenario-practice': 'Complete All Exam Scenarios',
  'timed-mock-exam': 'Take Timed Mock Exam',
  'review-weak-domains': 'Review Weak Domains',
  'score-80-plus': 'Score 80%+ on Scenario Questions'
};

async function loadStudyPlan() {
  const el = document.getElementById('view-study-plan');
  el.innerHTML = '<p class="text-muted text-center">Loading study plan...</p>';
  try {
    const plan = await api('/api/study-plan');
    const currentPhase = plan.currentPhase || 1;
    const checkpoints = plan.checkpoints || {};

    let html = '<h2 class="mb-20">Study Plan</h2>';

    for (let phase = 1; phase <= 4; phase++) {
      const meta = PHASE_META[phase];
      const phaseKey = `phase-${phase}`;
      const phaseData = checkpoints[phaseKey] || { items: [], completed: [] };
      const items = phaseData.items || [];
      const completed = phaseData.completed || [];
      const isCurrent = phase === currentPhase;

      const completedCount = completed.length;
      const totalCount = items.length;

      html += `<div class="phase-card${isCurrent ? ' current' : ''}" style="margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <span class="phase-num">${phase}</span>
          <div>
            <div class="phase-title">${esc(meta.title)}</div>
            <div class="text-muted" style="font-size:0.85rem">${esc(meta.goal)}</div>
          </div>
          <span class="text-muted" style="margin-left:auto;font-size:0.85rem">${completedCount}/${totalCount}</span>
        </div>`;

      if (items.length) {
        html += '<div style="margin-top:12px">';
        items.forEach(itemId => {
          const isChecked = completed.includes(itemId);
          const label = ITEM_LABELS[itemId] || itemId;
          html += `<label class="checkpoint-item flex gap-12" style="align-items:center;padding:6px 0;cursor:pointer">
            <input type="checkbox" class="checkpoint-check plan-checkbox" data-phase="${phaseKey}" data-item="${esc(itemId)}" ${isChecked ? 'checked' : ''} />
            <span style="font-size:0.9rem${isChecked ? ';opacity:0.5;text-decoration:line-through' : ''}">${esc(label)}</span>
          </label>`;
        });
        html += '</div>';
      }

      html += `<div class="milestone text-muted" style="margin-top:12px;font-size:0.8rem;font-style:italic">Milestone: ${esc(meta.milestone)}</div>`;
      html += '</div>';
    }

    el.innerHTML = html;

    // Checkbox handlers
    el.querySelectorAll('.plan-checkbox').forEach(cb => {
      cb.addEventListener('change', async () => {
        await api('/api/study-plan', {
          method: 'PUT',
          body: {
            phase: cb.dataset.phase,
            itemId: cb.dataset.item,
            completed: cb.checked
          }
        });
        // Re-render to update strike-through and counts
        loadStudyPlan();
      });
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading study plan: ${esc(err.message)}</p>`;
  }
}

// ===============================================================
//  EXERCISES
// ===============================================================

let expandedExercise = null;

async function loadExercises() {
  const el = document.getElementById('view-exercises');
  el.innerHTML = '<p class="text-muted text-center">Loading exercises...</p>';
  try {
    const exercises = await api('/api/exercises');

    let html = '<h2 class="mb-20">Hands-On Exercises</h2>';

    exercises.forEach(ex => {
      const num = ex.num;
      const criteria = ex.criteria || [];
      const completedCriteria = ex.completedCriteria || [];
      const completedCount = completedCriteria.length;
      const totalCriteria = criteria.length;
      const isExpanded = expandedExercise === num;
      const pct = totalCriteria ? Math.round((completedCount / totalCriteria) * 100) : 0;

      html += `<div class="exercise-card" style="margin-bottom:16px">
        <div class="exercise-header" data-num="${num}" style="cursor:pointer">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-weight:800;font-size:1.1rem;opacity:0.5">#${num}</span>
              <h3>${esc(ex.title)}</h3>
            </div>
            <div style="display:flex;align-items:center;gap:12px">`;

      // Domain pills
      // Extract domain numbers from strings like "1 (Agentic Architecture), 2 (Tool Design), 5 (Reliability)"
      const domainNums = typeof ex.domains === 'string'
        ? [...ex.domains.matchAll(/(\d)/g)].map(m => m[1])
        : Array.isArray(ex.domains) ? ex.domains.map(String) : [];
      domainNums.forEach(num => {
        const color = DOMAIN_COLORS[num] || '#888';
        html += `<span class="domain-pill" style="background:${color};color:#000;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:700">D${num}</span>`;
      });

      html += `<span class="text-muted" style="font-size:0.85rem">${completedCount}/${totalCriteria}</span>
              <span style="font-size:1.2rem;transition:transform 0.2s;transform:rotate(${isExpanded ? '180' : '0'}deg)">&#9660;</span>
            </div>
          </div>
          <div style="background:rgba(255,255,255,0.06);border-radius:6px;height:6px;margin-top:10px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:#4ECDC4;border-radius:6px;transition:width 0.5s ease"></div>
          </div>
        </div>`;

      if (isExpanded) {
        html += `<div class="exercise-body" style="padding:16px 20px;border-top:1px solid rgba(255,255,255,0.06)">`;
        if (ex.html) {
          html += `<div class="md-body" style="margin-bottom:20px">${ex.html}</div>`;
        }
        if (criteria.length) {
          html += '<h4 style="margin-bottom:12px">Success Criteria</h4>';
          criteria.forEach(cr => {
            const isChecked = completedCriteria.includes(cr.id);
            html += `<label class="criteria-item flex gap-12" style="align-items:center;padding:6px 0;cursor:pointer">
              <input type="checkbox" class="checkpoint-check exercise-criteria-cb" data-num="${num}" data-criteria="${esc(cr.id)}" ${isChecked ? 'checked' : ''} />
              <span style="font-size:0.9rem${isChecked ? ';opacity:0.5;text-decoration:line-through' : ''}">${esc(cr.text)}</span>
            </label>`;
          });
        }
        html += '</div>';
      }

      html += '</div>';
    });

    el.innerHTML = html;

    // Toggle expand/collapse
    el.querySelectorAll('.exercise-header').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const num = parseInt(hdr.dataset.num);
        expandedExercise = expandedExercise === num ? null : num;
        loadExercises();
      });
    });

    // Criteria checkboxes
    el.querySelectorAll('.exercise-criteria-cb').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        e.stopPropagation();
        await api(`/api/exercises/${cb.dataset.num}/checklist`, {
          method: 'PUT',
          body: { criteriaId: cb.dataset.criteria, completed: cb.checked }
        });
        loadExercises();
      });
    });
  } catch (err) {
    el.innerHTML = `<p style="color:#FF6B6B">Error loading exercises: ${esc(err.message)}</p>`;
  }
}

// ===============================================================
//  INITIALIZATION
// ===============================================================

document.addEventListener('DOMContentLoaded', () => {
  loadView('dashboard');
});
