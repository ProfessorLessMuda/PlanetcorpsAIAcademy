# Module 02 - Tool Design & MCP Integration

## Exam Weighting: 18%

## Objective

Understand how to design effective tool interfaces, implement structured error handling, distribute tools across agents, and integrate MCP servers into Claude workflows. This domain tests your ability to make tools discoverable, reliable, and well-scoped so that Claude selects and uses them correctly.

---

## Task Statements Covered

- **2.1:** Design effective tool interfaces with clear descriptions and boundaries
- **2.2:** Implement structured error responses for MCP tools
- **2.3:** Distribute tools appropriately across agents and configure tool_choice
- **2.4:** Integrate MCP servers into Claude Code and agent workflows
- **2.5:** Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob) effectively

---

## Key Concepts

### 2.1 Tool Interface Design

#### Why Tool Descriptions Matter

Tool descriptions are the PRIMARY mechanism Claude uses to decide which tool to call. When Claude receives a user request and has access to multiple tools, it reads each tool's description to determine which one matches the task. If the descriptions are vague, overlapping, or incomplete, Claude will make selection errors — calling the wrong tool, calling no tool when it should, or calling a tool with incorrect parameters.

Think of tool descriptions as the contract between you and the model. The model cannot read your source code or infer what a tool does from its implementation. It relies entirely on what you tell it.

#### Anatomy of an Effective Tool Description

A well-designed tool description includes five components:

1. **Purpose statement** — What the tool does in one sentence.
2. **Input formats** — What parameters it accepts and in what format.
3. **Example queries** — Concrete examples of valid inputs.
4. **Output description** — What the tool returns.
5. **Boundary statements** — What the tool does NOT do.

#### Bad vs Good Descriptions

**Bad description:**
```
"Searches the database."
```

This tells Claude almost nothing. Which database? What fields can be searched? What does it return? Claude cannot distinguish this tool from any other search tool.

**Good description:**
```
"Searches the customer database by email address, phone number, or order ID.
Returns customer name, email, order history (last 10 orders), and account status.
Use this tool when the user provides identifying information about a customer.
Does NOT search by customer name, partial matches, or physical address —
use fuzzy_customer_search for those cases."
```

This description tells Claude exactly when to use this tool, what inputs are valid, what it returns, and critically, when NOT to use it (directing Claude to an alternative instead).

#### Boundary Statements Prevent Overlap

When you have multiple tools that seem related, boundary statements are essential. Without them, Claude may pick the wrong tool or oscillate between tools.

For example, if you have both `search_customers` and `fuzzy_customer_search`:

- `search_customers`: "...Does NOT support partial name matches or address-based lookups. Use fuzzy_customer_search for those."
- `fuzzy_customer_search`: "...Use this when the user provides a partial name, approximate spelling, or physical address. Does NOT accept order IDs or exact email lookups — use search_customers for those."

Each tool explicitly defers to the other for cases outside its scope. This eliminates ambiguity.

#### System Prompt Influence on Tool Selection

The system prompt also affects which tools Claude chooses. If your system prompt says "Always look up the customer record before processing any request," Claude will prioritize customer lookup tools even when the user's message doesn't explicitly request it. Use system prompt instructions to establish priority and sequencing when multiple tools are available.

#### Common Exam Mistakes

- Writing descriptions like "searches the database" or "processes data" — too vague
- Failing to include boundary statements when multiple tools have similar purposes
- Not specifying input formats, leading Claude to pass incorrectly formatted parameters
- Omitting output descriptions, so Claude doesn't know what information it will receive

---

### 2.2 Structured Error Responses

#### The isError Flag

In MCP, when a tool call fails, the server should set the `isError` flag to `true` in the response. This signals to Claude that the result is an error, not valid data. Without this flag, Claude may attempt to interpret error messages as valid tool output, leading to confused or incorrect responses.

#### Why Structured Error Metadata Matters

Returning a generic message like "An error occurred" gives Claude no information about what went wrong or what to do next. Structured error metadata enables intelligent recovery.

A well-designed error response includes:

