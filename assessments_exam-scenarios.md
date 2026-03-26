# Exam Scenario Assessments

These scenario-based questions mirror the exam format. The actual exam presents 4 of 6 scenarios randomly.

---

## Scenario 1: Customer Support Resolution Agent
**Context:** A company is building a customer support agent targeting 80%+ first-contact resolution. The agent has access to tools: get_customer, lookup_order, process_refund, escalate_to_human. The system must enforce refund limits and handle escalation appropriately.
**Domains tested:** 1, 2, 5

### Question 1.1
The agent's agentic loop processes customer requests by calling tools and evaluating results. A customer says, "I'd like a refund for order #4821." The agent calls lookup_order and receives the order details, then needs to decide whether to call process_refund or ask the customer a clarifying question.

How should the agentic loop determine the next action?

A) Use a pre-configured decision tree: if order exists and is within 30 days, always call process_refund automatically
B) Let the model evaluate the tool result in the context of the conversation and company policy to decide whether to proceed with the refund or gather more information
C) Always ask the customer a clarifying question before calling any refund tool, regardless of context
D) Call process_refund immediately after lookup_order returns successfully, since the customer explicitly requested a refund

**Answer:** B

**Explanation:** Model-driven decision-making is a core principle of agentic loops. The model should evaluate the tool result (order details, eligibility, amount) against conversation context and policy to determine the best next step. Option A uses a pre-configured decision tree, which removes the model's ability to handle nuanced cases and is not truly agentic. Option C adds unnecessary friction that reduces first-contact resolution. Option D skips evaluation entirely and could process refunds that violate policy (wrong item, outside window, exceeds limits).

**Task Statement:** 1.1

### Question 1.2
The team discovers that when get_customer returns no matching customer, the agent sometimes fabricates customer details and proceeds with the workflow. The tool currently returns `{"result": null}` with no additional context.

What is the best improvement to the tool's response design?

A) Add a fallback that returns the most similar customer name from the database
B) Return a structured response with an explicit message distinguishing "no customer found" from an error, such as `{"found": false, "suggestion": "Ask customer to verify their email or account number"}`
C) Configure tool_choice to force the agent to always call get_customer twice for verification
D) Add a system prompt instruction telling the agent to never fabricate customer details

**Answer:** B

**Explanation:** Clear tool response design with explicit status fields and actionable guidance prevents the model from misinterpreting ambiguous results. Distinguishing between "not found" and "error" gives the agent the context to respond appropriately. Option A risks matching the wrong customer, creating a worse problem. Option C wastes a tool call and does not address the ambiguity of the null result. Option D relies on prompt-based guidance, which is less reliable than structured tool design for preventing specific failure modes.

**Task Statement:** 2.2

### Question 1.3
The agent handles conversations that sometimes require 20+ turns to resolve complex order issues. The team notices that late in long conversations, the agent occasionally contradicts refund amounts or order details it confirmed earlier.

What is the most effective way to address this?

A) Limit conversations to a maximum of 15 turns and escalate if unresolved
B) Store key confirmed facts (order number, refund amount, customer ID) in a structured format that is maintained at the end of the conversation context rather than relying solely on conversation history
C) Increase the model's temperature to make it more creative in resolving complex issues
D) Add a system prompt instruction reminding the agent to be consistent throughout the conversation

**Answer:** B

**Explanation:** In long conversations, earlier details can be lost or degraded as context accumulates. Maintaining a structured summary of confirmed key facts positioned near the end of the context ensures these details receive strong attention from the model. Option A artificially limits the agent's ability to resolve complex issues, hurting the 80%+ resolution target. Option C is counterproductive because higher temperature increases randomness. Option D is a prompt-based approach that cannot compensate for information that has degraded in the context window.

**Task Statement:** 5.1

---

## Scenario 2: Code Generation with Claude Code
**Context:** A development team is using Claude Code for code generation tasks across a large monorepo with frontend and backend code. The repository contains over 3,000 files with TypeScript frontend, Python backend, and shared configuration files.
**Domains tested:** 3, 5

### Question 2.1
The team wants to establish coding conventions so that Claude Code follows different style rules for frontend TypeScript files versus backend Python files. The frontend uses camelCase with React conventions, while the backend uses snake_case with Flask conventions.

What is the best configuration approach?

