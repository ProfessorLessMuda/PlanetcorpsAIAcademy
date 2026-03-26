# Module 04 - Prompt Engineering & Structured Output

## Exam Weighting: 20%

## Objective

Understand how to design effective prompts with explicit criteria, enforce structured output using JSON schemas and tool use, implement validation and retry patterns, leverage batch processing for cost-efficient workloads, and design multi-instance review architectures that eliminate self-review bias. This domain tests your ability to move beyond naive prompting toward production-grade prompt design that produces reliable, parseable, and semantically correct output at scale.

## Task Statements Covered

- **4.1:** Design prompts with explicit criteria to improve precision and reduce false positives
- **4.2:** Apply few-shot prompting to improve output consistency and quality
- **4.3:** Enforce structured output using tool use and JSON schemas
- **4.4:** Implement validation, retry, and feedback loops for extraction quality
- **4.5:** Design efficient batch processing strategies
- **4.6:** Design multi-instance and multi-pass review architectures

---

## Key Concepts

### 4.1 Explicit Criteria in Prompts

The single most common failure in production prompt engineering is vague instruction language. Phrases like "be conservative," "be thorough," "flag anything suspicious," or "use your best judgment" are interpreted inconsistently by the model across runs, across different inputs, and across different contexts. They feel precise to the human writing them because the human has a mental model of what "conservative" means in their domain. The model does not share that mental model. It will impose its own interpretation, which may or may not align with what the developer intended -- and worse, it may shift between invocations.

Explicit criteria replace subjective language with measurable, testable conditions. Instead of "flag potential security issues," an explicit criterion specifies exactly what constitutes a flaggable issue: "Flag any function that accepts user input as a parameter and passes that input to a SQL query without using parameterized queries or a query builder." Instead of "identify poorly documented functions," specify "flag any public function that lacks a docstring, has more than three parameters, or has a return type that is not self-documenting (e.g., returns a raw dictionary instead of a typed object)."

The reason explicit criteria matter so much in production is that **false positives destroy developer trust faster than false negatives**. If your automated code review flags 50 "issues" per pull request and 40 of them are noise, developers will stop reading the reviews within a week. Precision -- the percentage of flagged items that are actually problems -- matters more than recall in most automated review scenarios. Explicit criteria directly improve precision because they eliminate the ambiguous cases where the model guesses (often incorrectly) whether something qualifies.

#### How to Write Explicit Criteria

The pattern follows a consistent structure: **condition + what to look for + what counts as a violation + what to do about it**.

**Vague prompt (poor precision):**
```
Review this code for error handling issues.
```

**Explicit criteria prompt (high precision):**
```
Review this code for the following specific error handling issues:

1. Any try/catch block that catches a generic Exception without logging the
   exception message or stack trace before re-throwing or returning
2. Any async function that does not have a try/catch wrapper around the
   primary operation (network call, file I/O, database query)
3. Any API endpoint handler that returns a 200 status code in its catch
   block instead of an appropriate error status (4xx or 5xx)
4. Any function that silently swallows errors by catching and doing nothing
   (empty catch block or catch block with only a comment)

Do NOT flag:
- Catch blocks that intentionally ignore specific, expected errors
  (e.g., catching FileNotFoundError to return a default value)
- Test files, which may intentionally test error conditions
```

Notice that the explicit version defines not only what to flag but also what NOT to flag. The exclusion list is often as important as the inclusion list for reducing false positives. Without it, the model will err on the side of flagging anything remotely related, because it has no signal about where the boundaries are.

#### Common Mistake: Subjective Adjectives

Watch for subjective adjectives that seem specific but are actually vague: "complex functions," "large classes," "deeply nested code," "excessive parameters." These feel like criteria because they describe code properties, but they have no threshold. How many parameters is "excessive"? The model might say 4, or 6, or 10, depending on the context. Explicit criteria replace these with numbers: "functions with more than 5 parameters," "classes with more than 300 lines," "nesting depth exceeding 4 levels."

For the exam, if an answer choice uses subjective language like "be conservative" or "flag anything that looks suspicious," it is almost always the wrong answer. The correct answer will contain specific, testable criteria.

---

### 4.2 Few-Shot Prompting

Few-shot prompting -- providing examples of input-output pairs directly in the prompt -- is the single most effective technique for improving output consistency. It is more effective than adding more instructions, more effective than using longer system prompts, and more effective than adding more descriptive language. The reason is fundamental: instructions tell the model what to do, but examples show the model how to do it. When the model sees concrete examples, it can pattern-match on format, style, level of detail, and handling of edge cases in a way that abstract instructions cannot achieve.

