# Claude University

**Interactive study dashboard for the Claude Certified Architect – Foundations certification.**

A self-hosted Node.js web app with curriculum modules, practice quizzes, progress tracking, and a searchable glossary — everything you need to prepare for the exam in one place.

## Features

- **Study Content** — 5 curriculum modules covering all 27 exam task statements, searchable glossary with 44 terms and domain filtering, 4-phase study plan with persistent checkpoints
- **Practice & Assessment** — 57 practice questions (39 domain-specific + 18 scenario-based), interactive quiz engine with server-side answer validation and explanations
- **Progress Tracking** — Domain mastery rings, study streak counter, section completion checkmarks, persistent progress across sessions
- **Hands-On Exercises** — 4 practical exercises with checkable success criteria
- **7 Interactive Views** — Dashboard, Programs, Curriculum, Assessments, Glossary, Study Plan, Exercises

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later

### Installation

```bash
git clone https://github.com/professorlessmuda/claudeuniversity.git
cd claudeuniversity
npm install
```

### Run

```bash
npm start
```

Then visit [http://localhost:3009](http://localhost:3009) in your browser.

**Windows users:** Double-click `START.bat` to launch the server.

**Development mode** (auto-restart on file changes):

```bash
npm run dev
```

Set the `PORT` environment variable to change the default port (3009).

## Exam Overview

The certification exam covers 5 domains with the following weights:

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

Passing score: 720/1000. Format: multiple-choice, scenario-based. Each exam presents 4 of 6 possible scenarios.

## Project Structure

```
├── server.js            Express server (port 3009)
├── public/
│   ├── index.html       Single-page app shell
│   └── app.js           Frontend logic (views, quiz engine, progress)
├── package.json         Node.js dependencies and scripts
├── docs_*.md            Reference documentation
├── curriculum_*.md      Study modules (5 files)
└── assessments_*.md     Practice questions (7 files)
```

### Reference Docs
| File | Description |
|------|-------------|
| `docs_domains.md` | All 5 domains with 27 task statements |
| `docs_exam-guide-summary.md` | Exam format, scoring, scenarios, study tips |
| `docs_key-concepts-glossary.md` | Glossary of technical terms with domain references |
| `docs_learning-path.md` | 4-phase study plan |
| `docs_hands-on-exercises.md` | 4 practical exercises |
| `docs_cross-reference-map.md` | Maps task statements to modules, assessments, and scenarios |

### Curriculum Modules
| File | Domain | Weight |
|------|--------|--------|
| `curriculum_module-01-agentic-architecture.md` | Agentic Architecture & Orchestration | 27% |
| `curriculum_module-02-tool-design-mcp.md` | Tool Design & MCP Integration | 18% |
| `curriculum_module-03-claude-code-workflows.md` | Claude Code Configuration & Workflows | 20% |
| `curriculum_module-04-prompt-engineering.md` | Prompt Engineering & Structured Output | 20% |
| `curriculum_module-05-context-reliability.md` | Context Management & Reliability | 15% |

### Assessments
| File | Content |
|------|---------|
| `assessments_scenario-questions.md` | Assessment index and self-assessment guide |
| `assessments_domain-01-questions.md` | 9 questions — Domain 1 |
| `assessments_domain-02-questions.md` | 7 questions — Domain 2 |
| `assessments_domain-03-questions.md` | 8 questions — Domain 3 |
| `assessments_domain-04-questions.md` | 8 questions — Domain 4 |
| `assessments_domain-05-questions.md` | 7 questions — Domain 5 |
| `assessments_exam-scenarios.md` | 18 questions across 6 exam scenarios |

**Total: 57 practice questions** covering all 27 task statements.

## Tech Stack

- **Runtime:** Node.js
- **Server:** Express.js
- **Markdown Parsing:** marked
- **Frontend:** Vanilla JS, CSS (dark aurora theme), single-page app
- **Persistence:** JSON files (no database required)

## Study Guide

1. Start with `docs_learning-path.md` for the recommended study order
2. Study one curriculum module at a time, starting with Module 01 (highest weight)
3. After each module, take the corresponding domain assessment
4. Use `docs_cross-reference-map.md` to find related content when stuck
5. Finish with `assessments_exam-scenarios.md` for exam simulation

The dashboard's **Study Plan** view tracks these same steps interactively with persistent checkpoints.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

**Guidelines:**
- New practice questions should follow the existing format in `assessments_domain-*` files
- Curriculum additions should reference task statement IDs (e.g., "Task 2.1")

## License

TBD
