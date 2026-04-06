# Domain 2 Assessment - CORPS Framework & Prompt Design

## Question 1
**Scenario:** A developer is writing a prompt to generate API documentation for a REST endpoint. They include the following context: (1) the endpoint URL and HTTP method, (2) the request/response JSON schemas, (3) a paragraph explaining what REST APIs are, (4) the company's founding year and mission statement, and (5) the target audience (junior developers onboarding to the team). Using context tiering, which items are essential context and which are waste?

A) All five items are essential -- more context always produces better outputs
B) Items 1, 2, and 5 are essential; item 3 is background waste (the model knows what REST APIs are); item 4 is irrelevant waste
C) Only items 1 and 2 are essential; everything else is unnecessary because the model can infer audience and format
D) Items 1, 2, 3, and 5 are essential; only item 4 is waste because company history adds brand context

**Answer:** B

**Explanation:** Context tiering classifies information into essential (task cannot be completed correctly without it), helpful (improves quality but not strictly necessary), and background (general knowledge the model already has). The endpoint URL/method (1) and JSON schemas (2) are essential -- without them, the documentation cannot be written. The target audience (5) is essential because "junior developers onboarding" directly affects vocabulary, detail level, and what to explain versus assume. Explaining what REST APIs are (3) is background waste -- the model's training already includes this knowledge, so including it consumes tokens for zero value. The company founding year and mission statement (4) is irrelevant to API documentation and is pure waste. A is wrong because the context relevance test asks "if I removed this, would output quality decline?" -- removing items 3 and 4 would not degrade quality. C is wrong because audience (item 5) is essential, not inferable; "junior developers onboarding" versus "senior architects" would produce very different documentation. D is wrong because explaining REST to an AI model is textbook background waste.

**Task Statement:** 2.1

---

## Question 2
**Scenario:** A recruiter pastes an entire 4,000-token employee handbook into a prompt and asks the AI to "write a job posting for a senior engineer based on our company values." The output is generic, vaguely references "innovation" and "teamwork," and misses the specific technical requirements the recruiter expected. What is the primary problem?

A) The model cannot process 4,000 tokens of input effectively
B) Excess context inventory -- the large volume of irrelevant handbook content diluted the model's focus, causing it to latch onto generic themes instead of the specific information needed for the job posting
C) The prompt is missing a Role element, which would have fixed the output quality
D) The model needs fine-tuning on HR content to produce better job postings

**Answer:** B

**Explanation:** This is excess context inventory waste. The 4,000-token handbook contains information about every company policy, benefit, and value, but a job posting for a senior engineer only needs specific technical requirements, team details, and relevant cultural values. The massive context block dilutes the model's attention across irrelevant material, causing it to surface generic themes (innovation, teamwork) rather than the specific details buried somewhere in the handbook. A is wrong because modern models can handle 4,000 tokens easily -- the issue is not capacity but signal-to-noise ratio. The model processed the tokens fine; it just could not distinguish what mattered from what did not because the prompt gave no guidance. C incorrectly identifies the fix; while a role might help, the core problem is that the model was flooded with irrelevant context that drowned out the signal. Adding a role on top of 4,000 tokens of noise does not solve the fundamental problem. D blames the model when the prompt design is the issue -- the same model with a focused 300-token context containing only relevant requirements would likely produce a much better result.

**Task Statement:** 2.1

---

## Question 3
**Scenario:** A project manager writes the following objective in their prompt: "Help me with the quarterly report." Which property of an effective objective does this most critically lack?

A) Measurable -- there is no way to evaluate whether the output succeeded
B) Specific -- "help me with" does not identify what deliverable is expected
C) Singular -- quarterly reports contain multiple sections, making this a compound task
D) Actionable -- "help" is not a concrete action the model can execute

**Answer:** B

**Explanation:** The most critical failure is specificity. "Help me with the quarterly report" does not identify what deliverable the user expects -- should the model write the entire report, draft an outline, analyze data for one section, proofread an existing draft, or suggest improvements? The model cannot produce an aligned output because the output itself is undefined. D is a plausible distractor because "help" is indeed vague, but actionability means "tells the model what to do" -- the deeper problem is that even replacing "help" with a verb like "write" would still leave the objective non-specific (write what part? in what format?). A is partially true but secondary; you cannot measure success when you have not defined what success looks like, and that definition is specificity. C is partially valid since quarterly reports have multiple sections, but the prompt does not actually ask for the full report -- it says "help me with," which could refer to a single task. The most fundamental gap is that no one, including the model, can determine what deliverable is being requested.

