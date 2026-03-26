# Domain 2 Assessment - Tool Design & MCP Integration

## Question 1
**Scenario:** Your agent has two tools: `search_customers` (searches by email, phone, or customer ID) and `fuzzy_customer_search` (searches by partial name or address). During testing, you find that when a user says "find the customer named Sarah," the agent calls `search_customers` instead of `fuzzy_customer_search`, resulting in an error. The `search_customers` description currently reads: "Searches the customer database. Returns customer profile information." What is the most effective fix?

A) Add a system prompt instruction: "When the user provides a name, always use fuzzy_customer_search"
B) Remove `search_customers` from the agent's tool set so there is no ambiguity
C) Rewrite the `search_customers` description to include boundary statements specifying it accepts only email, phone, or customer ID, and explicitly directing the agent to use `fuzzy_customer_search` for name-based lookups
D) Rename `search_customers` to `search_customers_by_id` so the tool name clarifies its purpose

**Answer:** C

**Explanation:** Tool descriptions are the primary mechanism Claude uses to select tools. A vague description like "Searches the customer database" gives Claude no basis for distinguishing between the two tools. Adding boundary statements that specify valid inputs and explicitly redirect to the alternative tool for out-of-scope cases eliminates ambiguity. Option A is partially helpful but fragile -- system prompt instructions are secondary to tool descriptions in selection logic, and this creates a maintenance burden if tools change. Option B removes useful functionality; the solution is better descriptions, not fewer tools. Option D helps marginally through the name but does not solve the core problem -- Claude primarily reads descriptions, not just names, and without boundary statements the overlap remains for cases like "look up this customer."

**Task Statement:** 2.1

---

## Question 2
**Scenario:** Your MCP tool `process_payment` encounters a rate limit from the payment gateway (HTTP 429). The tool currently returns: `{"isError": true, "content": [{"type": "text", "text": "Payment failed. Please try again later."}]}`. After receiving this error, the agent tells the user the payment cannot be processed and asks them to try a different payment method. What should you change about the error response to improve the agent's recovery behavior?

A) Remove the isError flag so the agent treats the response as a normal result and retries automatically
B) Add structured metadata including `"errorCategory": "transient"` and `"isRetryable": true"` so the agent knows to retry the same call instead of giving up
C) Change the message to include the HTTP status code so the agent can look up the error type
D) Add `"suggestedAction": "Inform the user that the payment system is down"` to ensure the agent communicates clearly

**Answer:** B

**Explanation:** A rate limit (HTTP 429) is a transient error -- the service is temporarily unavailable but will accept requests again shortly. Without structured metadata indicating the error is retryable, the agent interprets the failure as permanent and gives up. Adding errorCategory and isRetryable fields gives the agent the information it needs to retry the call rather than abandoning the operation. Option A is incorrect because removing isError would cause the agent to interpret the error message as valid payment data, leading to confused responses. Option C is incorrect because raw HTTP status codes require the model to map codes to recovery strategies, which is unreliable -- structured categories like "transient" are far clearer. Option D is incorrect because the payment system is not down; it is rate-limited. Telling the user the system is down is inaccurate, and the correct behavior is retrying, not communicating failure.

**Task Statement:** 2.2

---

## Question 3
**Scenario:** You are building a multi-agent research system with 16 tools spanning web search, document analysis, writing, and citation management. A colleague suggests putting all 16 tools on a single "research agent" for simplicity. What is the primary risk of this approach, and what is the better alternative?

A) The primary risk is exceeding API token limits; the alternative is reducing the number of tools to 5
B) The primary risk is degraded tool selection accuracy when a single agent has too many tools; the alternative is distributing tools across specialized subagents with 4-5 tools each, coordinated by a hub agent
C) The primary risk is increased latency from loading tool definitions; the alternative is lazy-loading tools on demand
D) The primary risk is security exposure from having all tools accessible; the alternative is implementing permission checks on each tool

**Answer:** B

**Explanation:** Research and practice show that giving a single agent too many tools (e.g., 15-18) degrades selection reliability. The model must evaluate each tool's description against the task, and with many similar-sounding options, it makes more selection errors. The proven solution is distributing tools across specialized agents (4-5 tools each) with a coordinator that delegates. Option A is incorrect because the risk is not token limits -- tool definitions are relatively small -- and arbitrarily reducing to 5 tools means losing 11 tools of functionality. Option C is incorrect because tool definition loading is not a significant latency factor; the problem is cognitive load on the model during selection. Option D describes a valid security practice but is not the primary risk of having too many tools -- the primary risk is selection accuracy, not security.

**Task Statement:** 2.3

---

## Question 4
**Scenario:** Your development team uses a shared internal database and a company-wide Jira integration that every developer needs. One developer also uses a personal note-taking MCP server connected to their private account. Where should each MCP server be configured?

A) All three in `.mcp.json` so the entire team has a consistent configuration
B) The database and Jira servers in `.mcp.json` (project-level, version-controlled); the personal note-taking server in `~/.claude.json` (user-level, not shared)
C) All three in `~/.claude.json` so credentials stay local
D) The database in `.mcp.json`, and both the Jira and note-taking servers in `~/.claude.json` since they require individual authentication

