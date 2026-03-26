# Hands-On Exercises

Four practical exercises aligned with the certification exam's preparation recommendations. Each exercise practices concepts across multiple domains and task statements.

---

## Exercise 1: Build a Multi-Tool Agent with Escalation Logic

**Domains practiced:** 1 (Agentic Architecture), 2 (Tool Design), 5 (Reliability)
**Task statements:** 1.1, 1.4, 1.5, 2.1, 2.2, 5.2

### Objective
Build an agentic loop for a customer support agent that handles order lookups, processes refunds with programmatic limits, and escalates to humans when appropriate.

### Setup
- Define 4 tool interfaces: get_customer, lookup_order, process_refund, escalate_to_human
- Prepare mock data: 5 customer records with varied order histories
- Define refund policy: automatic approval under $100, manager approval required over $100

### Tasks

**Step 1: Design tool descriptions (Task 2.1)**
Write descriptions for each tool that clearly state input formats, expected outputs, and boundaries. Include what each tool does NOT do.

**Step 2: Implement the agentic loop (Task 1.1)**
Build a while loop that calls the model, checks stop_reason, executes tool calls, and appends results. Handle end_turn (terminate), tool_use (execute and continue), and max_tokens (error handling).

**Step 3: Add programmatic enforcement (Task 1.4)**
Implement a code-level check that blocks process_refund calls exceeding $100 without an approval flag. Do NOT rely on prompt instructions for this — use programmatic enforcement.

**Step 4: Implement structured error responses (Task 2.2)**
When enforcement blocks a refund, return a structured error with isError: true, errorCategory: "business", isRetryable: false, and a message explaining why.

**Step 5: Add escalation triggers (Task 5.2)**
Define deterministic escalation triggers: customer explicitly requests human, refund exceeds $100 and no manager approval available, agent has attempted 3 resolution strategies without success. Do NOT use sentiment-based detection.

**Step 6: Add a PostToolUse hook (Task 1.5)**
Implement a hook that normalizes date formats in all tool results to ISO 8601 before they're appended to the conversation.

### Success Criteria
- The agentic loop correctly terminates on end_turn and continues on tool_use
- Refunds over $100 are blocked by code, not by prompt
- Escalation triggers fire on the defined conditions (not sentiment)
- All tool results contain normalized date formats
- Error responses include structured metadata

---

## Exercise 2: Configure Claude Code for a Team Development Workflow

**Domains practiced:** 3 (Claude Code), 4 (Prompt Engineering)
**Task statements:** 3.1, 3.2, 3.3, 3.5, 3.6

### Objective
Set up a complete Claude Code configuration for a team working on a monorepo with frontend (React/TypeScript) and backend (Python/FastAPI) code.

### Setup
- Create a project directory with frontend/ and backend/ subdirectories
- Include sample files: React components, Python API endpoints, test files in both areas

### Tasks

**Step 1: Design the CLAUDE.md hierarchy (Task 3.1)**
- Create a project-level .claude/CLAUDE.md with team-wide conventions (code style, PR process, testing requirements)
- Document what should go in user-level (~/.claude/CLAUDE.md) vs project-level
- Use @import to break the CLAUDE.md into focused modules (e.g., @import testing-conventions.md)

**Step 2: Create path-specific rules (Task 3.3)**
- Write a .claude/rules/ file for all *.tsx files: React component conventions, hook patterns
- Write a .claude/rules/ file for all *.py files: Python style, FastAPI patterns, type hints
- Write a .claude/rules/ file for all *test* files: testing patterns, assertion styles, mock usage
- Use YAML frontmatter with appropriate glob patterns

**Step 3: Build custom slash commands (Task 3.2)**
- Create a project command (/review) that performs code review with explicit criteria
- Create a project command (/test-gen) that generates tests for a given file
- Set appropriate frontmatter: context: fork for isolation, allowed-tools restrictions

**Step 4: Apply iterative refinement (Task 3.5)**
- Add concrete input/output examples to the /review command's prompt
- Include edge case examples showing how the review should handle ambiguous situations
- Test the command and refine based on output quality

**Step 5: Configure CI/CD integration (Task 3.6)**
- Write a CI script that runs Claude Code with -p flag for non-interactive mode
- Use --output-format json for structured review output
- Design the pipeline to use independent Claude Code instances per PR file (not one instance reviewing everything)

### Success Criteria
- CLAUDE.md hierarchy is properly scoped (personal vs shared)
- Path-specific rules activate correctly for the right file types
- Slash commands work with proper frontmatter configuration
- CI pipeline uses -p flag and independent review instances
- Configurations are checked into version control (except user-level)

---

## Exercise 3: Build a Structured Data Extraction Pipeline

**Domains practiced:** 4 (Prompt Engineering), 5 (Reliability)
**Task statements:** 4.1, 4.2, 4.3, 4.4, 4.5, 5.5

### Objective
Build a pipeline that extracts structured data from invoices with high accuracy, using JSON schemas, few-shot prompting, validation loops, and human review workflows.

