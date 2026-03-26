# Module 01 - Agentic Architecture & Orchestration

## Exam Weighting: 27%

## Objective
Understand how to design, implement, and manage autonomous agent systems using the Claude Agent SDK — including agentic loops, multi-agent orchestration, hooks, session management, and task decomposition.

## Task Statements Covered
- 1.1: Design and implement agentic loops for autonomous task execution
- 1.2: Orchestrate multi-agent systems with coordinator-subagent patterns
- 1.3: Configure subagent invocation, context passing, and spawning
- 1.4: Implement multi-step workflows with enforcement and handoff patterns
- 1.5: Apply Agent SDK hooks for tool call interception and data normalization
- 1.6: Design task decomposition strategies for complex workflows
- 1.7: Manage session state, resumption, and forking

## Key Concepts

### 1.1 Agentic Loops

The agentic loop is the fundamental execution pattern for autonomous agent systems built on the Claude API. At its core, it is a while loop that follows a simple cycle: call the model, inspect the response's stop_reason, execute any requested tool calls, append the tool results back into the conversation's messages array, and call the model again. This loop continues until the model signals it is finished. The pattern is deceptively simple in structure but carries significant design implications because the model — not the code — is driving the decisions about what happens next. Unlike a traditional workflow where a developer hardcodes "if condition A, call function B," an agentic loop lets the model determine which tools to call, in what order, and when to stop.

The stop_reason field in the API response is the control signal that governs the loop. When stop_reason is "tool_use," it means the model is requesting one or more tool calls. Your code must execute those tool calls and append each result as a tool_result message in the conversation history before making the next API call. When stop_reason is "end_turn," the model has decided it is finished — this is your signal to break out of the loop and return the final response. When stop_reason is "max_tokens," the model's response was truncated because it hit the output token limit. This is not a clean termination; it typically means you need to either increase max_tokens or handle the truncation gracefully (for example, by prompting the model to continue). Recognizing and correctly handling all three stop_reason values is essential — confusing "tool_use" with "end_turn" or ignoring "max_tokens" will produce broken agent behavior.

A critical implementation detail that catches many developers is the requirement to append tool results to the conversation history. The model has no persistent memory between API calls. The only way it "knows" what happened when a tool was executed is by reading the tool_result message that your code appends to the messages array. If you execute a tool but forget to append the result, the model will either re-request the same tool call (because from its perspective, it never happened), hallucinate the result, or behave unpredictably. This append step is not optional — it is the mechanism by which the model maintains awareness of the world state as the loop progresses.

The fundamental tradeoff of model-driven agentic loops is flexibility versus predictability. Because the model decides which tools to call and when, the agent can handle novel situations, adapt to unexpected tool results, and pursue creative solution paths that a hardcoded decision tree could never anticipate. However, this flexibility means the exact execution path is not deterministic. The same input may produce different tool call sequences on different runs. For workflows where predictability and auditability are paramount — such as financial processing or compliance-sensitive operations — this tradeoff must be carefully managed, often by combining the agentic loop with programmatic enforcement (covered in Task 1.4). The agentic loop provides the engine; guardrails must be built around it.

### 1.2 Multi-Agent Orchestration

Multi-agent orchestration uses a hub-and-spoke architecture (also called the coordinator-subagent pattern) where a single coordinator agent manages multiple specialist subagents. The coordinator receives the high-level task, breaks it into subtasks, delegates each subtask to the appropriate specialist subagent, and then aggregates the results into a coherent final output. This mirrors how a project manager works: they do not personally write code, design interfaces, and test the product — they assign each responsibility to the right team member and synthesize their work into a deliverable.

