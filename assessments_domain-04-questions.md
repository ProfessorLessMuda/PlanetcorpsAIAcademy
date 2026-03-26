# Domain 4 Assessment - Prompt Engineering & Structured Output

## Question 1
**Scenario:** A team deploys a Claude-based code review bot. Developers complain that it flags too many trivial style issues as "critical," eroding trust. The current system prompt says: "Be thorough and conservative when reviewing code. Flag anything that could be a problem." Which change would most effectively reduce false positives while maintaining detection quality?

A) Add "Only flag truly critical issues" to the prompt
B) Replace the vague instruction with explicit criteria such as "Flag functions exceeding 50 lines, cyclomatic complexity above 10, or missing null checks on external API responses"
C) Increase the model temperature to introduce more variation in responses
D) Add a self-review step where the same instance re-evaluates its own findings

**Answer:** B

**Explanation:** Replacing vague instructions like "be conservative" or "flag anything that could be a problem" with explicit, measurable criteria gives the model clear decision boundaries, directly reducing false positives. Option A replaces one vague instruction with another; "truly critical" is subjective and will not meaningfully change behavior. Option C would increase randomness, potentially worsening both false positives and false negatives. Option D is limited by self-review constraints: the same instance retains its reasoning context and tends to confirm its own findings rather than critically re-evaluate them.

**Task Statement:** 4.1

---

## Question 2
**Scenario:** A document extraction pipeline needs to pull structured data from invoices. During testing, the model inconsistently handles edge cases: invoices with multiple tax rates sometimes get a single aggregated rate, and invoices with no discount field sometimes get a hallucinated "0% discount." What is the most effective technique to improve consistency on these edge cases?

A) Add a rule to the system prompt: "Handle edge cases carefully and do not hallucinate values"
B) Provide few-shot examples that explicitly demonstrate the correct handling of multi-tax-rate invoices and missing-field invoices
C) Increase the maximum token output to give the model more room to reason
D) Switch to a smaller, faster model that is less prone to hallucination

**Answer:** B

**Explanation:** Few-shot prompting is the most effective technique for improving consistency, especially on ambiguous or edge cases. By including examples that show the correct output for multi-tax-rate invoices (listing each rate separately) and missing-field invoices (omitting the field rather than inventing a value), the model learns the expected pattern and generalizes to similar cases. This also directly reduces hallucination in extraction tasks. Option A is a vague instruction that provides no concrete guidance on what "carefully" means. Option C does not address the root cause of inconsistency. Option D is incorrect because model size does not reliably correlate with hallucination rates in structured extraction, and the issue is about prompting, not model selection.

**Task Statement:** 4.2

---

## Question 3
**Scenario:** An application requires Claude to always respond with a JSON object containing exactly three fields: `category` (one of five predefined values), `confidence` (a number between 0 and 1), and `reasoning` (a string). During testing, the model occasionally returns free-text responses or JSON with misspelled field names. What approach guarantees schema compliance?

A) Add "You must always respond in valid JSON with the exact fields: category, confidence, reasoning" to the system prompt
B) Use `tool_use` with a tool whose `input_schema` defines the required JSON structure, and set `tool_choice` to force that specific tool
C) Parse the response with a JSON validator and retry on failure
D) Use `tool_choice: "any"` to ensure the model uses some tool, then validate the output

**Answer:** B

**Explanation:** Using `tool_use` with a JSON schema defined in the tool's `input_schema` and forcing that specific tool via `tool_choice` guarantees the response conforms to the schema. The model is structurally constrained to produce valid JSON matching the schema, eliminating misspelled field names and free-text responses entirely. Option A relies on prompt compliance, which is not guaranteed and is exactly the failure mode described. Option C adds overhead and does not prevent the initial failure; it also wastes tokens on retries. Option D ensures the model calls some tool but does not guarantee it calls the correct one with the right schema, since `"any"` allows the model to choose among available tools.

**Task Statement:** 4.3

---

## Question 4
**Scenario:** A contract analysis system uses Claude to extract key dates, party names, and obligation amounts from legal documents. Schema validation passes consistently, but the team discovers that extracted obligation amounts sometimes reference the wrong clause, and party names occasionally include the attorney's name instead of the contracting entity. Which statement best describes the nature of these errors and the appropriate mitigation?

A) These are schema validation errors; tightening the JSON schema with stricter field types will fix them
B) These are semantic validation errors; they require domain-specific validation logic beyond schema enforcement, and a retry-with-feedback pattern providing the specific error context can help
C) These are transient errors that will resolve by retrying without any additional feedback
D) These errors indicate the model is too small; upgrading to a larger model will eliminate semantic extraction mistakes

**Answer:** B

**Explanation:** The errors described are semantic, not structural: the JSON is valid and schema-compliant, but the extracted values are contextually incorrect. Schema enforcement catches syntax and structure issues but cannot detect whether an obligation amount references the correct clause or whether a name is the contracting entity vs. the attorney. Domain-specific validation logic (checking clause cross-references, validating party roles) is needed, and a retry-with-feedback pattern that tells the model exactly what was wrong (e.g., "the amount $50,000 appears in Clause 3, not Clause 7") gives it the information needed to correct the extraction. Option A confuses semantic errors with schema errors. Option C would retry blindly without corrective information, likely reproducing the same mistakes. Option D oversimplifies; larger models still make semantic extraction errors without proper validation feedback.

**Task Statement:** 4.4

---

