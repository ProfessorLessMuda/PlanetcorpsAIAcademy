# Module 04 - Token Efficiency & Optimization

## Exam Weighting: 20%

## Objective
Apply concrete techniques to reduce token consumption and iteration count while maintaining or improving output quality. Master the "Name That Tune" challenge methodology for achieving results with minimum viable prompts.

## Task Statements Covered
- 4.1: Measure token usage and identify reduction opportunities
- 4.2: Apply compression techniques to reduce prompt length without losing meaning
- 4.3: Optimize output specifications to minimize unnecessary generation
- 4.4: Reduce iteration count through first-pass precision
- 4.5: Apply the "Name That Tune" challenge methodology

## Key Concepts

### 4.1 Token Measurement and Baseline Establishment

Token measurement is the foundation of all efficiency optimization. You cannot improve what you do not measure. In Lean manufacturing, every process has cycle time, throughput, and defect rate metrics. In Lean AI, the equivalent metrics are input tokens, output tokens, iteration count, and output quality.

**How tokenization works** (conceptual level): AI models do not process text character by character. They break text into tokens -- chunks that typically represent common words, word fragments, or punctuation. "Marketing" is one token. "Antidisestablishmentarianism" is multiple tokens. Spaces, punctuation, and formatting characters are tokens. A rough approximation is that one token equals approximately 3/4 of a word in English, so 100 words is roughly 130-140 tokens. Understanding this relationship helps practitioners estimate token costs without needing a tokenizer tool for every prompt.

**Input vs. output tokens** have different cost profiles. Input tokens (what you send to the model) and output tokens (what the model generates) are typically priced differently, with output tokens costing more per unit. This means that overproduction waste (the model generating too much output) is more expensive per token than excess context waste (sending too much input). Both should be minimized, but output optimization often has a higher dollar-per-token return.

**Establishing a baseline** means measuring the current state before any optimization. For each common task type in your workflow, document: the average prompt length (input tokens), the average response length (output tokens), the average number of iterations to achieve an acceptable result, and the total tokens consumed per successful output (sum of all input and output tokens across all iterations). This baseline is your "before" state. Without it, you cannot quantify the impact of optimization efforts, and you cannot distinguish genuine improvement from random variation.

**Cost calculation** connects token usage to financial impact. If your API charges $3 per million input tokens and $15 per million output tokens, a prompt that uses 500 input tokens and generates 1,000 output tokens across 3 iterations costs: (500 x 3 x $0.000003) + (1,000 x 3 x $0.000015) = $0.0045 + $0.045 = $0.0495 per successful task. At 1,000 tasks per day, that is $49.50 daily. If CORPS optimization reduces iterations to 1, the cost drops to $0.0165 per task or $16.50 daily -- a 67% reduction. These calculations motivate the business case for Lean AI practices.

### 4.2 Prompt Compression Techniques

Prompt compression is the art of saying the same thing with fewer tokens. It is the token equivalent of Lean's waste elimination -- removing every word, phrase, and instruction that does not contribute to output quality.

**Eliminating redundant instructions** is the highest-impact compression technique. Prompts commonly repeat the same instruction in different words: "Make sure to include..." followed by "Don't forget to add..." followed by "It's important that you incorporate..." are three ways of saying the same thing, consuming three times the tokens. Identify every instruction in the prompt and check whether it is stated more than once. If so, keep the clearest version and delete the rest.

**Concise phrasing without ambiguity** removes filler words that add no information. "I would like you to please write a detailed and comprehensive analysis of the following topic" can be compressed to "Analyze the following topic in detail" -- from 19 tokens to 7 tokens, a 63% reduction, with zero loss of meaning. Common token-wasting patterns include: hedging language ("I was wondering if you could possibly..."), unnecessary politeness markers (the model does not need "please" or "thank you" to function), and passive constructions ("It should be noted that..." instead of the direct statement).

The critical constraint on compression is clarity. Compression that introduces ambiguity is counterproductive -- it saves input tokens but creates defect waste when the model misinterprets the compressed instruction. The test is: could a competent person reading this compressed prompt understand exactly what is being asked? If yes, the compression is valid. If no, it has gone too far.

**Role as context compression** is a powerful technique. Instead of writing: "You are an expert in B2B marketing with 15 years of experience in the SaaS industry, specializing in thought leadership content that appeals to C-suite executives in technology companies," you can write: "Act as a senior B2B SaaS marketing director." The role assignment compresses the detailed description into a handful of tokens because the model's training enables it to infer the associated expertise, vocabulary, and perspective. This is one of the most underused compression techniques because it requires trust that the model will correctly expand the compressed role into appropriate behavior.

**Reference techniques** compress context by pointing to shared knowledge rather than restating it. Instead of including a full paragraph defining what a value proposition is, a prompt can reference the concept: "Write the value proposition section (customer pain point, solution, differentiation)." The parenthetical tells the model what the section should cover without defining the term. This works because the model already knows what a value proposition is -- re-explaining it is unnecessary background context (waste type: excess inventory).

### 4.3 Output Optimization

Output optimization reduces the tokens the model generates without reducing the value of the output. Since output tokens are typically more expensive than input tokens, output optimization often has a higher financial return than prompt compression.

**Specifying output length** is the simplest output optimization. A prompt without a length constraint leaves the model free to produce an output of any length, and the default tendency is toward thoroughness -- the model will produce more rather than less. If your task needs 150 words, specify 150 words. The tokens saved by preventing a 500-word default response far outweigh the few tokens spent on the length constraint.

