# Module 03 - Context Engineering

## Exam Weighting: 20%

## Objective
Distinguish context engineering from prompt engineering and apply systematic techniques for providing the right information at the right time to minimize waste and maximize output alignment.

## Task Statements Covered
- 3.1: Differentiate context engineering from prompt engineering
- 3.2: Apply just-in-time context delivery strategies
- 3.3: Manage context window efficiency across multi-turn interactions
- 3.4: Design context hierarchies for complex tasks
- 3.5: Evaluate context relevance to reduce waste

## Key Concepts

### 3.1 Context Engineering vs. Prompt Engineering

Prompt engineering and context engineering are often used interchangeably, but they address fundamentally different problems. Understanding the distinction is essential because it determines where you focus your optimization efforts.

**Prompt engineering** is about what you say -- the instructions, questions, and directives you send to the model. It encompasses how you phrase objectives, how you structure requests, and how you specify desired outputs. Prompt engineering is the craft of writing the request itself. The CORPS framework (Module 02) is primarily a prompt engineering tool: it provides a structure for crafting effective requests.

**Context engineering** is about what the model knows when it responds. It encompasses everything that shapes the model's understanding before and during response generation: system prompts, retrieved documents, conversation history, injected data, reference materials, and the information architecture that determines which of these elements are present and in what order. Context engineering is the design of the information environment in which the model operates.

The analogy is this: prompt engineering is writing a good question for an interview. Context engineering is selecting which documents, briefing materials, and background information the interviewer has on their desk before the interview begins. You can ask a perfect question, but if the interviewer has the wrong briefing materials (or no materials at all), the answer will miss the mark. Conversely, even a mediocre question will get a good answer if the interviewer has exactly the right context.

In practice, context engineering is the higher-leverage skill. A well-contextualized prompt with an average question will often outperform a poorly contextualized prompt with a perfectly crafted question. This is because the model's response quality is bounded by the information available to it. No amount of prompt sophistication can compensate for missing context -- the model cannot reason about information it does not have.

Context engineering is also where the most significant waste opportunities exist at organizational scale. Individual prompt optimization saves tokens one prompt at a time. Context engineering improvements -- better system prompts, smarter retrieval pipelines, more efficient conversation history management -- improve every prompt that operates within that context.

### 3.2 Just-in-Time Context Delivery

Just-in-time (JIT) context delivery is the principle of providing context only when the model needs it for the current task, rather than front-loading everything into the initial interaction. This borrows directly from Lean manufacturing's JIT inventory management, where parts arrive at the assembly line exactly when they are needed -- not before (which creates excess inventory) and not after (which creates waiting waste).

In AI interactions, the most common anti-pattern is the "context dump" -- loading a massive block of background information, instructions, examples, and reference material into the first prompt. This creates three forms of waste. First, **token cost waste**: every token of context is charged on input, whether the model uses it or not. A 2,000-token context block costs the same whether 100% of it is relevant or only 10% is. Second, **attention dilution**: models have finite attention capacity, and critical information buried in a large context block may receive less processing than it would in a focused, smaller context. Third, **flexibility loss**: a massive upfront context locks you into a particular framing that may not serve later turns in the conversation.

JIT context delivery operates on three principles. **Progressive disclosure** provides context in layers -- essential background first, then task-specific details, then refinement criteria -- across multiple turns rather than all at once. **Conditional inclusion** adds context only when a specific condition is met: if the user asks about pricing, inject pricing data; if they ask about technical specs, inject technical data. **Context staging** pre-plans which context will be needed at each step of a multi-step workflow and prepares it in advance but delivers it just before it is needed.

The practical implementation of JIT context depends on the interaction pattern. In single-turn interactions (one prompt, one response), JIT means including only the context relevant to the specific task and excluding everything else -- this is the context tier system from Module 02 (essential, helpful, background). In multi-turn interactions, JIT means distributing context across turns: turn 1 sets the scene, turn 2 provides the specific task, turn 3 adds refinement criteria based on the first output. In automated pipelines (RAG systems, agent architectures), JIT means designing retrieval and injection logic that selects context based on the current query, not a static context block.

### 3.3 Context Window Management

Every AI model has a context window -- the maximum number of tokens it can process in a single interaction. Understanding and managing this window is a core context engineering skill because window capacity is a finite resource, and every token of waste reduces the space available for value-adding content.