```json
{
  "isError": true,
  "content": [
    {
      "type": "text",
      "text": "{\"errorCategory\": \"transient\", \"isRetryable\": true, \"message\": \"Database connection timed out after 30 seconds. The database server may be under heavy load.\", \"suggestedAction\": \"Retry after a brief delay.\"}"
    }
  ]
}
```

#### Error Categories

Design your error responses around four categories:

| Category | Description | isRetryable | Example |
|----------|-------------|-------------|---------|
| **transient** | Temporary infrastructure issue | true | Rate limit hit, connection timeout, service temporarily unavailable |
| **validation** | Invalid input from the caller | false | Missing required field, invalid email format, order ID not in expected format |
| **business** | Business rule violation | false | Refund exceeds order total, customer account suspended, item out of stock |
| **permission** | Authorization failure | false | API key lacks required scope, user not authorized for this operation |

#### How Claude Uses Error Categories

When Claude receives a retryable error (transient), it should attempt the same tool call again, possibly after a brief pause. When it receives a non-retryable error, it should NOT retry the same call. Instead, it should:

- For **validation** errors: Fix the input and try again with corrected parameters
- For **business** errors: Inform the user of the constraint and ask how to proceed
- For **permission** errors: Inform the user that the operation is not authorized

#### Error Response Design Pattern

```json
{
  "errorCategory": "validation",
  "isRetryable": false,
  "message": "The email address 'john@' is not a valid email format. Expected format: user@domain.com",
  "field": "email",
  "receivedValue": "john@",
  "suggestedAction": "Ask the user to provide a complete email address."
}
```

Key elements:
- **errorCategory** tells the model what kind of failure occurred
- **isRetryable** tells the model whether to retry or try a different approach
- **message** provides a human-readable explanation
- **field** and **receivedValue** (when applicable) help the model correct its input
- **suggestedAction** guides the model's next step

#### Common Exam Mistakes

- Returning generic "error occurred" strings without structured metadata
- Not distinguishing retryable from non-retryable errors, causing infinite retry loops or premature failure
- Treating all errors as retryable (wasting API calls on validation errors)
- Omitting the isError flag entirely, causing Claude to interpret error text as valid data

---

### 2.3 Tool Distribution and tool_choice

#### The "Too Many Tools" Problem

Research and practice show that giving a single agent too many tools degrades its reliability. When an agent has access to 15 or 18 tools, it struggles to select the correct one. The model must evaluate each tool's description against the current task, and with many similar-sounding options, selection accuracy drops.

**Best practice: 4-5 tools per agent, scoped by role.**

Instead of one "super agent" with every tool, create specialized agents that each have a focused set of tools:

| Agent Role | Tools (4-5 each) |
|-----------|-------------------|
| Customer Lookup Agent | search_customers, get_customer_details, get_order_history, fuzzy_customer_search |
| Order Processing Agent | lookup_order, process_refund, apply_credit, update_order_status |
| Escalation Agent | escalate_to_human, create_ticket, get_agent_availability, transfer_conversation |

A coordinator agent delegates to these specialized agents, each of which operates with high reliability because its tool set is small and well-scoped.

#### tool_choice Options

The `tool_choice` parameter controls how Claude selects tools:

| Value | Behavior | Use Case |
|-------|----------|----------|
| `"auto"` | Claude decides whether to use a tool and which one | Default for most agents. Good for general-purpose agents that sometimes need tools and sometimes don't. |
| `"any"` | Claude MUST use a tool but can choose which one | Use when you know a tool call is needed but the specific tool depends on context. |
| `{"type": "tool", "name": "specific_tool"}` | Claude MUST call this specific tool | Use when you need guaranteed structured output via a particular tool, or when you're building a pipeline step that must produce a specific output format. |

#### When to Use Each Option

**"auto" (default):** Use for conversational agents that sometimes answer directly and sometimes use tools. For example, a customer support agent that can answer FAQs from its training but needs tools for account-specific queries.

**"any":** Use when you always want a tool call but the right tool depends on the input. For example, a routing agent that must always classify and route a request but has multiple routing tools for different categories.

