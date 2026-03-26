# Domain 5 Assessment - Context Management & Reliability

## Question 1
**Scenario:** A customer support agent handles long conversations that sometimes exceed 80 turns. The team implements progressive summarization to condense earlier turns when context limits approach. After deployment, they notice the agent occasionally agrees to refund amounts that differ from what the customer originally requested, and sometimes misremembers order dates discussed earlier in the conversation.

What is the most likely cause of these errors?

A) The model's temperature setting is too high, causing hallucinated details
B) Progressive summarization is condensing specific numerical values and dates into generalized summaries, losing precision
C) The agent's system prompt does not mention that it should remember order details
D) The context window is too small for 80-turn conversations and should be upgraded to a larger model

**Answer:** B

**Explanation:** Progressive summarization poses a specific risk of condensing precise numerical values, dates, and expectations into generalized summaries. When the original "$47.50 refund for order #12345 placed on March 3" gets summarized to "customer wants a refund for a recent order," the agent loses the specific details needed to act correctly. Option A is incorrect because temperature affects generation randomness, not memory of prior conversation content. Option C is incorrect because system prompt instructions cannot compensate for information that has been removed from context. Option D is incorrect because the problem is not context window size but rather how summarization handles specific data types.

**Task Statement:** 5.1

---

## Question 2
**Scenario:** A support agent is configured with several escalation triggers. During testing, the team observes that genuine escalation-worthy cases are sometimes missed while low-risk interactions are unnecessarily escalated. The current triggers include: (1) customer sentiment score drops below 0.3, (2) the model's self-reported confidence falls below "medium," (3) the customer explicitly asks to speak with a human, and (4) the agent detects a policy exception not covered by its guidelines.

Which escalation triggers should the team keep, and which should they replace?

A) Keep all four triggers but lower the sentiment threshold to 0.2
B) Keep triggers 3 and 4; replace triggers 1 and 2 because sentiment-based escalation and self-reported confidence scores are unreliable indicators
C) Keep triggers 1 and 2 because they are data-driven; replace triggers 3 and 4 because they depend on subjective judgment
D) Replace all four triggers with a single rule that escalates after three consecutive failed tool calls

**Answer:** B

**Explanation:** Explicit customer requests for a human (trigger 3) and policy gaps the agent cannot resolve (trigger 4) are reliable, deterministic escalation triggers. Sentiment-based escalation (trigger 1) is unreliable because sentiment analysis of customer messages is noisy and context-dependent. Self-reported model confidence (trigger 2) is also unreliable because models are not well-calibrated at assessing their own certainty. Option A merely adjusts an unreliable metric rather than replacing it. Option C inverts the correct assessment, treating unreliable signals as data-driven. Option D is too narrow, as tool call failures do not capture the full range of escalation-worthy situations.

**Task Statement:** 5.2

---

## Question 3
**Scenario:** A multi-agent system has a coordinator that delegates tasks to three subagents: inventory lookup, payment processing, and shipping status. When the inventory subagent fails to connect to the database, it returns `{"status": "error"}` to the coordinator. The coordinator then tells the customer "we're unable to help with your request" and ends the conversation.

What is the primary problem with this error propagation pattern?

A) The coordinator should retry the inventory lookup at least three times before giving up
B) The generic error status hides whether the failure was a transient database timeout, an access permission issue, or a valid empty result, preventing the coordinator from making an intelligent recovery decision
C) The subagent should handle the error internally and return a best-guess result instead of an error
D) The coordinator should log the error and continue the conversation without mentioning the failure to the customer

**Answer:** B

**Explanation:** Generic error statuses like `{"status": "error"}` strip away the context needed for intelligent recovery. A transient database timeout is retryable, an access permission failure requires different handling, and a valid empty result (item not found) is not an error at all. When the coordinator cannot distinguish between these cases, it cannot choose the right recovery strategy. Option A assumes retrying is always appropriate, but retrying a permission failure is pointless. Option C is dangerous because fabricating results hides real problems. Option D suppresses the error entirely, which is an anti-pattern that can lead to incorrect downstream behavior.

**Task Statement:** 5.3

---

## Question 4
**Scenario:** A developer is using Claude Code to investigate a performance regression across a large monorepo with 2,000+ files. The investigation requires reading configuration files, tracing function call chains, and correlating log output across multiple services. After about 45 minutes of investigation, the developer notices Claude Code is starting to overlook files it examined earlier and is re-reading files it already analyzed.

What is the most effective mitigation for this problem?

A) Restart the session and provide a more specific initial prompt to reduce the scope of investigation
B) Have Claude Code write its findings, hypotheses, and key file paths to a scratchpad file as it investigates, and delegate verbose exploration tasks to subagents
C) Increase the model's context window by switching to a larger model variant
D) Break the investigation into separate sessions, one for each service, and manually combine the results

