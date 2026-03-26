# Domain 1 Assessment - Agentic Architecture & Orchestration

## Question 1
**Scenario:** You are building a customer support agent that uses an agentic loop. During testing, you notice the agent occasionally re-requests the same tool call it just made, as if the tool was never executed. The tool is definitely running and returning results. What is the most likely cause?

A) The stop_reason is incorrectly set to "end_turn" instead of "tool_use"
B) The tool results are not being appended to the conversation's messages array before the next API call
C) The agent's system prompt does not include instructions to avoid duplicate tool calls
D) The max_tokens value is set too low, causing the response to truncate before the tool call completes

**Answer:** B

**Explanation:** The model has no persistent memory between API calls. The only way it knows a tool was executed is by reading the tool_result message appended to the messages array. If the result is not appended, the model sees no evidence the call happened and re-requests it. Option A is incorrect because a stop_reason of "end_turn" would cause the loop to terminate, not repeat a tool call. Option C is incorrect because this is not a prompt guidance problem -- it is a missing data problem in the conversation history. Option D is incorrect because max_tokens truncation would produce a stop_reason of "max_tokens," not a repeated tool request.

**Task Statement:** 1.1

---

## Question 2
**Scenario:** A development team is designing an agent system to handle incoming support tickets. The system needs to look up customer records, check order status, process refunds, and escalate to humans. All four tools are tightly coupled to the same customer support workflow. A junior engineer proposes splitting this into four specialist subagents -- one per tool -- with a coordinator. What is the best response?

A) Approve the design because multi-agent architectures are always more reliable than single-agent
B) Recommend a single agent with all four tools because the tools are tightly coupled, the tool count is within the optimal range, and multi-agent coordination would add unnecessary overhead
C) Approve the design but add a fifth subagent for conversation management
D) Recommend two agents: one for read operations (lookup) and one for write operations (refund and escalation)

**Answer:** B

**Explanation:** With only four tightly coupled tools that all serve the same customer support workflow, a single agent is the correct choice. Multi-agent is appropriate when subtasks require genuinely different tool sets or different expertise profiles. Splitting four related tools across four subagents creates coordination overhead, loses cross-task context (e.g., customer data from lookup is needed for refund processing), and increases latency without any benefit. Option A is incorrect because multi-agent is not always better -- it adds complexity that must be justified by the problem structure. Option C compounds the original mistake by adding even more agents. Option D is an arbitrary split that still creates unnecessary coordination overhead for a small, coherent tool set.

**Task Statement:** 1.2

---

## Question 3
**Scenario:** A coordinator agent spawns a research subagent to analyze a set of documents. The coordinator has a 40-turn conversation history containing detailed requirements from the user, including specific evaluation criteria. The subagent is invoked with the Task tool and given only the instruction: "Analyze the documents in /data/reports/." The subagent returns results that are technically accurate but completely miss the user's evaluation criteria. What went wrong?

A) The subagent's allowedTools configuration did not include the necessary file reading tools
B) The coordinator should have used fork_session instead of the Task tool to preserve context
C) The coordinator failed to pass the relevant evaluation criteria in the task description because subagent context is not automatically inherited from the coordinator
D) The subagent's system prompt was too generic and should have included the evaluation criteria

**Answer:** C

**Explanation:** Subagent context must be explicitly provided by the coordinator. There is no automatic inheritance of the coordinator's conversation history. The subagent only knows what the coordinator includes in the task description. Since the coordinator only said "Analyze the documents," the subagent had zero knowledge of the evaluation criteria from the 40-turn conversation. Option A is incorrect because the subagent did return results, meaning it could read the files -- the problem was missing criteria, not missing tools. Option B is incorrect because fork_session creates an independent copy of session state at the point of forking; it does not automatically share the coordinator's ongoing context with a subagent, and the Task tool is the correct mechanism for spawning subagents. Option D is incorrect because while a better system prompt could help define the agent's role, the specific evaluation criteria from the user's conversation must come via the task description, not a static system prompt.

**Task Statement:** 1.3

---