**Forced specific tool:** Use when you need guaranteed structured output. For example, forcing a `classify_intent` tool ensures Claude always returns a structured JSON classification rather than a free-text response. This is particularly valuable at pipeline boundaries where the output format must be predictable for downstream processing.

#### Relationship Between tool_choice and Structured Output

Forcing a specific tool with a JSON schema is one of the most reliable ways to get structured output from Claude. When `tool_choice` forces a tool that has a defined JSON schema, Claude will always produce schema-compliant output. This eliminates format variability but does not prevent semantic errors (the output will be valid JSON in the right shape, but the values may still be incorrect).

#### Common Exam Mistakes

- Giving a single agent 15+ tools instead of distributing across specialized agents
- Using `"auto"` when you need guaranteed tool usage (should use `"any"` or forced)
- Using forced tool selection when the agent needs flexibility to choose between tools
- Not understanding that `"any"` still lets the model choose which tool — it just guarantees a tool will be called

---

### 2.4 MCP Server Integration

#### What MCP Provides

The Model Context Protocol (MCP) is a standardized way to connect Claude to external tools and data sources. MCP servers expose tools (callable functions) and resources (read-only data catalogs) that Claude can use during conversations.

#### Configuration Scoping

MCP servers are configured at two levels:

| Level | File | Shared? | Use Case |
|-------|------|---------|----------|
| **Project-level** | `.mcp.json` in project root | Yes, via version control | Tools the whole team needs: database access, internal APIs, shared services |
| **User-level** | `~/.claude.json` | No, personal only | Personal tools: personal API keys, local development servers, individual preferences |

**Project-level configuration** (`.mcp.json`) is committed to version control so every team member gets the same tool setup. This is the right place for shared infrastructure.

**User-level configuration** (`~/.claude.json`) is personal and not shared. Use this for tools that require individual credentials or are specific to one developer's workflow.

#### Environment Variable Expansion

