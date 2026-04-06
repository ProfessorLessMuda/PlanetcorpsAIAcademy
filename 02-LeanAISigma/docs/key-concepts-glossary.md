# Lean AI Sigma -- Green Belt: Key Concepts Glossary

**Before/After Analysis** — A structured methodology for comparing an original prompt against a CORPS-optimized version, measuring improvements in token count, iterations, and output quality. (Domain 1, Task 1.3)

**Background Context** — General knowledge the model likely already has; including it is almost always waste. The lowest tier in the context relevance hierarchy. (Domain 2, Task 2.1; Domain 3, Task 3.5)

**Compound Objective** — A prompt objective that bundles multiple deliverables into a single request, violating single-piece flow and increasing defect probability. (Domain 2, Task 2.2)

**Context** — The first element of CORPS. Background information the model needs to produce an aligned output. Categorized into essential, helpful, and background tiers. (Domain 2, Task 2.1)

**Context Dump** — The anti-pattern of front-loading all possible context into the first prompt. Creates token waste, attention dilution, and flexibility loss. (Domain 3, Task 3.2)

**Context Engineering** — The design of the information environment in which the model operates: system prompts, retrieved documents, conversation history, and information architecture. Distinguished from prompt engineering (what you say) as the higher-leverage skill. (Domain 3, Task 3.1)

**Context Hierarchy** — A layered organization of context into persistent, situational, and ephemeral layers based on scope and relevance duration. (Domain 3, Task 3.4)

**Context Pruning** — The systematic removal of noise from prompts by testing whether each context element demonstrably improves output quality. (Domain 3, Task 3.5)

**CORPS Framework** — Cognitively Optimized Resource Packaging & Stacking. The five-element framework for designing efficient prompts: Context, Objective, Role, Parameters, Structure. The core tool of Lean AI Sigma Green Belt. (Domain 2, Tasks 2.1-2.6)

**Cost** — A component of the LAI Score denominator. The financial cost of an AI interaction, determined by input and output token pricing. (Domain 5, Task 5.1)

**Defect Waste** — Outputs that fail to meet the stated or implied objective, triggering rework. Caused by vague prompts, missing context, or inappropriate role assignment. (Domain 1, Task 1.1)

**Efficiency Improvement Percentage** — The Kaizen metric. Measures percentage improvement in any key metric compared to a baseline. The headline number for stakeholder reporting. (Domain 5, Task 5.2)

**Ephemeral Context** — Information relevant only to the current turn and immediately disposable. Examples: specific data points for a calculation, format examples for the current output. (Domain 3, Task 3.4)

**Essential Context** — Information without which the task cannot be completed correctly. Must always be included in the prompt. (Domain 2, Task 2.1)

**Excess Context Inventory** — Including more background information than the model needs, consuming tokens and diluting attention. The prompt equivalent of excess factory inventory. (Domain 1, Task 1.1)

**First-Pass Precision** — Getting the right output on the first attempt, eliminating iteration waste. Achieved through complete CORPS application. (Domain 4, Task 4.4)

**Five Whys** — A root cause analysis technique from Toyota's production system. Applied to prompt failures, it traces defective outputs back to their root cause in the prompting methodology. (Domain 1, Task 1.3)

**HALO** — High-Alignment Logical Output. The target state for every AI interaction: output precisely aligned to the objective, logically structured, and produced with minimal waste. The Lean AI equivalent of "right first time." (Domain 1, Task 1.4; Domain 2, Task 2.6)

**Helpful Context** — Context that improves output quality but is not strictly necessary. Include when token budget allows; exclude when efficiency is the priority. (Domain 2, Task 2.1)

**Iterations to Completion** — The average number of prompt-response cycles required to produce an acceptable output. A cycle time metric. Target: 1.0 (perfect first-pass precision). (Domain 5, Task 5.2)

**Just-in-Time Context** — Providing context only when the model needs it for the current step, rather than front-loading everything. Borrows from Lean manufacturing's JIT inventory management. (Domain 1, Task 1.2; Domain 3, Task 3.2)

**Kaizen** — Continuous improvement through small, incremental changes. In Lean AI, treating every interaction as a learning opportunity. Operationalized through the PDCA cycle. (Domain 1, Task 1.4; Domain 5, Task 5.3)

**LAI Score** — Lean AI Index. The unified efficiency metric: LAI = Value Output / (Tokens + Cost + Iterations). Higher scores indicate greater efficiency. (Domain 5, Task 5.1)

