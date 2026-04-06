# Module 02 - CORPS Framework & Prompt Design

## Exam Weighting: 25%

## Objective
Master the CORPS framework (Context, Objective, Role, Parameters, Structure) as the primary tool for constructing efficient, high-alignment prompts that minimize waste and maximize first-pass accuracy.

## Task Statements Covered
- 2.1: Apply the Context element to scope relevant background information
- 2.2: Write precise Objectives that eliminate ambiguity
- 2.3: Assign effective Roles that leverage model capabilities
- 2.4: Define Parameters that constrain output without over-specifying
- 2.5: Design Structure templates for repeatable prompt patterns
- 2.6: Integrate all CORPS elements into a complete prompt

## Key Concepts

### 2.1 Context: What the AI Needs to Know

Context is the background information the model needs to produce an aligned output. It answers the question: "What does the model need to understand about the situation before it can do its job?" Context is the first element of CORPS because everything that follows depends on it. A precise objective is useless if the model does not understand the domain it applies to. A well-chosen role is wasted if the model lacks the situational awareness to perform that role effectively.

The critical skill in context design is deciding what to include versus what to exclude. Too little context produces defect waste -- the model guesses at missing information and guesses wrong. Too much context produces excess inventory waste -- tokens consumed by irrelevant background that dilutes the model's focus and inflates cost. The target is just-enough context: every piece of information included must serve the objective, and every piece excluded must be genuinely unnecessary for the task.

Context can be categorized into three tiers. **Essential context** is information without which the task cannot be completed correctly -- for example, the target audience for a marketing post, the programming language for a code task, or the specific product being described. Essential context must always be included. **Helpful context** improves output quality but is not strictly necessary -- for example, brand voice guidelines, competitive landscape, or previous versions of similar work. Helpful context should be included when token budget allows and excluded when efficiency is the priority. **Background context** provides general knowledge that the model likely already has -- for example, explaining what a LinkedIn post is, or defining common industry terms. Background context is almost always waste and should be excluded.

A practical test for context relevance: for each piece of information you are about to include, ask "If I removed this, would the output quality measurably decline?" If the answer is no, remove it. If the answer is "maybe," test both versions and compare. This empirical approach prevents the common error of including context "just in case," which is the prompting equivalent of carrying excess inventory.

### 2.2 Objective: What Success Looks Like

The Objective is the single most important element of CORPS because it defines what the model is trying to achieve. In Lean terms, the objective is the pull signal -- it defines the value the customer (you) is requesting, and everything else in the prompt exists to serve it. A vague objective is the single largest source of defect waste in AI interactions.

An effective objective has four properties. It is **specific** (identifies exactly what deliverable is expected), **measurable** (defines criteria that can be used to evaluate whether the output succeeded), **singular** (addresses one task, not a bundle of tasks), and **actionable** (tells the model what to do, not what to think about). Compare these two objectives:

Vague: "Write something about marketing."
CORPS: "Write a 150-word LinkedIn post on AI cost optimization trends for B2B SaaS decision-makers."

The vague objective fails all four tests. It is not specific (what kind of "something"?), not measurable (how would you know if it succeeded?), not singular (marketing is a vast topic), and not actionable ("something" is not a deliverable format). The CORPS objective is specific (LinkedIn post), measurable (150 words, on a named topic, for a defined audience), singular (one post, one topic), and actionable (write).

The connection between objective precision and iteration count is direct and measurable. A vague objective almost guarantees multiple iterations because the first output is unlikely to match the user's unstated expectations. Each iteration costs tokens and time. A precise objective front-loads the thinking time into prompt design (which is free in token terms) and dramatically reduces iteration count. This is the fundamental Lean AI tradeoff: invest more time thinking upfront to eliminate waste downstream.

Compound objectives -- prompts that ask for multiple deliverables -- are a common source of defect waste. When a prompt asks "write a blog post and suggest five headlines," the model must split its attention between two tasks with different requirements. The blog post may be excellent but the headlines weak, or vice versa. Single-piece flow (one objective per prompt) produces higher-quality results and makes it easier to diagnose failures when they occur.

### 2.3 Role: Who the AI Should Act As

Role assignment is a context compression mechanism. Instead of writing a paragraph explaining the expertise, perspective, and priorities you want the model to apply, you can assign a role and let the model's training fill in those details. "Act as a B2B SaaS marketer" compresses an enormous amount of context into seven words: the model understands the vocabulary, priorities, communication style, and audience expectations associated with that role.

Effective role assignment follows three principles. **Specificity** -- "B2B SaaS marketer" is better than "marketer" which is better than "expert." The more specific the role, the more precisely the model calibrates its output. **Relevance** -- the assigned role must match the task. Assigning a "data scientist" role for a marketing copy task creates a mismatch that degrades output quality. **Capability leverage** -- the role should enable the model to apply capabilities it has but might not use by default. Assigning a "senior editor" role for a writing task activates the model's knowledge of editorial standards, concision, and audience awareness that a generic response would not emphasize.

Role assignment can also be a source of waste when misapplied. Assigning a role when the task does not benefit from one adds unnecessary tokens. Simple tasks like "convert this list to a table" or "translate this sentence to Spanish" do not benefit from role assignment because there is no expertise to activate. The role element of CORPS is optional, not mandatory -- it should be used when it adds value and omitted when it does not. Applying CORPS does not mean forcing all five elements into every prompt; it means using the elements that serve the objective and omitting those that would be waste.

