# Lean AI Sigma -- Green Belt: Exam Scenarios

---

## Scenario 1: Marketing Team Prompt Overhaul

**Context:** Brightline Digital is a mid-size marketing agency where a team of eight content writers uses AI daily to produce blog posts, social media copy, and email campaigns. The team lead, Priya, notices that the average content piece requires 4.2 prompt-response iterations before the writer accepts the output. Token tracking shows the team consumes approximately 3,800 tokens per successful output -- roughly three times the estimated minimum for their typical deliverables.

Priya observes that most writers use a similar pattern: they paste in a large block of background information about the client, add a vague request like "write a great blog post about this topic," receive an unfocused 1,200-word draft when they needed 400 words, rephrase their request with more detail, receive another misaligned draft, and continue iterating until the output is acceptable. The writers report that they spend more time re-prompting than they would spend writing the content themselves.

Priya has been asked to lead a Lean AI initiative to reduce iteration count and token waste by at least 40% within one month.

**Domains tested:** 1, 2, 4

### Question 1.1
**Scenario:** Priya examines a writer's typical prompt for a client blog post. The prompt includes 600 tokens of client background (company history, full product catalog, executive bios), a 50-token request saying "Write a compelling blog post about our new feature for our audience," and no specification of length, format, tone, or target audience segment. The resulting output is a 1,200-word general overview that the writer then spends three more iterations narrowing down to a 400-word focused piece.

Which combination of waste types is most clearly present in this interaction?

A) Waiting waste and underutilized talent waste -- the writer waits too long between iterations and does not leverage the model's creative capabilities
B) Excess context inventory, overproduction, and defect waste -- the prompt loads unnecessary background, lacks output constraints causing bloated generation, and the misaligned output requires rework
C) Unnecessary motion and unnecessary token waste -- the writer moves between too many applications and uses too many filler words in the prompt
D) Over-processing and waiting waste -- the model performs too much analysis and the writer spends idle time evaluating outputs

**Answer:** B

**Explanation:** Three distinct waste types converge here. Excess context inventory: 600 tokens of client background including executive bios and full product catalog when only the new feature and target audience are relevant to this specific blog post. Overproduction: the absence of length and format constraints causes the model to generate 1,200 words when 400 were needed -- three times the required output. Defect waste: the vague objective ("compelling blog post... for our audience") without specifying the audience segment or angle produces a misaligned draft requiring three additional iterations of rework. Option A misidentifies the waste types; waiting is a secondary consequence, not the root cause. Option C confuses unnecessary motion (repeated rephrasing due to structural problems) with the actual cause (missing CORPS elements). Option D misapplies over-processing, which refers to requesting more types of work than needed, not generating too much of the right type.

**Task Statement:** 1.1

---

### Question 1.2
**Scenario:** Priya decides to redesign the blog post prompt using the CORPS framework. She drafts: "Context: [Client] is launching [Feature] targeting mid-market SaaS buyers. Role: Act as a B2B technology content strategist. Objective: Write a 400-word blog post explaining how [Feature] solves [specific pain point]. Parameters: Professional but conversational tone, include one concrete example, no jargon. Structure: Hook (2 sentences), problem statement, solution with example, CTA."

A team member argues this is "over-engineering a simple prompt" and that they should just add "make it 400 words" to their existing approach.

Which response best explains why the full CORPS redesign is more effective than the minimal fix?

A) The CORPS prompt is more professional and demonstrates proper methodology, which matters for the team's credibility with clients
B) Adding "make it 400 words" addresses only overproduction; the full CORPS redesign eliminates excess context inventory (scoped background), defect waste (precise objective and role), and overproduction (length, tone, and structure constraints) simultaneously -- attacking one waste type while leaving others untouched rarely achieves the 40% reduction target
C) The CORPS framework must always be applied in full; using partial elements violates the methodology and produces worse results than no framework at all
D) The minimal fix is actually sufficient because length constraints are the only parameter that meaningfully affects output quality

**Answer:** B

**Explanation:** The minimal fix of adding a word count addresses only one waste type (overproduction by length) while leaving the root causes of other waste types untouched. The vague objective will still produce misaligned content requiring rework (defect waste). The 600-token context dump will still consume unnecessary input tokens (excess context inventory). The missing role means the model has no guidance on voice or expertise level. CORPS addresses all waste types simultaneously: scoped context eliminates inventory waste, a precise objective prevents defects, role assignment compresses context and calibrates voice, and parameters plus structure prevent overproduction. Option A focuses on optics rather than measurable efficiency. Option C overstates the requirement -- CORPS elements are used when they add value, not forced into every prompt. Option D is incorrect because length alone cannot fix objective misalignment or context bloat.