A) Write all conventions for both languages in the project-level .claude/CLAUDE.md file
B) Create directory-level CLAUDE.md files in both the frontend/ and backend/ directories, each containing only the relevant conventions
C) Create path-specific rule files in .claude/rules/ with YAML frontmatter paths fields using glob patterns like "frontend/**/*.ts" and "backend/**/*.py"
D) Add the conventions to user-level ~/.claude/CLAUDE.md so they apply across all projects

**Answer:** C

**Explanation:** Path-specific rule files in .claude/rules/ with glob pattern frontmatter allow conventions to be conditionally loaded based on which files are being edited. This is more precise than directory-level CLAUDE.md files because glob patterns can target specific file types across multiple directories. Option A loads all conventions at once, which can cause confusion when rules conflict between languages. Option B works but is less flexible than glob patterns for conventions that span multiple directories or target specific file extensions. Option D puts project-specific conventions in a user-level location that is not shared with the team via version control.

**Task Statement:** 3.3

### Question 2.2
A developer asks Claude Code to refactor a core authentication module that touches both frontend and backend. The refactoring involves reading 40+ files to understand the current implementation before making changes.

What approach best preserves context quality during this large-scale investigation?

A) Start the refactoring immediately and read files as needed during the implementation
B) Use plan mode to have Claude Code create a comprehensive refactoring plan first, with subagent delegation for exploring verbose file contents, and write key findings to a scratchpad file before executing changes
C) Split the work into two completely separate sessions, one for frontend and one for backend, with no shared context
D) Provide all 40+ file paths in the initial prompt so Claude Code reads them all before starting

**Answer:** B

**Explanation:** Plan mode is appropriate for complex, large-scale changes with multiple valid approaches. Subagent delegation isolates verbose exploration output from the main agent's context, and scratchpad files persist findings that would otherwise degrade in the context window. Option A skips planning for a task that clearly benefits from it. Option C loses cross-cutting context that is essential for a refactoring that spans both frontend and backend. Option D floods the initial context with raw file contents, causing the "lost in the middle" effect and leaving little room for reasoning.

**Task Statement:** 5.4

### Question 2.3
The team wants to create a reusable workflow for generating API endpoint code from OpenAPI specifications. The workflow should be shareable with the team and allow developers to specify the spec file path as an argument.

What is the correct configuration approach?

A) Create a custom slash command in .claude/commands/ with a markdown file that uses $ARGUMENTS to receive the spec file path, and commit it to version control
B) Create the command in ~/.claude/commands/ so it is available across all projects
C) Write the instructions in the project-level CLAUDE.md file and tell developers to copy-paste the spec path into their prompt
D) Create a Bash script that calls Claude Code with the -p flag and hardcode the spec file path

**Answer:** A

**Explanation:** Project-scoped commands in .claude/commands/ are shared via version control, making them available to the entire team. The $ARGUMENTS placeholder allows developers to pass the spec file path when invoking the command. Option B places the command in the user-level directory, which is not shared with the team. Option C is not reusable and requires manual effort each time. Option D hardcodes the path, removing flexibility, and is a less integrated approach than native slash commands.

**Task Statement:** 3.2

---

## Scenario 3: Multi-Agent Research System
**Context:** An organization is building a research system where a coordinator agent delegates to specialized subagents: web search, document analysis, synthesis, and report generation. The system must produce sourced research reports on complex topics.
**Domains tested:** 1, 2, 5

### Question 3.1
The coordinator needs to decompose a complex research question like "What are the economic impacts of recent tariff policies on the semiconductor industry?" into tasks for its subagents. The question requires both current data and historical analysis.

Which decomposition strategy is most appropriate?

A) A fixed sequential pipeline: web search, then document analysis, then synthesis, then report generation, always in that order
B) Dynamic adaptive decomposition where the coordinator evaluates initial search results and adjusts subsequent subagent tasks based on what information gaps remain
C) Send the full question to all four subagents simultaneously and merge their outputs
D) Have the coordinator answer the question directly from its training data without delegating to subagents

**Answer:** B

**Explanation:** Complex research questions benefit from adaptive decomposition because the coordinator cannot predict in advance what information will be available or what gaps will emerge. After initial search results, the coordinator may discover that tariff impact data requires additional focused searches or that certain documents need deeper analysis. Option A is too rigid for research tasks where the next step depends on what was found previously. Option C wastes resources because not all subagents are relevant at every stage, and the synthesis agent cannot synthesize what has not been gathered yet. Option D ignores the purpose of the subagent system and risks producing outdated or unsourced information.

**Task Statement:** 1.6

