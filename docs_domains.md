# Exam Domains

The Claude Certified Architect – Foundations exam covers five domains. Each domain is weighted differently, reflecting its relative importance on the exam.

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Agentic Architecture & Orchestration | 27% |
| 2 | Tool Design & MCP Integration | 18% |
| 3 | Claude Code Configuration & Workflows | 20% |
| 4 | Prompt Engineering & Structured Output | 20% |
| 5 | Context Management & Reliability | 15% |

---

## Domain 1: Agentic Architecture & Orchestration (27%)

The highest-weighted domain. Covers designing, building, and managing autonomous agent systems.

### Task Statements

- **1.1** Design and implement agentic loops for autonomous task execution
  - stop_reason handling ("tool_use" vs "end_turn")
  - Tool results appended to conversation history
  - Model-driven decision-making vs pre-configured decision trees

- **1.2** Orchestrate multi-agent systems with coordinator-subagent patterns
  - Hub-and-spoke architecture
  - Subagents operate with isolated context
  - Coordinator role: decomposition, delegation, result aggregation

- **1.3** Configure subagent invocation, context passing, and spawning
  - Task tool mechanism for spawning subagents
  - allowedTools must include "Task" for delegation
  - Subagent context explicitly provided; no automatic inheritance
  - AgentDefinition configuration and fork-based session management

- **1.4** Implement multi-step workflows with enforcement and handoff patterns
  - Programmatic enforcement vs prompt-based guidance
  - Deterministic compliance required for critical business logic
  - Structured handoff protocols for escalation

- **1.5** Apply Agent SDK hooks for tool call interception and data normalization
  - PostToolUse hooks for data transformation
  - Tool call interception hooks for compliance enforcement
  - Distinction between programmatic enforcement and prompt-based guidance

- **1.6** Design task decomposition strategies for complex workflows
  - Fixed sequential pipelines vs dynamic adaptive decomposition
  - Prompt chaining patterns
  - Adaptive investigation plans

- **1.7** Manage session state, resumption, and forking
  - Named session resumption using --resume
  - fork_session for divergent exploration
  - Importance of informing agent about file changes between sessions

---

## Domain 2: Tool Design & MCP Integration (18%)

Covers designing tool interfaces, handling errors, and integrating MCP servers.

### Task Statements

- **2.1** Design effective tool interfaces with clear descriptions and boundaries
  - Tool descriptions as primary selection mechanism
  - Include input formats, example queries, edge cases, boundary explanations
  - Impact of ambiguous or overlapping descriptions on tool selection
  - System prompt wording effects on tool selection

- **2.2** Implement structured error responses for MCP tools
  - MCP isError flag pattern
  - Error categories: transient, validation, business, permission
  - Structured metadata: errorCategory, isRetryable, human-readable descriptions
  - Distinction between retryable and non-retryable errors

- **2.3** Distribute tools appropriately across agents and configure tool_choice
  - Too many tools (e.g., 18 instead of 4-5) degrades reliability
  - Scoped tool access by role
  - tool_choice options: "auto", "any", forced tool selection

- **2.4** Integrate MCP servers into Claude Code and agent workflows
  - MCP server scoping: project-level (.mcp.json) vs user-level (~/.claude.json)
  - Environment variable expansion for credentials
  - Tools discovered at connection time and available simultaneously
  - MCP resources for content catalogs to reduce exploratory calls

- **2.5** Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively
  - Grep for content search; Glob for file path pattern matching
  - Read/Write for full file operations; Edit for targeted modifications
  - Edit fallback: Read + Write for non-unique text matches

---

## Domain 3: Claude Code Configuration & Workflows (20%)

Covers configuring Claude Code for team workflows, CI/CD integration, and iterative development.

### Task Statements

- **3.1** Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization
  - Hierarchy: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md), directory-level
  - User-level settings apply only to that user (not shared via version control)
  - @import syntax for modular organization
  - .claude/rules/ directory for topic-specific rule files

- **3.2** Create and configure custom slash commands and skills
  - Project-scoped commands in .claude/commands/ (shared via version control)
  - User-scoped commands in ~/.claude/commands/ (personal)
  - Skills in .claude/skills/ with SKILL.md files
  - Frontmatter options: context: fork, allowed-tools, argument-hint

- **3.3** Apply path-specific rules for conditional convention loading
  - .claude/rules/ files with YAML frontmatter paths fields
  - Glob patterns for conditional rule activation
  - Advantage over directory-level CLAUDE.md for conventions spanning multiple directories

