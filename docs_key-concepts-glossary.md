# Key Concepts Glossary

Alphabetical reference of technical terms, patterns, and APIs covered in the certification. Each entry notes which domain(s) and task statement(s) it relates to.

---

**Adaptive decomposition** — A task decomposition strategy where the agent dynamically decides next steps based on results so far, rather than following a fixed plan. Contrast with fixed sequential pipelines. (Domain 1, Task 1.6)

**AgentDefinition** — Configuration object in the Agent SDK that defines an agent's behavior, including its model, system prompt, tools, and allowed capabilities. (Domain 1, Task 1.3)

**Agentic loop** — A while-loop pattern where the model is repeatedly called, checks stop_reason, executes tool calls, appends results to the conversation, and continues until the model signals completion (end_turn). The fundamental pattern for autonomous agent execution. (Domain 1, Task 1.1)

**allowedTools** — Configuration field that restricts which tools an agent can access. Must include "Task" if the agent needs to spawn subagents. Scoping tools per agent improves reliability. (Domain 1, Task 1.3; Domain 2, Task 2.3)

**Batch processing / Message Batches API** — API for submitting large volumes of requests at 50% cost savings with up to 24-hour processing window. Uses custom_id for request/response correlation. Does not support multi-turn tool calling within a single request. Appropriate for latency-tolerant workloads only. (Domain 4, Task 4.5)

**Claim-source mapping** — A structured data pattern that preserves which source provided which specific claim during multi-source synthesis. Prevents source attribution loss during summarization. (Domain 5, Task 5.6)

**CLAUDE.md hierarchy** — Three-tier configuration: user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md), directory-level. User-level settings are personal and not shared via version control. Supports @import for modular organization. (Domain 3, Task 3.1)

**Claude Code CLI flags** — Key flags for non-interactive/CI usage: -p / --print for headless mode, --output-format json for structured output, --json-schema for schema-constrained output. (Domain 3, Task 3.6)

**Context degradation** — The progressive loss of useful information as a conversation grows longer. Causes include: progressive summarization losing details, "lost in the middle" effect, tool result accumulation. Mitigated by scratchpad files, subagent delegation, and structured state persistence. (Domain 5, Tasks 5.1, 5.4)

**Coordinator-subagent pattern** — A multi-agent topology where a central coordinator decomposes tasks, delegates to specialized subagents, and aggregates their results. Also called hub-and-spoke. Subagents operate with isolated context. (Domain 1, Task 1.2)

**custom_id** — Field in the Batch API used to correlate requests with responses, since batch results may return in any order. (Domain 4, Task 4.5)

**end_turn** — A stop_reason value indicating the model has finished its response and is not requesting any tool calls. In an agentic loop, this signals the loop should terminate. (Domain 1, Task 1.1)

**Escalation triggers** — Conditions that should cause an agent to hand off to a human: customer explicitly requests human, policy exception/gap encountered, agent unable to make progress. Sentiment-based escalation and self-reported confidence are unreliable triggers. (Domain 5, Task 5.2)

**Few-shot prompting** — Providing example input/output pairs in the prompt to improve consistency, handle ambiguous cases, enable generalization, and reduce hallucination. The most effective technique for output consistency. (Domain 4, Task 4.2)

**fork_session** — Session management mechanism that creates a divergent copy of the current session state for parallel exploration without affecting the original session. (Domain 1, Task 1.7)

**Glob** — Built-in tool for file path pattern matching. Use Glob to find files by name or path pattern. Contrast with Grep (content search). (Domain 2, Task 2.5)

**Grep** — Built-in tool for searching file contents by pattern. Use Grep to find text within files. Contrast with Glob (path matching). (Domain 2, Task 2.5)

**Hub-and-spoke** — See Coordinator-subagent pattern. (Domain 1, Task 1.2)

**Interview pattern** — An iterative refinement technique where Claude asks clarifying questions before acting, rather than making assumptions. Useful for ambiguous or complex requests. (Domain 3, Task 3.5)

**isError flag** — MCP protocol field indicating a tool call resulted in an error. Used with structured metadata (errorCategory, isRetryable) to enable intelligent error handling by the model. (Domain 2, Task 2.2)

**"Lost in the middle" effect** — The phenomenon where information placed in the middle of a long context window receives less attention than information at the beginning or end. (Domain 5, Task 5.1)

**MCP resources** — Read-only data catalogs exposed by MCP servers. Enable agents to browse available data without making exploratory tool calls, reducing unnecessary API usage. (Domain 2, Task 2.4)

