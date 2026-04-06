# Domain 1 Assessment - Prompt Waste & Lean AI Principles

## Question 1
**Scenario:** A product manager asks an AI to "write a comprehensive guide to our product's features" and receives a 3,000-word document covering every feature in detail. The manager only needed a 200-word summary of the three newest features for a stakeholder email. The manager now has to re-read the output, locate the relevant features, and re-prompt for a shorter version.

A) Defects -- the output contained incorrect information about the features
B) Overproduction -- the prompt lacked scope constraints, generating far more output than the task required
C) Over-processing -- the model performed unnecessary analytical work beyond the task
D) Unnecessary tokens -- the prompt itself contained redundant filler language

**Answer:** B

**Explanation:** This is overproduction: the model generated far more output than the task required because the prompt did not constrain scope or length. The output was not factually wrong (eliminating A -- defects require incorrect or misaligned content, not merely excessive content). It is not over-processing because the model did not perform deeper analytical work than requested; it simply produced too much of the requested deliverable (C fails because over-processing means asking the model to do more types of work than needed, such as adding an executive summary when only recommendations are required). D is wrong because the waste is in the output volume, not in the prompt's own language -- the prompt was actually quite short.

**Task Statement:** 1.1

---

## Question 2
**Scenario:** A marketing analyst sends an AI the prompt "write me a social media post about our new feature." The output uses the wrong tone. The analyst rephrases: "write a casual social media post about our new feature." The output is too long. They try again: "write a short casual social media post about our new feature." The output targets the wrong platform style. They try yet again: "write a short casual Twitter post about our new feature." After five attempts with minor wording adjustments, they finally get a usable result.

A) Waiting -- the analyst spent idle time between each failed iteration
B) Defects -- each output failed to meet quality requirements
C) Unnecessary motion -- the analyst repeatedly rephrased the same core request without addressing the structural problem
D) Overproduction -- the model generated too much content each time

**Answer:** C

**Explanation:** This is unnecessary motion: the analyst sent the same core request five different ways, each time making small wording adjustments rather than designing a properly structured prompt upfront. The root cause is a poorly structured prompt that leaves too much to interpretation, causing the user to iterate through surface-level rephrasing. Waiting (A) is the idle time between iterations, not the iteration pattern itself -- the waste here is in the repeated rephrasing activity, not in downtime. Defects (B) is a plausible distractor because the outputs were indeed flawed, but the question asks what the overall pattern of behavior demonstrates -- the repeated rephrasing cycle is the defining characteristic of motion waste. Overproduction (D) was only one of several problems encountered across iterations; the dominant pattern is the repetitive adjustment cycle.

**Task Statement:** 1.1

---

## Question 3
**Scenario:** A team currently uses a single massive prompt that front-loads all company background, product details, audience personas, style guides, and the actual task into one 2,000-token message. Outputs are inconsistent and the team averages 3.2 iterations per task. A Lean AI consultant recommends redesigning the workflow. Which approach best applies Lean principles to reduce waste?

A) Add more detailed instructions to the existing prompt to clarify expectations and reduce misinterpretation
B) Split the workflow into a multi-turn sequence: establish context in turn one, deliver task-specific details in turn two, and refine in turn three using just-in-time context delivery
C) Remove all context and rely on the model's training data to fill in the gaps, minimizing input tokens
D) Keep the single prompt but compress it to fewer tokens using abbreviations and shorthand

**Answer:** B

**Explanation:** B applies two Lean principles: just-in-time context delivery (providing information only when the model needs it for the current step) and pull-based design (structuring the workflow around what each step requires rather than pushing everything at once). This directly addresses the "lost in the middle" problem where critical information buried in a large context block receives less attention. A makes the problem worse by adding more tokens to an already overloaded prompt -- more instructions in a bloated context does not solve the attention dilution problem. C swings too far in the other direction, removing essential context and guaranteeing defect waste from the model guessing at missing information. D addresses token count but not the structural problem; compressed gibberish in a single massive block still suffers from attention dilution and inconsistent outputs.

**Task Statement:** 1.2

---