**Task Statement:** 2.6

---

### Question 1.3
**Scenario:** After two weeks of CORPS adoption, Priya's team measures results. Average iterations dropped from 4.2 to 1.6, and tokens per successful output dropped from 3,800 to 1,900. However, one writer, Marcus, still averages 3.1 iterations despite using the CORPS template. Priya reviews Marcus's prompts and finds he copies the template structure but fills in vague content: his objectives say things like "write something good about the topic" and his context sections contain full client briefs unchanged from before.

What is the most effective intervention for Marcus's situation?

A) Provide Marcus with completed example prompts he can copy and modify, using the "Name That Tune" challenge to progressively reduce token count while maintaining output quality
B) Remove Marcus from the initiative since some team members are not suited for structured approaches
C) Ask Marcus to double the length of his prompts so the model has more information to work with
D) Switch Marcus to a more capable model that can handle vague prompts with less iteration

**Answer:** A

**Explanation:** Marcus understands the CORPS structure but has not internalized the principles behind each element. Providing completed examples gives him a concrete model of what "specific" looks like in practice. The "Name That Tune" challenge then builds his compression skills by progressively reducing prompt length while maintaining output quality, which forces him to identify which tokens actually drive results. This combination teaches both what good CORPS looks like and how to achieve efficiency. Option B discards a team member rather than addressing a skill gap. Option C amplifies the existing problem -- more tokens with vague content creates more waste, not less. Option D treats the prompt quality issue as a model capability issue, which it is not; a vague prompt produces vague output regardless of model capability.

**Task Statement:** 4.5

---

## Scenario 2: Customer Service Knowledge Base

**Context:** TechReach, a SaaS company with 200 enterprise clients, is building an AI-powered customer service system. The system must handle three categories of queries: billing inquiries (account status, invoice disputes, payment processing), technical support (product configuration, error troubleshooting, integration issues), and account management (plan upgrades, user provisioning, contract renewals). Each category requires different context: billing queries need account data and invoice history, technical queries need product documentation and error logs, and account queries need contract terms and feature matrices.

The current implementation uses a single monolithic prompt that includes context for all three categories regardless of query type. The prompt runs 2,800 input tokens and produces responses averaging 900 output tokens. Customer satisfaction scores are at 72%, below the 85% target, with the most common complaint being "the response included irrelevant information about features I did not ask about."

The team has been asked to redesign the system using CORPS principles and context engineering to improve satisfaction while reducing token costs.

**Domains tested:** 2, 3, 5

### Question 2.1
**Scenario:** The team begins redesigning by creating three separate CORPS prompt templates -- one for each query category. For the billing template, a junior engineer writes: "Context: You are handling a billing inquiry. The customer's account data is: [FULL ACCOUNT DUMP]. Objective: Answer the customer's billing question. Role: Customer service agent. Parameters: Be helpful. Structure: Provide the answer."

A senior engineer reviews this and says the template still contains significant waste. Which CORPS element has the most critical problem?

A) Role -- "customer service agent" is too generic and should be "senior billing specialist with enterprise SaaS experience"
B) Context -- dumping the full account data regardless of the specific billing question is excess context inventory; the template should conditionally include only the data relevant to the specific query type (e.g., invoice history for disputes, payment methods for processing issues)
C) Parameters -- "be helpful" is too vague and should specify response length, tone formality level, and whether to include next steps
D) Structure -- "provide the answer" gives no output format guidance and should specify sections like greeting, answer, and follow-up action

**Answer:** B

**Explanation:** The context element has the most critical problem because it recreates the core issue from the original monolithic prompt -- loading all available data regardless of relevance. A billing dispute needs invoice history and transaction records, not payment method details or account provisioning data. A payment processing question needs payment methods and billing cycle data, not historical invoice line items. Conditional context inclusion based on query subtype eliminates excess context inventory, reduces input tokens, and focuses the model's attention on relevant information -- directly addressing the customer complaint about irrelevant content. Options C and D identify real but secondary issues; vague parameters and structure cause overproduction and format problems but do not explain the core satisfaction failure. Option A would improve role specificity but has less impact than fixing the context bloat.