MCP configurations support environment variable expansion for credentials:

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["-y", "@company/db-mcp-server"],
      "env": {
        "DB_CONNECTION_STRING": "${DB_CONNECTION_STRING}",
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

The `${API_KEY}` syntax pulls the value from the user's environment at runtime. This allows `.mcp.json` to be safely committed to version control without exposing secrets. Each developer sets their own environment variables locally.

**Critical rule:** Never put actual credentials directly in `.mcp.json`. Always use environment variable expansion. Credentials in version-controlled files are a security vulnerability.

#### Tool Discovery

MCP tools are discovered at connection time. When Claude starts a session and connects to configured MCP servers, it queries each server for its available tools. All discovered tools become available simultaneously. You do not need to manually register each tool — the MCP protocol handles discovery automatically.

#### MCP Resources

Resources are read-only content catalogs exposed by MCP servers. Unlike tools (which perform actions), resources let agents browse what data is available without making exploratory tool calls.

For example, a database MCP server might expose resources like:
- A list of available tables and their schemas
- A catalog of recent reports
- A directory of customer segments

Without resources, an agent might need to make multiple exploratory tool calls ("What tables exist? What columns does this table have?") before it can make a productive query. Resources provide this information upfront, reducing unnecessary API calls and improving efficiency.

#### Transport Mechanisms

MCP supports multiple transport mechanisms for communication between the client (Claude) and MCP servers:

- **stdio (standard I/O):** The MCP server runs as a local subprocess, communicating via stdin/stdout. This is the most common transport for local development. The server starts when Claude connects and stops when the session ends.
- **SSE (Server-Sent Events):** The MCP server runs as a remote HTTP service. Claude connects via HTTP and receives events over a persistent connection. Used for shared or remote MCP servers.
- **Streamable HTTP:** A newer transport that supports both request-response and streaming patterns over HTTP. Designed for production deployments where SSE limitations (such as unidirectional communication) are a constraint.

For exam purposes, understand that stdio is for local servers and SSE/Streamable HTTP are for remote servers. The choice of transport does not affect the tool interface — the same tools work regardless of transport.

#### Common Exam Mistakes

- Putting credentials directly in `.mcp.json` instead of using `${ENV_VAR}` syntax
- Confusing project-level (`.mcp.json`) and user-level (`~/.claude.json`) scoping
- Not understanding that resources are read-only catalogs (not callable tools)
- Thinking tools must be manually registered instead of being auto-discovered at connection time

---

### 2.5 Built-in Tool Selection

#### The Built-in Tool Set

Claude Code provides six built-in tools, each optimized for a specific type of operation. Choosing the right tool is a matter of matching the task to the tool's specialty.

#### Decision Tree

Use this decision tree to select the correct tool:

```
What do you need to do?
|
+-- Find files by name or path pattern?
|   --> Glob
|   Example: "Find all TypeScript files in the src directory"
|   Pattern: **/*.ts
|
+-- Search file CONTENTS for a pattern?
|   --> Grep
|   Example: "Find all files that import the UserService class"
|   Pattern: "import.*UserService"
|
+-- Read the full contents of a known file?
|   --> Read
|   Example: "Show me what's in src/config.ts"
|
+-- Create a new file or completely rewrite an existing file?
|   --> Write
|   Example: "Create a new test file for the UserService"
|
+-- Make a targeted change within an existing file?
|   --> Edit (if target string is unique in the file)
|   --> Read + Write (if target string appears multiple times)
|   Example: "Change the timeout from 30 to 60 in the config"
|
+-- Run a system command, install packages, execute tests, or do something
|   that isn't a file operation?
|   --> Bash
|   Example: "Run the test suite" or "Install the lodash package"
```

#### Tool Details

**Glob** — Finds files by path pattern. Supports standard glob syntax: `*` matches within a directory, `**` matches across directories, `?` matches a single character. Returns file paths sorted by modification time. Use Glob when you know something about the file's name or location but need to find the exact path.

**Grep** — Searches file contents using regular expressions. Use Grep when you know what text you're looking for but don't know which file contains it. Grep supports three output modes: `files_with_matches` (default, returns just file paths), `content` (returns matching lines with context), and `count` (returns match counts per file). You can filter by file type or glob pattern.

**Read** — Reads the contents of a specific file. Use when you already know the file path and need to see its contents. Supports reading specific line ranges for large files (using `offset` and `limit` parameters), and can read images, PDFs, and Jupyter notebooks.

**Write** — Creates a new file or completely overwrites an existing file. Use for creating new files. For modifying existing files, prefer Edit (which only sends the diff) unless you need a complete rewrite. Write requires that you have previously Read the file if it already exists.

**Edit** — Performs exact string replacement within a file. You specify the `old_string` to find and the `new_string` to replace it with. The `old_string` must be unique within the file — if it appears multiple times, the edit will fail. In that case, fall back to Read + Write. Use `replace_all: true` when you intentionally want to replace every occurrence (like renaming a variable).

**Bash** — Executes shell commands. Use for anything that isn't a direct file operation: running tests, installing packages, Git operations, building projects, checking environment state. Avoid using Bash for tasks where a dedicated tool exists — for example, don't use `grep` via Bash when the Grep tool is available, because the built-in Grep tool has better permission handling and provides a better experience.

#### Common Selection Errors

| Mistake | Why It's Wrong | Correct Tool |
|---------|---------------|--------------|
| Using Bash to run `grep` | Built-in Grep has better permissions and output handling | Grep |
| Using Bash to run `find` | Built-in Glob is optimized for file pattern matching | Glob |
| Using Bash to run `cat` | Built-in Read handles binary files, PDFs, images | Read |
| Using Write to change one line in a file | Write overwrites the entire file; Edit sends only the diff | Edit |
| Using Edit when the target string isn't unique | Edit will fail; it requires uniqueness | Read + Write |
| Using Grep to find files by name | Grep searches file contents, not file names | Glob |

#### The Edit Uniqueness Requirement

This is a critical detail for the exam. Edit requires the `old_string` to be unique within the file. If the string appears on multiple lines, the edit will fail. When this happens, you have two options:

1. **Expand the context:** Include more surrounding text in `old_string` to make it unique (for example, include the line above and below the target).
2. **Fall back to Read + Write:** Read the full file, make the change programmatically, and Write the entire file back.

Option 1 is preferred when possible because it sends less data. Option 2 is the fallback when uniqueness cannot be achieved.

---

## Architecture Patterns

### Tool Description Design Pattern: Boundary-Explicit Descriptions

**Problem:** Multiple tools have overlapping purposes, causing selection errors.

**Solution:** Every tool description includes explicit boundary statements that tell Claude when NOT to use this tool and which alternative to use instead.

**Structure:**
```
[Purpose]: What this tool does
[Inputs]: What parameters it accepts and their formats
[Output]: What it returns
[Use when]: Positive conditions for selection
[Do NOT use when]: Negative conditions with redirect to correct tool
```

**Example:**
```
Purpose: Looks up a customer's order by order ID.
Inputs: order_id (string, format: ORD-XXXXX where X is a digit)
Output: Order details including items, total, status, shipping address, and tracking number.
Use when: The user provides a specific order ID or you have retrieved one from a previous tool call.
Do NOT use when: The user wants to search for orders by date range or product — use search_orders instead. Do NOT use to check refund status — use get_refund_status instead.
```

### Error Response Pattern: Structured isError with Metadata

**Problem:** Generic error messages prevent the model from recovering intelligently.

**Solution:** Every error response includes the `isError` flag and structured metadata with category, retryability, and actionable guidance.

**Template:**
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"errorCategory\": \"<transient|validation|business|permission>\", \"isRetryable\": <true|false>, \"message\": \"<human-readable explanation>\", \"suggestedAction\": \"<what the model should do next>\"}"
  }]
}
```

**Key principle:** The error response should give the model enough information to take the correct next action without human intervention (for retryable and validation errors) or to clearly communicate the problem to the user (for business and permission errors).

### Tool Scoping Pattern: Role-Based Distribution

**Problem:** A single agent with too many tools makes unreliable selections.

**Solution:** Distribute tools across specialized agents, each with 4-5 tools scoped to a specific role. A coordinator agent delegates to the appropriate specialist.

**Implementation steps:**
1. List all available tools
2. Group them by functional domain (customer data, order processing, billing, etc.)
3. Create one agent per domain with only that domain's tools
4. Create a coordinator agent whose only tool is the Task tool for spawning subagents
5. The coordinator reads the user request, determines which domain is needed, and delegates

**Benefit:** Each specialist agent has a small, focused tool set with no overlap, maximizing selection accuracy.

### MCP Resource Pattern: Reducing Exploratory Tool Calls

**Problem:** Agents waste API calls on exploratory queries ("What tables exist? What fields does this table have?") before they can do productive work.

**Solution:** Expose schema information and data catalogs as MCP resources. The agent reads available resources at the start of a session to understand what data is available, then makes targeted tool calls.

**Before (without resources):**
```
Agent: calls list_tables tool
Agent: calls describe_table("customers") tool
Agent: calls describe_table("orders") tool
Agent: calls query_table("customers", ...) tool  <-- first productive call
```

**After (with resources):**
```
Agent: reads "database-schema" resource (all tables and columns)
Agent: calls query_table("customers", ...)  <-- first productive call
```

Resources reduce latency, cost, and context window usage by front-loading discovery information.

---

## Scenario Walkthrough

### Designing an MCP Tool Interface for Customer Support

You are building a customer support system with three core tools: `get_customer`, `lookup_order`, and `process_refund`. Walk through the design decisions for each.

#### Step 1: Design Tool Descriptions

**get_customer:**
```
Retrieves a customer profile by email address, phone number, or customer ID
(format: CUST-XXXXXXXX). Returns the customer's name, email, phone, account
status (active/suspended/closed), and a list of their last 10 order IDs.

