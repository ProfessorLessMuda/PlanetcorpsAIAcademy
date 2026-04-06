# Domain 5 Assessment - Measurement, Metrics & Sustainability

## Question 1
**Scenario:** A content team is evaluating two versions of a product description prompt. Version A scores 9 for Value Output, uses 800 total tokens, costs $0.02, and completes in 1 iteration. Version B scores 8 for Value Output, uses 2,400 total tokens, costs $0.06, and completes in 3 iterations. Using the normalization factors tokens/1000, cost/0.01, and iterations/1, which version has the higher LAI score and what does the comparison reveal?

A) Version A: LAI = 9 / (0.8 + 2 + 1) = 2.37; Version B: LAI = 8 / (2.4 + 6 + 3) = 0.70 -- Version A is over 3x more efficient while delivering higher quality
B) Version A: LAI = 9 / (800 + 0.02 + 1) = 0.011; Version B: LAI = 8 / (2400 + 0.06 + 3) = 0.003 -- the raw numbers show Version A is slightly better
C) Both versions have similar LAI scores because Version B's lower Value Output is offset by its additional iterations, which indicate thoroughness
D) LAI scores cannot be compared across versions because the iteration counts differ, making the normalization invalid

**Answer:** A

**Explanation:** Applying the LAI formula with normalization (tokens/1000, cost/0.01, iterations/1), Version A produces LAI = 9 / (0.8 + 2.0 + 1.0) = 2.37 and Version B produces LAI = 8 / (2.4 + 6.0 + 3.0) = 0.70. Version A achieves both higher quality and dramatically lower resource consumption, making it over three times more efficient. Option B fails to normalize the components, which makes the denominator meaninglessly large and dominated by the token count alone. Option C misinterprets iterations as thoroughness when they actually represent rework waste. Option D is incorrect because the entire purpose of LAI normalization is to enable cross-version comparison regardless of differing metrics.

**Task Statement:** 5.1

---

## Question 2
**Scenario:** A data analyst runs a prompt that scores LAI = 0.45. The prompt achieves a Value Output of 7 out of 10, uses 4,200 total tokens across all iterations, costs $0.12, and requires 4 iterations. The analyst asks you what the low LAI score tells them about their prompt design.

A) The Value Output score of 7 is dragging the LAI down; the analyst should focus on improving output quality since the denominator metrics are acceptable
B) The high iteration count is the primary driver of the low score because each iteration compounds token cost and rework time, indicating the prompt lacks first-pass precision from missing or unclear CORPS elements
C) The cost component is too high relative to the task value, suggesting the analyst should switch to a cheaper model
D) The LAI formula is producing a misleadingly low score because 0.45 is within normal range for analytical tasks

**Answer:** B

**Explanation:** With 4 iterations, the analyst's prompt is failing to achieve first-pass success. Each additional iteration multiplies both the token count (contributing to the 4,200 total) and cost ($0.12), while also adding directly to the denominator as a separate component. The iteration count signals that the original prompt likely has unclear objectives, insufficient context, or missing structure -- gaps in CORPS elements that force repeated rework. Option A misidentifies the problem; a Value Output of 7 is reasonable, and improving it from 7 to 10 would only modestly increase the score compared to cutting iterations from 4 to 1. Option C treats cost as an independent variable when it is actually a downstream consequence of the iteration problem. Option D invents a "normal range" concept that does not exist -- LAI scores are meaningful only in comparison to baselines and alternative versions, not as absolute thresholds.

**Task Statement:** 5.1

---

## Question 3
**Scenario:** An operations manager reviews the team's AI efficiency dashboard and notices that the "tokens per successful output" metric has remained flat at 1,800 for the past month despite CORPS training being completed three weeks ago. However, the "iterations to completion" metric dropped from 2.8 to 1.4 over the same period.

Which type of waste does the flat tokens-per-output metric most likely indicate?

A) Defect waste -- the outputs still contain errors that require manual correction after delivery
B) Overproduction waste -- prompts now succeed on the first pass but still generate far more output than the task requires, offsetting the token savings from fewer iterations
C) Waiting waste -- the team is spending too much idle time between interactions
D) Underutilized talent waste -- the model is being assigned roles below its capability level

**Answer:** B

**Explanation:** The iterations-to-completion drop from 2.8 to 1.4 confirms that CORPS training improved first-pass precision, which should have reduced total tokens. The fact that tokens per successful output stayed flat at 1,800 despite halving the iteration count means each individual prompt-response cycle is now consuming significantly more tokens. The most likely explanation is overproduction: prompts lack output constraints (length, format, scope), so the model generates excessive content on each pass. The token savings from fewer iterations are being consumed by bloated single-pass outputs. Option A is unlikely because defect waste would show up as increased iterations, not flat tokens. Option C measures time, not tokens, and would not explain the metric pattern. Option D describes a capability mismatch that would not directly produce this specific metric signature.

**Task Statement:** 5.2

---

## Question 4
**Scenario:** A team lead examines the efficiency dashboard and sees the following three-month trend: iterations to completion dropped from 3.1 to 1.3, tokens per successful output dropped from 2,200 to 1,100, but time to completion increased from 4.2 minutes to 5.8 minutes average. The team lead is confused because the first two metrics show clear improvement while the third is getting worse.

What does this trend data most likely reveal?

A) The efficiency improvements are illusory -- if time to completion is increasing, the other metrics must be measured incorrectly
B) The team is spending more time designing prompts upfront using CORPS, which increases pre-submission time but pays off in reduced iterations and tokens -- this is the expected Lean AI tradeoff of investing thinking time to eliminate waste downstream
C) The model's response latency has increased due to API throttling, making time to completion an unreliable metric that should be removed from the dashboard
D) The team has become over-reliant on single-turn interactions, which take longer because they cannot leverage multi-turn refinement