**Token budgeting** is the practice of allocating the context window across its components: system prompt, conversation history, retrieved context, current user prompt, and reserved space for the model's response. A typical allocation might be: 15% system prompt, 30% conversation history, 25% retrieved context, 10% current prompt, 20% response space. These percentages vary by use case, but the principle is constant: explicitly plan how the window is used rather than filling it ad hoc until it overflows.

**Conversation history management** is the highest-leverage context window optimization for multi-turn interactions. As conversations grow, the history consumes an increasing share of the window. Without management, a 20-turn conversation will eventually push out room for the model's response or force truncation of important early context. Three strategies manage this: **summarization** (periodically compressing earlier turns into a summary that captures key decisions and context), **selective retention** (keeping only turns that remain relevant to the current task and dropping completed subtasks), and **sliding window** (retaining only the most recent N turns, with critical information promoted to a persistent context section).

**The "lost in the middle" phenomenon** is a well-documented pattern in which models pay more attention to information at the beginning and end of the context window and less attention to information in the middle. For context engineering, this means that the most important information -- the objective, critical constraints, essential context -- should be placed at the beginning of the prompt or at the end, near the point where the model begins generating its response. Burying critical instructions in the middle of a large context block increases the probability of those instructions being underweighted, leading to defect waste.

**Context overflow strategies** determine what happens when the content needed for a task exceeds the context window. Options include: breaking the task into smaller subtasks that each fit within the window, using retrieval to dynamically inject only the most relevant content, summarizing large documents before injection, and hierarchical processing (summarize sections individually, then synthesize summaries). The choice depends on the task type and the acceptable quality tradeoff.

### 3.4 Context Hierarchies for Complex Tasks

Complex tasks require structured context delivery. A context hierarchy organizes information into layers based on persistence and scope, ensuring that the model always has the right information for the current step without carrying unnecessary load.

**Persistent context** is information that remains relevant throughout the entire interaction, regardless of which specific task is being performed. System prompts are the primary vehicle for persistent context. Examples include: the organization's name and industry, the user's role, communication standards, and any constraints that apply universally (compliance requirements, brand guidelines). Persistent context should be concise -- it consumes tokens on every turn, so bloated persistent context is a compounding waste.

**Situational context** is information relevant to the current task or task phase but not to the entire interaction. When a user shifts from writing marketing copy to analyzing competitor data, the context needed changes entirely. Situational context is injected at the beginning of a task and may be removed or replaced when the task changes. In RAG architectures, retrieval results are situational context -- they are dynamically selected based on the current query.

**Ephemeral context** is information relevant only to the current turn and immediately disposable afterward. Examples include: specific data points for a calculation, a reference snippet for fact-checking, or a format example for the current output. Ephemeral context should be clearly demarcated so that the model (and the system managing context) can distinguish it from information that should persist.

Designing context hierarchies requires understanding the task structure. For a simple, single-step task, the hierarchy is flat: all context is situational. For a multi-step workflow (draft, review, revise, publish), the hierarchy has layers: persistent context (brand guidelines), situational context (the specific topic and audience for this piece), and ephemeral context (the reviewer's feedback for the current revision cycle).

### 3.5 Context Relevance Assessment

Not all context is created equal. Context relevance assessment is the practice of evaluating whether each piece of included context actually improves output quality enough to justify its token cost.

**Signal-to-noise ratio** is the framework for this assessment. Signal is context that directly contributes to a better output. Noise is context that consumes tokens without improving the output. The goal is to maximize the signal-to-noise ratio in every prompt. A prompt with 500 tokens of context where 400 are signal has an 80% signal-to-noise ratio. A prompt with 2,000 tokens of context where 400 are signal has a 20% ratio -- the same signal buried in five times the noise.

**Measuring context impact** requires A/B testing: run the same prompt with and without a specific piece of context and compare the outputs. If removing the context degrades the output quality, it was signal. If removing it has no measurable effect on output quality, it was noise. This empirical approach prevents the common error of assuming that "more context is always better." In practice, there is a point of diminishing returns where additional context begins to dilute rather than enhance the model's performance.

**Context pruning** is the systematic removal of noise from prompts. It follows a simple protocol: start with the full context set, remove one element at a time, test whether output quality declines, and retain only the elements that demonstrably improve quality. This is the context equivalent of Lean's waste elimination -- every token must earn its place in the prompt.

The cost of irrelevant context is not just the tokens it consumes directly. Irrelevant context can actively degrade output quality by distracting the model from the signal. A prompt asking for a technical analysis of a software architecture that includes three paragraphs of company history is not just wasting tokens on the history -- the history may cause the model to frame its analysis in a business context rather than a purely technical one, producing a less focused and less useful output.