Use this tool as the FIRST step when a customer contacts support, to identify
their account.

Does NOT search by name or address — if the customer can only provide their
name, ask them for their email or phone number. Does NOT return order details —
use lookup_order with the order IDs from this tool's response.
```

**lookup_order:**
```
Retrieves full details for a specific order by order ID (format: ORD-XXXXXXXXXX).
Returns item list, quantities, prices, order total, order status
(pending/shipped/delivered/cancelled/returned), shipping address, tracking
number, and payment method (last 4 digits only).

Use this tool after get_customer to look up specific orders the customer is
asking about.

Does NOT search orders by date or product name. Does NOT process any changes
to the order — use process_refund for refunds.
```

**process_refund:**
```
Initiates a refund for a specific order. Requires order_id (format: ORD-XXXXXXXXXX)
and refund_amount (decimal, must not exceed the order total). Optionally accepts
a reason string.

Returns a refund confirmation with refund_id, status (approved/pending_review/denied),
and estimated processing time.

Use this tool ONLY after you have already looked up the order with lookup_order
and confirmed the order details with the customer. NEVER call process_refund
without first verifying the order exists and the refund amount is valid.

Does NOT handle exchanges, order modifications, or shipping changes.
```

#### Step 2: Design Error Responses

For `process_refund`, consider the error cases:

**Validation error — refund exceeds order total:**
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"errorCategory\": \"validation\", \"isRetryable\": false, \"message\": \"Refund amount $150.00 exceeds order total $99.99 for order ORD-1234567890.\", \"field\": \"refund_amount\", \"maxAllowed\": 99.99, \"suggestedAction\": \"Ask the customer to confirm the correct refund amount. The maximum refund for this order is $99.99.\"}"
  }]
}
```

