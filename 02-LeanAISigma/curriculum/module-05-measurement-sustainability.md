# Module 05 - Measurement, Metrics & Sustainability

## Exam Weighting: 20%

## Objective
Calculate and interpret LAI scores, track the four key efficiency metrics, apply the PDCA cycle to prompt design improvement, and articulate the environmental implications of token waste.

## Task Statements Covered
- 5.1: Calculate and interpret the LAI Score formula
- 5.2: Track and optimize the four key efficiency metrics
- 5.3: Apply the PDCA cycle to prompt design improvement
- 5.4: Articulate the energy and environmental cost of token waste
- 5.5: Design efficiency reports and improvement documentation

## Key Concepts

### 5.1 The LAI Score

The Lean AI Index (LAI) Score is the unified metric for evaluating prompt efficiency. It collapses multiple dimensions of performance into a single number that enables comparison across prompt versions, tasks, and practitioners.

**The formula:**

LAI = Value Output / (Tokens + Cost + Iterations)

Each component is defined as follows:

**Value Output** is a numeric score representing how well the output met the stated objective. It can be scored on a 1-10 scale where 10 means the output perfectly matches all requirements and 1 means it completely fails. The scoring criteria should be based on the CORPS objective: did the output achieve what was specified? Value Output is the numerator because efficiency is meaningless without effectiveness -- a prompt that uses zero waste but produces a useless output has no value.

**Tokens** is the total token consumption across all iterations of the interaction: sum of all input tokens and all output tokens from the first prompt through the final acceptable output. This captures the full resource cost, including rework. A prompt that succeeds in one iteration at 700 tokens scores better than one that requires three iterations at 2,100 total tokens.

**Cost** is the financial cost in the relevant currency unit (dollars, cents, or the normalized cost from the API pricing). Cost correlates with tokens but is not identical because input and output tokens have different prices. Including cost separately from tokens ensures that the metric reflects the economic reality of the interaction, not just the technical resource consumption.

**Iterations** is the number of prompt-response cycles required to achieve the acceptable output. Each iteration beyond the first represents rework waste. A first-pass success has Iterations = 1. Including iterations as a separate denominator component ensures that the LAI score penalizes rework independently from the token cost of rework.

**Interpreting LAI scores:** Higher scores are better. A high LAI score means high value was achieved with low resource expenditure. Comparing LAI scores across prompt versions reveals which version is most efficient. A score of 5.0 produced by Version A (8 value, 500 tokens, $0.01, 1 iteration) versus a score of 1.6 produced by Version B (8 value, 1500 tokens, $0.03, 3 iterations) clearly shows that Version A achieves the same quality at one-third the cost.

**Normalizing components:** Because tokens, cost, and iterations are measured in different units, they need to be normalized for the formula to produce meaningful comparisons. A common normalization approach: divide each by a baseline value (e.g., tokens/1000, cost/0.01, iterations/1) so that each component contributes proportionally to the denominator. The specific normalization factors should be consistent within an organization to enable cross-task comparison.

### 5.2 The Four Key Efficiency Metrics

Beyond the LAI score, four individual metrics provide granular visibility into prompt efficiency. Tracking these metrics over time reveals trends, identifies systemic issues, and validates improvement efforts.

**Tokens per Successful Output** is the total token consumption (input + output, across all iterations) divided by the number of successful outputs. This is the efficiency metric -- how many tokens does it cost to produce one unit of value? Tracking this metric over time reveals whether the organization's prompting efficiency is improving. A declining trend means less waste per output. A flat or increasing trend suggests that improvements in one area are being offset by regression in another.

**Iterations to Completion** is the average number of prompt-response cycles required to produce an acceptable output. This is the cycle time metric in Lean terms. An average of 1.0 means perfect first-pass precision. An average of 3.0 means every task requires two rounds of rework on average. This metric is particularly sensitive to CORPS adoption: organizations that systematically apply the CORPS framework see this metric drop sharply in the first weeks of implementation.