**MCP server scoping** — Configuration determines where MCP tools are available: project-level (.mcp.json, shared) vs user-level (~/.claude.json, personal). Supports environment variable expansion for credentials. (Domain 2, Task 2.4)

**Multi-pass review** — A review architecture using separate passes: per-file local analysis followed by cross-file integration analysis. More effective than single-pass review for catching cross-cutting issues. (Domain 4, Task 4.6)

**Path-specific rules** — Configuration files in .claude/rules/ with YAML frontmatter that specify glob patterns. Rules activate only when working with files matching those patterns. Preferred over directory-level CLAUDE.md when conventions span multiple directories. (Domain 3, Task 3.3)

**PostToolUse hooks** — Agent SDK hooks that execute after a tool call completes. Used for data transformation, normalization, and compliance enforcement. (Domain 1, Task 1.5)

**Programmatic enforcement** — Using code (not prompts) to enforce business rules and compliance requirements. Required when deterministic compliance is needed. Contrast with prompt-based guidance. (Domain 1, Tasks 1.4, 1.5)

**Progressive summarization** — Technique of condensing conversation history to fit context limits. Risk: summarization may lose critical details like numerical values, dates, and precise expectations. (Domain 5, Task 5.1)

**Prompt chaining** — Breaking a complex task into a sequence of simpler prompts, where each prompt's output feeds the next. A form of fixed sequential decomposition. (Domain 1, Task 1.6)

**Read / Write / Edit** — Built-in file tools. Read: read file contents. Write: create or overwrite entire files. Edit: targeted string replacement within a file. Use Edit for modifications; fall back to Read + Write when the target text isn't unique. (Domain 2, Task 2.5)

**Retry-with-error-feedback** — Pattern where a failed extraction/generation is retried with the specific error message included, enabling the model to correct its output. Effective for format errors; ineffective when the required information is absent from the input. (Domain 4, Task 4.4)

**--resume** — Claude Code CLI flag for resuming a named session. Preserves conversation state across invocations. Important to inform the agent about external file changes that occurred between sessions. (Domain 1, Task 1.7)

**Scratchpad file** — A file used as external memory during long exploration sessions. The agent writes findings to the scratchpad to persist them beyond context window limits. Enables crash recovery and context management. (Domain 5, Task 5.4)

**Self-review limitations** — The model retains its own reasoning context, making it biased when reviewing its own output. Independent review instances (separate API calls with fresh context) are more effective. (Domain 4, Task 4.6)

**Session context isolation** — In CI/CD, using independent Claude instances for each review (rather than having one instance review its own prior output) produces higher quality results. (Domain 3, Task 3.6; Domain 4, Task 4.6)

**Skills** — Reusable capabilities defined in .claude/skills/ with SKILL.md files containing frontmatter (description, allowed-tools) and instructions. (Domain 3, Task 3.2)

**Slash commands** — Custom commands defined in .claude/commands/ (project-scoped, shared) or ~/.claude/commands/ (user-scoped, personal). Invoked with / prefix. Frontmatter options include context: fork and allowed-tools. (Domain 3, Task 3.2)

**stop_reason** — API response field indicating why the model stopped generating. Key values: "tool_use" (model wants to call a tool), "end_turn" (model is done), "max_tokens" (hit token limit). Critical for agentic loop control flow. (Domain 1, Task 1.1)

**Stratified random sampling** — Sampling technique for human review that ensures coverage across document types, fields, and edge cases. Prevents aggregate accuracy metrics from masking poor performance on specific categories. (Domain 5, Task 5.5)

**Structured handoff** — A protocol for transferring a conversation from agent to human (or between agents) that includes structured context: conversation summary, actions taken, reason for handoff, relevant data. (Domain 1, Task 1.4)

**Task tool** — Agent SDK mechanism for spawning subagents. The coordinator uses Task to delegate work to specialized agents. The coordinator's allowedTools must include "Task". (Domain 1, Task 1.3)

**tool_choice** — API parameter controlling tool selection behavior. Options: "auto" (model decides), "any" (must use a tool, any tool), or forced selection of a specific tool. "auto" is default for most cases; forced selection useful for guaranteed structured output. (Domain 2, Task 2.3; Domain 4, Task 4.3)

**tool_use** — A stop_reason value indicating the model wants to execute a tool call. In an agentic loop, the code should execute the tool and append the result to the conversation before the next model call. (Domain 1, Task 1.1)

**Tool description** — The text description provided with a tool definition. Acts as the primary mechanism Claude uses to decide which tool to call. Effective descriptions include input formats, example queries, edge cases, and boundary explanations. (Domain 2, Task 2.1)