## Question 4
**Scenario:** Your company's insurance claims agent must never approve claims above $10,000 without a supervisor review. A colleague suggests adding this instruction to the system prompt: "Always escalate claims over $10,000 to a supervisor before approving." The system handles thousands of claims daily. What is the correct approach?

A) The system prompt instruction is sufficient because Claude reliably follows explicit dollar-amount thresholds in prompts
B) Implement a programmatic check in the code that executes the approve_claim tool -- if the amount exceeds $10,000, block the call and return an error instructing the model to escalate
C) Add the instruction to both the system prompt and a CLAUDE.md file for redundancy
D) Use a PostToolUse hook to check the claim amount after approval and reverse it if it exceeds the threshold

**Answer:** B

**Explanation:** For mandatory business compliance -- especially involving financial thresholds -- programmatic enforcement is required. Prompt-based guidance is probabilistic and cannot guarantee the model will never approve a high-value claim. A tool call interception hook or conditional check in the tool execution code that blocks the call before it executes is deterministic and guarantees compliance. Option A is incorrect because prompt instructions are not deterministic; the model may occasionally reason around them or fail to apply them. Option C is incorrect for the same reason -- redundant prompt instructions are still prompt-based guidance, not enforcement. Option D is incorrect because checking after approval means the claim has already been approved; reversing an approval is a poor pattern that creates inconsistency and potential legal complications. The check must happen before the action.

**Task Statement:** 1.4

---

## Question 5
**Scenario:** Your agent integrates with three different backend systems that return dates in inconsistent formats: "2025-03-15", "03/15/2025", and "15 March 2025". The model frequently misinterprets dates from the third system, leading to errors in downstream processing. What is the most reliable solution?

A) Add a system prompt instruction telling the model to normalize all dates to ISO 8601 format before using them
B) Implement a PostToolUse hook that intercepts tool results from all three systems and converts all date strings to ISO 8601 format before the model sees them
C) Create a dedicated date-normalization tool that the agent calls after each backend query
D) Switch all three backend systems to return dates in the same format

**Answer:** B

**Explanation:** A PostToolUse hook executes after a tool call completes but before the result is appended to the conversation. This is the ideal insertion point for data normalization -- the hook transforms all date formats into a consistent ISO 8601 format programmatically, so the model always sees clean, uniform data. Option A is incorrect because asking the model to normalize dates is prompt-based guidance and is unreliable -- the model may misparse unfamiliar formats, which is the exact problem described. Option C adds unnecessary tool calls and latency, wastes context window space, and still relies on the model to correctly invoke the normalization tool. Option D may be ideal in theory but is typically impractical -- you often cannot control third-party system response formats, and it does not solve the immediate agent reliability problem.

**Task Statement:** 1.5

---

## Question 6
**Scenario:** You are designing a document processing pipeline that handles invoices. Every invoice follows the same structure: extract vendor info, classify expense category, validate totals, and generate an accounting entry. The format and steps are identical for every invoice. Which decomposition strategy is most appropriate?

A) Dynamic adaptive decomposition where the agent creates and revises its plan after each step based on intermediate results
B) A single agentic loop where the agent decides the order of operations at runtime
C) A fixed sequential pipeline: extract, classify, validate, generate -- with each step having defined input/output contracts
D) A coordinator-subagent system with four specialist subagents, one for each step

**Answer:** C

**Explanation:** When the workflow is well-understood, consistent across every instance, and follows the same structure every time, a fixed sequential pipeline is the most appropriate strategy. Each step has a clear input/output contract, making the pipeline easy to debug, monitor, and maintain. Option A is incorrect because adaptive decomposition is designed for tasks where the path varies and depends on what is discovered -- invoice processing does not vary. The overhead of planning and replanning adds complexity without benefit. Option B is incorrect because while a single loop could work, it sacrifices the predictability and debuggability of a fixed pipeline for flexibility that is not needed. Option D is incorrect because four specialist subagents for a simple sequential workflow adds coordination overhead (context passing, spawning, aggregation) that a pipeline chain handles more efficiently.

**Task Statement:** 1.6

---

