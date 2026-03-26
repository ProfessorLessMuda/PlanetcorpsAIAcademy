# Module 03 - Claude Code Configuration & Workflows

## Exam Weighting: 20%

## Objective

Understand how to configure Claude Code for team workflows using CLAUDE.md hierarchy, custom commands, path-specific rules, plan mode, iterative refinement, and CI/CD integration. This domain tests your ability to set up Claude Code so that it behaves consistently across a team, adapts to different parts of a codebase, and integrates into automated pipelines.

## Task Statements Covered

- **3.1:** Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization
- **3.2:** Create and configure custom slash commands and skills
- **3.3:** Apply path-specific rules for conditional convention loading
- **3.4:** Determine when to use plan mode vs direct execution
- **3.5:** Apply iterative refinement techniques for progressive improvement
- **3.6:** Integrate Claude Code into CI/CD pipelines

---

## Key Concepts

### 3.1 CLAUDE.md Hierarchy

CLAUDE.md files are the primary mechanism for giving Claude Code persistent instructions that survive across sessions. They function like a project-aware system prompt: Claude reads them at the start of every session and follows their guidance throughout.

#### The Three Levels

There are three levels of CLAUDE.md, each with a different scope and sharing model:

**1. User-Level: `~/.claude/CLAUDE.md`**

- Applies to ALL projects for the current user
- Lives in the user's home directory, outside any repository
- NOT shared via version control -- this is strictly personal
- Use for: personal coding style preferences, preferred tools, editor conventions, personal workflow habits
- Example content: "I prefer verbose variable names," "Always explain changes before making them," "Use TypeScript strict mode when possible"

**2. Project-Level: `.claude/CLAUDE.md`**

- Applies to the entire project (repository root)
- Lives inside the repository and IS shared via version control
- This is the primary team configuration file
- Use for: project coding standards, architectural conventions, framework usage patterns, test requirements, deployment notes
- Example content: "This project uses React with TypeScript," "All API endpoints must include error handling," "Run `npm test` before committing"

**3. Directory-Level: `subdir/CLAUDE.md`**

- Applies only when Claude is working with files in that directory or its children
- Lives inside a subdirectory of the project
- Shared via version control (it is in the repo)
- Use for: directory-specific conventions that differ from the project defaults
- Example content: In `src/legacy/CLAUDE.md`: "This directory uses CommonJS modules -- do not convert to ES modules"

#### Precedence and Layering

All three levels are active simultaneously. They layer on top of each other rather than replacing:

```
User-level (personal preferences)
  + Project-level (team standards)
    + Directory-level (local overrides)
      = What Claude follows for a given file
```

If instructions conflict, the more specific level takes priority. Directory-level overrides project-level, and project-level overrides user-level for project-specific concerns.

#### Modular Organization with @import

A large CLAUDE.md can become unwieldy. The `@import` syntax lets you break it into smaller, focused files:

```markdown
# .claude/CLAUDE.md

@import ./rules/coding-standards.md
@import ./rules/testing-conventions.md
@import ./rules/api-guidelines.md
@import ./rules/deployment-checklist.md
```

Each imported file is read and included as if its content were inlined at the import location. This keeps the main CLAUDE.md clean and makes it easy to find and update specific sections.

#### The .claude/rules/ Directory

As an alternative to directory-level CLAUDE.md files, you can place rule files in `.claude/rules/`. These files can optionally include YAML frontmatter with `paths` fields for conditional loading (covered in detail in section 3.3). When they lack frontmatter, they apply globally to the project, just like content in the project-level CLAUDE.md.

This is often cleaner than scattering CLAUDE.md files across subdirectories because it keeps all rules in one predictable location.

#### Common Mistakes

- **Putting personal preferences in project-level CLAUDE.md.** Your preference for tab width or verbose explanations should go in `~/.claude/CLAUDE.md`, not in the repo where it affects your whole team.
- **Assuming user-level settings affect teammates.** User-level CLAUDE.md is local to your machine. Team members will not see your `~/.claude/CLAUDE.md` content.
- **Duplicating rules across directories instead of using @import or .claude/rules/.** If the same convention applies in multiple directories, centralize it rather than copying it into each directory's CLAUDE.md.

---

### 3.2 Custom Slash Commands and Skills

Claude Code supports two mechanisms for reusable instructions: slash commands (user-invoked) and skills (Claude-discovered).

