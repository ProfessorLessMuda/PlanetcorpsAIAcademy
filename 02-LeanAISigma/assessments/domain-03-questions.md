# Domain 3 Assessment - Context Engineering

## Question 1
**Scenario:** A team is building an AI-assisted code review tool. Currently, the system sends each pull request diff to Claude with the instruction: "Review this code for bugs and style issues." The reviews are generic and miss project-specific conventions. A developer proposes rewriting the instruction to say: "You are an expert code reviewer. Be thorough and detailed. Review this code for bugs and style issues. Think step by step." Another developer proposes instead feeding the model the project's style guide, recent merged PRs as examples of approved code, and the relevant module's architecture doc alongside the diff. Which proposal represents context engineering?

A) The first proposal, because rewriting the instruction to add role-setting and chain-of-thought is the core of context engineering
B) The second proposal, because context engineering focuses on curating and structuring the information the model receives rather than refining the instruction phrasing
C) Both proposals equally represent context engineering because any change to what the model sees counts as context engineering
D) Neither proposal is context engineering -- both are prompt engineering applied at different levels of abstraction

**Answer:** B

**Explanation:** Context engineering is about designing and managing the total information environment the model operates within -- selecting which documents, examples, and reference material to include so the model has the right knowledge at inference time. The second proposal does exactly this by supplying the style guide, example PRs, and architecture docs. Option A is incorrect because adding "You are an expert" and "Think step by step" are classic prompt engineering techniques -- they refine how the model is instructed to behave, not what information it has access to. Option C is incorrect because while both technically change the input, the distinction matters: prompt engineering optimizes the instruction itself, while context engineering optimizes the surrounding information payload. Option D is incorrect because the second proposal clearly goes beyond prompt engineering by curating external knowledge sources.

**Task Statement:** 3.1

---

## Question 2
**Scenario:** An AI customer support agent handles billing inquiries. The current system prompt says: "You are a helpful billing support agent. Answer questions about invoices clearly and concisely." The team wants to improve accuracy on questions about prorated charges. Which of the following improvements is context engineering rather than prompt engineering?

A) Adding to the system prompt: "When answering proration questions, break down the calculation step by step and show the daily rate"
B) Injecting the customer's actual invoice line items, their billing cycle dates, and the company's proration policy document into the context alongside each query
C) Changing the system prompt to: "You are a senior billing specialist with 10 years of experience in SaaS proration calculations"
D) Appending "Let's think about this carefully" to the end of each user query before sending it to the model

**Answer:** B

**Explanation:** Context engineering means supplying the model with the specific data and reference documents it needs to produce an accurate answer. Injecting the real invoice data, billing cycle dates, and the proration policy document gives the model the factual grounding required to calculate prorated charges correctly. Option A is incorrect because it changes how the model is instructed to format its reasoning -- that is prompt engineering. Option C is incorrect because assigning a persona or expertise level is a prompt engineering technique that does not give the model any actual proration data. Option D is incorrect because appending a reasoning trigger is a prompt engineering tactic (similar to chain-of-thought prompting) that does not introduce any new information.

**Task Statement:** 3.1

---

## Question 3
**Scenario:** A legal research assistant handles multi-turn conversations where attorneys ask follow-up questions about case law. The system currently loads the full text of every potentially relevant case (often 15-20 cases, totaling 80,000+ tokens) into the context at the start of each conversation, regardless of the attorney's first question. Most conversations only reference 2-3 cases. The team wants to reduce cost and improve relevance. What is the best approach?

A) Summarize all 15-20 cases into short abstracts and load all summaries at the start so the model always has awareness of every case
B) Load only the case metadata (names, dates, holdings) initially, then retrieve and inject the full text of specific cases on demand as the attorney's questions identify which cases are relevant
C) Keep loading all cases but move them to the end of the context window where they consume fewer effective tokens
D) Pre-filter to the 5 most commonly cited cases in the practice area and always load those regardless of the query

**Answer:** B

**Explanation:** This is just-in-time (JIT) context -- progressive disclosure that provides lightweight metadata upfront and retrieves full detail only when the conversation signals a need. This approach keeps costs low on most turns, maintains relevance by loading only what is needed, and still gives the model enough metadata to guide the attorney toward available cases. Option A is incorrect because while summaries reduce token count, loading all 15-20 summaries still front-loads information the conversation may never need and loses the detail required for deep analysis when a case does become relevant. Option C is incorrect because position in the context window does not reduce token consumption -- all tokens are counted and billed regardless of placement. Option D is incorrect because pre-filtering by general popularity ignores the specific query and would miss the niche cases that matter most for a particular attorney's question.

**Task Statement:** 3.2

---

## Question 4
**Scenario:** A developer is building a customer service agent with a system prompt that contains (1) safety guardrails prohibiting discussion of competitor products, (2) a product catalog with 200 items, and (3) instructions for tone and formatting. The total context is 12,000 tokens. During testing, the agent occasionally violates the competitor product guardrail, especially in longer conversations. Where should the safety guardrails be placed for maximum reliability?

A) In the middle of the context, embedded within the product catalog, so the model encounters them naturally while processing product information
B) At the very beginning of the system prompt and reiterated at the end, leveraging both primacy and recency effects in attention
C) Only at the end of the system prompt, because the model processes tokens sequentially and the last instruction it reads carries the most weight
D) In a separate tool description rather than the system prompt, because tool descriptions receive higher attention weight than system prompts

