# Domain 3 Assessment - Claude Code Configuration & Workflows

## Question 1
**Scenario:** A development team wants to enforce a coding standard that every TypeScript file must use strict null checks. The standard should apply to all team members working on the project and be version-controlled. One senior developer also has personal preferences for verbose logging during debugging sessions that should not affect other team members. Where should each configuration be placed?

A) Team standard in `~/.claude/CLAUDE.md`; personal preference in `.claude/CLAUDE.md`
B) Team standard in `.claude/CLAUDE.md`; personal preference in `~/.claude/CLAUDE.md`
C) Both in `.claude/CLAUDE.md` with conditional logic per user
D) Both in `~/.claude/CLAUDE.md` since all CLAUDE.md files are merged at runtime

**Answer:** B

**Explanation:** Project-level `.claude/CLAUDE.md` is version-controlled and shared with the entire team, making it the correct location for team coding standards. User-level `~/.claude/CLAUDE.md` applies only to that individual user and is not shared via version control, making it appropriate for personal debugging preferences. Option A reverses the scoping. Option C would expose personal preferences to all team members and has no built-in per-user conditional mechanism. Option D is incorrect because user-level files are not shared, so team standards placed there would not propagate to other developers.

**Task Statement:** 3.1

---

## Question 2
**Scenario:** A large monorepo project has accumulated a lengthy CLAUDE.md file with sections covering API conventions, database patterns, testing standards, and deployment rules. The team finds it hard to maintain and wants to reorganize. They want each topic managed independently so different sub-teams can own their respective sections. What is the best approach?

A) Split into multiple CLAUDE.md files in each subdirectory of the project
B) Use `@import` syntax in the root CLAUDE.md to pull in topic-specific files, and place rule files in `.claude/rules/`
C) Create separate user-level CLAUDE.md files for each sub-team
D) Use custom slash commands to dynamically load the relevant section at runtime

**Answer:** B

**Explanation:** The `@import` syntax allows modular organization by referencing external files from the root CLAUDE.md, and the `.claude/rules/` directory supports topic-specific rule files that can be independently maintained. This keeps the project-level configuration clean while allowing sub-teams to own their sections. Option A would scatter configuration across many directories without a clear import mechanism and would only apply when working within those directories. Option C would not share standards across the team since user-level files are personal. Option D confuses slash commands (which are user-invoked actions) with configuration loading.

**Task Statement:** 3.1

---

## Question 3
**Scenario:** A team lead wants to create a reusable code review workflow that all developers on the project can invoke. The workflow should fork a new context to avoid polluting the main conversation, and it should hint to the user that they need to provide a file path as an argument. Where should this command be defined, and which frontmatter options are needed?

A) In `~/.claude/commands/review.md` with frontmatter `context: fork` and `argument-hint: <file-path>`
B) In `.claude/commands/review.md` with frontmatter `context: fork` and `argument-hint: <file-path>`
C) In `.claude/skills/review/SKILL.md` with frontmatter `context: fork` and `argument-hint: <file-path>`
D) In `.claude/commands/review.md` with frontmatter `allowed-tools: all` only

**Answer:** B

**Explanation:** Project-scoped commands live in `.claude/commands/` and are shared via version control, making them available to all developers on the project. The `context: fork` frontmatter ensures the review runs in an isolated context, and `argument-hint` tells users what argument to provide. Option A places the command in user-scoped `~/.claude/commands/`, which would only be available to the team lead personally. Option C confuses skills (`.claude/skills/`) with commands; skills are a distinct mechanism with SKILL.md files and different invocation patterns. Option D omits the critical `context: fork` and `argument-hint` frontmatter that the scenario requires.

**Task Statement:** 3.2

---

## Question 4
**Scenario:** A developer notices that Claude Code has both "skills" (in `.claude/skills/`) and "custom slash commands" (in `.claude/commands/`). They want to understand when to use each. The team needs an automated background capability that Claude can invoke on its own when relevant, as well as a user-triggered action for generating boilerplate. Which mechanism fits each need?

A) Skills for both; commands are deprecated
B) Commands for both; skills are just commands with a different directory
C) Skills for the automated background capability; commands for the user-triggered boilerplate action
D) Commands for the automated background capability; skills for the user-triggered boilerplate action

**Answer:** C

**Explanation:** Skills (defined with SKILL.md files in `.claude/skills/`) are capabilities that Claude can discover and invoke autonomously when the situation calls for them. Custom slash commands (in `.claude/commands/`) are explicitly invoked by the user via `/command-name`. An automated background capability aligns with skills because Claude decides when to use it, while user-triggered boilerplate generation aligns with commands because the user initiates it. Option A incorrectly claims commands are deprecated. Option B ignores the distinct behavioral difference between skills and commands. Option D reverses the correct mapping.

**Task Statement:** 3.2

---