## Question 5
**Scenario:** A compliance team needs to classify 50,000 customer support transcripts by topic and sentiment. The results will feed into a quarterly report due in two weeks. Each transcript is independent and can be classified in isolation. The team wants to minimize costs. Which processing strategy is most appropriate?

A) Process all transcripts synchronously using the standard Messages API with parallel requests
B) Use the Message Batches API with a `custom_id` for each transcript to correlate results
C) Use the Message Batches API with multi-turn tool calling to refine each classification
D) Process transcripts in a real-time streaming pipeline to get results as fast as possible

**Answer:** B

**Explanation:** The Message Batches API is designed for exactly this scenario: a large volume of independent, non-blocking requests where latency is not critical (two-week deadline). It provides 50% cost savings and processes requests within a 24-hour window. Assigning a `custom_id` to each transcript enables reliable correlation between requests and responses. Option A works but forgoes the 50% cost savings that the Batches API provides, which is significant at 50,000 transcripts. Option C is incorrect because the Batch API does not support multi-turn tool calling within a single request; each batch item is a single request-response pair. Option D prioritizes speed over cost, which contradicts the team's goal of cost minimization given their generous timeline.

**Task Statement:** 4.5

---

## Question 6
**Scenario:** A team builds a PR review system where Claude analyzes code changes and produces a list of findings. To improve quality, they add a step at the end of the same prompt: "Now review your findings and remove any that are incorrect." Testing shows this self-review step rarely removes any findings, even ones that human reviewers consistently reject. What explains this behavior, and what is a better approach?

A) The self-review instruction is too vague; replacing it with "Be very critical of your own findings" would fix the issue
B) The model retains its reasoning context from the initial analysis, making it biased toward confirming its own findings; using an independent review instance with a separate conversation is more effective
C) Self-review does not work because the model cannot read its own output; a programmatic filter is the only solution
D) The model needs a higher temperature during the review phase to introduce fresh perspective

**Answer:** B

**Explanation:** When a model reviews its own output within the same conversation, it retains the reasoning context that produced the original findings. This creates a confirmation bias where the model is predisposed to agree with its prior analysis. Independent review instances, using a separate conversation with fresh context, are significantly more effective because the reviewing instance evaluates findings without the anchoring effect of the original reasoning. Option A makes the instruction more emphatic but does not address the fundamental confirmation bias problem. Option C is incorrect; the model can read its own output, but the issue is contextual bias, not capability. Option D introduces randomness but does not solve the confirmation bias inherent in same-context review.

**Task Statement:** 4.6

---

## Question 7
**Scenario:** A developer is building a batch job to summarize 10,000 research papers. Each summary must include a title, three key findings, and a relevance score. The job needs to complete within one business day. Partway through design, they realize some papers require a follow-up API call to fetch citation counts before scoring relevance. How should they handle this?

A) Use the Message Batches API for all 10,000 papers with tool calling enabled to fetch citation counts mid-request
B) Pre-fetch all citation counts in a separate step, then submit the full batch to the Message Batches API with all data included in each request
C) Use the synchronous Messages API with tool calling for all papers to handle the citation lookups dynamically
D) Submit two sequential batches: one to generate summaries, then a second to add relevance scores after manual citation lookups

**Answer:** B

**Explanation:** Since the Batch API does not support multi-turn tool calling within a single request, papers requiring citation count lookups cannot dynamically fetch that data mid-batch. The correct approach is to pre-fetch all citation counts in a separate pipeline step, then include that data in each batch request so the model has everything it needs in a single turn. This preserves the 50% cost savings and meets the one-day timeline. Option A is incorrect because the Batch API does not support multi-turn tool calling. Option C would work functionally but sacrifices the 50% cost savings across 10,000 requests, which is a major cost penalty. Option D introduces unnecessary manual steps and delays.

**Task Statement:** 4.5

---

## Question 8
**Scenario:** A large codebase review system needs to detect security vulnerabilities. The architect proposes a multi-pass design: Pass 1 analyzes each file individually for local vulnerabilities, and Pass 2 reviews cross-file data flows for injection paths that span multiple files. A junior engineer suggests that Pass 1 is unnecessary since Pass 2 already looks at all the code. Why is the multi-pass design superior?

A) Pass 1 is faster because it processes fewer tokens, so it reduces total cost even though Pass 2 would catch the same issues
B) Per-file local analysis catches vulnerabilities that are visible within a single file, while cross-file integration passes detect patterns that emerge only from data flows across files; both are necessary because they catch different classes of issues
C) Pass 1 is only needed to warm up the model's understanding of the codebase before the real analysis in Pass 2
D) Multi-pass is required because the model cannot process more than one file at a time due to context window limits

**Answer:** B

**Explanation:** Multi-pass review architectures are valuable because each pass is optimized for a different class of finding. Per-file local analysis (Pass 1) focuses on vulnerabilities visible within a single file, such as buffer overflows, SQL injection in a single function, or insecure defaults. Cross-file integration passes (Pass 2) detect patterns that only emerge when tracing data flows across multiple files, such as unsanitized user input passing through three modules before reaching a database query. Removing Pass 1 would miss locally-detectable vulnerabilities that might be obscured in a broader cross-file analysis. Option A incorrectly claims Pass 2 would catch everything Pass 1 does. Option C mischaracterizes Pass 1 as a warmup rather than a substantive analysis stage. Option D is factually wrong; models can process multiple files in a single context.

**Task Statement:** 4.6

---
