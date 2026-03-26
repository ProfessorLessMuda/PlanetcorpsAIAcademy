# Exam Guide Summary

## Certification Overview

**Name:** Claude Certified Architect – Foundations

**Purpose:** Validates that practitioners can make informed decisions about tradeoffs when implementing real-world solutions with Claude.

**Passing Score:** 720 (on a scaled score of 100–1,000)

**Score Reporting:** Pass/Fail designation with scaled scoring to equate across exam forms

**Question Format:** Multiple choice (one correct answer, three distractors)

---

## Domains and Weightings

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

See `docs_domains.md` for the full list of 27 task statements across all domains.

---

## Exam Scenarios

Each exam presents **4 of 6 possible scenarios**, randomly selected. Questions are situated within these scenarios, testing applied judgment rather than recall.

| # | Scenario | Domains Tested |
|---|----------|----------------|
| 1 | Customer Support Resolution Agent | 1, 2, 5 |
| 2 | Code Generation with Claude Code | 3, 5 |
| 3 | Multi-Agent Research System | 1, 2, 5 |
| 4 | Developer Productivity with Claude | 2, 3, 1 |
| 5 | Claude Code for CI/CD | 3, 4 |
| 6 | Structured Data Extraction | 4, 5 |

### Scenario Details

**1. Customer Support Resolution Agent**
Target: 80%+ first-contact resolution. Tools: get_customer, lookup_order, process_refund, escalate_to_human. Tests agentic loop design, error handling, escalation patterns.

**2. Code Generation with Claude Code**
Tests Claude Code configuration, context management during code generation, and session management.

**3. Multi-Agent Research System**
Coordinator delegates to web search, document analysis, synthesis, and report generation subagents. Tests multi-agent orchestration, tool distribution, and error propagation.

**4. Developer Productivity with Claude**
Built-in tools: Read, Write, Bash, Grep, Glob. Tests tool selection, MCP integration, and workflow configuration.

**5. Claude Code for CI/CD**
Automated code reviews, test generation, pull request feedback. Tests CI/CD integration flags, prompt engineering for review quality.

**6. Structured Data Extraction**
JSON schema validation, high accuracy requirements, edge case handling. Tests prompt engineering, structured output, validation loops.

---

## Preparation Exercises

The exam guide includes 4 hands-on exercises for practice:

1. **Build a Multi-Tool Agent with Escalation Logic** (Domains 1, 2, 5)
2. **Configure Claude Code for a Team Development Workflow** (Domains 3, 4)
3. **Build a Structured Data Extraction Pipeline** (Domains 4, 5)
4. **Design and Debug a Multi-Agent Research Pipeline** (Domains 1, 2, 5)

See `docs_hands-on-exercises.md` for detailed instructions.

---

## What Is In Scope

Agentic loops, multi-agent orchestration, MCP design, Claude Code configuration, prompt engineering, structured output, context management, error handling, escalation patterns, batch processing, human review workflows, Agent SDK hooks, session management, built-in tools.

## What Is Out of Scope

Fine-tuning, API authentication/billing, specific programming frameworks, MCP server deployment infrastructure, Claude's internal architecture, Constitutional AI, embeddings, computer use, vision capabilities, streaming API, rate limiting, cloud provider configs, performance benchmarking.

---

## Study Tips

- **Prioritize by weight.** Domain 1 (27%) deserves the most study time. Domains 3 and 4 (20% each) are next. Don't neglect Domain 5 (15%) — it appears in 4 of 6 scenarios.
- **Focus on judgment, not vocabulary.** The exam tests tradeoff decisions ("which approach is best given these constraints?"), not definitions.
- **Understand "why not" for each distractor.** Correct answers require knowing why the other options are wrong.
- **Practice scenario-based reasoning.** Read the scenario context carefully — the correct answer depends on the specific constraints described.