**Answer:** B

**Explanation:** Project-level configuration (`.mcp.json`) is committed to version control and shared across the team -- this is correct for tools the whole team needs (database, Jira). User-level configuration (`~/.claude.json`) is personal and not shared -- this is correct for individual tools like a personal note-taking server. Both files support environment variable expansion for credentials, so secrets never need to be hardcoded regardless of which level is used. Option A is incorrect because putting a personal note-taking server in shared project configuration exposes its existence to the team and would fail for other developers who do not have access. Option C is incorrect because putting shared team tools in user-level configuration means every developer must configure them independently, defeating the purpose of shared project setup. Option D is incorrect because Jira being a shared team tool belongs in project-level configuration; individual authentication is handled through environment variable expansion (`${JIRA_API_KEY}`), not by moving the configuration to user level.

**Task Statement:** 2.4

---

## Question 5
**Scenario:** An agent needs to find all Python files in a project that contain the string "deprecated_function" so it can update them. Which combination of built-in tools is most appropriate?

A) Use Bash to run `find . -name "*.py" | xargs grep "deprecated_function"`
B) Use Glob to find all `**/*.py` files, then Read each file and search for the string manually
C) Use Grep with the pattern "deprecated_function" and a glob filter of "*.py" to find matching files, then use Read to examine each match, and Edit to make targeted replacements
D) Use Grep to find the files, then use Write to rewrite each file with the updated content

**Answer:** C

**Explanation:** Grep is the correct tool for searching file contents by pattern, and its glob filter parameter efficiently restricts the search to Python files. Read then allows examining the surrounding context of each match. Edit is preferred for targeted modifications because it sends only the diff rather than rewriting entire files. Option A is incorrect because built-in Grep has better permission handling and output formatting than running grep via Bash -- the built-in tools should be preferred when they can accomplish the task. Option B is incorrect because it wastes time and context window space reading entire files when Grep can pinpoint exactly which files contain the pattern and where. Option D is incorrect because Write overwrites entire files, which is unnecessarily heavy for a targeted replacement; Edit is the correct tool for changing specific strings within files.

**Task Statement:** 2.5

---

## Question 6
**Scenario:** You are building an agent pipeline where the first step must always classify an incoming support ticket into one of five categories (billing, shipping, technical, account, other) and return a structured JSON object. The classification must be in a predictable format for downstream routing. Which tool_choice configuration ensures this?

A) `tool_choice: "auto"` with a system prompt instruction to "always classify the ticket first"
B) `tool_choice: "any"` so the agent must call a tool, combined with only the classify_ticket tool being available
C) `tool_choice: {"type": "tool", "name": "classify_ticket"}` where classify_ticket has a JSON schema defining the required category field
D) `tool_choice: "auto"` with the classify_ticket tool's description stating it must be called first

**Answer:** C

**Explanation:** Forcing a specific tool with a JSON schema is the most reliable way to guarantee structured output. When tool_choice forces classify_ticket and the tool has a defined schema, Claude will always produce schema-compliant output in the exact format needed for downstream processing. Option A is incorrect because "auto" lets Claude decide whether to use a tool at all -- it might respond conversationally instead of classifying. System prompt instructions do not guarantee tool usage. Option B would work functionally (since the only available tool is classify_ticket and "any" forces a tool call), but it is a workaround that breaks if additional tools are added later. Forced tool selection is the explicit, self-documenting approach. Option D is incorrect for the same reason as A -- "auto" does not guarantee a tool call regardless of what the description says.

**Task Statement:** 2.3

---

## Question 7
**Scenario:** Your agent connects to a database MCP server. Before the agent can answer user queries, it typically makes three exploratory tool calls: `list_tables`, `describe_table("customers")`, and `describe_table("orders")` just to understand the schema. These calls add latency and consume context window space on every session. What MCP feature would eliminate these exploratory calls?

A) Configure the MCP server to cache tool results across sessions so the schema information persists
B) Add the database schema to the agent's system prompt so it does not need to discover it at runtime
C) Expose the database schema as an MCP resource -- a read-only content catalog the agent can access at connection time without making tool calls
D) Increase the agent's context window so the exploratory calls have less impact on available space

**Answer:** C

**Explanation:** MCP resources are read-only content catalogs designed for exactly this purpose. By exposing the database schema as a resource, the agent can read it at the start of a session without making exploratory tool calls. This reduces latency, API cost, and context window usage. Option A is incorrect because MCP does not define cross-session caching as a standard feature, and caching at the server level does not eliminate the tool calls from the agent's perspective -- the agent still makes the calls and the results still consume context. Option B is a viable workaround but is brittle -- the system prompt must be manually updated whenever the schema changes, and schema information embedded in the system prompt is always present even when not needed. Resources are the purpose-built MCP solution. Option D is incorrect because it does not address the root problem; the exploratory calls still happen and still add latency, they just waste a smaller percentage of a larger window.

**Task Statement:** 2.4