#### Slash Commands

Slash commands are markdown files that define a prompt Claude executes when the user types the command name with a `/` prefix.

**Project-Scoped Commands: `.claude/commands/`**

- Shared with the team via version control
- Available to everyone who clones the repository
- Use for: team-standard workflows like code review, test generation, deployment preparation
- File path determines the command name: `.claude/commands/review.md` becomes `/review`
- Nested directories create namespaced commands: `.claude/commands/db/migrate.md` becomes `/db/migrate`

**User-Scoped Commands: `~/.claude/commands/`**

- Personal only, not shared via version control
- Available across all projects for that user
- Use for: personal productivity shortcuts, custom analysis commands, personal workflow automation

#### Command Frontmatter

Command files support YAML frontmatter that controls execution behavior:

```yaml
---
context: fork
allowed-tools: Read, Grep, Glob
argument-hint: <file-path-to-review>
---

Review the provided file for potential bugs, performance issues,
and adherence to project coding standards. Report findings in
a structured format with severity levels.
```

**Frontmatter options:**

- **`context: fork`** -- Runs the command in a forked context. The command executes in an isolated copy of the current conversation, so its output and side effects do not pollute the main session. This is essential for commands that perform broad searches or generate verbose output.
- **`allowed-tools`** -- Restricts which tools the command can use. A read-only review command might only need `Read, Grep, Glob` and should not have access to `Write, Edit, Bash`. This prevents accidental modifications.
- **`argument-hint`** -- Provides usage guidance shown when the user types the command. Tells the user what argument to supply (e.g., a file path, a PR number, a feature description).

#### Skills

Skills live in `.claude/skills/` and contain `SKILL.md` files. The critical difference from commands:

- **Commands** are invoked explicitly by the user typing `/command-name`
- **Skills** are discovered and used by Claude autonomously when relevant to the current task

A skill file describes a capability, pattern, or piece of knowledge that Claude can draw upon without the user explicitly invoking it. For example, a skill describing how to set up a new API endpoint in the project's framework would be automatically referenced when Claude is asked to create an endpoint.

#### Common Mistakes

- **Confusing commands and skills.** Commands require explicit user invocation with `/`. Skills are passive knowledge that Claude discovers on its own. If you want the user to trigger something explicitly, make it a command. If you want Claude to know something contextually, make it a skill.
- **Not using `context: fork` for verbose commands.** A command that searches broadly across the codebase can flood the main conversation with context. Use `context: fork` to keep the main session clean.
- **Forgetting that `~/.claude/commands/` is personal.** If you create a useful command in your user directory, your teammates will not have it. Move it to `.claude/commands/` if the team should share it.

---

### 3.3 Path-Specific Rules

Path-specific rules provide conditional convention loading based on file glob patterns. They live in the `.claude/rules/` directory and use YAML frontmatter to declare which files they apply to.

#### How They Work

A rule file in `.claude/rules/` can include a `paths` field in its YAML frontmatter:

```yaml
---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

When writing or modifying test files:
- Use describe/it blocks, not test() syntax
- Always include at least one positive and one negative test case
- Mock external dependencies; never make real network calls
- Use factory functions for test data, not inline object literals
```

When Claude works with a file matching any of the glob patterns, this rule activates automatically. When working with non-matching files, the rule is ignored.

#### Examples of Path-Specific Rules

**Rule for all Python files:**
```yaml
---
paths:
  - "**/*.py"
---

Follow PEP 8. Use type hints on all function signatures.
Use dataclasses for simple data containers.
Prefer pathlib over os.path for file operations.
```

**Rule for all API endpoint files:**
```yaml
---
paths:
  - "src/api/**/*.ts"
  - "src/routes/**/*.ts"
---

All endpoints must validate input using zod schemas.
Return standardized error responses with status codes.
Include rate limiting middleware on all public endpoints.
Log all requests with correlation IDs.
```

**Rule for all migration files:**
```yaml
---
paths:
  - "db/migrations/**"
---

Migrations must be reversible. Include both up and down functions.
Never drop columns in production migrations -- mark as deprecated first.
Add comments explaining the business reason for schema changes.
```

#### Why Path-Specific Rules Are Preferred Over Directory-Level CLAUDE.md

Path-specific rules are the recommended approach when conventions apply across file types rather than directory boundaries. Consider the difference:

- **Directory-level CLAUDE.md** activates based on where a file lives in the filesystem. It works when conventions are location-based (e.g., "everything in `src/legacy/` uses old patterns").
- **Path-specific rules** activate based on what a file is, regardless of where it lives. They work when conventions are type-based (e.g., "all test files should follow this pattern" or "all Python files should use type hints").

Since most coding conventions are type-based rather than location-based, path-specific rules are the more common and flexible choice. A single rule file for `**/*.test.ts` covers test files in every directory, whereas directory-level CLAUDE.md files would require duplicating the same instructions in every directory containing tests.

---

### 3.4 Plan Mode vs Direct Execution

Claude Code can operate in two modes: plan mode (think before acting) and direct execution (act immediately). Choosing the right mode significantly affects the quality of outcomes.

#### When to Use Plan Mode

Plan mode is appropriate when:

- **The task is complex.** Multiple files need to change in a coordinated way.
- **Multiple valid approaches exist.** There are architectural tradeoffs worth discussing before committing to an implementation.
- **Large-scale changes are involved.** Refactoring a module, restructuring a directory, or migrating a system.
- **Architectural decisions need to be made.** Which pattern to use, how to structure the data model, which library to adopt.
- **The scope is unclear.** The user's request could be interpreted in several ways, and getting alignment first saves rework.

In plan mode, Claude produces an outline of what it intends to do, what files it will change, and what tradeoffs it sees. The user reviews and approves before execution begins. This creates a checkpoint that prevents Claude from going down the wrong path on expensive operations.

#### When to Use Direct Execution

Direct execution is appropriate when:

- **The task is simple and well-scoped.** Fix a typo, add an import, rename a variable.
- **The approach is obvious.** There is only one reasonable way to accomplish the task.
- **The change is small and easily reversible.** A single file modification that can be undone with git.
- **The user has given specific instructions.** They have already decided what to do and just need it done.

#### The Explore Subagent

The Explore subagent is a specialized tool for discovery that isolates verbose search output from the main conversation context. When Claude needs to search broadly across a codebase -- examining many files, reading large sections, following dependency chains -- doing so in the main context can consume significant context window space with information that is only useful during discovery.

The Explore subagent runs in its own context, performs the exploration, and returns only the relevant findings to the main conversation. Use it when:

- You need to understand how a system works before planning changes
- Broad codebase searches are required
- The discovery process will generate a lot of intermediate output

#### Common Mistakes

- **Using direct execution for complex tasks.** When someone asks Claude to "refactor the authentication system," jumping straight into code changes without a plan often produces a half-finished result or an approach the user would not have chosen.
- **Over-using plan mode for trivial changes.** Producing a detailed plan for "add a null check on line 42" wastes time and adds unnecessary back-and-forth.
- **Not using the Explore subagent when discovery is needed.** Running broad searches in the main context fills it with file contents that are only needed temporarily, pushing out more important context.

---

### 3.5 Iterative Refinement

Iterative refinement is the practice of improving Claude's output progressively rather than expecting perfection on the first attempt. Several specific techniques make this process more effective.

#### Concrete Input/Output Examples

Abstract descriptions are ambiguous. Concrete examples are not. Compare:

**Abstract (weaker):**
> "Format the output nicely with proper structure"

**Concrete (stronger):**
> "Format the output like this:
> ```
> [ERROR] 2024-01-15 auth.py:42 - Invalid token: expired
> [WARN]  2024-01-15 auth.py:58 - Rate limit approaching: 89/100
> ```
> Left-align severity in brackets, followed by date, file:line, then message."

When Claude can see exactly what you want, it produces it consistently. When instructions are vague, every session may produce different formatting.

#### Test-Driven Iteration

The most reliable iteration technique for code:

1. **Write the test first** that defines expected behavior
2. **Ask Claude to implement** code that passes the test
3. **Run the test** -- if it fails, Claude sees the failure output
4. **Iterate** -- Claude adjusts the implementation based on test feedback
5. **Repeat** until all tests pass

This technique is powerful because the test provides an objective, automated success criterion. Claude does not need to guess whether its output is correct -- the test verdict is unambiguous. It also creates a regression safety net for future changes.

#### The Interview Pattern

Instead of making assumptions about ambiguous requirements, Claude asks clarifying questions before acting:

- "Should this function handle null inputs by throwing an error or returning a default value?"
- "The existing code uses callbacks. Should I convert to async/await or keep the callback pattern for consistency?"
- "This could be a separate microservice or a module within the existing service. Which approach fits your architecture?"