**Task Statement:** 2.1

---

### Question 2.2
**Scenario:** The team implements conditional context loading: a classifier first identifies the query subtype, then injects only the relevant context slice. For billing disputes, the system loads invoice history and transaction records (400 tokens). For payment processing, it loads payment methods and billing cycle (300 tokens). For technical queries, it loads relevant documentation sections using retrieval (200-600 tokens depending on query complexity).

The architect proposes organizing context into three layers: persistent context (company policies, service level commitments -- loaded for every query), situational context (query-type-specific data -- loaded based on classification), and ephemeral context (conversation-specific details mentioned by the customer -- extracted and maintained during the interaction).

What is the primary advantage of this three-layer context hierarchy over a flat conditional system?

A) It reduces total token count because persistent context is cached by the API and does not count against the token budget
B) It enables different update cadences -- policies change quarterly, account data changes daily, and conversation details change per-turn -- so each layer can be maintained and refreshed at the appropriate frequency without disrupting the others
C) It simplifies the system because three fixed layers are easier to debug than dynamic conditional loading
D) It ensures that the model always reads the persistent context first, which primes it to follow company policies before processing the query

**Answer:** B

**Explanation:** The three-layer hierarchy maps each context type to its natural lifecycle. Persistent context (policies) is stable and updated infrequently. Situational context (account data) changes between queries and must be loaded fresh. Ephemeral context (conversation details) changes within a single interaction and must be managed turn-by-turn. This separation means the team can update policies without touching the account data pipeline, refresh account data without re-engineering the conversation tracker, and manage turn-by-turn state without pulling new account snapshots. Option A is incorrect because API caching behavior varies by provider and persistent context is not universally free. Option C oversimplifies -- the hierarchy adds structural complexity, but the benefit is operational, not simplicity. Option D describes attention positioning, which is a valid technique but is not the primary advantage of the hierarchical design.

**Task Statement:** 3.4

---

### Question 2.3
**Scenario:** After deploying the redesigned system, the team wants to measure improvement. They establish baselines from the old system and collect two weeks of data from the new system. The old system averaged: 2,800 input tokens, 900 output tokens, 1.8 iterations, and 72% satisfaction. The new system averages: 850 input tokens, 420 output tokens, 1.1 iterations, and 87% satisfaction. The team calculates LAI scores using normalization factors tokens/1000 and iterations/1, with Value Output scored on a 1-10 scale based on satisfaction (old = 7.2, new = 8.7) and cost estimated proportionally to tokens.

A stakeholder asks: "The satisfaction improvement is great, but how do I know the token reduction is not just because the responses are shorter and less helpful?"

Which metric combination best addresses this concern?

A) Show the LAI score improvement alone, since it already accounts for quality in the numerator
B) Present the satisfaction increase (72% to 87%) alongside the tokens-per-successful-output decrease, demonstrating that quality improved while resource consumption dropped -- then show the efficiency improvement percentage to quantify the combined gain
C) Compare only the iteration counts (1.8 to 1.1) because fewer iterations prove the responses are more accurate
D) Calculate cost savings in dollars and present those, since financial impact is the only metric stakeholders understand

**Answer:** B

**Explanation:** The stakeholder's concern is that token reduction might trade off against quality. The most persuasive response pairs the quality metric (satisfaction from 72% to 87%) directly with the efficiency metric (tokens per successful output), showing both improved simultaneously. The efficiency improvement percentage then quantifies the magnitude of the gain. This three-metric combination addresses the concern head-on: quality went up, cost went down, and here is exactly how much. Option A relies on a single composite score that obscures the components -- the stakeholder specifically wants to see that quality did not suffer, which requires showing quality separately. Option C addresses accuracy but not helpfulness or completeness. Option D ignores the quality question entirely and only addresses cost.

**Task Statement:** 5.2

---

## Scenario 3: Report Generation Pipeline

**Context:** FinanceFlow, a financial analytics company, has built a multi-step AI pipeline that generates weekly client reports. The pipeline operates in four stages: (1) Data Summary -- the model receives raw financial data (portfolio positions, market indices, transaction history) and produces a structured data summary, (2) Analysis -- the model receives the data summary plus market context and produces an analytical narrative, (3) Recommendations -- the model receives the analysis plus the client's risk profile and investment goals and produces actionable recommendations, (4) Formatting -- the model receives all previous outputs and assembles the final report with proper formatting, headers, and disclaimer language.