**Task Statement:** 2.2

---

## Question 4
**Scenario:** A data analyst needs to convert a CSV dataset into a markdown table. They are considering whether to include a Role element in their CORPS prompt. Which approach is correct?

A) Assign "Act as a senior data analyst" to ensure the table is formatted with analytical best practices
B) Assign "Act as a markdown formatting expert" to ensure correct markdown syntax
C) Skip the role assignment -- converting CSV to a markdown table is a mechanical transformation that does not benefit from domain expertise or perspective
D) Assign "Act as a technical writer" to ensure the table is readable and well-organized

**Answer:** C

**Explanation:** CSV-to-markdown conversion is a mechanical transformation task with a deterministic correct output. The role element should be used when the task requires domain expertise, depends on perspective, or when default model behavior is too generic. None of those conditions apply here: the task is format conversion with no judgment, expertise, or perspective involved. A is wrong because "senior data analyst" activates analytical reasoning capabilities that are irrelevant to a formatting task -- it does not change how a table is rendered and adds unnecessary tokens. B sounds targeted but is still waste; the model already knows markdown syntax, and a role assignment does not improve mechanical accuracy. D is wrong for the same reason -- technical writing expertise affects content decisions (what to emphasize, how to explain), not mechanical format conversion. Every unnecessary role assignment is wasted tokens, violating the CORPS principle that elements should be used when they add value and omitted when they do not.

**Task Statement:** 2.3

---

## Question 5
**Scenario:** A prompt includes the following elements: "[Role] Act as a B2B SaaS content strategist. [Parameters] Use professional tone, include data-driven insights, and write for a business audience familiar with SaaS terminology." A reviewer flags potential waste in this prompt. What is the issue?

A) The role and parameters conflict, which will confuse the model and produce inconsistent output
B) The parameters are redundant with the role -- "B2B SaaS content strategist" already implies professional tone, data-driven approach, and SaaS-literate audience, making those explicit parameters unnecessary token waste
C) The role is too specific and should be broadened to "content writer" to give the model more flexibility
D) Parameters should never be used alongside a role assignment because they serve the same function

**Answer:** B

**Explanation:** The role "B2B SaaS content strategist" already encodes professional tone (B2B communication norms), data-driven insights (strategists rely on data), and SaaS-audience awareness (the role inherently targets that audience). Re-specifying these as explicit parameters duplicates information the model already activated through role assignment, wasting tokens without improving output quality. This is a parameter-role interaction -- effective CORPS design recognizes when a role implicitly covers parameter territory and avoids the redundancy. A is wrong because the elements do not conflict; they are simply redundant. Redundancy wastes tokens but does not cause model confusion. C is wrong because broadening the role would remove the specificity that makes role assignment valuable in the first place -- "content writer" is too generic to activate the domain-specific behavior the user needs. D is categorically false; parameters and roles serve different functions (roles set perspective, parameters set constraints) and frequently complement each other. The issue is specifically when a parameter restates what a role already implies.

**Task Statement:** 2.4

---

## Question 6
**Scenario:** A team needs to generate weekly client status reports that follow a consistent format. Each report must include: project name, status (on track / at risk / blocked), key accomplishments (2-3 bullets), upcoming milestones (2-3 bullets), and risks or blockers. The team currently writes free-form prompts each week and reformats the output manually. What level of structure specification is most appropriate?

A) High-level structure: "Respond in a professional report format with sections for status, accomplishments, and next steps"
B) Detailed structure with a template: "For each report, use this format: Project Name, Status [on track/at risk/blocked], Key Accomplishments (2-3 bullets), Upcoming Milestones (2-3 bullets), Risks/Blockers"
C) No structure specification -- let the model decide the best format since it handles reports well
D) Example-driven structure: provide a 500-word sample report and instruct the model to replicate the format exactly

**Answer:** B

**Explanation:** A detailed template is the correct level for this task because the team needs repeatable, consistent formatting across weekly reports -- this is standardized work in Lean terms. The template captures the exact sections, field types, and bullet count constraints so every report follows the same structure regardless of who writes the prompt. A is too vague -- "professional report format" leaves section naming, ordering, and detail level to the model's discretion, which produces inconsistent outputs across weeks and team members and defeats the purpose of standardization. C guarantees inconsistency; without structure, each week's report will have a different format, requiring the manual reformatting the team is trying to eliminate. D is wasteful -- a 500-word example consumes far more tokens than the template in B while achieving the same result. Example-driven structure is appropriate when the format is difficult to describe in words (complex visual layouts, unusual formatting), not when the format can be specified concisely as a template.