### Question 3.2
The team is deciding how to distribute tools across the subagents. The web search subagent currently has 15 tools including web_search, site_scrape, pdf_download, image_search, video_search, news_search, academic_search, patent_search, social_search, translate_page, bookmark_save, history_lookup, cache_read, cache_write, and analytics_log.

What is the primary problem with this tool distribution?

A) The subagent needs even more tools to cover all possible research scenarios
B) Having 15 tools on a single subagent significantly degrades tool selection reliability; the subagent should be scoped to 4-5 core tools relevant to its search function
C) The tools should be distributed evenly across all four subagents so each has roughly the same number
D) All tools should be on the coordinator so it can decide which to use

**Answer:** B

**Explanation:** Research shows that too many tools on a single agent (e.g., 18 instead of 4-5) degrades reliability because the model must select among too many options. The web search subagent should have only the tools directly relevant to its role, such as web_search, news_search, academic_search, and site_scrape. Utility tools like cache_read/write and analytics_log could be handled at a different layer. Option A worsens the existing problem. Option C distributes tools by count rather than relevance, giving agents tools they should not have. Option D violates the principle of subagent specialization and overwhelms the coordinator.

**Task Statement:** 2.3

### Question 3.3
The synthesis subagent receives research findings from multiple sources and must produce a coherent summary. During testing, the team discovers that the final reports contain statistics without attribution, making it impossible to verify claims or identify which source a particular figure came from.

What is the best architectural fix?

A) Add a post-processing step that uses a separate model to guess the likely source for each statistic
B) Require each subagent to return findings as structured claim-source mappings (claim, source URL, publication date, collection date) and require the synthesis subagent to preserve these mappings in its output
C) Include a disclaimer at the end of each report stating that sources may not be accurately attributed
D) Have the report generation subagent re-run all the searches to independently verify each statistic

**Answer:** B

**Explanation:** Source attribution loss during summarization is a core reliability problem. Structured claim-source mappings that include the specific claim, its source, and temporal metadata (publication date, data collection date) must be maintained as a first-class data structure throughout the pipeline, not treated as optional metadata. Option A fabricates attribution after the fact, which is unreliable. Option C acknowledges the problem without fixing it. Option D is wasteful and may not reproduce the same results, especially for time-sensitive data.

**Task Statement:** 5.6

---

## Scenario 4: Developer Productivity with Claude
**Context:** A team is configuring Claude Code with built-in tools (Read, Write, Bash, Grep, Glob) and MCP integrations for daily development workflows. The team works on a Python web application with a PostgreSQL database.
**Domains tested:** 2, 3, 1

### Question 4.1
A developer needs to find all files in the project that import a specific database utility module. They ask Claude Code to help locate these files.

Which built-in tool is most appropriate for this task?

A) Glob with the pattern "**/*.py" to find all Python files, then Read each file to check for the import
B) Bash with `find . -name "*.py" -exec grep -l "from db_utils import" {} \;`
C) Grep to search for the import pattern "from db_utils import" across the codebase
D) Read the project's requirements.txt to identify which modules depend on db_utils

**Answer:** C

**Explanation:** Grep is the built-in tool designed specifically for searching file contents by pattern. It directly finds all files containing the import statement without requiring multi-step approaches. Option A uses Glob for file path matching (its intended purpose) but then requires reading every Python file individually, which is extremely inefficient. Option B uses Bash to replicate functionality that Grep already provides natively, and built-in tools are preferred over shell command equivalents. Option D searches dependency declarations, not actual import usage in source code.

**Task Statement:** 2.5

### Question 4.2
The team wants to integrate a PostgreSQL MCP server so Claude Code can query the database directly during development. The database credentials differ between team members (each developer has their own database instance).

What is the correct MCP server configuration approach?

A) Add the MCP server configuration with hardcoded credentials in the project-level .mcp.json file
B) Configure the MCP server in .mcp.json with environment variable expansion for credentials (e.g., `${DB_PASSWORD}`), so each developer sets their own environment variables
C) Have each developer add the MCP server configuration to their user-level ~/.claude.json file with their personal credentials
D) Store the database password in the project CLAUDE.md file so Claude Code can read it

**Answer:** B

**Explanation:** MCP server configuration in .mcp.json supports environment variable expansion for credentials. This allows the server configuration structure to be shared via version control while each developer provides their own credentials through environment variables. Option A commits credentials to version control, which is a security risk. Option C works for personal use but means the MCP server configuration is not shared with the team and must be manually set up by each developer. Option D exposes credentials in a markdown file that is committed to the repository.