**Time to Completion** is the elapsed time from the first prompt to the final acceptable output. This captures the human side of the efficiency equation: not just how many tokens were consumed but how long the person waited. Time to completion includes model response latency, human evaluation time, and re-prompting time. Unlike tokens (which are precisely measurable), time to completion is influenced by factors outside the prompt's control (model load, network latency, human multitasking), so it is best tracked as a trend rather than an absolute value.

**Efficiency Improvement Percentage** is the Kaizen metric. It measures the percentage improvement in any of the above metrics compared to a baseline. If the baseline tokens-per-output was 2,000 and the current value is 1,200, the efficiency improvement is 40%. This metric is the headline number for reporting the impact of Lean AI practices to stakeholders. It answers the question: "How much better are we doing than before?"

**Dashboard integration:** These four metrics should be displayed together on a dashboard that provides at-a-glance visibility into the organization's AI efficiency. The dashboard should show current values, trend lines over time, and comparison to baselines. Token usage should be broken down by input and output. Cost should be shown as a running total and per-task average. Iterations should be shown as a distribution (histogram of 1-iteration, 2-iteration, 3-iteration tasks) as well as an average.

### 5.3 PDCA Applied to Prompt Design

The Plan-Do-Check-Act (PDCA) cycle, also known as the Deming cycle, is the operational framework for continuous improvement in Lean AI. It transforms prompt optimization from ad hoc trial-and-error into a disciplined, repeatable process.

**Plan** is the analysis and design phase. Before writing or modifying a prompt, analyze the task: What is the objective? What context is needed? What waste patterns are likely? If optimizing an existing prompt, review its current metrics (tokens, iterations, LAI score) and identify the specific waste to eliminate. Design the improved prompt using CORPS principles. Document the hypothesis: "By adding explicit structure and removing redundant context, I expect to reduce iterations from 3 to 1 and tokens by 40%."

**Do** is the execution phase. Execute the designed prompt. Collect metrics: input tokens, output tokens, iterations required, output quality score, and time to completion. Do not optimize during the Do phase -- execute the plan as designed so the results are a clean test of the hypothesis.

**Check** is the evaluation phase. Compare the results to the hypothesis and to the baseline. Did iterations decrease as expected? Did token usage decrease? Did output quality maintain or improve? Calculate the LAI score for the new version and compare to the previous version. If the results match the hypothesis, the improvement is validated. If not, diagnose why: was the hypothesis wrong, was the execution flawed, or did an unexpected factor intervene?

**Act** is the standardization and adjustment phase. If the Check phase validated the improvement, standardize it: update the prompt template, document the change, and communicate the improvement to the team. If the Check phase revealed unexpected results, adjust the approach and begin a new PDCA cycle with a revised hypothesis. The Act phase also identifies the next improvement opportunity -- PDCA is a cycle, not a one-time activity.

**PDCA cadence:** For individual practitioners, PDCA can operate on every significant prompt. For teams, a weekly PDCA review of the team's aggregate metrics identifies systemic improvements. For organizations, monthly PDCA reviews track progress toward efficiency targets. The cadence should match the rate of change -- faster-moving environments benefit from more frequent cycles.

The key discipline of PDCA is documentation. Each cycle should produce a brief record: what was the hypothesis, what was done, what were the results, and what action was taken. This documentation builds an organizational knowledge base of what works and what does not, preventing future practitioners from repeating past mistakes and accelerating the learning curve for new team members.

### 5.4 Energy and Environmental Cost of Token Waste

Every token processed by an AI model requires compute power, and every unit of compute power requires electricity. This creates a direct chain from token waste to energy waste to environmental impact. While individual interactions have negligible energy costs, the aggregate effect at organizational and global scale is significant and growing.

**The compute-energy chain:** When a prompt is sent to an AI model, the request is routed to a data center where GPU clusters process the tokens. Each GPU consumes electricity during processing -- typically 300-700 watts per GPU for modern AI accelerators. A single inference request uses a fraction of a second of GPU time, consuming milliwatts of energy. But AI models process billions of requests per day globally, and the aggregate energy consumption of AI infrastructure is measured in gigawatt-hours per year and growing rapidly.

