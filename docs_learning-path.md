# Learning Path

A four-phase study plan for the Claude Certified Architect – Foundations certification. Each phase builds on the previous one.

---

## Phase 1: Foundations

**Goal:** Understand the Claude ecosystem, exam structure, and core vocabulary.

**Study:**
- Read `docs_exam-guide-summary.md` — exam format, scoring, scenarios
- Read `docs_domains.md` — all 5 domains and 27 task statements
- Read `docs_key-concepts-glossary.md` — skim for familiarity (return later as reference)
- Study `curriculum_module-01-agentic-architecture.md` — highest-weight domain (27%), covers agentic loops, multi-agent patterns, session management
- Study `curriculum_module-03-claude-code-workflows.md` — CLAUDE.md hierarchy, commands, CI/CD integration

**Assess:**
- `assessments_domain-01-questions.md` — take as a baseline diagnostic
- `assessments_domain-03-questions.md` — take as a baseline diagnostic

**Milestone:** You can explain stop_reason values, the coordinator-subagent pattern, and the CLAUDE.md hierarchy without looking at notes.

---

## Phase 2: Applied Patterns

**Goal:** Build implementation skills for tool design, prompt engineering, and structured output.

**Study:**
- Study `curriculum_module-02-tool-design-mcp.md` — tool descriptions, error handling, MCP integration, built-in tools
- Study `curriculum_module-04-prompt-engineering.md` — explicit criteria, few-shot prompting, JSON schemas, batch processing, review architectures

**Practice:**
- Exercise 1 from `docs_hands-on-exercises.md` — Build a Multi-Tool Agent with Escalation Logic
- Exercise 3 from `docs_hands-on-exercises.md` — Build a Structured Data Extraction Pipeline

**Assess:**
- `assessments_domain-02-questions.md`
- `assessments_domain-04-questions.md`

**Milestone:** You can design tool descriptions with clear boundaries, write prompts with explicit criteria, and explain when to use batch processing vs real-time.

---

## Phase 3: Production and Reliability

**Goal:** Develop judgment for production systems — context management, error propagation, escalation, human review.

**Study:**
- Study `curriculum_module-05-context-reliability.md` — context degradation, escalation patterns, error propagation, human review, provenance
- Revisit `curriculum_module-03-claude-code-workflows.md` — deep dive on CI/CD sections (Task 3.6) and session context isolation

**Practice:**
- Exercise 2 from `docs_hands-on-exercises.md` — Configure Claude Code for a Team Development Workflow
- Exercise 4 from `docs_hands-on-exercises.md` — Design and Debug a Multi-Agent Research Pipeline

**Assess:**
- `assessments_domain-05-questions.md`
- Re-take any domain assessments where you scored below 70%

**Milestone:** You can explain why sentiment-based escalation is unreliable, design structured error propagation across agents, and set up a human review workflow with stratified sampling.

---

## Phase 4: Exam Readiness

**Goal:** Build speed and confidence with scenario-based reasoning under exam conditions.

**Study:**
- Review `docs_cross-reference-map.md` — understand connections across domains
- Revisit weak areas identified in Phase 3 assessments

**Practice:**
- Complete all scenarios in `assessments_exam-scenarios.md` — simulate exam conditions (timed, no notes)
- For each wrong answer, trace back to the relevant curriculum module section using the cross-reference map

**Assess:**
- Score 80%+ on scenario questions before sitting for the exam
- Ensure no single domain is below 70%

**Milestone:** You can answer scenario-based questions by identifying the relevant task statements, evaluating tradeoffs, and choosing the best option — within the time constraints of the exam.

---

## Study Time Allocation by Domain Weight

| Domain | Weight | Suggested % of Study Time |
|--------|--------|---------------------------|
| 1. Agentic Architecture | 27% | 30% |
| 2. Tool Design & MCP | 18% | 18% |
| 3. Claude Code Workflows | 20% | 20% |
| 4. Prompt Engineering | 20% | 20% |
| 5. Context & Reliability | 15% | 12% (appears in 4/6 scenarios, but lower question weight) |