**Answer:** B

**Explanation:** Research on attention patterns in large language models shows that content at the beginning and end of the context window receives stronger attention than content in the middle (sometimes called the "lost in the middle" effect). For critical instructions like safety guardrails, placing them at the start (primacy) and reinforcing them at the end (recency) maximizes the probability that the model attends to them, especially as conversations grow longer. Option A is incorrect because the middle of the context is precisely where attention is weakest -- embedding critical rules among catalog entries increases the chance they will be overlooked. Option C is incorrect because relying solely on recency neglects primacy, and in longer conversations the "end of the system prompt" moves further from the model's most recent attention focus. Option D is incorrect because tool descriptions are not inherently attended to more strongly than system prompts, and safety guardrails should govern overall behavior, not just tool use.

**Task Statement:** 3.3

---

## Question 5
**Scenario:** A technical support chatbot averages 25 turns per conversation. By turn 20, the model frequently "forgets" constraints established in turns 1-3, such as the customer's subscription tier and the troubleshooting steps already attempted. The full conversation history is being passed in every request. What is the best strategy to maintain coherence across the full conversation?

A) Increase max_tokens to give the model more room to process the full history
B) Maintain a running structured summary that is updated every few turns, capturing key facts (subscription tier, steps completed, current issue state), and prepend this summary to the context so critical information stays near the top
C) Instruct the model in the system prompt: "Always remember everything the customer has told you across all turns"
D) Limit conversations to 15 turns maximum and force the customer to start a new session, since context degradation is unavoidable

**Answer:** B

**Explanation:** A running structured summary solves the "lost in the middle" problem by extracting key facts from earlier turns and placing them at the top of the context where attention is strongest. This ensures the subscription tier, completed steps, and current state remain salient regardless of how many turns have elapsed. Option A is incorrect because max_tokens controls the output length, not the model's ability to attend to input context -- a longer response does not improve comprehension of a long history. Option C is incorrect because instructing the model to "remember everything" is a prompt-only approach that cannot overcome attention degradation across a long context; the model does not have persistent memory, it only has what is in the current context window. Option D is incorrect because while it avoids the problem, it creates a poor user experience and is unnecessary when proper context management strategies exist.

**Task Statement:** 3.3

---

## Question 6
**Scenario:** An enterprise AI assistant has access to several types of information: (1) the company's acceptable use policy, which rarely changes, (2) the user's current project details pulled from Jira at the start of each session, (3) the specific error message the user just pasted into the chat. How should these three items be classified in a context taxonomy?

A) All three are persistent context because they are all relevant to the user's work
B) (1) is persistent, (2) is persistent, and (3) is situational -- since the error message only matters for this conversation
C) (1) is persistent, (2) is situational, and (3) is ephemeral -- each has a different lifespan and refresh cadence
D) (1) is situational, (2) is ephemeral, and (3) is ephemeral -- because both the project details and the error message are specific to the moment

**Answer:** C

**Explanation:** Context taxonomy classifies information by its lifespan and how frequently it changes. The acceptable use policy (1) is persistent context -- it applies across all sessions and rarely changes, so it can be baked into the system prompt or loaded once. The Jira project details (2) are situational context -- they are relevant for the duration of a session but change between sessions as the user switches projects. The error message (3) is ephemeral context -- it is relevant only for the immediate exchange and will be replaced by the next question. Option A is incorrect because lumping all three together ignores their fundamentally different refresh cadences. Option B is incorrect because Jira project details are not persistent; they change session to session as the user works on different projects. Option D is incorrect because the acceptable use policy is clearly not situational -- it does not change based on the session.

**Task Statement:** 3.4

---

## Question 7
**Scenario:** A developer is debugging a prompt for a contract analysis agent. The current context includes: (1) the full contract text (3,000 tokens), (2) a general explanation of what contracts are and how they work (800 tokens), (3) the company's extraction schema defining which fields to extract (400 tokens), (4) five example contracts with their expected outputs (4,000 tokens), and (5) a disclaimer about not providing legal advice (200 tokens). The total is 8,400 tokens. The developer needs to reduce the context to under 5,000 tokens to cut costs while maintaining extraction accuracy. Which item should be pruned first to improve the signal-to-noise ratio?

A) The extraction schema (4), because the model can infer the output format from the examples alone
B) The general explanation of what contracts are (2), because it adds no information the model does not already know and contributes zero signal to the extraction task
C) Three of the five example contracts (4), keeping only two examples to save the most tokens
D) The legal disclaimer (5), because at 200 tokens it is the smallest item and easiest to remove

**Answer:** B

**Explanation:** Signal-to-noise ratio measures how much of the context directly contributes to the task versus how much is irrelevant filler. The general explanation of what contracts are is pure noise for a language model that already has extensive knowledge of contracts from pretraining. Removing it frees 800 tokens without any loss in extraction accuracy. Option A is incorrect because the extraction schema is high-signal content -- it defines exactly which fields the model should output, and removing it would force the model to guess the schema from examples alone, increasing error risk. Option C is incorrect as a first move because while reducing examples saves the most tokens (2,400), examples are high-signal for extraction accuracy; this should be a later optimization, not the first cut. Option D is incorrect because while the disclaimer is low-signal, removing 200 tokens is insufficient to reach the 5,000 token target, and it may serve a compliance purpose -- the developer should first remove content that is clearly zero-signal.

**Task Statement:** 3.5

---