**Token waste as energy waste:** If 30% of tokens in an organization's AI interactions are waste (redundant instructions, failed iterations, overproduction), then 30% of the energy consumed by those interactions is also waste. At the scale of a single organization running 10,000 prompts per day, this waste is measurable in kilowatt-hours. At the scale of millions of organizations worldwide, it contributes meaningfully to data center energy demand.

**The sustainability dimension:** Data centers are among the fastest-growing consumers of electricity globally. The expansion of AI capabilities is accelerating this growth. Efficient prompting does not solve the macro energy challenge alone, but it contributes to responsible resource usage. An organization that reduces its AI token consumption by 40% through Lean AI practices has reduced its AI-related energy footprint by a proportional amount. This contribution becomes more significant as AI adoption scales.

**Grid impact awareness:** AI compute demand creates load on electrical grids, particularly in regions with concentrated data center infrastructure. Peak AI usage periods contribute to peak grid demand, which is typically served by the least efficient and most carbon-intensive power sources (peaker plants). Reducing unnecessary AI compute reduces grid strain and the associated carbon emissions.

**The practitioner's responsibility:** Green Belt practitioners are not expected to calculate their personal energy footprint from AI usage -- the per-interaction numbers are too small to be meaningful. What practitioners are expected to understand is the principle: efficiency matters beyond cost savings. Eliminating token waste is not just about saving money (though it does that too). It is about using computational resources responsibly, recognizing that those resources are finite and have environmental costs. This awareness should inform prompting habits: not as a guilt mechanism, but as an additional reason to pursue the efficiency improvements that already make sense from a cost and quality perspective.

### 5.5 Certification Deliverables and Reporting

Green Belt certification requires demonstrating practical competence through four deliverables. Each deliverable provides evidence that the learner can apply Lean AI principles to real-world tasks, not just answer assessment questions.

**Deliverable 1: Before/After Prompt Comparison.** Select a real-world task that you perform regularly with AI. Document the current ("before") prompt, its token count, its typical iteration count, and the quality of its output. Apply CORPS to redesign the prompt. Document the redesigned ("after") prompt, its token count, its iteration count, and the quality of its output. The certification requirement is a minimum 30% reduction in total tokens consumed per successful output, with output quality maintained or improved.

**Deliverable 2: Token Usage Analysis.** For a set of at least 10 AI interactions, document the input tokens, output tokens, iterations, and cost for each. Calculate the average tokens per successful output, the average iterations to completion, and the total cost. Identify the top three sources of waste across the set (e.g., overproduction in output, redundant context in input, high iteration count for certain task types). Propose specific CORPS-based improvements for each waste source.

**Deliverable 3: Efficiency Improvement Report.** Using the metrics framework from this module, produce a report showing the improvement trajectory over a defined period (minimum one week). The report should include: baseline metrics, intervention description (what CORPS techniques were applied), post-intervention metrics, LAI scores for before and after, and the efficiency improvement percentage. The report should conclude with recommendations for further optimization.

**Deliverable 4: Energy and Grid Impact Reflection.** Write a 250-500 word reflection on the environmental implications of token waste. The reflection should demonstrate understanding of the compute-energy chain, provide a concrete example of how your efficiency improvements reduce energy consumption, and articulate how Lean AI practices contribute to responsible AI usage. This deliverable tests conceptual understanding and the ability to connect individual actions to systemic impacts.

**Portfolio assembly:** The four deliverables together form the Green Belt certification portfolio. They demonstrate the progression from understanding waste (Deliverable 1), to measuring it systematically (Deliverable 2), to improving it over time (Deliverable 3), to contextualizing it in the broader environmental picture (Deliverable 4). This progression mirrors the PDCA cycle: Plan (understand), Do (measure), Check (improve), Act (reflect and standardize).
