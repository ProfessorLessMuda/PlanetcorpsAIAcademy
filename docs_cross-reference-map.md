# Cross-Reference Map

This file maps every task statement to where it's taught, tested, and applied across the curriculum.

---

## Matrix 1: Task Statement → Module → Assessment → Scenarios

| Task | Curriculum Module | Domain Assessment | Exam Scenarios |
|------|-------------------|-------------------|----------------|
| 1.1 | Module 01 | Domain 01, Q1 | Scenario 1 |
| 1.2 | Module 01 | Domain 01, Q2 | Scenario 3 |
| 1.3 | Module 01 | Domain 01, Q3-Q4 | Scenario 3 |
| 1.4 | Module 01 | Domain 01, Q5 | Scenario 1 |
| 1.5 | Module 01 | Domain 01, Q6 | Scenario 1 |
| 1.6 | Module 01 | Domain 01, Q7 | Scenario 3 |
| 1.7 | Module 01 | Domain 01, Q8-Q9 | Scenario 4 |
| 2.1 | Module 02 | Domain 02, Q1 | Scenario 1, 4 |
| 2.2 | Module 02 | Domain 02, Q2 | Scenario 1 |
| 2.3 | Module 02 | Domain 02, Q3-Q4 | Scenario 3, 4 |
| 2.4 | Module 02 | Domain 02, Q5-Q6 | Scenario 4 |
| 2.5 | Module 02 | Domain 02, Q7 | Scenario 4 |
| 3.1 | Module 03 | Domain 03, Q1-Q2 | Scenario 2 |
| 3.2 | Module 03 | Domain 03, Q3-Q4 | Scenario 2 |
| 3.3 | Module 03 | Domain 03, Q5 | Scenario 2 |
| 3.4 | Module 03 | Domain 03, Q6 | Scenario 2 |
| 3.5 | Module 03 | Domain 03, Q7 | Scenario 5 |
| 3.6 | Module 03 | Domain 03, Q8 | Scenario 5 |
| 4.1 | Module 04 | Domain 04, Q1 | Scenario 5 |
| 4.2 | Module 04 | Domain 04, Q2 | Scenario 6 |
| 4.3 | Module 04 | Domain 04, Q3 | Scenario 5, 6 |
| 4.4 | Module 04 | Domain 04, Q4 | Scenario 6 |
| 4.5 | Module 04 | Domain 04, Q5, Q7 | — |
| 4.6 | Module 04 | Domain 04, Q6, Q8 | Scenario 5 |
| 5.1 | Module 05 | Domain 05, Q1, Q7 | Scenario 1, 2 |
| 5.2 | Module 05 | Domain 05, Q2 | Scenario 1 |
| 5.3 | Module 05 | Domain 05, Q3 | Scenario 3 |
| 5.4 | Module 05 | Domain 05, Q4 | Scenario 2 |
| 5.5 | Module 05 | Domain 05, Q5 | Scenario 6 |
| 5.6 | Module 05 | Domain 05, Q6 | Scenario 3 |

---

## Matrix 2: Exam Scenario → Domains → Task Statements → Exercises

| Scenario | Domains | Key Task Statements | Related Exercise |
|----------|---------|---------------------|------------------|
| 1. Customer Support Agent | 1, 2, 5 | 1.1, 1.4, 2.1, 2.2, 5.1, 5.2 | Exercise 1 |
| 2. Code Generation | 3, 5 | 3.1, 3.2, 3.3, 5.1, 5.4 | Exercise 2 |
| 3. Multi-Agent Research | 1, 2, 5 | 1.2, 1.6, 2.3, 5.3, 5.6 | Exercise 4 |
| 4. Developer Productivity | 2, 3, 1 | 1.7, 2.4, 2.5, 3.1, 3.2 | Exercise 2 |
| 5. CI/CD | 3, 4 | 3.5, 3.6, 4.1, 4.3, 4.6 | Exercise 2 |
| 6. Structured Data Extraction | 4, 5 | 4.2, 4.3, 4.4, 5.5 | Exercise 3 |

---

## Matrix 3: Exercise → Domains → Task Statements

| Exercise | Domains | Task Statements Practiced |
|----------|---------|---------------------------|
| 1. Multi-Tool Agent with Escalation | 1, 2, 5 | 1.1, 1.4, 1.5, 2.1, 2.2, 5.2 |
| 2. Team Development Workflow | 3, 4 | 3.1, 3.2, 3.3, 3.5, 3.6 |
| 3. Data Extraction Pipeline | 4, 5 | 4.1, 4.2, 4.3, 4.4, 4.5, 5.5 |
| 4. Multi-Agent Research Pipeline | 1, 2, 5 | 1.2, 1.3, 1.6, 2.3, 5.3, 5.6 |

---

## Key Cross-Domain Connections

These task statements are connected across domains — understanding one deepens understanding of the other:

| Connection | Task Statements | Why They Connect |
|------------|-----------------|------------------|
| Agent tools | 1.2/1.3 ↔ 2.3 | Multi-agent orchestration requires proper tool distribution |
| Error handling | 1.4/1.5 ↔ 5.3 | Enforcement hooks and error propagation work together |
| Context in agents | 1.1 ↔ 5.1/5.4 | Long-running agentic loops face context degradation |
| Claude Code as prompts | 3.1 ↔ 4.1 | CLAUDE.md configuration IS prompt engineering |
| Review quality | 3.6 ↔ 4.6 | CI session isolation extends multi-instance review |
| Validation | 4.4 ↔ 5.5 | Retry loops connect to confidence calibration |
| Escalation | 1.4 ↔ 5.2 | Workflow handoffs connect to escalation design |

---

## Coverage Verification

All 27 task statements are covered by:
- At least one curriculum module section
- At least one domain assessment question
- At least one exam scenario (except 4.5 which is tested in domain questions only)
- At least one hands-on exercise (most task statements)