**Format constraints that prevent overproduction** direct the model to produce only the output structure you need. "Respond with a bullet list of 5 key points" constrains both format and quantity. "Respond in a markdown table with columns: Feature, Benefit, Priority" constrains format, content scope, and structure simultaneously. Each constraint reduces the probability of the model generating content you do not need.

**Asking for what you need, not everything available** is a mindset shift. The default prompting behavior is to ask broad questions and let the model decide what to include. Lean AI inverts this: specify exactly what components you want in the output and nothing else. Instead of "analyze this data," write "from this data, extract the three highest-growth segments and their year-over-year change." The specific request eliminates the model's tendency to provide comprehensive coverage when only a targeted answer is needed.

**Structured output as waste prevention** uses format specifications (JSON, tables, specific templates) to channel the model's output into a predictable shape. Unstructured outputs (free-form paragraphs) give the model maximum latitude to include irrelevant content. Structured outputs force the model to fill specific fields, naturally constraining the scope and preventing overproduction.

### 4.4 First-Pass Precision

First-pass precision means getting the right output on the first attempt, eliminating the most expensive form of waste: iterations. Each iteration costs the full round-trip of tokens (re-sending context, re-processing the prompt, re-generating the response) plus the user's time to evaluate the output and craft a correction prompt.

Consider the cost structure of iteration waste. A prompt with 200 input tokens that produces 500 output tokens costs 700 tokens per attempt. If it takes 3 iterations to get an acceptable result, the total cost is 2,100 tokens (plus additional tokens for the correction prompts in iterations 2 and 3, typically adding another 200-400 tokens). If CORPS optimization achieves the same result in 1 iteration, the cost is 700 tokens -- a 67-80% reduction. Multiply this across hundreds or thousands of tasks, and the savings are substantial.

The techniques for achieving first-pass precision are the combined application of all CORPS elements. **Context** ensures the model has the information it needs. **Objective** ensures the model knows exactly what to produce. **Role** ensures the model applies the right expertise. **Parameters** ensure the output meets the required constraints. **Structure** ensures the output is organized as expected. When all five elements are properly calibrated, the probability of a first-pass success is high. When any element is missing or vague, the probability of iteration increases proportionally.

First-pass precision is not perfection. The goal is not a flawless output on every first attempt -- that is unrealistic. The goal is an output that is usable without requiring a complete redo. Minor adjustments (changing a word, tweaking a sentence) are acceptable. Complete misfires (wrong topic, wrong format, wrong audience) are the waste that first-pass precision eliminates.

**Iteration diagnosis** is the practice of analyzing why a first pass failed when it does. For each failed first pass, identify which CORPS element was responsible. Was the context insufficient (the model did not know enough)? Was the objective vague (the model did not know what to produce)? Was the role wrong (the model applied the wrong perspective)? Were the parameters missing (the model defaulted to the wrong constraints)? Was the structure unspecified (the model organized the output unhelpfully)? Diagnosing failures by CORPS element turns each failure into a learning opportunity, directly supporting the Kaizen principle.

### 4.5 The "Name That Tune" Challenge

The "Name That Tune" challenge is a gamified approach to token efficiency optimization, named after the classic game show where contestants competed to identify a song in the fewest notes. In Lean AI, the challenge is: "I can get this output in N tokens." The goal is to progressively reduce the prompt to the minimum viable prompt -- the shortest prompt that still produces an acceptable output.

**The methodology** works in three phases. **Phase 1 (Baseline):** Write a full CORPS prompt for a specific task and execute it. Document the input token count, output quality, and iteration count. This is your baseline -- the maximum-quality prompt. **Phase 2 (Progressive Reduction):** Remove one element or compress one section at a time and re-execute. After each reduction, evaluate whether output quality declined. Continue reducing until quality begins to degrade. **Phase 3 (Minimum Viable Prompt):** The last version before quality degradation is your minimum viable prompt. Document its token count and the savings versus the baseline.

**Competitive benchmarking** turns this into a team exercise. Give multiple team members the same task and the same CORPS baseline prompt. Challenge them to produce the shortest prompt that achieves the same output quality. Compare results. The winner's techniques become shared knowledge, raising the efficiency of the entire team.

**The tradeoff between compression and robustness** is the key insight from this challenge. A minimum viable prompt achieves the desired output but is fragile -- small variations in context or model behavior may cause failures. A full CORPS prompt is more token-expensive but more robust -- it succeeds across a wider range of conditions. The appropriate compression level depends on the use case: high-volume, standardized tasks benefit from aggressive compression (the task is predictable, so robustness is less critical), while novel or high-stakes tasks benefit from full CORPS prompts (unpredictability requires robustness).

**Metrics for the challenge** are: input tokens (how short is the prompt?), output quality (scored on a 1-5 scale or against specific criteria), and iteration count (did it succeed in one pass?). The winning prompt is the one with the lowest token count that still achieves a quality score above the threshold and succeeds in one iteration. This operationalizes the Lean principle of eliminating waste while preserving value.

The "Name That Tune" challenge is most valuable as a training exercise. It builds the prompt design intuition that experienced practitioners develop over time: an instinct for which tokens are carrying weight and which are dead weight. Practicing the challenge regularly accelerates the development of this intuition.