**Business error — order already refunded:**
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"errorCategory\": \"business\", \"isRetryable\": false, \"message\": \"Order ORD-1234567890 has already been fully refunded on 2025-12-01. Refund ID: REF-9876543210.\", \"suggestedAction\": \"Inform the customer that this order was already refunded and provide the existing refund ID.\"}"
  }]
}
```

**Transient error — payment gateway timeout:**
```json
{
  "isError": true,
  "content": [{
    "type": "text",
    "text": "{\"errorCategory\": \"transient\", \"isRetryable\": true, \"message\": \"Payment gateway timed out after 30 seconds.\", \"suggestedAction\": \"Retry the refund request. If the error persists after 2 retries, escalate to a human agent.\"}"
  }]
}
```

#### Step 3: Configure tool_choice

For the customer support agent, use `tool_choice: "auto"` because:
- The agent sometimes needs to respond conversationally (greeting, asking clarifying questions)
- The agent sometimes needs to call tools (looking up customer data, processing refunds)
- The correct tool depends on context, so the model must choose

If you were building a separate intent classification step at the start of each conversation, you might force `tool_choice: {"type": "tool", "name": "classify_intent"}` to guarantee structured routing output before the conversation proceeds.

#### Step 4: Consider Tool Distribution

With only three core tools plus an escalation tool, a single agent with 4 tools is within the optimal range. No need to split across multiple agents. However, if the system grew to include billing tools, shipping tools, and account management tools (12-15 total), you would split into:

- **Customer Lookup Agent:** get_customer, fuzzy_customer_search, get_customer_history
- **Order Agent:** lookup_order, search_orders, track_shipment, update_order
- **Refund/Billing Agent:** process_refund, check_refund_status, apply_credit, get_invoice
- **Coordinator:** Task tool for delegation, escalate_to_human

---

## Practice Exercises

### Exercise 1: Write and Evaluate Tool Descriptions

Write tool descriptions for these three tools in a project management system:

1. **create_task** — Creates a new task in a project
2. **search_tasks** — Searches for existing tasks
3. **update_task_status** — Changes the status of a task

For each description, check:
- Does it specify input formats and valid values?
- Does it describe what the tool returns?
- Does it include boundary statements explaining when NOT to use this tool?
- Could Claude confuse this tool with one of the other two?

**Self-check:** Can you construct a user request that would be ambiguous between two of your tools? If yes, your boundary statements need work.

### Exercise 2: Design Error Response Schemas

Design error response schemas for a payment processing MCP tool called `charge_card`. Consider at least one error from each category:

- **transient:** What happens when the payment gateway is temporarily unreachable?
- **validation:** What happens when the card number format is invalid?
- **business:** What happens when the card has insufficient funds?
- **permission:** What happens when the API key lacks payment processing scope?

For each error response, include: errorCategory, isRetryable, message, and suggestedAction. Then answer: which of these errors should Claude retry, which should it fix and retry, and which should it report to the user?

### Exercise 3: Tool Distribution Across Agents

You have 15 tools for a research system:

`search_web`, `search_academic_papers`, `search_news`, `fetch_url`, `extract_text`, `summarize_document`, `compare_sources`, `generate_outline`, `write_section`, `edit_section`, `check_citations`, `format_bibliography`, `create_report`, `export_pdf`, `send_email`

Propose a distribution across 3 specialized agents plus a coordinator. For each agent:
- Name the agent and define its role
- List its 4-5 tools
- Explain why these tools belong together
- Identify which tools could be confused with each other and how your descriptions would prevent that

---

## Exam Tips

- **Tool descriptions are tested heavily.** You will see questions asking which tool description would cause Claude to select the correct tool. Look for descriptions that include boundary statements and input format specifications. Vague descriptions like "handles customer requests" are almost always the wrong answer.

- **Know the difference between retryable and non-retryable errors.** If a question asks what the agent should do after a rate limit error, the answer involves retrying. If the error is "invalid customer ID format," the answer involves correcting the input, not retrying the same call.

- **"Too many tools" is a common distractor.** If an answer option gives one agent 15+ tools, it is likely wrong. The exam tests whether you know that tool count per agent should be kept to 4-5. Look for answers that distribute tools across specialized agents.

- **Know when to use `.mcp.json` vs `~/.claude.json`.** Project-level (`.mcp.json`) is for shared team tools and is committed to version control. User-level (`~/.claude.json`) is for personal tools and credentials. If a question asks about sharing MCP configuration across a team, the answer is `.mcp.json`. If it asks about individual developer preferences, the answer is `~/.claude.json`.

- **Know the built-in tools and when to use each one.** Grep searches file contents; Glob finds files by path. Edit requires unique target strings; fall back to Read + Write when uniqueness fails. Bash is for non-file operations. If you see a question about finding which files contain a specific function name, the answer is Grep (not Glob, not Bash).

- **Forced tool_choice guarantees structured output.** When the exam asks how to ensure Claude always returns structured JSON, forced tool selection with a JSON schema is the most reliable answer. "auto" does not guarantee a tool call; "any" guarantees a tool call but not which one.

- **Credentials never go directly in `.mcp.json`.** If an answer shows hardcoded API keys in the MCP configuration file, it is wrong. The correct approach is environment variable expansion with `${VAR_NAME}` syntax.

- **Resources are not tools.** MCP resources are read-only data catalogs. They cannot perform actions. If a question asks how to reduce exploratory tool calls, resources are often the answer.

---

## Cross-References

- **Domain 1, Task 1.2/1.3** — Multi-agent tool distribution relies on the coordinator-subagent pattern and Task tool mechanism covered in Domain 1. Understanding how subagents are spawned and how allowedTools is configured is essential for distributing tools effectively.

- **Domain 1, Task 1.5** — Hooks for tool call interception. PostToolUse hooks can normalize tool output or enforce compliance, complementing the error handling patterns in Task 2.2.

- **Domain 4, Task 4.3** — tool_choice is also tested in the Structured Output domain, specifically for guaranteeing schema-compliant output via forced tool selection.

- **Domain 5, Task 5.3** — Error propagation in multi-agent systems. The structured error patterns from Task 2.2 feed directly into how coordinators handle subagent failures.

- **Exam Scenarios:**
  - Scenario 1 (Customer Support) — Tests tool interface design, error handling, and escalation
  - Scenario 3 (Multi-Agent Research) — Tests tool distribution across specialized agents
  - Scenario 4 (Developer Productivity) — Tests built-in tool selection and MCP integration

- **Assessment:** `assessments_domain-02-questions.md`