**Task Statement:** 2.4

### Question 4.3
The team is building a feature that requires changes across the database migration, the API route handler, the service layer, and the test files. A developer starts a Claude Code session, implements the migration and service layer, then needs to pause for a meeting and continue later.

What is the best approach for maintaining continuity?

A) Copy the conversation into a text file and paste it as context in a new session
B) Use named session resumption with --resume to continue the same session, ensuring Claude Code retains the context of what was already implemented
C) Start a fresh session and trust that Claude Code will detect the changes by reading the modified files
D) Use fork_session to create a branching exploration of the remaining work

**Answer:** B

**Explanation:** Named session resumption (--resume) preserves the full conversation history and context from the original session, allowing the developer to continue exactly where they left off with awareness of what was already done and what remains. Option A loses tool call history and structured context. Option C starts fresh with no awareness of the implementation plan, decisions made, or work in progress. Option D is for divergent exploration of alternative approaches, not for continuing a linear workflow.

**Task Statement:** 1.7

---

## Scenario 5: Claude Code for CI/CD
**Context:** A team is integrating Claude Code into their CI/CD pipeline for automated code reviews, test generation, and pull request feedback. The pipeline runs on every pull request.
**Domains tested:** 3, 4

### Question 5.1
The team configures Claude Code to run automated code reviews in CI. The initial implementation adds review comments as part of the same pipeline step that runs tests. After a month, they notice that Claude Code's reviews sometimes reference test results from the same run and rubber-stamp code that happens to pass tests.

What is the best architectural fix?

A) Add a system prompt instruction telling the reviewer to ignore test results when reviewing code quality
B) Run the code review as an independent Claude Code instance with its own isolated session context, separate from the test execution pipeline
C) Increase the review strictness by lowering the threshold for flagging issues
D) Have the same Claude Code instance run tests first, then review the code, to ensure test awareness

**Answer:** B

**Explanation:** Independent review instances are more effective than self-review or context-contaminated review. When the review instance shares context with test execution, it has access to test outcomes that bias its review toward confirming passing code rather than independently evaluating quality. Session context isolation ensures the reviewer evaluates the code on its own merits. Option A uses prompt-based guidance to overcome a structural problem, which is unreliable. Option C adjusts sensitivity without addressing the contamination issue. Option D deliberately increases the context contamination problem.

**Task Statement:** 3.6

### Question 5.2
The automated review pipeline is generating too many false positive comments on pull requests, causing developers to ignore all review feedback. The current review prompt says: "Review this code and flag anything that could be improved. Be thorough."

What is the most effective prompt improvement?

A) Change the prompt to: "Be conservative and only flag critical issues"
B) Replace the vague instruction with explicit criteria: "Flag only: (1) bugs that would cause runtime errors, (2) security vulnerabilities in input handling, (3) missing null checks on database query results. Do not flag style preferences or minor optimizations."
C) Add: "Think step by step about each line of code before flagging issues"
D) Add: "You are a senior staff engineer with 20 years of experience. Be very selective."

**Answer:** B

**Explanation:** Explicit criteria dramatically improve precision by giving the model clear decision boundaries for what constitutes a flaggable issue. Vague instructions like "be thorough" or "be conservative" do not give the model actionable standards. Option A uses a general instruction ("be conservative") that is documented as ineffective for reducing false positives. Option C adds reasoning steps but does not clarify what should be flagged. Option D uses persona assignment, which does not provide concrete review criteria and still leaves the decision boundary ambiguous.

**Task Statement:** 4.1

### Question 5.3
The team wants Claude Code to output structured JSON for each review comment so the CI system can programmatically create inline PR comments. The output should include the file path, line number, severity, and comment text. Occasionally, the model outputs malformed JSON that breaks the CI parser.

What is the most reliable approach to guarantee valid JSON output?

A) Add "Output valid JSON only" to the system prompt and parse the response
B) Use the --output-format json flag combined with a --json-schema flag that specifies the exact expected structure with required fields
C) Use a regex to extract JSON from the model's free-text response
D) Ask the model to validate its own JSON output before returning it

**Answer:** B

**Explanation:** The --output-format json and --json-schema flags in non-interactive mode enforce schema-compliant structured output, eliminating JSON syntax errors. The schema defines required fields (file, line, severity, comment), and the output is guaranteed to conform. Option A relies on prompt instruction, which does not guarantee valid JSON. Option C is fragile and fails on edge cases. Option D is a form of self-review that adds latency without guaranteeing validity since the model can incorrectly validate its own output.