Currently, each stage passes its full output as input to the next stage. The pipeline consumes approximately 12,000 total tokens per report across all four stages, takes an average of 2.3 iterations per stage (9.2 total iterations per report), and costs $0.18 per report. With 500 weekly reports, the monthly cost is $3,600. The operations team has identified that Stage 2 (Analysis) is the primary bottleneck, averaging 3.1 iterations because the model frequently misinterprets which data points to emphasize.

**Domains tested:** 3, 4, 5

### Question 3.1
**Scenario:** An engineer examines the context passed from Stage 1 (Data Summary) to Stage 2 (Analysis). Stage 1 outputs a 1,400-token summary that includes every data point from the raw input in narrative paragraph form. Stage 2 receives this entire summary plus 600 tokens of market context. The engineer suspects the high iteration count at Stage 2 is related to how context flows between stages.

What is the most likely context engineering problem, and what is the best fix?

A) Stage 1's output is too short; it should include more raw data so Stage 2 has comprehensive information to analyze
B) Stage 1 should output a structured format (key metrics table, notable changes list, data flags) rather than narrative paragraphs, so Stage 2 can precisely identify which data points to emphasize without parsing prose -- and Stage 2's context should position the client's reporting priorities before the data summary to guide emphasis
C) Stage 2 should receive the raw financial data directly instead of Stage 1's summary, eliminating the information loss from summarization
D) The market context should be moved to Stage 1 so the data summary incorporates market perspective from the start

**Answer:** B

**Explanation:** The root cause of Stage 2's 3.1-iteration average is that narrative paragraphs from Stage 1 force the analysis model to interpret which data points matter -- a task that relies on the model's judgment about emphasis, which varies across iterations. A structured output format (metrics table, flagged changes, priority indicators) removes this ambiguity by making the data hierarchy explicit. Additionally, positioning the client's reporting priorities before the data summary in Stage 2's context leverages the primacy effect, guiding the model's attention to what matters before it encounters the data. Option A increases tokens without solving the structural problem. Option C bypasses summarization entirely, which would massively inflate Stage 2's input tokens and reintroduce the raw data parsing problem. Option D conflates two different analytical tasks -- data summarization and market-relative analysis should remain separate for single-piece flow.

**Task Statement:** 3.3

---

### Question 3.2
**Scenario:** After restructuring the inter-stage context, the engineer turns to token efficiency. She notices that Stage 4 (Formatting) receives the complete output from all three previous stages -- a combined 3,200 tokens -- even though its job is primarily to assemble sections, add headers, insert disclaimers, and apply formatting. Much of the analytical content passes through Stage 4 unchanged.

Which token efficiency technique would yield the largest reduction at Stage 4 without risking output quality?

A) Compress all three stage outputs into a single 500-token summary before passing to Stage 4
B) Pass Stage 4 only the structural skeleton (section headers, key figures for insertion, and formatting instructions) plus a reference to the full content, and use output format constraints to specify the exact template -- keeping the substantive content from Stages 1-3 as pre-formatted blocks that Stage 4 assembles rather than rewrites
C) Eliminate Stage 4 entirely and add formatting instructions to Stage 3
D) Reduce Stage 4's output length parameter to 800 tokens to force concise formatting

**Answer:** B

**Explanation:** Stage 4's function is assembly and formatting, not content generation. Passing it 3,200 tokens of analytical content that it will mostly reproduce unchanged is excess context inventory. The efficient approach is to give Stage 4 only what it needs for its specific job: structural instructions, key insertion points, and formatting templates. The substantive content from earlier stages flows through as pre-formatted blocks that Stage 4 arranges without reprocessing. This can reduce Stage 4's input tokens by 60-70% while eliminating the risk of the formatting stage inadvertently altering analytical content. Option A destroys the detailed content that must appear in the final report. Option C overloads Stage 3 with a dual objective (recommendations and formatting), violating single-piece flow. Option D constrains output length but does not reduce the inflated input.

**Task Statement:** 4.3

---