The interview pattern prevents wasted effort on wrong assumptions. It is especially valuable when the task is underspecified or when there are legitimate architectural choices to make.

Prompting Claude to use this pattern can be done in CLAUDE.md: "When requirements are ambiguous, ask clarifying questions before implementing. Do not guess."

#### Sequential vs All-at-Once

When you have multiple issues or changes to request:

- **Provide all issues at once** when they are independent. If you need a typo fixed in file A, a new function in file B, and a test added in file C, give all three at once. Claude can address them in parallel without interference.
- **Provide issues sequentially** when later issues depend on how earlier ones are resolved. If the approach to issue 2 depends on the architectural choice made for issue 1, give issue 1 first, review the result, then provide issue 2.

Sequencing dependent issues prevents Claude from committing to an approach for issue 2 that conflicts with the resolution of issue 1.

---

### 3.6 CI/CD Integration

Claude Code can run in non-interactive (headless) mode, making it suitable for automated pipelines. This enables automated code reviews, test generation, PR feedback, and more.

#### Key Flags for CI/CD

**`-p` / `--print` flag:**
Puts Claude Code in non-interactive mode. Claude reads the prompt, executes, and outputs the result to stdout without waiting for user input. This is the essential flag for any pipeline integration.

```bash
claude -p "Review this diff for security issues" < diff.patch
```

**`--output-format json`:**
Produces structured JSON output that CI tools can parse programmatically. Instead of human-readable text, you get a JSON object with defined fields that scripts can process.

```bash
claude -p --output-format json "Analyze this code for bugs" < code.py
```

**`--json-schema`:**
Constrains the JSON output to conform to a specific schema. This guarantees that the output structure matches what your pipeline expects, making it safe to parse without defensive null checks.

```bash
claude -p --output-format json --json-schema '{"type":"object","properties":{"issues":{"type":"array","items":{"type":"object","properties":{"severity":{"type":"string","enum":["critical","warning","info"]},"file":{"type":"string"},"line":{"type":"number"},"message":{"type":"string"}},"required":["severity","file","line","message"]}}}}' "Review this PR for issues"
```

#### CLAUDE.md in CI

CLAUDE.md files are read even in CI mode. This means your project-level CLAUDE.md provides context to Claude during automated runs -- coding standards, project conventions, and architectural patterns are all available. You do not need to duplicate project context in your CI prompts.

This is a significant advantage: the same conventions that guide interactive development also guide automated reviews.

#### Session Context Isolation (Critical Concept)

This is one of the most heavily tested concepts in the CI/CD portion of the exam.

**The problem:** If you use a single Claude Code instance to generate code and then review that same code, the instance is reviewing its own output. It has the full context of why it made each decision, which creates a strong bias toward approving its own work. This is analogous to a developer reviewing their own pull request -- they are blind to their own assumptions.

**The solution:** Use independent Claude Code instances for each review target. Each instance starts with a fresh context and evaluates the code on its own merits.

**Wrong approach:**
```bash
# Single instance generates and reviews -- self-review bias
claude -p "Generate the auth module" > auth.py
claude -p "Now review auth.py for issues"  # Same session context!
```

**Correct approach:**
```bash
# Instance 1: Generate
claude -p "Generate the auth module" > auth.py

# Instance 2: Independent review (separate invocation, fresh context)
claude -p "Review this file for security issues, bugs, and style violations" < auth.py
```

For PR reviews, the pattern extends naturally:

```bash
# Review each changed file independently
for file in $(git diff --name-only main...HEAD); do
  claude -p "Review this file for issues" < "$file" >> review_results.json
done
```

This produces better reviews because each instance approaches the code as a fresh reader, without the author's contextual knowledge biasing its judgment.

#### Common Mistakes

- **Running one Claude Code instance to review its own output.** Self-review produces lower quality feedback due to author bias. Always use separate instances.
- **Not using `--output-format json` in pipelines.** Human-readable text output is fragile to parse programmatically. Use structured output for anything a script needs to process.
- **Forgetting that CLAUDE.md applies in CI.** Your project conventions are available in headless mode. Take advantage of this rather than restating everything in CI prompts.

---

## Architecture Patterns

### Layered Configuration

Configuration in Claude Code follows a layered architecture where each level adds specificity:

```
User-level   (~/.claude/CLAUDE.md)        -- Personal preferences
  |
  v
Project-level (.claude/CLAUDE.md)         -- Team standards
  |
  v
Directory-level (subdir/CLAUDE.md)        -- Location-specific overrides
  |
  v
Path-specific  (.claude/rules/*.md)       -- File-type-specific rules
```

All layers are active simultaneously. More specific layers take precedence when there is a conflict. Path-specific rules are orthogonal to the directory hierarchy -- they activate based on file patterns rather than location.

### Command Distribution

```
Project commands (.claude/commands/)       -- Team workflows, shared via git
User commands    (~/.claude/commands/)      -- Personal shortcuts, local only
Skills           (.claude/skills/)         -- Passive knowledge Claude discovers
```

The distribution principle: if the team needs it, put it in the project directory. If only you need it, put it in your user directory. If Claude should know it without being asked, make it a skill.

### CI Review Pipeline

```
PR submitted
  |
  v
[Instance 1] Review file A  ---\
[Instance 2] Review file B  ----+---> Aggregate results
[Instance 3] Review file C  ---/          |
                                          v
                                    Post PR comment
```

Each review instance is independent. No instance has context from another instance's review. This eliminates self-review bias and produces the most objective feedback.

---

## Scenario Walkthrough

### Configure Claude Code for a Team Development Workflow

**Scenario:** You are setting up Claude Code for a monorepo with a Node.js backend and a React frontend. The team has five developers with different preferences. You need consistent code generation, automated PR reviews, and team-standard workflows.

**Step 1: Establish the CLAUDE.md hierarchy**

Project-level `.claude/CLAUDE.md`:
```markdown
# Project: Acme Platform

## Architecture
- Monorepo with backend (src/api/) and frontend (src/web/)
- Backend: Node.js with Express, TypeScript strict mode
- Frontend: React 18 with TypeScript, Tailwind CSS
- Database: PostgreSQL with Prisma ORM
- Testing: Jest for unit tests, Playwright for E2E

## Conventions
- All functions must have TypeScript return types
- API responses use { data, error, meta } envelope pattern
- Commits follow Conventional Commits format
- PRs require at least one test for new functionality

@import ./rules/api-conventions.md
@import ./rules/testing-standards.md
@import ./rules/frontend-patterns.md
```

Each developer also has their own `~/.claude/CLAUDE.md` for personal preferences (editor behavior, verbosity levels, etc.) that does not affect teammates.

**Step 2: Add path-specific rules**

`.claude/rules/python-scripts.md`:
```yaml
---
paths:
  - "scripts/**/*.py"
---

Python scripts in this project use Python 3.11+.
Use argparse for CLI arguments. Include if __name__ == "__main__" guards.
```

`.claude/rules/test-files.md`:
```yaml
---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

Use describe/it blocks. Mock all external services.
Each test file must import from the module under test, not from barrel exports.
Use test factories from src/test/factories/ for test data.
```

**Step 3: Create team-wide slash commands**

`.claude/commands/review.md`:
```yaml
---
context: fork
allowed-tools: Read, Grep, Glob
argument-hint: <file-or-directory-to-review>
---

Review the specified code for:
1. Security vulnerabilities (injection, auth bypass, data exposure)
2. Performance issues (N+1 queries, missing indexes, unnecessary re-renders)
3. Convention violations per project CLAUDE.md
4. Missing error handling

Output a structured report with severity levels: critical, warning, info.
```

`.claude/commands/test.md`:
```yaml
---
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
argument-hint: <file-to-test>
---

Generate comprehensive tests for the specified file.
Follow the testing standards in .claude/rules/testing-standards.md.
Run the tests after writing them and fix any failures.
```

**Step 4: Set up CI/CD integration**

In the CI pipeline (e.g., GitHub Actions):
```yaml
pr-review:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Review changed files
      run: |
        for file in $(git diff --name-only origin/main...HEAD); do
          claude -p --output-format json \
            "Review this file for bugs, security issues, and convention violations" \
            < "$file" >> reviews.json
        done
    - name: Post review comments
      run: node scripts/post-review-comments.js reviews.json
```

Each file is reviewed by an independent Claude instance, avoiding self-review bias. The `--output-format json` flag ensures parseable output for the comment-posting script.

---

## Practice Exercises

### Exercise 1: Design a CLAUDE.md Hierarchy for a Monorepo