## Question 5
**Scenario:** A project has Python source code in `src/`, test files in `tests/`, and infrastructure-as-code in `infra/`. The team wants a rule that enforces "always use pytest fixtures instead of setUp/tearDown" but only when Claude is working on files matching `tests/**/*.py`. They also want a separate rule for Terraform naming conventions that activates only for `infra/**/*.tf` files. What is the best approach?

A) Create a directory-level CLAUDE.md in `tests/` and another in `infra/` with the respective rules
B) Create files in `.claude/rules/` with YAML frontmatter `paths` fields using glob patterns like `tests/**/*.py` and `infra/**/*.tf`
C) Put both rules in the project-level `.claude/CLAUDE.md` and rely on Claude to apply them contextually
D) Create custom slash commands that developers invoke before working in each directory

**Answer:** B

**Explanation:** Files in `.claude/rules/` support YAML frontmatter with `paths` fields that accept glob patterns, enabling conditional rule activation based on the files being edited. This is the recommended approach for conventions that should activate based on file patterns, especially when those patterns span multiple directories or target specific file types. Option A works for directory-scoped rules but is less flexible than glob patterns when targeting specific file extensions, and directory-level CLAUDE.md files only activate when working within that directory. Option C would load both rules at all times, adding irrelevant context when working outside the target directories. Option D requires manual developer intervention and is error-prone.

**Task Statement:** 3.3

---

## Question 6
**Scenario:** A developer is about to ask Claude Code to refactor the authentication module across 14 files, changing the session management strategy from cookie-based to JWT-based. There are multiple valid implementation approaches (middleware-based, decorator-based, or wrapper-based). What is the recommended workflow approach?

A) Direct execution, since Claude Code works best when given full autonomy on implementation details
B) Plan mode, because the task involves large-scale changes across many files with multiple valid architectural approaches
C) Direct execution with the interview pattern so Claude asks questions one at a time during implementation
D) Use the Explore subagent first, then direct execution based on its findings

**Answer:** B

**Explanation:** Plan mode is recommended for complex tasks involving large-scale changes, multiple files, and multiple valid implementation approaches. It allows the developer to review and approve the proposed approach before any code is modified, which is critical for architectural decisions like this. Option A is inappropriate because direct execution on a 14-file architectural change risks committing to a suboptimal approach. Option C mixes the interview pattern (a refinement technique) with execution mode; while asking clarifying questions is valuable, the scale and architectural nature of this task calls for plan mode to outline the full strategy first. Option D is partially useful for discovery but does not address the need to evaluate and select among approaches before execution.

**Task Statement:** 3.4

---

## Question 7
**Scenario:** A developer wants Claude Code to generate a data validation module but is not sure exactly what edge cases to handle. They want Claude to ask clarifying questions before writing any code, so the final output covers requirements they might not have thought of. Which iterative refinement technique best fits this situation?

A) Test-driven iteration: write failing tests first, then iterate until they pass
B) The interview pattern: instruct Claude to ask clarifying questions before acting
C) Provide all known requirements at once and iterate on the output afterward
D) Use plan mode with direct execution to let Claude decide the edge cases autonomously

**Answer:** B

**Explanation:** The interview pattern instructs Claude to ask clarifying questions before beginning implementation, which surfaces requirements and edge cases the developer may not have considered. This is ideal when the developer is uncertain about the full scope. Option A is effective when requirements are known and can be expressed as test cases, but the developer explicitly does not know all edge cases yet. Option C skips the discovery phase and would miss the unknown requirements the developer wants to uncover. Option D conflates plan mode (which outlines an approach) with autonomous requirement discovery; plan mode does not prompt the developer for missing requirements the way the interview pattern does.

**Task Statement:** 3.5

---

## Question 8
**Scenario:** A team is integrating Claude Code into their GitHub Actions CI pipeline to perform automated code review on pull requests. They need Claude to run non-interactively, output results as structured JSON matching a specific schema, and ensure each review is independent so that findings from one PR do not leak into another. Which combination of flags and practices achieves this?

A) Use `--print` flag, `--output-format json` with `--json-schema`, and run each review in a fresh session
B) Use `--print` flag only, parse the plain text output with regex, and reuse a named session for consistency
C) Use `--resume` to maintain context across reviews, with `--output-format json` for structured output
D) Use `--print` flag with `--output-format json`, and share a CLAUDE.md session context across all PRs for consistency

**Answer:** A

**Explanation:** The `-p` / `--print` flag enables non-interactive mode required for CI/CD. The `--output-format json` combined with `--json-schema` enforces structured output matching a specific schema. Running each review in a fresh session (not resuming a previous one) ensures session context isolation so findings from one PR cannot influence another review. Option B relies on fragile regex parsing instead of structured output and reusing sessions would leak context between reviews. Option C uses `--resume` which explicitly carries context forward between sessions, violating the isolation requirement. Option D shares session context across PRs, which contradicts the independence requirement; independent review instances are more effective than shared contexts.

**Task Statement:** 3.6

---