#### Why Few-Shot Works

The model generalizes from the patterns it observes in the examples. If every example shows a brief, two-sentence summary, the model will produce brief, two-sentence summaries. If every example shows a detailed three-paragraph analysis, the model will produce detailed analyses. If every example handles missing data by outputting `"value": null` with a `"note": "not found in source"`, the model will handle missing data the same way. This consistency is extremely difficult to achieve through instructions alone because instructions leave room for interpretation, while examples leave little ambiguity about the expected behavior.

#### What to Include in Few-Shot Examples

The most common mistake with few-shot prompting is including only "happy path" examples -- cases where the input is clean, the data is present, and the answer is obvious. These examples help with format but not with judgment. The real value of few-shot examples lies in demonstrating how to handle ambiguous, incomplete, or borderline cases.

Effective few-shot sets follow this pattern:

1. **One clear positive example** -- straightforward input where the extraction/classification/analysis is obvious
2. **One clear negative example** -- input that might seem relevant but should not be flagged/extracted
3. **One or two ambiguous examples** -- borderline cases where the correct handling is not obvious, with the example demonstrating the reasoning or decision

```
Example 1 (clear match):
Input: "The patient was prescribed Metformin 500mg twice daily for Type 2 diabetes."
Output: {"medication": "Metformin", "dosage": "500mg", "frequency": "twice daily",
         "condition": "Type 2 diabetes", "confidence": "high"}

Example 2 (clear non-match):
Input: "The patient mentioned that her mother takes blood pressure medication."
Output: {"medication": null, "dosage": null, "frequency": null,
         "condition": null, "confidence": "n/a",
         "note": "Reference is to a family member's medication, not the patient's"}

Example 3 (ambiguous case):
Input: "Continue current medications. Also discussed starting a statin."
Output: {"medication": "statin (class, not specific drug)", "dosage": null,
         "frequency": null, "condition": null, "confidence": "low",
         "note": "Medication was discussed but not confirmed as prescribed.
                  No specific drug, dosage, or frequency provided."}
```

The third example is the most valuable. It shows the model exactly how to handle uncertainty: extract what is available, mark confidence as low, and explain what is missing and why. Without this example, different runs will handle the ambiguity differently -- some will extract "statin" as if it were prescribed, others will skip the entry entirely.

#### How Many Examples

Research and practical experience consistently show that 2-4 examples is the optimal range for most tasks. One example establishes format but not judgment. Two examples begin to establish patterns. Three to four examples covering different edge cases provide strong generalization. Beyond four examples, you hit diminishing returns and start consuming context window space that could be better used for the actual input data. The exception is highly complex classification tasks with many categories, where more examples may be justified to cover each category.

#### Few-Shot for Reducing Hallucination

In extraction tasks, hallucination manifests as the model fabricating data that is not in the source document. Few-shot examples that explicitly demonstrate outputting `null` or "not found" for missing fields teach the model that it is acceptable -- and expected -- to leave fields empty when the information is absent. Without these examples, the model may attempt to fill every field by inferring or guessing, which produces plausible but incorrect output.

---

### 4.3 Structured Output with JSON Schemas

Producing structured output that downstream systems can reliably parse is a core requirement for production Claude integrations. Free-text responses are adequate for human consumption but fail in pipelines -- a code review system cannot post GitHub comments from a paragraph of prose, and an extraction pipeline cannot insert data into a database from narrative text. The Claude API provides a robust mechanism for structured output through tool use combined with JSON schemas.

#### The Tool Use Mechanism for Structured Output

When you define a tool with an `input_schema`, you are telling the model: "To produce your output, you must call this tool with arguments that match this JSON schema." The model then structures its response as a tool call, with the output data as the tool's input arguments. This may seem counterintuitive -- the tool is not a real function that does anything; it is a schema enforcement mechanism. You define a "tool" called something like `record_extraction_results` with the schema you want, and the model "calls" it with its output formatted to match. Your code then reads the tool call arguments as the structured output.

This approach guarantees that the output is valid JSON that conforms to the schema structure. The model cannot produce malformed JSON, omit required fields, or use values outside of defined enums when constrained by a tool schema. This eliminates an entire class of parsing errors that plague regex-based or hope-and-pray extraction from free-text responses.

#### tool_choice Options

The `tool_choice` parameter in the API request controls whether and how the model uses tools:

**`"auto"`** -- The model decides whether to use a tool or respond with plain text. This is appropriate when the model sometimes needs to use tools and sometimes does not (for example, a general assistant that can optionally look things up). For structured output extraction, this is usually the wrong choice because you always want the structured output.

**`"any"`** -- The model must use at least one tool but can choose which one. This is appropriate when you have multiple output tools (for example, `record_issue` and `record_no_issues_found`) and you want the model to select the appropriate one based on the input.

**Forced specific tool** (e.g., `{"type": "tool", "name": "record_extraction_results"}`) -- The model must use exactly this tool. This is the strongest constraint and is appropriate when you always want output in one specific format. For structured data extraction, this is usually the correct choice.

For the exam, know these three modes and when to use each. The most common exam pattern is a scenario where you need guaranteed structured output, and the answer is a forced specific tool.

#### Schema Design Decisions

**Required vs optional fields:** Fields marked as `required` in the schema must be present in every response. Use `required` for fields that should always have a value, even if that value is `null`. Use optional fields (not in the `required` array) for data that genuinely may not apply to every input. For example, in an invoice extraction schema, `vendor_name` and `total_amount` should be required (every invoice has these), while `purchase_order_number` might be optional (not all invoices reference a PO).

**The enum + freetext detail pattern:** When categorizing output, enum fields ensure the model selects from predefined categories, making the output machine-parseable and aggregatable. But rigid enums miss unexpected values. The solution is to include an `"other"` option in the enum and pair it with a freetext detail field:

```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": ["bug", "feature_request", "documentation", "performance", "other"]
    },
    "category_detail": {
      "type": "string",
      "description": "When category is 'other', describe the actual category"
    }
  },
  "required": ["category"]
}
```

This pattern captures 90% of cases in clean, structured enums while still handling the unexpected 10% gracefully. It is a common exam question: you will be presented with a scenario where a rigid enum misses edge cases, and the correct answer is adding the "other" + detail field pattern.

#### The Critical Distinction: Schema Compliance vs Semantic Correctness

**This is one of the most important concepts in this module.**

Schema compliance means the output is valid JSON that matches the schema structure: required fields are present, types are correct, enum values are valid. The tool use mechanism guarantees schema compliance.

Semantic correctness means the content of the output is actually accurate and meaningful. The tool use mechanism does NOT guarantee semantic correctness.

Example of schema-compliant but semantically wrong output:

```json
{
  "vendor_name": "Acme Corp",
  "invoice_number": "INV-2024-001",
  "total_amount": 1500.00,
  "line_items": [
    {"description": "Consulting services", "amount": 1500.00}
  ]
}
```

This output is perfectly valid JSON, conforms to the schema, has all required fields, and uses correct types. But if the actual invoice says "GlobalTech Solutions" as the vendor and $2,750.00 as the total, the output is semantically wrong despite being schema-compliant.

Schema enforcement solves the format problem. It does not solve the accuracy problem. Accuracy requires good prompt design (explicit criteria, few-shot examples), validation logic (covered in 4.4), and appropriate review mechanisms (covered in 4.6).

---

### 4.4 Validation, Retry, and Feedback Loops

Even with excellent prompts and schema-enforced output, extraction and analysis pipelines will produce errors. Validation catches those errors. Retry mechanisms correct them. Feedback loops improve accuracy over time.

#### The Retry-with-Error-Feedback Pattern

The most effective retry pattern is not simply re-running the same request. It is re-running the request with the specific validation error included in the prompt, so the model knows what it did wrong and can correct it.

The pattern works as follows:

1. Send the extraction request to the model
2. Validate the response against your rules (schema validation + semantic validation)
3. If validation fails, construct a new request that includes: the original input, the model's previous output, and the specific error message
4. The model sees what it produced and what was wrong with it, and generates a corrected version

```
Your previous extraction contained the following error:
  Field "invoice_date" has value "March 2024" but must be in ISO 8601
  format (YYYY-MM-DD). The source document says "March 15, 2024",
  so the correct value should be "2024-03-15".

Please re-extract with the corrected date format.
```

This pattern works well for **format errors**: wrong date formats, incorrect number formats, fields in the wrong structure, values that violate constraints. The model can see the error and fix it because the correct data exists in the source -- it just formatted it wrong.

This pattern does NOT work when **the information is absent from the input**. If the source document simply does not contain a purchase order number, no amount of retrying will produce a correct one. Retrying in this case risks the model hallucinating a plausible but fabricated value to satisfy the validation. Your retry logic must distinguish between "the model formatted this wrong" (retry) and "the data is not in the source" (accept null and move on).