**Task Statement:** 2.5

---

## Question 7
**Scenario:** A user writes the following prompt: "You are an experienced financial analyst. Our company had $2.3M revenue in Q3, up 12% from Q2. Write about our quarterly performance for investors." A reviewer evaluates this prompt against the CORPS framework. Which CORPS element is most critically missing?

A) Context -- the prompt provides no background about the company
B) Objective -- "write about our quarterly performance" does not specify a deliverable format, length, or success criteria
C) Parameters -- there are no constraints on tone, length, or audience
D) Structure -- the prompt does not specify how the output should be organized

**Answer:** B

**Explanation:** The Objective is the most critically missing element. "Write about our quarterly performance" fails the specificity and measurability tests: it does not specify what deliverable is expected (a full report? an executive summary? a letter? a slide deck script?), how long it should be, or what counts as success. Without a clear objective, the model has no pull signal -- it does not know what the user actually wants and will produce a generic response that likely requires rework. Context (A) is actually partially present -- the $2.3M revenue and 12% growth are relevant context. While more context could help, the prompt has enough data to work with. Parameters (C) are missing, but parameters serve the objective; without knowing what the deliverable is, you cannot meaningfully set constraints on it. Structure (D) is also missing, but again, you cannot define output structure without first defining what you are structuring. The Objective is the foundational element that everything else serves -- fixing it first would clarify what parameters and structure are needed.

**Task Statement:** 2.6

---

## Question 8
**Scenario:** A marketing team currently uses this prompt: "Write a blog post about AI trends." They want to rewrite it using the full CORPS framework. Which rewrite best applies all CORPS elements?

A) "[Context] AI is a growing field. [Objective] Write a great blog post. [Role] Be an expert. [Parameters] Make it professional. [Structure] Use headings."
B) "[Context] Our company provides AI-powered supply chain tools to mid-market manufacturers. [Objective] Write a 600-word blog post arguing that predictive demand forecasting will be the most impactful AI trend for manufacturers in 2026. [Role] Act as our VP of Product Marketing. [Parameters] 600 words, authoritative but accessible tone, include one customer-relevant statistic. [Structure] Hook (2 sentences), Trend overview (1 paragraph), Why it matters for manufacturers (2 paragraphs), CTA to download our whitepaper (1 sentence)."
C) "[Context] Our company provides AI-powered supply chain tools to mid-market manufacturers. We've been growing at 40% year over year. Our competitors include SupplyAI, ChainOptix, and LogiSense. The AI market is projected to reach $500B by 2027. Our CEO gave a keynote at TechSummit last year. [Objective] Write a blog post about AI trends that will go viral and generate thousands of leads. [Role] Act as the world's best marketer. [Parameters] Make it the best blog post ever written. [Structure] Surprise me with something creative."
D) "Act as our VP of Product Marketing. Write a 600-word blog post about predictive demand forecasting for manufacturers. Use an authoritative but accessible tone with headings."

**Answer:** B

**Explanation:** B demonstrates proper integration of all five CORPS elements. The Context provides relevant company and audience information (supply chain tools, mid-market manufacturers) without excess inventory. The Objective is specific (blog post), measurable (600 words, one topic, one argument), singular (one post, one trend), and actionable (write). The Role is specific and relevant (VP of Product Marketing). The Parameters constrain length, tone, and content requirements without over-specifying. The Structure provides a clear template with section-level detail. A fails because every element is vague -- "AI is a growing field" is background waste, "great blog post" is not measurable, "be an expert" is not a specific role, "make it professional" is not a meaningful constraint, and "use headings" is minimal structure. C loads excessive context (competitor names, CEO keynote, market projections that are not relevant to the post), sets an unmeasurable objective ("go viral"), uses a non-specific role ("world's best marketer"), provides no real parameters ("best ever" is not a constraint), and abandons structure entirely. D is a reasonable prompt but does not demonstrate full CORPS integration -- it lacks explicit Context (no company or audience information) and has minimal Structure (just "headings" rather than a section blueprint). B is the only option where all five elements are present, precise, and working together without redundancy or waste.

**Task Statement:** 2.6
