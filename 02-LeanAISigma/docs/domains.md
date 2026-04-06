# Lean AI Sigma -- Green Belt: Domains & Task Statements

## Domain Overview

| Domain | Name | Weight |
|--------|------|--------|
| 1 | Prompt Waste & Lean AI Principles | 15% |
| 2 | CORPS Framework & Prompt Design | 25% |
| 3 | Context Engineering | 20% |
| 4 | Token Efficiency & Optimization | 20% |
| 5 | Measurement, Metrics & Sustainability | 20% |

---

## Domain 1: Prompt Waste & Lean AI Principles (15%)

Identify and eliminate waste in AI interactions by applying Lean manufacturing principles to prompt design.

### Task Statements

**1.1** Identify the 8 types of prompt waste in AI interactions
- Map each Lean waste type (overproduction, waiting, unnecessary tokens, over-processing, excess inventory, unnecessary motion, defects, underutilized talent) to its AI interaction equivalent
- Recognize waste types in real-world prompt examples

**1.2** Map Lean manufacturing principles to AI prompt workflows
- Apply value stream mapping to trace prompt lifecycles
- Implement pull-based interaction design
- Use just-in-time context delivery and single-piece flow

**1.3** Diagnose waste in existing prompts using before/after analysis
- Conduct structured before/after prompt comparisons
- Apply token counting as a waste measurement tool
- Use the Five Whys root cause analysis on prompt failures

**1.4** Apply a continuous improvement mindset to prompt iteration
- Understand HALO (High-Alignment Logical Output) as the target state
- Treat every AI interaction as a Kaizen opportunity
- Connect individual prompt improvement to organizational efficiency

---

## Domain 2: CORPS Framework & Prompt Design (25%)

Master the five elements of CORPS (Context, Objective, Role, Parameters, Structure) to construct efficient, high-alignment prompts.

### Task Statements

**2.1** Apply the Context element to scope relevant background information
- Categorize context into essential, helpful, and background tiers
- Apply the context relevance test: "If I removed this, would output quality decline?"
- Avoid excess context inventory waste

**2.2** Write precise Objectives that eliminate ambiguity
- Ensure objectives are specific, measurable, singular, and actionable
- Understand the objective as the "pull signal" in Lean terms
- Avoid compound objectives that bundle multiple tasks

**2.3** Assign effective Roles that leverage model capabilities
- Use roles as context compression mechanisms
- Choose roles that are specific, relevant, and capability-leveraging
- Know when to skip role assignment (mechanical/conversion tasks)

**2.4** Define Parameters that constrain output without over-specifying
- Apply the four parameter categories: length, tone, format, audience
- Balance tight constraints against creative utility
- Recognize parameter-role interactions to avoid redundancy

**2.5** Design Structure templates for repeatable prompt patterns
- Specify output structure at high-level, detailed, or example-driven levels
- Create reusable prompt templates as standardized work
- Use structure to prevent overproduction and defect waste

**2.6** Integrate all CORPS elements into a complete prompt
- Assemble elements in the natural flow: Context, Role, Objective, Parameters, Structure
- Determine which elements are needed for a given task (not all are always required)
- Demonstrate before/after improvement using full CORPS integration

---

## Domain 3: Context Engineering (20%)

Design information environments that provide the right context at the right time to maximize output alignment and minimize waste.

### Task Statements

**3.1** Differentiate context engineering from prompt engineering
- Define prompt engineering as "what you say" and context engineering as "what the model knows"
- Recognize context engineering as the higher-leverage skill
- Identify organizational-scale context engineering opportunities

**3.2** Apply just-in-time context delivery strategies
- Implement progressive disclosure across multi-turn interactions
- Use conditional context inclusion based on task requirements
- Plan context staging for multi-step workflows

**3.3** Manage context window efficiency across multi-turn interactions
- Practice token budgeting across system prompt, history, retrieved context, and response
- Apply conversation history management strategies (summarization, selective retention, sliding window)
- Position critical information at context window edges (beginning and end)

**3.4** Design context hierarchies for complex tasks
- Classify context into persistent, situational, and ephemeral layers
- Match context hierarchy depth to task complexity
- Manage context transitions when tasks change within an interaction

**3.5** Evaluate context relevance to reduce waste
- Calculate signal-to-noise ratio in prompts
- Conduct A/B tests to measure context impact on output quality
- Apply systematic context pruning to eliminate noise

---

## Domain 4: Token Efficiency & Optimization (20%)

Apply concrete techniques to reduce token consumption and iteration count while maintaining or improving output quality.

### Task Statements

**4.1** Measure token usage and identify reduction opportunities
- Understand tokenization at a conceptual level
- Differentiate input and output token cost profiles
- Establish token-per-successful-output baselines for common tasks

**4.2** Apply compression techniques to reduce prompt length without losing meaning
- Eliminate redundant instructions
- Convert verbose phrasing to concise equivalents
- Use role assignment and reference techniques as compression tools

**4.3** Optimize output specifications to minimize unnecessary generation
- Specify output length constraints
- Use format constraints to prevent overproduction
- Ask for specific deliverables rather than open-ended analysis

**4.4** Reduce iteration count through first-pass precision
- Quantify the cost structure of iteration waste
- Apply full CORPS to maximize first-pass success
- Diagnose iteration failures by CORPS element

**4.5** Apply the "Name That Tune" challenge methodology
- Execute the three-phase reduction methodology (baseline, progressive reduction, minimum viable prompt)
- Use competitive benchmarking for team efficiency improvement
- Balance compression aggressiveness against prompt robustness

---

## Domain 5: Measurement, Metrics & Sustainability (20%)

Calculate LAI scores, track efficiency metrics, apply PDCA to improvement cycles, and understand the environmental implications of AI resource usage.

### Task Statements

**5.1** Calculate and interpret the LAI Score formula
- Apply the formula: LAI = Value Output / (Tokens + Cost + Iterations)
- Normalize components for cross-task comparison
- Compare LAI scores across prompt versions to identify the most efficient approach

**5.2** Track and optimize the four key efficiency metrics
- Measure tokens per successful output (efficiency)
- Track iterations to completion (cycle time)
- Monitor time to completion (throughput)
- Calculate efficiency improvement percentage (Kaizen metric)

**5.3** Apply the PDCA cycle to prompt design improvement
- Plan: analyze task and design CORPS-based improvement hypothesis
- Do: execute the improved prompt and collect metrics
- Check: compare results to hypothesis and baseline
- Act: standardize improvements and identify next opportunity

**5.4** Articulate the energy and environmental cost of token waste
- Describe the compute-energy chain (tokens to GPUs to electricity to grid)
- Explain how token waste at scale contributes to data center energy demand
- Connect individual efficiency improvements to responsible AI usage

**5.5** Design efficiency reports and improvement documentation
- Produce before/after comparisons with quantified improvements
- Create token usage analysis reports identifying top waste sources
- Assemble certification portfolio deliverables (4 required documents)