#### Schema Validation vs Semantic Validation

These are two different layers of validation that catch different classes of errors:

**Schema validation** checks structural correctness: Is the output valid JSON? Are required fields present? Are types correct? Are enum values from the allowed set? Schema validation is deterministic and easy to implement -- most languages have JSON schema validation libraries. If you are using tool use with a JSON schema, the API handles schema validation automatically.

**Semantic validation** checks content correctness: Does the extracted date fall within a reasonable range? Is the total amount approximately equal to the sum of line items? Does the vendor name match a known vendor in your database? Is the currency code valid? Semantic validation requires domain knowledge and must be implemented as custom logic.

A production pipeline needs both layers. Schema validation catches structural issues (and with tool use, is handled automatically). Semantic validation catches content issues and must be designed for each specific extraction task.

#### Feedback Loops for Continuous Improvement

A well-designed extraction pipeline does not just validate output -- it captures metadata about the extraction for later analysis. The most useful metadata field is a `detected_pattern` or `extraction_notes` field in the output schema that the model uses to describe what it found and how it interpreted it.

```json
{
  "vendor_name": "Acme Corp",
  "total_amount": 1500.00,
  "detected_pattern": "Standard single-page invoice with header table layout.
                        All fields clearly labeled. No ambiguity.",
  "low_confidence_fields": []
}
```

```json
{
  "vendor_name": "Global Tech",
  "total_amount": 2750.00,
  "detected_pattern": "Multi-page invoice with line items split across pages.
                        Total found on final page. Tax amount inferred from
                        subtotal and total difference.",
  "low_confidence_fields": ["tax_amount"]
}
```

Over time, analyzing these notes reveals patterns: which types of documents cause errors, which fields are frequently low-confidence, which patterns the model consistently mishandles. This data informs prompt improvements, additional few-shot examples, and schema adjustments.

#### Common Mistake: Endless Retries

A pipeline that retries indefinitely when validation fails will waste tokens and may hallucinate. Best practice is to set a maximum retry count (typically 2-3 retries) and, after exhausting retries, either flag the item for human review or accept the output with a low-confidence marker. The key insight is that **some inputs are genuinely ambiguous or incomplete, and no prompt refinement will produce a correct extraction from insufficient data.** The system must have a graceful fallback for these cases rather than looping forever.

---

### 4.5 Batch Processing

The Message Batches API is designed for workloads that can tolerate processing latency in exchange for significant cost savings. It accepts batches of up to thousands of message requests, processes them asynchronously with a processing window of up to 24 hours, and returns the results at a 50% cost reduction compared to real-time API calls.

#### When to Use Batch Processing

Batch processing is appropriate for workloads that are:

- **Latency-tolerant:** The results are not needed immediately. Examples include overnight report generation, weekly compliance audits, end-of-day document classification, and bulk historical data extraction.
- **High-volume:** You have many independent requests to process. The cost savings scale linearly -- 1,000 batch requests save 50% on 1,000 requests' worth of API costs.
- **Non-interactive:** The requests do not depend on user interaction or real-time feedback. Each request in a batch is a complete, self-contained message.

Batch processing is NOT appropriate for:

- **Pre-merge code reviews or CI/CD checks:** Developers are waiting for the review to complete before merging. A 24-hour processing window is unacceptable for a blocking workflow.
- **Real-time user interactions:** Chatbots, assistants, or any interface where a user is waiting for a response.
- **Time-sensitive workflows:** Anything with an SLA shorter than the batch processing window.
- **Multi-turn conversations:** The batch API processes single-turn requests. You cannot have the model call a tool, receive the result, and continue reasoning within a single batch request. If your workflow requires tool use with multiple rounds of tool calls, you need the real-time API.

The last point is a critical exam concept: **the Message Batches API does not support multi-turn tool calling within a single batch request.** If your extraction task requires the model to call a tool, receive its result, reason about it, and call another tool, you cannot use batch processing for that task. You can, however, structure your pipeline so that each batch request is self-contained (all necessary data included in the prompt) and does not require tool-based interaction.

#### Batch API Mechanics

Each request in a batch includes a `custom_id` field -- a string you assign that identifies the request. Results may return in any order (not necessarily the order you submitted them), so `custom_id` is the mechanism for correlating responses back to their original requests. If you are processing 500 invoices, each request's `custom_id` might be the invoice filename or database ID.