**Lost in the Middle** — The phenomenon where models pay more attention to information at the beginning and end of the context window, underweighting content in the middle. Critical for context placement decisions. (Domain 3, Task 3.3)

**Minimum Viable Prompt** — The shortest prompt that still produces an acceptable output. The target of the "Name That Tune" challenge. (Domain 4, Task 4.5)

**"Name That Tune" Challenge** — A gamified token efficiency exercise: progressively reduce a prompt to the minimum viable version while maintaining output quality. Named after the game show where contestants identify songs in the fewest notes. (Domain 4, Task 4.5)

**Objective** — The second element of CORPS. Defines what success looks like. Must be specific, measurable, singular, and actionable. Functions as the "pull signal" in Lean terms. (Domain 2, Task 2.2)

**Over-processing Waste** — Asking the model to perform analysis, formatting, or generation beyond what the task requires. (Domain 1, Task 1.1)

**Overproduction Waste** — Generating far more output than the task requires. Considered the worst form of waste because it triggers other waste types. (Domain 1, Task 1.1)

**Parameters** — The fourth element of CORPS. Constraints on the output: length, tone, format, and audience. Prevent overproduction and defect waste. (Domain 2, Task 2.4)

**PDCA Cycle** — Plan-Do-Check-Act. The Deming cycle applied to prompt design improvement. The operational framework for practicing Kaizen in Lean AI. (Domain 5, Task 5.3)

**Persistent Context** — Information relevant throughout an entire interaction, regardless of specific tasks. Typically delivered via system prompts. Should be concise to avoid compounding waste. (Domain 3, Task 3.4)

**Prompt Compression** — Techniques for reducing prompt token count without losing meaning: eliminating redundancy, concise phrasing, role-based compression, and reference techniques. (Domain 4, Task 4.2)

**Prompt Engineering** — The craft of writing effective instructions, questions, and directives for AI models. Distinguished from context engineering as "what you say" versus "what the model knows." (Domain 3, Task 3.1)

**Pull-Based Interaction Design** — Starting from the desired output and working backward to determine the minimum input required. The opposite of push mode (prompt and hope). (Domain 1, Task 1.2)

**Role** — The third element of CORPS. Assigns a persona that compresses domain expertise into a few words. Should be specific, relevant, and capability-leveraging. Optional for mechanical tasks. (Domain 2, Task 2.3)

**Signal-to-Noise Ratio** — The proportion of context tokens that directly contribute to output quality (signal) versus those that consume tokens without impact (noise). Higher ratios indicate more efficient context. (Domain 3, Task 3.5)

**Single-Piece Flow** — Processing one objective per prompt rather than bundling multiple unrelated tasks. Produces higher-quality results by allowing focused model attention. (Domain 1, Task 1.2)

**Situational Context** — Information relevant to the current task or task phase but not the entire interaction. Injected at task start and may be replaced when the task changes. (Domain 3, Task 3.4)

**Structure** — The fifth element of CORPS. Defines the output format: lists, tables, templates, or sectioned responses. Prevents overproduction and makes outputs immediately actionable. (Domain 2, Task 2.5)

**Token Budget** — The planned allocation of context window capacity across system prompt, conversation history, retrieved context, current prompt, and response space. (Domain 3, Task 3.3)

**Tokens per Successful Output** — The total token consumption (input + output, all iterations) required to produce one acceptable result. The core efficiency metric. (Domain 5, Task 5.2)

**Underutilized Talent Waste** — Failing to leverage the model's full capabilities by over-constraining or treating it as a simple Q&A tool. (Domain 1, Task 1.1)

**Unnecessary Motion Waste** — Repeatedly rephrasing, reformatting, or restructuring the same request due to a poorly structured prompt. (Domain 1, Task 1.1)

**Unnecessary Token Waste** — Tokens in the prompt that add no value: redundant instructions, filler phrases, repeated context. The prompt equivalent of excess inventory. (Domain 1, Task 1.1)

**Value Output** — The numerator of the LAI Score. A numeric rating of how well the output met the stated objective. Scored on a defined scale (e.g., 1-10). (Domain 5, Task 5.1)

**Value Stream Mapping** — Tracing every step of an AI interaction lifecycle to classify each as value-adding, non-value-adding but necessary, or waste. (Domain 1, Task 1.2)

**Waiting Waste** — Idle time between prompt iterations caused by vague initial prompts requiring rework. Eliminated by investing in upfront prompt design. (Domain 1, Task 1.1)
