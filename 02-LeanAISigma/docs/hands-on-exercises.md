# Lean AI Sigma -- Green Belt: Hands-On Exercises

## Exercise 1: CORPS Before/After Prompt Redesign

**Domains:** 1 (Prompt Waste), 2 (CORPS Framework)

### Objective
Take a real-world inefficient prompt, identify its waste types, redesign it using CORPS, and measure the improvement.

### Instructions

**Step 1: Select a real prompt.** Choose a prompt you have used (or would use) in your work. It should be a task you perform regularly -- email drafting, report generation, data analysis, content creation, or similar.

**Step 2: Document the "before" state.**
- Write the original prompt exactly as you would send it
- Count the input tokens (estimate: words x 1.3)
- Execute the prompt and count the output tokens
- Record how many iterations it took to get an acceptable result
- Rate the output quality on a 1-10 scale
- Identify which waste types (from Task 1.1) are present

**Step 3: Redesign using CORPS.**
- Context: What does the model need to know? (essential tier only)
- Objective: What specific deliverable is expected?
- Role: What persona should the model adopt? (skip if not needed)
- Parameters: What constraints apply? (length, tone, format, audience)
- Structure: What output format is expected?

**Step 4: Document the "after" state.**
- Write the CORPS-optimized prompt
- Count the input tokens
- Execute the prompt and count the output tokens
- Record the iteration count
- Rate the output quality on a 1-10 scale

**Step 5: Calculate improvement.**
- Token reduction percentage
- Iteration reduction
- Quality change
- Total tokens per successful output: before vs. after

### Success Criteria
- Minimum 30% reduction in total tokens per successful output
- Output quality maintained or improved (quality score >= before score)
- Clear identification of at least 2 waste types in the original prompt

---

## Exercise 2: Token Reduction Challenge ("Name That Tune")

**Domains:** 4 (Token Efficiency), 2 (CORPS Framework)

### Objective
Progressively reduce a prompt to its minimum viable version while maintaining output quality.

### Instructions

**Step 1: Start with a full CORPS prompt.**
Use the following prompt (or substitute your own full CORPS prompt):

"You are a senior product manager at a B2B SaaS company that sells project management tools to mid-market enterprises. Your target audience is VPs of Engineering who are evaluating tools for their teams. Write a 200-word product comparison summary comparing our tool against Competitor X. Focus on three differentiators: integration ecosystem, AI-powered automation, and pricing flexibility. Use a professional but conversational tone. Structure the response as: opening hook (1 sentence), three differentiator paragraphs (2-3 sentences each), and a closing call-to-action (1 sentence)."

**Step 2: Execute and record baseline.**
- Input tokens: ___
- Output quality (1-10): ___
- Iterations needed: ___

**Step 3: Progressive reduction (5 rounds).**
For each round, remove or compress one element and re-execute:

| Round | What was removed/compressed | Input tokens | Quality (1-10) | Pass? |
|-------|---------------------------|-------------|----------------|-------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Step 4: Identify the minimum viable prompt.**
The last version before quality dropped below acceptable is your minimum viable prompt.

**Step 5: Analyze.**
- What elements were most compressible?
- What elements were load-bearing (removing them degraded quality)?
- What is the compression ratio (baseline tokens / minimum viable tokens)?

### Success Criteria
- Completed at least 4 reduction rounds
- Identified the minimum viable prompt with a clear quality threshold
- Compression ratio of at least 2:1 (50% reduction)
- Documented which CORPS elements were most and least compressible

---

## Exercise 3: LAI Score Calculation Lab

**Domains:** 5 (Measurement), 4 (Token Efficiency)

### Objective
Calculate LAI scores for multiple prompt versions and determine which is most efficient.

### Instructions

**Scenario:** You have tested three versions of a prompt for the same task (generating a weekly team status email). Here are the metrics:

| Metric | Version A | Version B | Version C |
|--------|-----------|-----------|-----------|
| Value Output (1-10) | 7 | 9 | 8 |
| Total Tokens (all iterations) | 1,800 | 600 | 900 |
| Cost ($) | 0.045 | 0.015 | 0.022 |
| Iterations | 3 | 1 | 2 |

**Step 1: Normalize the components.**
Use these normalization factors: Tokens / 1000, Cost / 0.01, Iterations / 1

| Component | Version A | Version B | Version C |
|-----------|-----------|-----------|-----------|
| Tokens (normalized) | | | |
| Cost (normalized) | | | |
| Iterations (normalized) | | | |
| Denominator total | | | |

**Step 2: Calculate LAI for each version.**

LAI = Value Output / (Tokens_norm + Cost_norm + Iterations_norm)

- Version A LAI: ___
- Version B LAI: ___
- Version C LAI: ___

**Step 3: Interpret the results.**
- Which version is most efficient? Why?
- Version A has the most iterations. What waste type does this indicate?
- Version B has the highest Value Output and lowest cost. What does this suggest about its CORPS design?
- If you could only improve one metric for Version C, which would have the biggest impact on its LAI score?

**Step 4: Design an improvement.**
Using CORPS principles, describe what changes to the Version A prompt would likely move its LAI score closer to Version B's. Reference specific CORPS elements and waste types.

### Success Criteria
- Correct LAI calculations for all three versions
- Accurate identification of the most efficient version
- Clear explanation linking LAI components to waste types and CORPS elements
- Actionable improvement recommendation for the weakest version

---

## Exercise 4: Energy Reflection & PDCA Journal

**Domains:** 5 (Measurement & Sustainability), 1 (Lean Principles)

### Objective
Track your AI usage over a work session, estimate its energy footprint, apply one PDCA improvement cycle, and reflect on the sustainability implications.

### Instructions

**Step 1: Track a work session.**
Over one work session (minimum 1 hour), log every AI interaction:

| # | Task Description | Input Tokens | Output Tokens | Iterations | Successful? |
|---|-----------------|-------------|--------------|------------|-------------|
| 1 | | | | | |
| 2 | | | | | |
| ... | | | | | |

**Step 2: Calculate session metrics.**
- Total input tokens: ___
- Total output tokens: ___
- Total iterations: ___
- Waste tokens (from failed iterations): ___
- Waste percentage: (waste tokens / total tokens) x 100 = ___%

**Step 3: Estimate energy impact.**
Use this rough estimation model:
- 1,000 tokens processed ~ 0.001 kWh (approximate for large language models)
- Your total tokens: ___ / 1000 x 0.001 = ___ kWh
- Your waste tokens: ___ / 1000 x 0.001 = ___ kWh wasted
- Scaled to a team of 50 doing this daily for a year: ___ x 50 x 250 = ___ kWh

**Step 4: PDCA cycle.**
Select the interaction with the highest waste from your log.

- **Plan:** Identify the waste types present. Design a CORPS-improved version. Hypothesize the expected improvement.
- **Do:** Execute the improved prompt. Record the metrics.
- **Check:** Compare to the original. Calculate LAI scores for both versions.
- **Act:** What would you standardize based on this result? What would you improve further?

**Step 5: Write the reflection (250-500 words).**
Address these questions:
- What percentage of your session's tokens were waste?
- How does your efficiency improvement reduce energy consumption?
- If every AI user in your organization adopted these practices, what would the aggregate impact be?
- How does thinking about energy change your approach to prompt design?

### Success Criteria
- Complete session log with at least 5 interactions tracked
- Accurate waste percentage calculation
- Energy estimation completed with scaling calculation
- One full PDCA cycle documented with before/after metrics
- Reflection demonstrates understanding of the compute-energy chain and personal responsibility