## Question 7
**Scenario:** You are investigating a complex codebase bug using Claude Code. After a 90-minute session, you have accumulated significant context about the architecture, the bug's root cause, and several attempted fixes. You need to take a break. When you return, you want to continue the investigation. Between sessions, no one else will modify the codebase. What is the best approach?

A) Start a fresh session and re-explain the entire investigation from scratch to avoid context degradation
B) Use --resume with a named session to continue from where you left off, since the codebase has not changed and the accumulated context is directly relevant
C) Fork the current session before leaving so you have a backup, then resume the original
D) Export the conversation to a file and paste it into a new session as context

**Answer:** B

**Explanation:** Session resumption is the correct choice when the current task is a direct continuation of previous work, the accumulated context is valuable and relevant, and the external state (codebase) has not changed. The --resume flag restores the full conversation history and state. Option A is incorrect because rebuilding 90 minutes of investigation context from scratch is wasteful when resumption preserves it. The investigation is directly continuous and the codebase is unchanged, so stale assumptions are not a concern. Option C is incorrect because forking creates an independent copy for divergent exploration -- there is no need for a backup when you simply want to pause and continue. Option D is incorrect because manually pasting a conversation export is an unreliable and lossy approximation of proper session resumption.

**Task Statement:** 1.7

---

## Question 8
**Scenario:** A research agent system uses a coordinator that delegates to three subagents: web_search_agent, document_analysis_agent, and synthesis_agent. The coordinator needs to pass the user's research question to all three subagents. Currently, it passes the raw user query to each without additional context. The web_search_agent performs well, but the document_analysis_agent and synthesis_agent produce irrelevant results. What is the most likely issue and fix?

A) The subagents need larger context windows to process the research question properly
B) The coordinator should pass each subagent a tailored context including not just the query but also the specific subset of information, constraints, and expected output format relevant to that subagent's role
C) All three subagents should share a single session so they can see each other's work
D) The coordinator should use tool_choice to force each subagent to use its primary tool

**Answer:** B

**Explanation:** The coordinator's job includes crafting appropriate context for each subagent. A raw user query may be sufficient for a web search (which is designed to work with natural language queries) but insufficient for document analysis (which needs to know which documents, what to look for, and what format to return results in) or synthesis (which needs the scope, audience, and structure of the desired output). Option A is incorrect because the problem is not context window size but context quality -- the subagents have enough capacity but lack the right information. Option C is incorrect because shared sessions violate the isolation principle of multi-agent design, leading to context pollution and defeating the purpose of specialist subagents. Option D is incorrect because tool_choice affects which tool is called, not the quality of the context the subagent works with -- the problem is insufficient input, not incorrect tool selection.

**Task Statement:** 1.3

---

## Question 9
**Scenario:** You have been working with Claude Code on a multi-day refactoring project. Over the weekend, a teammate merged a large pull request that restructured several modules you were working on, renamed key files, and updated the database schema. On Monday, you want to continue the refactoring. What is the best approach?

A) Resume the named session and continue working -- the agent will detect file changes automatically when it tries to read them
B) Resume the named session but immediately inform the agent about the specific changes: which files were renamed, what modules were restructured, and the database schema updates
C) Start a fresh session with a brief summary of the refactoring goals and let the agent re-discover the codebase state
D) Fork the previous session to preserve the old context, then start investigating the changes in the fork

**Answer:** C

**Explanation:** When the codebase has changed substantially between sessions -- files renamed, modules restructured, schema updated -- the previous session's accumulated context contains stale assumptions that could actively mislead the agent. The agent might reference files that no longer exist, assume code structure that has changed, or rely on a database schema that was updated. Starting fresh with a brief summary of the refactoring goals is safer and more efficient than trying to patch a context full of stale information. Option A is incorrect because the agent does not automatically detect or understand the full scope of external changes; it will operate on stale assumptions about file structure, module organization, and schema until it encounters errors. Option B is partially reasonable but risky -- the accumulated context from the previous session may contain many implicit assumptions about the old codebase state that are hard to enumerate and correct. Option D is incorrect because forking preserves the same stale context; investigating changes in a fork still starts from a misleading baseline.

**Task Statement:** 1.7