**Answer:** B

**Explanation:** This is the classic Lean AI tradeoff in action. Time to completion includes human thinking time before submission, not just model response time. When practitioners adopt CORPS, they invest more time upfront designing precise prompts -- analyzing the task, selecting appropriate context, defining clear objectives, and specifying structure. This front-loaded thinking time increases the total elapsed time but dramatically reduces iterations (3.1 to 1.3) and total tokens (2,200 to 1,100). The net result is significant efficiency gains despite the longer clock time. Option A incorrectly assumes all three metrics must move in the same direction. Option C invents an external cause without evidence and dismisses a valuable metric. Option D is backwards -- the reduced iterations show that single-turn success is exactly what improved, which is the goal.

**Task Statement:** 5.2

---

## Question 5
**Scenario:** A prompt engineer redesigns a customer email generation prompt using CORPS. Before testing, she documents: "By adding explicit role assignment and output structure, I expect to reduce iterations from 3 to 1 and cut tokens by 45%." She then runs the new prompt five times, collects metrics on each run, and calculates that iterations dropped to 1.2 average and tokens decreased by 38%.

Which phase of the PDCA cycle is the engineer currently in when she compares her results to the documented hypothesis?

A) Plan -- she is analyzing the task and forming her improvement strategy
B) Do -- she is executing the improved prompt and collecting data
C) Check -- she is comparing actual results against the hypothesis and baseline to determine whether the improvement was validated
D) Act -- she is standardizing the improvement and communicating it to the team

**Answer:** C

**Explanation:** The Check phase is specifically about comparing results to the hypothesis and to the baseline. The engineer has already completed Plan (when she analyzed the waste and documented her hypothesis) and Do (when she executed the prompt and collected metrics). She is now in Check: evaluating whether the actual results (1.2 iterations, 38% token reduction) match her predictions (1 iteration, 45% reduction). The results are close but not exact, which is normal -- the Check phase would then diagnose why iterations did not quite reach 1.0 and why token reduction fell short of 45%. Option A is incorrect because planning was completed when the hypothesis was documented. Option B is incorrect because execution and data collection are already done. Option D has not started yet -- standardization depends on the Check phase confirming the improvement is valid.

**Task Statement:** 5.3

---

## Question 6
**Scenario:** A sustainability-focused CTO learns that her organization sends approximately 50,000 AI prompts per day. An internal audit reveals that 35% of tokens across these interactions are waste -- redundant instructions, failed iterations, and overproduction. The CTO asks what this means in environmental terms.

Which statement most accurately connects the organization's token waste to environmental impact?

A) The 35% token waste directly translates to 35% higher carbon emissions for the organization's AI operations because every wasted token generates a proportional amount of CO2
B) Token waste at this scale contributes to data center energy demand because each token requires GPU compute cycles that consume electricity, and the aggregate waste across 50,000 daily prompts creates measurable energy consumption that could be reduced through Lean AI practices
C) The environmental impact is negligible because individual prompts consume only milliwatts of energy, so even 50,000 prompts per day produce no meaningful grid impact
D) The organization should offset its token waste by purchasing carbon credits rather than trying to reduce token consumption, which would slow down productivity

**Answer:** B

**Explanation:** This answer correctly traces the compute-energy chain: tokens require GPU processing, GPUs consume electricity, and at organizational scale (50,000 prompts/day with 35% waste), the aggregate energy consumption becomes measurable. Reducing token waste reduces the compute load and the associated energy footprint. Option A oversimplifies by claiming a direct proportional relationship between tokens and carbon -- the actual relationship depends on data center energy sources, GPU utilization patterns, and grid carbon intensity, which vary. Option C correctly notes that individual interactions are small but incorrectly dismisses the aggregate effect -- this is precisely the scale argument that makes organizational efficiency meaningful. Option D treats waste as inevitable rather than addressable, which contradicts the core Lean principle that waste should be eliminated at the source.

**Task Statement:** 5.4

---

## Question 7
**Scenario:** A Green Belt candidate submits her certification portfolio for review. It contains: (1) a before/after prompt comparison showing a 25% token reduction with quality maintained, (2) a token usage analysis covering 15 interactions with waste sources identified, (3) an efficiency improvement report with baseline and post-intervention LAI scores over two weeks, and (4) an energy reflection essay of 180 words connecting her improvements to responsible AI usage.

Which deliverable fails to meet the certification requirements?

A) Deliverable 1, because a 25% token reduction does not meet the minimum 30% reduction threshold
B) Deliverable 2, because 15 interactions exceeds the required minimum of 10 and suggests the candidate is padding her portfolio
C) Deliverable 3, because two weeks exceeds the minimum one-week reporting period, making the data unreliable
D) Deliverable 4, because the 180-word reflection falls below the required 250-500 word range and may not demonstrate sufficient depth of understanding

**Answer:** A

**Explanation:** The certification requirement for Deliverable 1 is a minimum 30% reduction in total tokens consumed per successful output with quality maintained or improved. A 25% reduction, while a meaningful improvement, falls short of this threshold. The candidate would need to further optimize her prompt or select a different task where she can achieve the 30% minimum. Option B is incorrect because 15 interactions exceeds the minimum of 10, which is acceptable -- more data strengthens the analysis. Option C is incorrect because two weeks exceeds the minimum of one week, which provides more data points and is preferable. Option D identifies a real issue -- 180 words is below the 250-word minimum -- but the question asks which deliverable "fails to meet certification requirements," and while both A and D have issues, Option A represents a hard quantitative threshold that is clearly unmet. Note: in a real review, the candidate would also need to address the short reflection.

**Task Statement:** 5.5