### Question 3.3
**Scenario:** The operations team implements the pipeline optimizations and runs a PDCA cycle. After one month, results show: total tokens per report dropped from 12,000 to 7,200, iterations per report dropped from 9.2 to 5.4, and cost per report dropped from $0.18 to $0.11. The team calculates the efficiency improvement percentage and plans next steps.

The team identifies that Stage 2 still averages 2.1 iterations (down from 3.1 but still the highest in the pipeline). They propose two hypotheses for the next PDCA cycle: Hypothesis A says that adding few-shot examples of excellent analyses to Stage 2's context will reduce iterations to 1.2. Hypothesis B says that splitting Stage 2 into two sub-stages (quantitative analysis, then qualitative narrative) will reduce iterations to 1.0.

Which PDCA principle should guide how the team proceeds?

A) Test both hypotheses simultaneously to save time, since the month-long cycle is too slow for a competitive environment
B) Select the hypothesis with the lower implementation cost and test it first, then run a second PDCA cycle for the other hypothesis if needed -- each cycle should test one change to isolate its impact on the metrics
C) Skip the formal PDCA cycle and implement whichever hypothesis the most senior engineer prefers, since experience is more reliable than structured testing
D) Abandon both hypotheses and focus on optimizing the other stages first, since Stage 2 has already improved from 3.1 to 2.1 iterations

**Answer:** B

**Explanation:** PDCA discipline requires testing one variable per cycle so that results can be attributed to a specific change. Testing both hypotheses simultaneously makes it impossible to determine which change caused the observed improvement (or degradation). The practical approach is to prioritize by implementation cost and test the simpler hypothesis first. If it achieves the target, the second hypothesis is unnecessary. If it falls short, the second cycle tests the alternative with a clean baseline. Option A sacrifices diagnostic clarity for speed -- if combined changes produce unexpected results, the team cannot isolate the cause. Option C replaces evidence-based improvement with opinion-based decision making, undermining the continuous improvement methodology. Option D mistakes progress for completion; 2.1 iterations is still the pipeline's weakest link and the highest-leverage optimization target.

**Task Statement:** 5.3

---

## Scenario 4: Cross-Department Prompt Standardization

**Context:** GlobalTech Solutions, a 2,000-person technology company, has decided to roll out Lean AI practices across all departments after a successful pilot in the marketing team. The pilot reduced marketing's token consumption by 42% and improved output quality scores from 6.8 to 8.4 on a 10-point scale. The CEO has mandated organization-wide adoption within six months.

The rollout faces significant challenges. The company has 14 departments, each with different AI use cases: marketing writes content, engineering generates code, legal reviews contracts, HR creates job descriptions, finance produces reports, and customer success drafts communications. Each department has developed its own prompting habits organically, with no shared vocabulary or methodology. Token usage audits reveal that the organization spends $28,000 per month on AI API costs, with estimated waste rates ranging from 25% (engineering) to 55% (legal).

The Head of AI Operations, Jamal, must design the rollout strategy, establish measurement systems, and create reporting structures that demonstrate ROI to the executive team.

**Domains tested:** 1, 2, 5

### Question 4.1
**Scenario:** Jamal begins with a waste audit across all 14 departments. The audit reveals that legal's 55% waste rate breaks down as: 20% from excess context inventory (pasting entire contracts when only specific clauses are relevant), 15% from overproduction (requesting "comprehensive analysis" when only a risk summary is needed), 12% from defects (vague objectives producing misaligned output requiring rework), and 8% from unnecessary tokens (redundant instructions and filler language). Engineering's 25% waste rate is primarily unnecessary tokens (15%) and moderate overproduction (10%).

Which department should Jamal prioritize for the first wave of CORPS training, and why?

A) Engineering, because their lower waste rate means faster results that can build organizational momentum
B) Legal, because their 55% waste rate represents the largest absolute waste reduction opportunity -- addressing the 20% excess context inventory and 15% overproduction through CORPS context scoping and output constraints alone could cut their waste nearly in half, producing the most compelling ROI numbers for the executive team
C) All departments simultaneously, because the CEO mandated organization-wide adoption within six months and sequential rollout will not meet the deadline
D) Marketing, because they already completed the pilot and can serve as trainers for other departments

**Answer:** B