When to assign a role versus when to skip it: assign a role when the task requires domain expertise (writing, analysis, design, strategy), when the output quality depends on perspective (customer-facing vs. internal, technical vs. non-technical), or when the default model behavior is too generic for the context. Skip the role when the task is mechanical (formatting, conversion, extraction), when the objective is already sufficiently specific, or when the role would not change the output.

### 2.4 Parameters: Constraints on the Output

Parameters are the guardrails that constrain the model's output. They answer: "What are the boundaries within which the model should operate?" Parameters prevent overproduction (by setting length limits), over-processing (by scoping the depth of analysis), and defects (by specifying format, tone, and audience).

The four primary parameter categories are **length** (word count, paragraph count, or page count), **tone** (professional, casual, technical, conversational), **format** (paragraph, bullet list, table, JSON), and **audience** (technical experts, executives, general public). Each parameter narrows the model's output space, reducing the probability of a first-pass miss.

The tradeoff between tight parameters and creative utility is important. Over-specifying parameters (exact word count, rigid structure, prescribed sentence patterns) can produce stilted, mechanical output that technically meets the constraints but lacks quality. Under-specifying leaves too much to the model's discretion and increases the probability of misalignment. The goal is to specify parameters at the level where they prevent waste without constraining quality.

A practical guideline: specify parameters for any output attribute that, if wrong, would require rework. If receiving a 500-word response when you needed 150 words would require a re-prompt, then the length parameter is justified. If receiving a formal tone when you needed casual would require a re-prompt, then the tone parameter is justified. If you genuinely do not care about a particular attribute (you would accept any reasonable length, any appropriate tone), then specifying that parameter is unnecessary tokens -- waste.

Parameters interact with roles. A role of "B2B SaaS marketer" already implies professional tone, data-driven content, and business vocabulary. Explicitly re-specifying "use professional tone" after assigning that role is redundant and wastes tokens. Effective CORPS design recognizes these interactions and avoids duplicating information across elements.

### 2.5 Structure: Output Format

Structure defines how the model should organize its response. It is the blueprint for the deliverable. A well-defined structure eliminates rework caused by the model choosing an unhelpful format (paragraphs when you needed bullet points, a narrative when you needed a table, an essay when you needed a checklist).

Structure can be specified at multiple levels of detail. **High-level structure** defines the overall format: "Respond with a numbered list," "Use a markdown table with columns for X, Y, Z," or "Structure as: Introduction, Analysis, Recommendation." **Detailed structure** provides a template: "For each item, include: Name, Description (1-2 sentences), Pros, Cons, Recommendation." **Example-driven structure** shows a sample of the desired format and tells the model to follow it.

Reusable prompt templates are standardized work in Lean terms. When an organization repeatedly performs the same type of task (generating weekly reports, writing customer emails, analyzing data), creating a CORPS template for that task type eliminates the waste of redesigning the prompt from scratch each time. A template captures the proven structure, parameter set, and context requirements so that users only need to fill in the variable parts (the specific data, topic, or customer). Templates enforce consistency across team members and reduce the skill gap between experienced and novice prompt designers.

Structure is the CORPS element most directly responsible for preventing overproduction and defect waste. Without structure, the model decides how to organize the response, and its default choice may not match the user's needs. With structure, the model follows the specified blueprint, and the output shape is predictable. Structure also makes outputs easier to parse and act on -- a structured response with clear sections, labels, and formatting is immediately useful, while an unstructured narrative requires the reader to extract the relevant information.

### 2.6 Integrating All CORPS Elements

Assembling the five CORPS elements into a complete prompt is where the framework delivers its value. The integration process follows a natural flow: Context establishes the situation, Objective states the goal, Role defines the persona, Parameters set the boundaries, and Structure specifies the deliverable format. Not every prompt needs all five elements -- simpler tasks may only need Objective and Structure, or Objective and Parameters.

**Example: Inefficient prompt (before CORPS)**

"Write something about marketing."

This 5-word prompt will produce an output, but it will almost certainly require multiple iterations to get something useful. It has no context (marketing for what industry, product, or audience?), no measurable objective (what kind of deliverable?), no role (from whose perspective?), no parameters (how long, what tone?), and no structure (what format?).

**Example: CORPS-optimized prompt**

"[Context] Our company sells AI-powered analytics tools to mid-market B2B companies. We are launching a new cost optimization feature next month. [Objective] Write a LinkedIn post announcing the upcoming feature launch. [Role] Act as our head of product marketing. [Parameters] 150 words maximum, professional but approachable tone, include one actionable insight for the reader. [Structure] Hook (1 sentence), Value proposition (2-3 sentences), Actionable insight (1 sentence), CTA (1 sentence)."

This prompt is longer in absolute token terms but will almost certainly produce a usable output on the first pass. The total token expenditure (one well-designed prompt plus one aligned output) is far less than the original prompt's likely three to four iterations of vague prompts and misaligned outputs.

The order of CORPS elements in the prompt is flexible, but research and practice suggest that placing Context and Role early (they shape how the model interprets everything that follows) and Objective and Structure later (they define the specific deliverable) produces the most consistent results. Parameters can appear anywhere but are typically most effective adjacent to the element they constrain (length parameters near the objective, format parameters near the structure).

A common mistake in CORPS integration is treating it as a rigid template that must include all five elements with explicit labels. CORPS is a framework, not a form. An experienced practitioner can write a CORPS-complete prompt without ever using the words "Context," "Objective," "Role," "Parameters," or "Structure." The elements are present in the content and organization of the prompt, not in the labeling. Forcing explicit labels when they add no value is itself unnecessary token waste.