```json
{
  "custom_id": "invoice-2024-00417",
  "params": {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 4096,
    "messages": [
      {"role": "user", "content": "Extract the following fields from this invoice: ..."}
    ]
  }
}
```

When results arrive, each result carries the same `custom_id`, allowing your code to match results to inputs regardless of processing order.

#### No Guaranteed Latency

The batch API has a processing window of up to 24 hours. Most batches complete faster, but there is no SLA guaranteeing a specific processing time. Design your pipeline to handle the full 24-hour window. If your pipeline runs nightly and processes the previous day's documents, submit the batch early enough that results are available by the time the next pipeline stage needs them.

#### Common Mistake: Batch for Blocking Workflows

The exam will present scenarios where batch processing is tempting because of the cost savings but wrong because the workflow is time-sensitive. If a developer is waiting for a code review before merging, 50% cost savings is irrelevant -- the developer's blocked time costs far more than the API savings. If a customer is waiting for a document to be processed before they can proceed with an application, latency matters more than cost. Always evaluate the latency requirements before choosing batch over real-time.

---

### 4.6 Multi-Instance and Multi-Pass Review

#### The Self-Review Problem

When you ask the model to generate output and then review that same output in the same conversation, the model retains the full reasoning context that produced the output. It remembers why it made each decision, what tradeoffs it considered, and what alternatives it rejected. This context creates a strong confirmation bias: the model is predisposed to agree with its own prior reasoning.

This is not a theoretical concern -- it is a measurable effect. A model reviewing its own code review will consistently rate its findings more favorably, miss fewer of its own false positives, and add fewer new findings compared to a fresh instance reviewing the same code. The analogy is a developer reviewing their own pull request: they already know why they wrote the code that way, so they are blind to assumptions that a fresh reviewer would question.

**The critical exam concept:** Asking the same model instance to "now review what you just wrote" is NOT an effective review mechanism. This is a frequently tested point, and any answer choice that relies on self-review within the same conversation is almost always wrong.

#### Independent Review Instances

The solution is to use separate API calls with fresh context for review tasks. Each review instance starts with no knowledge of how the output was produced. It evaluates the output purely on its merits, applying the review criteria without the author's contextual bias.

In practice, this means:

```
Instance 1 (generator): Produces the output (code, analysis, extraction)
    |
    v  (output is passed as raw input to Instance 2)
    |
Instance 2 (reviewer): Receives only the output and review criteria,
                         evaluates independently
```

The reviewer instance does not see the generator's system prompt, reasoning, or conversation history. It sees only the artifact to review and the criteria for evaluation. This produces significantly more objective reviews.

#### Multi-Pass Review Architecture

For complex analysis tasks, a single pass through the input may miss issues that are only visible in the aggregate. Multi-pass review uses two or more sequential passes, each with a different analytical focus:

**First pass -- Local analysis:** Examine each unit (file, document, section) independently. Each unit gets its own API call with focused context. The goal is to identify issues within individual units: code bugs in a single file, data quality issues in a single record, compliance violations in a single document.

**Second pass -- Cross-cutting analysis:** Take the results from the first pass and analyze them in aggregate. The second pass looks for patterns that span multiple units: are several files making the same mistake? Do extracted records from different documents have contradictory information? Are there system-wide patterns that no single-file analysis would catch?

```
Pass 1 (per-file):
  File A → [Instance 1] → Issues in A
  File B → [Instance 2] → Issues in B
  File C → [Instance 3] → Issues in C

Pass 2 (cross-cutting):
  Issues from A + B + C → [Instance 4] → Cross-cutting analysis
    - Patterns across files
    - Contradictions between files
    - System-wide recommendations
```

This architecture catches both local issues (a bug in one function) and cross-cutting concerns (inconsistent error handling patterns across the entire codebase). A single-pass, single-instance analysis of the entire codebase would either lack the focused attention of per-file analysis or miss the cross-file patterns.

#### When to Use Multi-Pass

Multi-pass review is worth the additional cost and complexity when:

- The input is too large for a single context window (many files, many documents)
- Cross-cutting patterns are important (consistency checks, aggregate statistics)
- The stakes are high enough to justify multiple review passes (compliance, security)
- Per-unit analysis benefits from focused context (each file reviewed with full attention rather than skimmed as part of a large batch)

For simpler tasks -- reviewing a single file, classifying a single document -- a single independent review instance is sufficient. Multi-pass is for complex, multi-unit workloads where both local and global perspectives matter.