The most important architectural property of this pattern is that subagents operate with isolated context. A subagent does not automatically see the coordinator's full conversation history, the other subagents' work, or the broader task context. Each subagent receives only what the coordinator explicitly passes to it. This isolation is a feature, not a bug — it prevents context pollution (where irrelevant information degrades a specialist's performance), reduces token usage (each subagent works with a focused context window), and enables parallel execution (subagents with no dependencies can run simultaneously). However, isolation also means the coordinator bears full responsibility for providing each subagent with adequate context. If the coordinator fails to pass a critical piece of information, the subagent will produce results that are technically correct for its limited view but wrong for the broader task.

The coordinator has three core responsibilities. First, decomposition: analyzing the incoming task and determining how to break it into meaningful subtasks that map to the available subagents' specialties. Second, delegation: selecting the right subagent for each subtask and crafting the context and instructions passed to it. Third, result aggregation: collecting the outputs from all subagents, resolving any conflicts or gaps, and synthesizing them into a unified response. The quality of the coordinator's decomposition directly determines the system's effectiveness. Decomposition that is too coarse leaves subagents with unfocused tasks; decomposition that is too granular creates unnecessary overhead and coordination complexity while losing cross-task context that might be valuable.

Choosing between multi-agent and single-agent architectures requires understanding the problem structure. Multi-agent is appropriate when subtasks require genuinely different tool sets (a code-analysis agent needs different tools than a documentation-search agent), when subtasks benefit from different system prompts or expertise profiles, or when parallel execution would significantly reduce latency. Single-agent is preferable when the tasks are tightly coupled (each step depends heavily on the results of the previous step), when the tool set is coherent and related, or when the overhead of coordination would exceed the benefit of specialization. A common exam mistake is to reach for multi-agent when a single agent with a well-designed tool set would be simpler and more effective.

### 1.3 Subagent Configuration

The Task tool is the mechanism by which a coordinator agent spawns subagents in the Claude Agent SDK. When a coordinator needs to delegate work, it calls the Task tool with a description of the subtask, the context the subagent needs, and configuration parameters. This is not a special API — it is a regular tool call that the framework intercepts and routes to a new agent instance. For the coordinator to use this delegation mechanism, its allowedTools configuration must include "Task." If "Task" is not in the coordinator's allowedTools, it simply cannot spawn subagents, regardless of what the system prompt says. Each subagent, in turn, receives its own scoped allowedTools that define what tools it can access — and these should be limited to what the subagent actually needs for its specific role.

Subagent context must be explicitly provided by the coordinator. This is one of the most critical design points in the entire Agent SDK, and it appears frequently on the exam. There is no automatic inheritance of the coordinator's conversation history, system prompt context, or accumulated knowledge. When the coordinator calls the Task tool, it must include in the task description everything the subagent needs to know: relevant background information, specific instructions, data from previous steps, constraints, and expected output format. If the coordinator has a 50-turn conversation with rich context about a customer's issue, and it spawns a subagent with only "look up order #12345," that subagent has zero knowledge of the broader customer context. Designing what context to pass — and what to omit — is a key architectural skill.

The AgentDefinition configuration object specifies the full behavioral profile of each agent type in the system. It includes the model to use, the system prompt that defines the agent's role and instructions, the set of allowed tools, and other behavioral parameters. Well-designed AgentDefinitions create clear role boundaries: a research subagent might have access to search and read tools but no write tools, while an editor subagent might have write and edit tools but no search tools. This scoping by role improves reliability (the model is less likely to misuse tools it does not have) and security (a compromised or confused subagent cannot perform actions outside its mandate).

Fork-based session management enables subagents to operate in forked sessions — copies of a session state that diverge independently without affecting the original. This is particularly valuable when subagents need to explore different approaches in parallel. Each forked session maintains its own conversation history and state, so a subagent's experimental or verbose exploration does not pollute the coordinator's clean session. When the subagent completes its work, only its final output is returned to the coordinator, keeping the coordinator's context focused and manageable. The common mistake to watch for is assuming that forking automatically shares context — it creates an independent copy at the point of forking, and subsequent changes in either the original or the fork are invisible to the other.

### 1.4 Multi-Step Workflows and Enforcement

There are two fundamentally different approaches to controlling the flow of multi-step workflows: programmatic enforcement and prompt-based guidance. Programmatic enforcement uses code to control what the agent can and cannot do — for example, wrapping a tool call in a conditional check, using hooks to intercept and validate actions, or structuring the workflow so that certain steps physically cannot be skipped. Prompt-based guidance relies on instructions in the system prompt or conversation to tell the model what it should do — for example, "always verify the customer's identity before processing a refund." The critical insight for the exam is that these are not interchangeable. Prompt-based guidance is probabilistic: the model will usually follow it, but it can and occasionally will deviate. Programmatic enforcement is deterministic: the code will always enforce the rule.

For any business logic where compliance is mandatory — financial thresholds, regulatory requirements, safety-critical operations, access controls — programmatic enforcement is required. You cannot rely on a prompt instruction like "do not approve refunds over $500" because the model may, in rare edge cases, reason its way around that instruction or simply fail to apply it. Instead, the code that executes the refund tool must check the amount and reject the call if it exceeds the threshold, returning an error message to the model. The model then receives the rejection, understands the constraint, and adjusts its approach (for example, by escalating to a human approver). This pattern — let the model attempt the action, enforce the constraint in code, return the enforcement result to the model — combines the flexibility of model-driven loops with the reliability of programmatic control.

Structured handoff protocols define how an agent transfers a conversation to a human operator or to another system. An effective handoff is not simply stopping the agent and dropping the user into a human queue. It requires passing structured context: a summary of the conversation so far, what actions the agent took (and their results), the specific reason for the handoff (policy exception, customer request, inability to resolve), and any relevant data the human will need to continue without asking the customer to repeat themselves. Well-designed handoffs should also include escalation triggers — predefined conditions that cause the agent to escalate automatically, such as the customer explicitly requesting a human, the agent detecting a policy gap it cannot resolve, or the agent failing to make progress after a configured number of attempts.

The tradeoff between programmatic and prompt-based approaches is fundamentally about rigidity versus adaptability. Programmatic enforcement guarantees compliance but is rigid — every enforced rule must be anticipated and coded in advance, and changes require code deployments. Prompt-based guidance is flexible and can handle novel situations gracefully, but it provides no guarantee. The most effective architectures use both: programmatic enforcement for the hard constraints that must never be violated, and prompt-based guidance for the softer behavioral preferences that benefit from the model's judgment. An exam question that presents a compliance-sensitive scenario and offers both approaches as answer choices will almost always have programmatic enforcement as the correct answer.

### 1.5 Agent SDK Hooks

The Agent SDK provides a hook system that enables developers to insert custom logic at specific points in the agent's execution cycle. The two most important hook types are PostToolUse hooks and tool call interception hooks. PostToolUse hooks execute after a tool call has completed and its result is available but before that result is appended to the conversation. This positioning makes them ideal for data transformation and normalization — for example, converting all date strings in tool results to a consistent ISO 8601 format, redacting sensitive fields like social security numbers from API responses, or enriching tool results with additional metadata. The hook receives the tool result, transforms it, and returns the modified version that the agent will actually see.

Tool call interception hooks execute before a tool call is made. They receive the tool name and the arguments the model wants to pass, and they can allow the call, modify the arguments, or block the call entirely. This is the mechanism for implementing compliance enforcement at the tool level. For example, an interception hook on the process_refund tool can check whether the refund amount exceeds the agent's authority limit, whether a required approval flag is present, or whether the customer account is in a state that permits refunds. If the hook blocks the call, it returns an error message that is appended to the conversation as if the tool had failed, allowing the model to understand the constraint and adjust its behavior.

The key distinction to internalize is that hooks are programmatic enforcement — they are code, not prompts. A hook that blocks refund calls over $500 will always block them, regardless of how the model reasons or what the conversation context suggests. This makes hooks the appropriate mechanism for any constraint that must be enforced deterministically. Prompt instructions like "check with a supervisor before approving large refunds" are useful for guiding the model's general behavior, but they cannot guarantee compliance. Hooks can. This distinction between programmatic hooks and prompt-based guidance is a recurring theme across the exam, and questions will test whether you can identify which approach is appropriate for a given scenario.

Practical hook applications extend beyond simple blocking. A PostToolUse hook might aggregate metrics across all tool calls (counting API requests, tracking latency, logging actions for audit trails), normalize inconsistent data formats from different backend systems into a uniform structure the model can process reliably, or filter out noisy fields that would waste context window space without providing value. An interception hook might enforce rate limiting (blocking tool calls that exceed a per-minute threshold), implement progressive authorization (allowing basic operations freely but requiring escalation for sensitive ones), or inject additional parameters that the model does not need to know about (such as internal tracking IDs or authentication tokens). Hooks transform the agent from a simple model-tool loop into a governed system with consistent behavior guarantees.

### 1.6 Task Decomposition

Fixed sequential pipelines define a predetermined sequence of steps that execute in order: Step A produces output that feeds Step B, which feeds Step C, and so on. Each step has a clearly defined input and output contract. Prompt chaining is a common implementation of this pattern, where each step is a separate model call with a focused prompt and the previous step's output included in the context. Fixed pipelines are simple to understand, debug, and monitor — you can trace exactly which step produced which output. They are appropriate when the workflow is well-understood, consistent across runs, and unlikely to require deviation. Examples include document processing pipelines (extract, classify, summarize) or data transformation workflows (validate, normalize, enrich).

Dynamic adaptive decomposition is the opposite approach: instead of following a fixed plan, the agent creates its own task plan, executes the first step, evaluates the result, and then decides what to do next — which may include revising the plan entirely. This pattern is sometimes called an adaptive investigation plan. The agent maintains an explicit or implicit model of what it knows, what it still needs to find out, and what approaches are available. After each step, it reassesses: Did the previous step produce the expected information? Does the plan need to change? Should a different approach be tried? This pattern excels in investigation and research tasks where the path through the problem depends on what is discovered along the way.

The choice between fixed and adaptive decomposition depends on the variability of the problem space. If every instance of the task follows roughly the same structure — same inputs, same processing steps, same output format — a fixed pipeline is more efficient and reliable. If the task varies significantly between instances — different data sources, unpredictable intermediate results, branching logic that depends on content rather than structure — adaptive decomposition handles the variability gracefully. A hybrid approach is also common: use a fixed pipeline for the well-understood stages and embed adaptive decomposition within specific stages that require exploration. For example, a code review pipeline might have fixed stages (clone, analyze, report) but use adaptive decomposition within the analyze stage to determine which files to examine based on the change set.

A common pitfall is over-decomposing tasks. Breaking a simple task into many small subtasks creates coordination overhead (each handoff requires context to be explicitly passed), loses cross-task context (information discovered in step 2 may be relevant to step 5 but is not automatically available), and increases latency (each subtask may involve a separate model call). The general principle is to decompose only when there is a clear benefit: different subtasks need different tools, different subtasks benefit from different expertise, or the task is too large for a single context window. If a task can be handled effectively by a single agent in a single agentic loop, decomposition adds complexity without value.

### 1.7 Session Management

The --resume flag in Claude Code allows an agent to continue a previously named session, restoring the full conversation history and state from where it left off. This is essential for long-running tasks that span multiple invocations — for example, a multi-day code refactoring project where the developer works with the agent for an hour, takes a break, and comes back later. Without session resumption, the agent would start fresh each time, losing all the context about what was already discussed, what decisions were made, and what work was completed. Named sessions act as persistent workspaces that preserve the agent's accumulated understanding.

The fork_session mechanism creates an independent copy of the current session state at the moment of forking. The original session continues unchanged, and the forked session can diverge freely. This is valuable for exploratory scenarios: the agent might fork a session to try an experimental approach without risking the main session's state. If the experiment succeeds, the results can be brought back; if it fails, the fork is simply discarded. Forking is also the mechanism used for subagent isolation — when a coordinator spawns a subagent, the subagent may operate in a forked session so that its verbose intermediate work does not pollute the coordinator's context.

A critical consideration for session resumption is the staleness of assumptions. When an agent resumes a session, it picks up with the same understanding of the world it had when the session was paused. If files were edited by other tools (an IDE, another developer, a CI pipeline), if git branches were switched, or if external data changed, the agent does not automatically know about these changes. It will operate based on stale assumptions — for example, believing a file still contains code that was deleted, or not knowing about new files that were added. For this reason, it is best practice to explicitly inform the agent about any external changes at the start of a resumed session: "Since we last spoke, I pulled the latest changes from main and the database schema was updated." Without this update, the agent's actions may conflict with the current state of the codebase.

The decision between resuming a session and starting fresh depends on the relationship between the previous and current tasks. Resume when continuity matters: the current task is a direct continuation of the previous work, decisions made in the prior session are still relevant, and the accumulated context would be expensive to rebuild. Start fresh when the prior context could be misleading: the task is unrelated, the codebase has changed substantially, or the previous session went down an unproductive path whose reasoning might bias the agent. Over-relying on session resumption can lead to context degradation — as the conversation grows, older information becomes harder for the model to access effectively (the "lost in the middle" effect discussed in Domain 5). For very long projects, periodic fresh starts with explicit context re-establishment can be more effective than indefinitely extending a single session.

## Architecture Patterns

### Single-Agent Loop
The simplest pattern: one agent with tools in a while loop. Best for focused tasks where all needed tools are related. stop_reason drives the loop. The agent receives a task, uses its tools as needed, and terminates when it decides the task is complete (end_turn). This pattern is appropriate for the majority of tasks that do not require specialized subagents or complex coordination.

### Hub-and-Spoke Multi-Agent
Coordinator manages specialist subagents. Best for complex tasks requiring different expertise or tool sets. Coordinator handles decomposition, delegation, and aggregation. Each subagent operates in isolation with its own scoped tools and context. The coordinator is the only agent that sees the full picture and is responsible for coherence of the final output.

### Pipeline Chain
Fixed sequential handoffs: Agent A produces output, which becomes input for Agent B, which produces output for Agent C. Each agent has a specific role and passes structured output to the next. Best for well-defined, repeatable workflows where the processing stages are known in advance. Easy to debug because each stage can be inspected independently.

### Dynamic Decomposer
An agent that creates its own task plan, executes steps, and revises the plan based on results. Best for investigation or research tasks where the path is not known in advance. The agent maintains an evolving plan and adapts as new information is discovered. Harder to debug and monitor than fixed patterns, but handles variability gracefully.

## Scenario Walkthrough

Design a customer support agent system that handles order lookup, refund processing, and escalation.

**Requirements:**
- 80%+ first-contact resolution target
- Tools: get_customer, lookup_order, process_refund, escalate_to_human
- Must enforce refund approval limits programmatically
- Must escalate when customer requests human or when policy gaps are detected

**Step-by-step design reasoning:**
1. This is a single-agent task (tools are tightly coupled, all relate to customer support)
2. Use an agentic loop with stop_reason control (Task 1.1)
3. Implement programmatic enforcement for refund limits — do NOT rely on prompt instructions for dollar thresholds (Task 1.4)
4. Define structured escalation triggers: customer requests human, policy exception, agent unable to resolve after N attempts (Task 1.4)
5. Use PostToolUse hooks to normalize customer data formats and log all actions for compliance (Task 1.5)
6. Session management: each support ticket is a new session; don't resume across different tickets (Task 1.7)

**Why not multi-agent?** The tools are all customer-support related and tightly coupled. Splitting into multiple agents would add coordination overhead without benefit. Multi-agent would make sense if we added a separate research capability or billing system integration.

## Practice Exercises

### Exercise 1: Build an Agentic Loop
Implement a basic agentic loop that calls a mock API, checks stop_reason, executes tool calls, and appends results. Verify that the loop terminates on end_turn and handles max_tokens gracefully.

### Exercise 2: Add Programmatic Enforcement
Extend the loop with a compliance hook that blocks refund tool calls above a threshold. Verify that the model receives an error response and adjusts its approach.

### Exercise 3: Design a Coordinator
Design (on paper) a coordinator-subagent architecture for a research system. Specify: what context the coordinator passes to each subagent, what each subagent returns, and how the coordinator aggregates results.

## Exam Tips

- **This domain is 27% of the exam.** Invest proportionally more study time here.
- **Know the stop_reason values cold.** Questions often test whether you know what triggers loop continuation vs termination.
- **Programmatic vs prompt-based is a key distinction.** If the question involves compliance, money, or safety — the answer is almost always programmatic enforcement.
- **Subagent context is NOT inherited.** Any question about subagent behavior — remember that context must be explicitly passed.
- **"Overly narrow decomposition" is a common distractor.** If a question presents a simple task split across many agents, that's usually the wrong answer.

## Cross-References

- Domain 2 (Tool Design) — Task 2.3 on distributing tools across agents directly connects to Task 1.2/1.3
- Domain 5 (Context & Reliability) — Task 5.3 on error propagation across multi-agent systems extends Task 1.2
- Domain 5 (Context & Reliability) — Task 5.1 on context management is critical for long-running agentic loops (Task 1.1)
- Exam Scenarios: Scenario 1 (Customer Support), Scenario 3 (Multi-Agent Research), Scenario 4 (Developer Productivity)
- Assessment: assessments_domain-01-questions.md