- **3.4** Determine when to use plan mode vs direct execution
  - Plan mode: complex tasks, large-scale changes, multiple valid approaches, architectural decisions
  - Direct execution: simple, well-scoped changes
  - Explore subagent for isolating verbose discovery output from main context

- **3.5** Apply iterative refinement techniques for progressive improvement
  - Concrete input/output examples for clarity
  - Test-driven iteration (write test first, iterate until passing)
  - Interview pattern (Claude asks clarifying questions before acting)
  - When to provide all issues at once vs sequentially

- **3.6** Integrate Claude Code into CI/CD pipelines
  - -p / --print flag for non-interactive mode
  - --output-format json and --json-schema for structured output
  - CLAUDE.md for providing project context in CI
  - Session context isolation: independent review instances more effective than self-review

---

## Domain 4: Prompt Engineering & Structured Output (20%)

Covers prompt design, structured output enforcement, batch processing, and review architectures.

### Task Statements

- **4.1** Design prompts with explicit criteria to improve precision and reduce false positives
  - Explicit criteria over vague instructions
  - General instructions like "be conservative" are ineffective
  - Impact of false positive rates on developer trust

- **4.2** Apply few-shot prompting to improve output consistency and quality
  - Few-shot examples as most effective technique for consistency
  - Demonstration of ambiguous-case handling
  - Enable generalization to novel patterns
  - Reduce hallucination in extraction tasks

- **4.3** Enforce structured output using tool use and JSON schemas
  - Tool use with JSON schemas for guaranteed schema-compliant output
  - tool_choice distinction: "auto", "any", forced tool selection
  - Strict JSON schemas eliminate syntax errors (but not semantic errors)
  - Schema design: required vs optional fields, enum with "other" + detail patterns

- **4.4** Implement validation, retry, and feedback loops for extraction quality
  - Retry-with-error-feedback pattern
  - Limits of retry (information absent vs format errors)
  - Feedback loop design: tracking detected_pattern for dismissal analysis
  - Semantic vs schema syntax validation errors

- **4.5** Design efficient batch processing strategies
  - Message Batches API: 50% cost savings, up to 24-hour processing window
  - Appropriate for non-blocking, latency-tolerant workloads
  - Not appropriate for blocking workflows (e.g., pre-merge checks)
  - Batch API does not support multi-turn tool calling within a single request
  - custom_id fields for request/response correlation

- **4.6** Design multi-instance and multi-pass review architectures
  - Self-review limitations: model retains reasoning context
  - Independent review instances more effective than self-review instructions
  - Multi-pass review: per-file local analysis + cross-file integration passes

---

## Domain 5: Context Management & Reliability (15%)

Covers managing context windows, escalation patterns, error propagation, and human review workflows.

### Task Statements

- **5.1** Manage conversation context to preserve critical information across long interactions
  - Progressive summarization risks (condensing numerical values, dates, expectations)
  - "Lost in the middle" effect
  - Tool results accumulate disproportionately in context
  - Importance of complete conversation history

- **5.2** Design effective escalation and ambiguity resolution patterns
  - Escalation triggers: customer requests for human, policy exceptions/gaps, inability to progress
  - Distinction between escalating immediately vs offering resolution first
  - Sentiment-based escalation and self-reported confidence are unreliable
  - Multiple customer matches require clarification, not heuristics

- **5.3** Implement error propagation strategies across multi-agent systems
  - Structured error context enabling intelligent coordinator recovery
  - Distinction between access failures and valid empty results
  - Why generic error statuses hide valuable context
  - Why silently suppressing errors or terminating workflows are anti-patterns

- **5.4** Manage context effectively in large codebase exploration
  - Context degradation in extended sessions
  - Role of scratchpad files for persisting findings
  - Subagent delegation for isolating verbose output
  - Structured state persistence for crash recovery

- **5.5** Design human review workflows and confidence calibration
  - Risk that aggregate accuracy metrics mask poor performance on specific types
  - Stratified random sampling for error rate measurement
  - Field-level confidence scores calibrated using labeled validation sets
  - Importance of validating accuracy by document type and field

- **5.6** Preserve information provenance and handle uncertainty in multi-source synthesis
  - How source attribution is lost during summarization
  - Structured claim-source mappings that must be preserved
  - Handling conflicting statistics from credible sources
  - Temporal data requirements (publication/collection dates)