**Explanation:** Lean methodology prioritizes the highest-waste processes first because they offer the largest return on improvement effort. Legal's 55% waste rate means more than half of their AI spend produces no value. The two largest waste categories (excess context inventory at 20% and overproduction at 15%) are directly addressable through CORPS -- context scoping eliminates the contract-dumping habit, and output specification prevents the "comprehensive analysis" default. Achieving a significant reduction in legal's waste produces the most dramatic ROI numbers for the executive presentation, building organizational support for further rollout. Option A optimizes an already-efficient department, producing smaller absolute gains. Option C risks overwhelming the organization and producing shallow adoption everywhere rather than deep adoption anywhere. Option D retrains an already-trained team instead of addressing new waste.

**Task Statement:** 1.3

---

### Question 4.2
**Scenario:** Jamal creates a CORPS prompt template library for each department. For legal, he designs a contract review template: "Context: [Paste only the clauses relevant to the review question -- do NOT paste the entire contract]. Role: Senior contract attorney specializing in [contract type]. Objective: Identify the top 3 risks in the pasted clauses related to [specific concern]. Parameters: 200-word maximum, bullet-point format, cite specific clause numbers. Structure: Risk description, severity (high/medium/low), recommended action for each."

A legal team member objects: "Every contract is different. We cannot use a template because each review requires a unique approach. Templates will make our analysis generic and miss important nuances."

What is the best response to this objection?

A) Agree with the objection and allow the legal team to continue using their current approach, since domain expertise should override process standardization
B) The template standardizes the prompt structure, not the analytical content -- the model still applies unique judgment to each contract's specific clauses. Standardized work in Lean eliminates variation in the process (how the prompt is constructed) while preserving variation in the output (what the analysis says). The template's bracketed fields are where case-specific context and objectives go, ensuring each review is tailored while the structure prevents the waste patterns identified in the audit
C) Override the objection because the CEO mandated adoption and the legal team does not have the option to opt out
D) Simplify the template to just "Review this contract" to reduce the team's burden of filling in template fields

**Answer:** B

**Explanation:** This objection conflates standardized process with standardized output. In Lean manufacturing, standardized work means every worker follows the same process steps (in the same order, with the same quality checks) while the product itself varies. Applied to prompting, the CORPS template standardizes the prompt construction process -- ensuring context is scoped, objectives are precise, and output is constrained -- while the analytical content within those structures is entirely specific to each contract. The bracketed fields ([specific concern], [contract type], [relevant clauses]) are the injection points for case-specific variation. Option A abandons process improvement based on a misunderstanding. Option C uses authority rather than persuasion, which produces compliance without understanding. Option D eliminates the structure that prevents the identified waste patterns.

**Task Statement:** 2.5

---

### Question 4.3
**Scenario:** Three months into the rollout, Jamal presents progress to the executive team. He shows that organization-wide AI costs dropped from $28,000 to $19,500 per month (a 30% reduction), average output quality scores improved from 7.1 to 8.3, and 9 of 14 departments have completed CORPS training. The CEO asks: "How do we sustain this after the initial enthusiasm fades? What prevents people from drifting back to their old habits?"

Which sustainability strategy best addresses the CEO's concern?

A) Mandate monthly prompt audits where managers review and grade every team member's prompts for CORPS compliance
B) Embed the four key efficiency metrics (tokens per successful output, iterations to completion, time to completion, efficiency improvement percentage) into department dashboards with monthly PDCA review cycles, making efficiency visible and creating a feedback loop where teams can see their own trends, identify regression, and self-correct -- supplemented by quarterly cross-department benchmarking that creates healthy competition
C) Rely on the cost savings to self-motivate continued adoption, since people will naturally maintain practices that save money
D) Hire a dedicated Lean AI compliance officer to enforce template usage across all departments

**Answer:** B

**Explanation:** Sustainability in Lean requires making the current state visible so that deviations are detected early. Dashboard integration of the four key metrics gives each department real-time visibility into their efficiency. Monthly PDCA reviews create a structured rhythm for identifying and addressing regression before it becomes entrenched. Quarterly cross-department benchmarking leverages social motivation -- teams naturally want to maintain or improve their relative performance. This combination creates self-sustaining improvement because the measurement infrastructure persists even after the initial rollout energy fades. Option A creates bureaucratic overhead and resentment without building intrinsic motivation. Option C assumes cost awareness is sufficient, but cost savings are invisible to individual practitioners who do not see the API bill. Option D creates a single point of failure and a policing dynamic that undermines ownership.

**Task Statement:** 5.2

---