### Setup
- Prepare 20 sample invoices (text format) with varying structures
- Define target extraction fields: vendor_name, invoice_number, date, line_items, total_amount, tax_amount
- Prepare a labeled validation set of 10 invoices with known correct extractions

### Tasks

**Step 1: Design the JSON schema (Task 4.3)**
- Define required fields (vendor_name, invoice_number, total_amount) vs optional fields (tax_amount, purchase_order)
- Use enum with "other" + detail pattern for invoice_type (e.g., "service", "product", "subscription", "other")
- Configure tool_use with forced tool_choice to guarantee schema-compliant output

**Step 2: Write explicit extraction criteria (Task 4.1)**
- Define exactly what constitutes each field (e.g., "total_amount is the final amount due INCLUDING tax, NOT the subtotal")
- Specify handling rules for missing data (null vs empty string vs "not found")
- Avoid vague instructions like "extract relevant information"

**Step 3: Add few-shot examples (Task 4.2)**
- Include 3 examples: a straightforward invoice, an invoice with missing fields, and an ambiguous invoice
- Show how to handle the ambiguous case (the most valuable example)
- Demonstrate the "other" + detail pattern for unusual invoice types

**Step 4: Implement validation and retry (Task 4.4)**
- Add schema validation (is the output valid JSON matching the schema?)
- Add semantic validation (is the total_amount a positive number? Does the date parse?)
- Implement retry-with-error-feedback for format errors
- Do NOT retry when information is absent from the source — return null instead

**Step 5: Design batch processing (Task 4.5)**
- Configure Message Batches API for the 20 invoices
- Use custom_id to correlate each request with its source invoice
- Verify that this is a latency-tolerant workload appropriate for batch processing

**Step 6: Design human review workflow (Task 5.5)**
- Implement field-level confidence scoring
- Calibrate confidence thresholds using the 10-invoice validation set
- Design stratified sampling: review a sample from each invoice type, not just random selection
- Flag documents where confidence is below threshold for human review

### Success Criteria
- JSON output matches the defined schema for all invoices
- Missing data returns null, not hallucinated values
- Retry fixes format errors but doesn't retry for absent data
- Batch processing completes with correct request-response correlation
- Human review workflow correctly prioritizes low-confidence extractions
- Accuracy is validated per field type, not just in aggregate

---

## Exercise 4: Design and Debug a Multi-Agent Research Pipeline

**Domains practiced:** 1 (Agentic Architecture), 2 (Tool Design), 5 (Reliability)
**Task statements:** 1.2, 1.3, 1.6, 2.3, 5.3, 5.6

### Objective
Design a multi-agent research system where a coordinator delegates to specialized subagents, with proper error propagation and source attribution.

### Setup
- Define 4 subagent roles: web_search, document_analysis, synthesis, report_generation
- Prepare mock tool results including: successful results, failed results (access denied), empty results (no data found), and conflicting information from different sources

### Tasks

**Step 1: Design the coordinator-subagent architecture (Task 1.2)**
- Define the coordinator's responsibilities: task decomposition, delegation, result aggregation
- Choose hub-and-spoke topology (coordinator manages all subagents directly)
- Define what context the coordinator passes to each subagent and what each returns

**Step 2: Configure subagent context and tools (Task 1.3)**
- Define AgentDefinition for each subagent with scoped allowedTools
- Explicitly specify what context each subagent receives (not inherited from coordinator)
- Limit each subagent to 4-5 tools maximum (Task 2.3)

**Step 3: Design task decomposition (Task 1.6)**
- Use adaptive decomposition: the coordinator creates an initial research plan but revises it based on subagent results
- Handle the case where web_search returns unexpected information that changes the research direction
- Compare this to a fixed sequential pipeline and articulate why adaptive is better for research

**Step 4: Implement error propagation (Task 5.3)**
- Design structured error responses that distinguish: access failure (database unreachable), permission failure (access denied), valid empty result (query returned no matches)
- The coordinator should: retry on transient failures, route around permission failures, treat empty results as valid data points
- Anti-pattern to avoid: returning generic { status: "error" } without context

**Step 5: Preserve information provenance (Task 5.6)**
- Design a claim-source mapping structure: each fact paired with its source URL, publication date, and confidence
- When sources conflict, the synthesis subagent surfaces both claims with their sources rather than silently choosing one
- Track temporal data: which source was published when, which data is freshest

**Step 6: Debug a failure scenario**
- Simulate: web_search fails with a transient error, document_analysis returns conflicting dates from two sources, synthesis must handle both issues
- Walk through how the coordinator handles each: retry the search, pass conflicting data to synthesis with provenance, synthesis reports the conflict in the final output

### Success Criteria
- Coordinator correctly decomposes tasks and delegates to appropriate subagents
- Subagents have scoped tools (4-5 max) and explicitly provided context
- Error propagation distinguishes failure types and enables intelligent recovery
- Source attribution is preserved through the entire pipeline
- Conflicting information is surfaced, not silently resolved
- The system recovers gracefully from transient errors