#### Connecting to CI/CD

The multi-instance review pattern is the foundation of Claude Code's CI/CD integration (covered in Domain 3, Task 3.6). In a CI pipeline, each changed file is reviewed by an independent Claude Code instance, and results are aggregated. This is the multi-pass pattern applied to pull request reviews: the first pass analyzes each file independently, and optionally a second pass examines cross-file concerns (API contract changes, migration consistency, etc.).

---

## Architecture Patterns

### Explicit Criteria Pattern

Replace subjective language with measurable, testable conditions. Every criterion should be evaluable as true or false for a given input.

```
Vague:     "Flag security issues"
Explicit:  "Flag any function that: (a) accepts user input, (b) constructs
            a SQL query using string concatenation or template literals,
            and (c) does not use parameterized queries or an ORM"
```

The explicit version can be unit-tested: given a function, does it match conditions (a), (b), and (c)? The vague version cannot.

### Few-Shot Edge Case Pattern

Structure examples to cover the spectrum from clear to ambiguous:

```
Example Set:
  1. Clear positive  -- obvious match, demonstrates output format
  2. Clear negative  -- obvious non-match, demonstrates what to skip
  3. Ambiguous case  -- borderline input, demonstrates judgment and reasoning
  4. Missing data    -- incomplete input, demonstrates null handling
```

Each example teaches a different aspect of the task. Together, they define the behavior space.

### Schema-Enforced Output

Combine three API features to guarantee structured output:

```
tool definition     →  defines the JSON schema
tool_choice: forced →  model must use this specific tool
input_schema        →  constrains the structure of the tool arguments
```

Result: every response is valid JSON conforming to the schema. Format errors are eliminated. Semantic errors remain and must be caught by validation.

### Retry-with-Feedback Pattern

```
Request → Response → Validate → [Pass] → Accept
                        |
                      [Fail]
                        |
                        v
              New request with:
                - Original input
                - Previous output
                - Specific error message
                        |
                        v
                Corrected response → Validate → [Pass] → Accept
                                        |
                                      [Fail, max retries exceeded]
                                        |
                                        v
                                Flag for human review
```

Critical: distinguish between format errors (retry can fix) and missing data (retry cannot fix).

### Batch Pipeline Pattern

```
Collect items (invoices, documents, records)
        |
        v
Construct batch (each item = one request with custom_id)
        |
        v
Submit to Message Batches API (50% cost savings)
        |
        v
Poll for completion (up to 24-hour window)
        |
        v
Match results to items using custom_id
        |
        v
Validate and post-process
```

Appropriate only for non-blocking, latency-tolerant workloads.

### Independent Review Pattern

```
[Generator Instance]  →  output  →  [Reviewer Instance]
     (full context)                    (fresh context,
                                        review criteria only)
```

The reviewer never sees the generator's reasoning. This eliminates confirmation bias.

---

## Scenario Walkthrough

### Build a Structured Data Extraction Pipeline for Invoice Processing

**Scenario:** Your company receives 500 invoices per week in PDF format. You need to extract vendor name, invoice number, date, line items, subtotal, tax, and total, then load the data into your accounting database. The extraction must be reliable enough to run without human review for standard invoices, while flagging unusual ones for manual processing.

**Step 1: Design the JSON schema**

Define the extraction schema as a tool input:

```json
{
  "name": "record_invoice_data",
  "description": "Record the extracted invoice data",
  "input_schema": {
    "type": "object",
    "properties": {
      "vendor_name": {"type": "string"},
      "invoice_number": {"type": "string"},
      "invoice_date": {
        "type": "string",
        "description": "ISO 8601 date format: YYYY-MM-DD"
      },
      "currency": {
        "type": "string",
        "enum": ["USD", "EUR", "GBP", "CAD", "AUD", "other"]
      },
      "currency_detail": {
        "type": "string",
        "description": "If currency is 'other', specify the actual currency code"
      },
      "line_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "description": {"type": "string"},
            "quantity": {"type": "number"},
            "unit_price": {"type": "number"},
            "amount": {"type": "number"}
          },
          "required": ["description", "amount"]
        }
      },
      "subtotal": {"type": "number"},
      "tax_amount": {"type": "number"},
      "total_amount": {"type": "number"},
      "confidence": {
        "type": "string",
        "enum": ["high", "medium", "low"]
      },
      "extraction_notes": {
        "type": "string",
        "description": "Describe any ambiguity, missing data, or unusual formatting"
      },
      "low_confidence_fields": {
        "type": "array",
        "items": {"type": "string"},
        "description": "List field names where extraction confidence is low"
      }
    },
    "required": ["vendor_name", "invoice_number", "invoice_date",
                  "total_amount", "confidence", "extraction_notes",
                  "low_confidence_fields"]
  }
}
```