## Question 4
**Scenario:** After applying CORPS principles to a customer email prompt, a team documents the following changes: the original prompt used 280 input tokens and required an average of 2.8 iterations to produce an acceptable output. The redesigned prompt uses 180 input tokens and produces acceptable output in 1.1 iterations on average. Output quality (judged by the team lead) remained the same. Which metric best quantifies the waste reduction achieved?

A) Input token reduction percentage: (280 - 180) / 280 = 36% fewer input tokens per prompt
B) Iteration reduction percentage: (2.8 - 1.1) / 2.8 = 61% fewer iterations
C) Tokens per successful output: original = 280 x 2.8 + output tokens vs. redesigned = 180 x 1.1 + output tokens, capturing both input efficiency and iteration elimination
D) Output quality score improvement, since quality is the only metric that matters

**Answer:** C

**Explanation:** Tokens per successful output is the best metric because it captures the total token expenditure required to achieve one acceptable result, combining both input token efficiency and iteration count into a single measure. A (36% input reduction) only captures half the improvement -- it ignores that iteration reduction from 2.8 to 1.1 is where the majority of waste was eliminated. B (61% iteration reduction) captures the other half but misses the input token savings. Neither A nor B alone tells the full story. C multiplies input tokens by iterations to calculate total input cost per success, which is the most comprehensive waste measure. D is wrong because quality stayed the same -- there is no quality improvement to measure, and even if there were, quality alone does not quantify waste reduction. The scenario explicitly states quality was held constant, making efficiency the relevant comparison.

**Task Statement:** 1.3

---

## Question 5
**Scenario:** A legal team's contract summary prompt consistently produces outputs that focus on financial terms while ignoring liability clauses. Applying the Five Whys, the team traces the failure: (1) the output ignores liability clauses, (2) because the prompt does not specify which clause types to prioritize, (3) because the team assumed the model would know liability is important in contracts, (4) because the team treats the model like a human lawyer who inherently understands priorities, (5) because the team has no structured prompt design methodology. What does this Five Whys analysis reveal as the root cause?

A) The model has a bias toward financial terms and needs fine-tuning to correct its behavior
B) The prompt needs a longer, more detailed context section explaining the importance of liability clauses
C) The root cause is a methodology gap -- the team lacks a structured approach (like CORPS) to make priorities explicit rather than assumed
D) The team should switch to a different AI model that better understands legal documents

**Answer:** C

**Explanation:** The Five Whys traces the failure from symptom (missing liability clauses) to root cause (no structured prompt design methodology). The analysis reveals that the problem is not the model's capability but the team's approach -- they assumed the model would infer priorities rather than making them explicit. CORPS directly addresses this by requiring an explicit Objective and Parameters that would specify which clause types to analyze. A blames the model, but the Five Whys clearly shows the prompt is the problem, not the model's training. B treats the symptom (add more context about liability) rather than the root cause; without a methodology, the team will encounter the same class of problem with every new task. D avoids the actual root cause entirely -- switching models does not fix a prompting methodology gap.

**Task Statement:** 1.3

---

## Question 6
**Scenario:** A team lead tells their department: "Our goal is to achieve HALO on every AI interaction -- we need perfectly written outputs that require no human editing." Is this an accurate description of HALO?

A) Yes -- HALO means the output requires zero human involvement after generation
B) No -- HALO means the output is precisely aligned to the stated objective with minimal waste, not that the output is "perfect" or requires no human review
C) No -- HALO is a measurement score, not a target state, and is calculated using the LAI formula
D) Yes -- HALO is achieved when the model produces the longest, most detailed response possible on the first attempt

**Answer:** B

**Explanation:** HALO (High-Alignment Logical Output) is the target state where the model's response is precisely aligned to the stated objective, logically structured, and produced with minimal waste. It is about getting the right output on the first pass with no unnecessary tokens consumed and no rework required -- the Lean AI equivalent of "right first time." The team lead's description conflates alignment with perfection. A is wrong because HALO does not eliminate human judgment -- it means the output meets the objective without requiring additional prompt iterations or rework, not that humans never review it. C is wrong because HALO is explicitly defined as a target state, not a metric; the LAI score (Module 05) is the measurement tool, and HALO is what you are measuring toward. D describes overproduction, which is the opposite of HALO -- producing the longest possible output maximizes waste rather than eliminating it.

**Task Statement:** 1.4