**Answer:** B

**Explanation:** Context degradation in extended sessions causes the model to lose track of earlier findings. Scratchpad files persist findings outside the context window so they remain accessible even as new information pushes older content further back. Subagent delegation isolates verbose tool output (like reading large files) from the main agent's context, preserving it for higher-level reasoning. Option A abandons all progress and does not address the fundamental context limitation. Option C may help marginally but does not solve the core problem of managing accumulated findings over long investigations. Option D creates coordination overhead and loses the ability to make cross-service connections that require information from multiple services simultaneously.

**Task Statement:** 5.4

---

## Question 5
**Scenario:** A company deploys an invoice extraction system that reports 96% overall accuracy in production. After three months, the accounts payable team reports that international invoices with non-USD currencies are frequently extracted incorrectly. A review reveals that international invoices represent only 8% of volume but have a 35% error rate, while domestic invoices have a 1% error rate.

What validation approach would have caught this problem before deployment?

A) Increasing the overall test set size from 500 to 5,000 documents
B) Implementing stratified random sampling that measures error rates separately by document type, currency, and other key dimensions
C) Adding a second extraction pass that re-processes all invoices and flags any discrepancies
D) Requiring 99% overall accuracy before deployment instead of 96%

**Answer:** B

**Explanation:** Stratified random sampling ensures that each meaningful category of input is evaluated independently rather than being drowned out by high-performing majority categories. By measuring error rates per document type, per currency, and per field, the 35% error rate on international invoices would have been identified during validation. Option A increases volume but random sampling would still under-represent the 8% international category. Option C adds cost without addressing the root measurement gap. Option D raises the bar on an aggregate metric that already masks the problem, as the system could still reach 99% overall while performing poorly on a small category.

**Task Statement:** 5.5

---

## Question 6
**Scenario:** A research synthesis agent gathers information from multiple sources and produces summary reports. A user asks about global renewable energy adoption rates. The agent finds that Source A (a 2024 government report) states solar capacity grew 28% year-over-year, while Source B (a 2024 industry group report) states solar capacity grew 34% year-over-year. Both sources are credible.

How should the agent handle this discrepancy in its synthesis?

A) Average the two figures and report 31% growth as the consensus estimate
B) Use the government report figure because government data is more authoritative than industry data
C) Present both figures with their respective sources and publication dates, note the discrepancy, and suggest possible reasons such as different measurement methodologies or geographic scope
D) Omit the specific growth figures entirely and describe the trend qualitatively as "significant growth"

**Answer:** C

**Explanation:** When credible sources conflict, the agent must preserve source attribution and present the discrepancy transparently rather than silently resolving it. Structured claim-source mappings should include the specific statistic, the source, and temporal metadata such as publication and data collection dates. Option A fabricates a figure that appears in neither source and destroys provenance. Option B applies an arbitrary authority hierarchy rather than letting the user evaluate the sources. Option D discards precisely the quantitative information the user requested, and qualitative summaries are a form of attribution loss.

**Task Statement:** 5.6

---

## Question 7
**Scenario:** A document analysis agent processes 50-page legal contracts. The system prompt places critical extraction instructions at the beginning, and the contract text is injected in the middle of a long conversation that also includes prior extraction results from earlier documents. The team notices that the agent frequently misses clauses located in the middle sections of contracts while accurately extracting clauses from the beginning and end.

Which context management issue best explains this pattern, and what is the most effective fix?

A) The context window is full, causing truncation of the middle sections; the fix is to use a model with a larger context window
B) The "lost in the middle" effect causes the model to attend less to information in the middle of long contexts; the fix is to restructure the context so critical contract sections are positioned near the beginning or end, or to process the contract in focused segments
C) The model is biased toward extracting short clauses and ignores longer ones; the fix is to add few-shot examples of long clause extraction
D) Prior extraction results from earlier documents are creating interference; the fix is to clear conversation history between documents

**Answer:** B

**Explanation:** The "lost in the middle" effect is a well-documented phenomenon where models show weaker attention to information positioned in the middle of long contexts compared to information near the beginning or end. When a 50-page contract sits in the middle of a context that also includes system instructions at the top and recent results at the end, the middle sections of the contract receive less attention. Restructuring the context to position the target contract text near the end, or breaking the contract into focused segments for separate analysis, directly addresses this. Option A assumes truncation rather than an attention pattern, and larger context windows do not eliminate the lost-in-the-middle effect. Option C misidentifies the cause as clause length rather than position. Option D addresses history accumulation but not the positional attention issue within a single long context.

**Task Statement:** 5.1