Note the design decisions: `vendor_name`, `invoice_number`, `invoice_date`, and `total_amount` are required because every invoice has these. `quantity` and `unit_price` in line items are optional because some invoices list only descriptions and amounts. The `confidence`, `extraction_notes`, and `low_confidence_fields` fields support the validation and feedback loop.

**Step 2: Write the prompt with explicit criteria and few-shot examples**

```
Extract invoice data from the following document. Follow these rules:

1. Dates must be in ISO 8601 format (YYYY-MM-DD). If only month and year
   are given, use the first of the month (e.g., "March 2024" → "2024-03-01").
2. All monetary amounts should be numbers without currency symbols.
3. If line items are present, extract each one. The sum of line item amounts
   should approximately equal the subtotal (within rounding tolerance of $0.02).
4. If tax is not explicitly stated but a subtotal and total are present,
   calculate tax as total minus subtotal.
5. Set confidence to "high" if all fields are clearly present and unambiguous.
   Set to "medium" if any fields required inference. Set to "low" if fields
   are missing or the document format is unusual.
6. If a field cannot be extracted, use null and add the field name to
   low_confidence_fields.

Example 1 (standard invoice):
[Include a complete input/output example with a clean, standard invoice]

Example 2 (invoice with missing PO number and handwritten notes):
[Include an input/output example showing null handling and medium confidence]

Example 3 (ambiguous multi-page invoice with inconsistent totals):
[Include an input/output example showing low confidence and detailed
 extraction_notes explaining the inconsistency]
```

**Step 3: Implement validation**

After receiving the model's output, apply both schema validation (handled by tool use) and semantic validation:

- Does `invoice_date` parse as a valid date?
- Is `invoice_date` within a reasonable range (not 10 years in the past or in the future)?
- Do line item amounts sum to approximately the subtotal?
- Does subtotal + tax approximately equal total?
- Is `vendor_name` in the known vendor database (or flagged for review if new)?

**Step 4: Implement retry-with-feedback**

If semantic validation fails for a correctable reason (e.g., date format wrong, amounts do not sum correctly), retry with the specific error:

```
Your previous extraction had a validation error:
  Line item amounts sum to $1,450.00 but subtotal is $1,500.00
  (difference of $50.00 exceeds tolerance of $0.02).

Please re-examine the line items in the source document and correct
the extraction.
```

If validation fails for an uncorrectable reason (e.g., vendor not in database, confidence is "low"), flag the invoice for human review.

**Step 5: Set up batch processing**

Since the 500 invoices arrive throughout the week and the accounting system updates nightly, submit invoices as a batch each evening. Each batch request includes the invoice content, the extraction prompt (with few-shot examples), and a `custom_id` set to the invoice filename. Results are processed the next morning, with high-confidence extractions loaded directly into the database and low-confidence ones queued for human review.

---

## Practice Exercises

### Exercise 1: Explicit Criteria vs Vague Prompts

**Task:** Write two versions of a prompt for reviewing Python code for maintainability issues:

- Version A: Vague prompt using subjective language (e.g., "flag poorly structured code")
- Version B: Explicit criteria prompt with specific, measurable conditions

Run both prompts against the same code sample (pick any Python file from an open-source project). Compare the results: How many findings does each produce? How many are actionable? How many are false positives?

**Expected outcome:** Version B should produce fewer total findings but a higher percentage of actionable, specific findings. Version A will likely produce more findings, many of which are vague or debatable.

### Exercise 2: JSON Schema Design for Meeting Action Items

**Task:** Design a JSON schema (as a tool input_schema) for extracting action items from meeting transcripts. The schema should include:

- Required fields: assignee, description, due_date (if mentioned)
- Optional fields: priority, related_topic, dependencies
- An enum field for status with values including "other" and a detail field
- A confidence field and extraction_notes

Then write a prompt with three few-shot examples: one clear action item, one vague reference to future work (that should NOT be extracted as an action item), and one ambiguous case where someone "offered to look into" something without a firm commitment.

**Guiding questions:**
- What is the threshold for something being an "action item" vs a casual mention?
- How do you handle action items with no specific assignee ("someone should look into this")?
- What date format do you enforce, and how do you handle relative dates ("by next Friday")?