**Task:** You have a monorepo with:
- `packages/web/` -- React frontend
- `packages/api/` -- Express backend
- `packages/shared/` -- Shared TypeScript types and utilities
- `scripts/` -- Python build and deployment scripts
- `infra/` -- Terraform infrastructure code

Design the complete CLAUDE.md hierarchy. Decide what goes in each level and why. Create the project-level CLAUDE.md with @import statements, directory-level overrides where needed, and path-specific rules in `.claude/rules/`.

**Guiding questions:**
- Which conventions apply universally (project-level)?
- Which conventions are location-specific (directory-level)?
- Which conventions are file-type-specific (path-specific rules)?
- What personal preferences should stay in user-level only?

### Exercise 2: Create a Slash Command with Fork Context and Restricted Tools

**Task:** Create a slash command called `/security-audit` that:
- Runs in a forked context so it does not pollute the main conversation
- Can only read files (no write/edit/bash access)
- Accepts a directory path as an argument
- Scans for common security issues: hardcoded secrets, SQL injection vectors, missing input validation, insecure dependencies

Write the complete markdown file with frontmatter and prompt content.

### Exercise 3: Write Path-Specific Rules

**Task:** Create three rule files in `.claude/rules/`:

1. A rule for all Python files that enforces type hints, docstrings, and PEP 8
2. A rule for all TypeScript files that enforces strict mode patterns and explicit return types
3. A rule for all test files (any language) that enforces test isolation, naming conventions, and coverage expectations

Each rule file must include appropriate YAML frontmatter with glob patterns and substantive guidance content.

---

## Exam Tips

- **Know the three CLAUDE.md levels and what is shared vs personal.** User-level is personal (not in version control). Project-level and directory-level are shared (in the repo). This is a frequent exam question.

- **Know the difference between `.claude/commands/` and `~/.claude/commands/`.** Project commands are shared via git. User commands are personal and local. The tilde (`~`) makes it user-scoped.

- **Path-specific rules (`.claude/rules/` with glob patterns) are preferred over directory-level CLAUDE.md for cross-directory conventions.** If a convention applies to a file type rather than a directory, use path-specific rules. This is a common exam distractor.

- **Plan mode = complex/unclear. Direct execution = simple/clear.** If the exam describes a complex refactoring or architectural decision, plan mode is the answer. If it describes a simple bug fix or small addition, direct execution is the answer.

- **CI/CD: `-p` flag, `--output-format`, and session context isolation are heavily tested.** Know that `-p` enables headless mode, `--output-format json` produces parseable output, and `--json-schema` constrains the structure.

- **"Self-review" is almost always the wrong answer.** When an exam question asks about reviewing code that Claude generated, the correct answer involves independent instances, not the same instance reviewing its own work. Session context isolation is a core principle.

- **Frontmatter options for commands:** Remember `context: fork` (isolated execution), `allowed-tools` (tool restriction), and `argument-hint` (usage guidance). These appear in scenario questions.

- **Skills vs commands:** Skills are passive and discovered by Claude. Commands are active and invoked by the user. If the question describes something Claude should "know" contextually, the answer is a skill. If it describes something the user triggers explicitly, the answer is a command.

---

## Cross-References

- **Domain 4 (Prompt Engineering)** -- CLAUDE.md is essentially prompt engineering for Claude Code. The same principles of specificity, concrete examples, and explicit criteria from Domain 4 apply to writing effective CLAUDE.md content.
- **Domain 4, Task 4.6** -- Session context isolation connects to the multi-instance review architecture. The CI/CD review pipeline pattern is tested in both domains.
- **Domain 1, Task 1.7** -- Session management (using `--resume` for named sessions) is a Claude Code workflow concern that bridges into agentic architecture.
- **Domain 2, Task 2.4** -- MCP server scoping (project-level `.mcp.json` vs user-level `~/.claude.json`) parallels the CLAUDE.md hierarchy: project config is shared, user config is personal.
- **Domain 2, Task 2.5** -- Built-in tools (Read, Write, Edit, Bash, Grep, Glob) are what `allowed-tools` in command frontmatter restricts. Understanding tool capabilities informs which tools to allow in commands.
- **Exam Scenarios:** Scenario 2 (Code Generation with Claude Code), Scenario 4 (Developer Productivity with Claude), Scenario 5 (Claude Code for CI/CD)
- **Assessment:** `assessments_domain-03-questions.md`