**Task Statement:** 4.3

---

## Scenario 6: Structured Data Extraction
**Context:** A company needs to extract structured data from thousands of invoices with high accuracy requirements and JSON schema validation. Invoices come from hundreds of different vendors with varying formats, and extracted data feeds directly into the accounts payable system.
**Domains tested:** 4, 5

### Question 6.1
The extraction pipeline uses a JSON schema that includes a "payment_terms" field. Most invoices use standard terms like "Net 30" or "Net 60," but some include unusual terms like "2/10 Net 30" (2% discount if paid within 10 days) or vendor-specific language. The team wants the schema to handle both standard and non-standard terms without losing information.

What is the best schema design approach?

A) Define payment_terms as a free-text string field to capture any possible value
B) Define payment_terms as an enum of known values ("net_30", "net_60", "due_on_receipt") and reject invoices with non-matching terms
C) Define payment_terms as an enum of common values plus an "other" option, paired with a payment_terms_detail string field that captures the original text when "other" is selected
D) Define two separate fields: payment_terms_standard (enum) and payment_terms_custom (string), both always required

**Answer:** C

**Explanation:** The enum-with-other pattern provides structured, queryable output for common cases while preserving the original text for non-standard terms. This is the recommended schema design for fields with a known set of common values but an open tail of possibilities. Option A sacrifices structure entirely, making downstream analysis difficult since there is no normalization. Option B silently rejects valid invoices with unusual terms. Option D forces both fields to always be populated, creating redundancy for standard terms and confusion about which field to use.

**Task Statement:** 4.3

### Question 6.2
The pipeline includes a validation step that retries extraction when the output fails schema validation. After adding retries, the team notices that some fields (like "invoice_number") correctly retry and fix formatting issues, while other fields (like "vendor_tax_id") continue to fail even after three retries on certain invoices.

What explains this difference, and what should the team do?

A) Increase the retry count to five for all fields to give the model more attempts
B) Formatting errors (wrong date format, missing prefix) are fixable via retry because the information exists in the source; missing information (tax ID not printed on the invoice) cannot be fixed by retrying because the data is absent, so the pipeline should distinguish between format errors and absent-data errors
C) The model is not capable of extracting tax IDs and should be replaced with OCR for that field
D) Add a few-shot example specifically for tax ID extraction to fix the retry failures

**Answer:** B

**Explanation:** Retry-with-error-feedback is effective for format and syntax errors because the correct information exists in the source and the model simply needs to reformat its output. However, retrying cannot conjure information that does not appear in the source document. When a vendor's tax ID is not printed on the invoice, no amount of retrying will produce it. The pipeline should categorize validation failures as format errors (retryable) versus absent-data errors (flag for human review). Option A wastes resources retrying unfixable errors. Option C is an overreaction to a data availability issue. Option D helps with extraction quality but does not address cases where the information is genuinely absent.

**Task Statement:** 4.4

### Question 6.3
The company wants to deploy the extraction system with a human review workflow. They plan to measure accuracy by having reviewers check a random 5% sample of all extractions. After deployment, they want to add field-level confidence scores so low-confidence extractions can be routed to human review.

What is the critical flaw in the proposed sampling and confidence approach?

A) 5% is too low a sample rate; they should review at least 20% of all extractions
B) Random sampling may under-represent rare but high-error invoice types; the team should use stratified sampling by vendor type and document format, and confidence scores must be calibrated against labeled validation sets to ensure that a 0.85 confidence score actually corresponds to 85% accuracy
C) Confidence scores are always accurate and do not need calibration, so the team should skip the calibration step to save time
D) Human reviewers should check 100% of extractions for the first year before trusting any automated confidence scoring

**Answer:** B

**Explanation:** Random sampling risks the same pitfall described in this scenario's context: rare invoice types with high error rates get buried in aggregate metrics. Stratified sampling ensures each vendor type, document format, and field type is measured independently. For confidence scores, calibration against labeled validation sets is essential because uncalibrated scores may not correspond to actual accuracy. A model reporting 0.90 confidence might only be correct 70% of the time on certain field types without calibration. Option A increases volume without addressing the distribution problem. Option C is factually wrong since confidence scores require calibration. Option D is cost-prohibitive and defeats the purpose of automation.

**Task Statement:** 5.5