### Exercise 3: Batch Processing Pipeline Design

**Task:** Design a batch processing pipeline for classifying 10,000 customer support tickets per week into categories (billing, technical, account, feature_request, other). The pipeline should:

1. Define the JSON schema for classification output
2. Determine the batch submission strategy (one batch per week? daily batches?)
3. Handle the `custom_id` mapping from tickets to results
4. Include semantic validation (e.g., confidence thresholds for auto-routing vs human review)
5. Identify which parts of this pipeline CANNOT use the batch API (hint: what if classification requires looking up customer account data?)

**Guiding questions:**
- If some tickets require checking the customer's account history (a tool call), can those go in the batch?
- How do you handle the ticket that arrives at 4:59 PM when the batch was submitted at 4:00 PM?
- What is your fallback if the batch has not completed when the next business day starts?

---

## Exam Tips

- **"Be conservative" or "be thorough" is almost always the wrong answer.** When an exam question asks how to improve prompt precision, the correct answer involves explicit, measurable criteria -- not subjective adjectives. If you see subjective language in an answer choice, treat it as a red flag.

- **Few-shot examples are the single most effective consistency technique.** When the exam asks how to improve output consistency, few-shot prompting is almost always the best answer. More instructions, longer system prompts, and more descriptive language are inferior to well-chosen examples.

- **Schema compliance does not equal semantic correctness.** Tool use with JSON schemas guarantees valid JSON structure. It does not guarantee that the content is accurate. Any exam question that implies schema enforcement solves accuracy problems is wrong.

- **Know the three tool_choice modes.** `auto` = model decides whether to use a tool. `any` = model must use a tool but chooses which one. Forced specific tool = model must use exactly this tool. For guaranteed structured output, use forced specific tool.

- **Batch API = cost savings + latency tolerance.** The 50% cost savings are attractive, but the up-to-24-hour processing window makes it inappropriate for any blocking or time-sensitive workflow. If the exam scenario involves developers waiting for results, real-time users expecting responses, or CI/CD pipelines that block on the output, batch is the wrong answer.

- **The batch API does not support multi-turn tool calling.** Each batch request is a single-turn interaction. If the task requires the model to call a tool, receive the result, and continue reasoning, it cannot be batched. This is a specific exam trap.

- **Self-review is biased; independent instances are effective.** When the same model instance reviews its own output, it is biased by its own reasoning context. Effective review requires a separate API call with fresh context. Any answer that suggests the model "review what it just wrote" in the same conversation is almost always wrong.

- **Retry-with-feedback works for format errors, not missing data.** If the model got the format wrong, retrying with the error message can fix it. If the data is not in the source document, retrying will not conjure it -- it may hallucinate instead. Know the difference.

- **The enum + "other" + freetext detail pattern** is the correct approach when you need structured categories but cannot predict every possible value. Watch for exam questions about handling unexpected classification results.

- **Multi-pass review: first pass = local, second pass = cross-cutting.** The first pass examines individual units in isolation. The second pass looks for patterns across all units. This catches both local issues and systemic problems that no single-unit analysis would reveal.

---

## Cross-References

- **Domain 3, Task 3.6** -- CI/CD integration uses structured output flags (`--output-format json`, `--json-schema`) that directly implement the concepts from Tasks 4.3 and 4.6. The CI review pipeline is a concrete application of schema-enforced output and multi-instance review.
- **Domain 3, Task 3.5** -- Iterative refinement in Claude Code is the interactive version of the retry-with-feedback pattern from Task 4.4. The same principle applies: specific feedback produces better corrections than vague feedback.
- **Domain 5, Task 5.5** -- Human review workflows extend the automated review patterns from Task 4.6. When automated validation flags low-confidence output, the human-in-the-loop pattern from Domain 5 provides the escalation mechanism.
- **Domain 5, Task 5.1** -- Context management affects long extraction sessions. When processing many documents in sequence, context window limits from Domain 5 constrain how much few-shot context you can include alongside the input data.
- **Domain 1, Task 1.4** -- Programmatic enforcement (hooks that validate tool call arguments) is the code-level implementation of the validation patterns from Task 4.4. Hooks provide deterministic enforcement; prompt-based validation is probabilistic.
- **Exam Scenarios:** Scenario 5 (CI/CD), Scenario 6 (Structured Data Extraction)
- **Assessment:** `assessments_domain-04-questions.md`
