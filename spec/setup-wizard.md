# Setup Wizard

This document guides an AI assistant through converting the base project
into a project-specific setup. The flow is conversational, not a form.
Start with goals, let the tech stack emerge from the design.

---

## Prerequisites

Before starting:
- This base has been copied to the new project directory.
- Read `README.md` and `spec/workflow.md` to understand the base layout.
- The user is ready to talk about their project.

---

## Step 1: Vision

Start with one open question: **"What do you want to build, and what problem does it solve?"**

Let the user talk. From their answer, extract:
- **Project name** and one-sentence description
- **Core goals** — what does success look like?
- **Key constraints** — timeline, platform, audience, existing systems to integrate with

Don't ask about languages, frameworks, or project types yet. If the user volunteers
them, note it but keep exploring goals first.

Follow up only if needed:
- "Who uses this?" (end users, developers, internal team)
- "Does this need to run somewhere specific?" (browser, mobile, desktop, server, embedded)
- "Is there an existing codebase or system this connects to?"

### Checkpoint — Confirm understanding:
Before moving on, play back your understanding to the user: project name, what it does,
who it's for, and key constraints. Get explicit confirmation before proceeding.
Don't generate any files yet.

### Actions:
- Update `CLAUDE.md`: Replace `[REPLACE: Project Name]` and `[REPLACE: One-sentence...]`
- Update `AGENTS.md`: Same replacements
- Update `README.md`: Replace title and add project-specific overview

---

## Step 2: Architecture & Stack

Based on the vision, discuss what the system looks like at a high level.
**The tech stack is a result of this conversation, not an input to it.**

Guide the discussion:
1. **What are the major components?** (frontend, backend, game engine, CLI, data pipeline, etc.)
2. **For each component, what language/framework fits?** Use `stacks/*.md` guides to recommend.
3. **Present a recommended stack** with rationale. Use the options table format.

Multi-language is normal. A project might have a Unity C# game + Node.js tooling,
or a Python API + TypeScript frontend. Each component gets its own stack guide.

Available stack guides (read the relevant ones before recommending):

| Guide | When to use |
|-------|-------------|
| `stacks/typescript.md` | Web apps, APIs, CLIs, tooling, anything Node.js |
| `stacks/python.md` | APIs, data pipelines, ML/AI, scripting |
| `stacks/csharp.md` | .NET APIs, desktop apps, enterprise |
| `stacks/unity.md` | Games, simulations, interactive 3D/2D |

For stacks not covered by a guide, research current best practices before recommending.

### Actions:
- Read the relevant `stacks/*.md` for each component.
- Update `CLAUDE.md` tech stack and architecture sections.
- Update `AGENTS.md` tech stack section.

---

## Step 3: Generate Configuration

Based on the stack decisions, generate project configuration files.
Research current best practices for each stack before generating.

### Per-stack configs:

**TypeScript/Node.js:**
- `package.json`, `tsconfig.json`, `biome.json`, `vitest.config.ts`

**Python:**
- `pyproject.toml`, `.python-version`, ruff + pyright config

**C#/.NET:**
- `.sln`, `.csproj`, `.editorconfig`, `Directory.Packages.props`

**Unity:**
- Follow Unity project conventions; config lives in Unity project settings

**Multi-language projects:**
- Each component gets its own config in its directory
- Add a root-level script or Makefile if needed to orchestrate across components

### For all projects:
- `.env.example` with placeholder values grouped by service
- Update `.gitignore` with stack-specific entries
- Add stack-specific rules to `.claude/rules/` and `.cursor/rules/` if needed

### Actions:
- Generate config files.
- Update `CLAUDE.md` commands section with actual build/dev/test commands.
- Update `AGENTS.md` commands section.

---

## Step 4: Project Structure

Based on the architecture, create the source directory structure.

Ask if needed:
1. **What are the initial features/modules?** (Creates initial directories)
2. **Any framework conventions to follow?** (Next.js `app/`, Unity `Assets/`, etc.)

Default to feature-based organization per `spec/architecture.md` unless the
framework dictates otherwise.

### Actions:
- Create directory structure.
- If feature-based: `src/features/`, `src/shared/`, `src/app/` (adapt to framework).
- Update `CLAUDE.md` architecture section with the actual structure.

---

## Step 5: Milestones & Tracking

Ask the user:
1. **What does "done" look like for the first milestone?**
2. **What are the key features to get there?**
3. **Any open technical decisions?**

### Actions:
- Populate `spec/tracking/milestone.md` with actual milestones and inline tasks.
- Every milestone MUST have `Done when` criteria and `Blocking decisions` filled in (not placeholder text).
- Do NOT create feature spec files yet — inline tasks are the starting point.
- Features get extracted later when they outgrow inline tracking (10+ tasks, need design docs).
  - Simple features → `spec/features/feature-name.md` (single file).
  - Complex features → `spec/features/feature-name/` folder with `tasks.md` + `design.md`.
  - See `spec/workflow.md` for extraction triggers and steps.
- Add any open questions to `spec/tracking/decisions.md`.
- Clear template placeholder rows from all tracking files.

---

## Step 6: Scaffolding

Set up the remaining infrastructure in one pass:

### Testing
- Install/configure test framework per stack guide (or ask user preference).
- Create test directory structure and a sample test file.
- Add test commands to `CLAUDE.md` and `AGENTS.md`.
- Add stack-specific testing rules to `.claude/rules/code-rules.md`.

### Git
- `git init` if not already initialized.
- Set up pre-commit hooks per stack guide if user wants them.
- Create initial commit with the base structure.

---

## Step 7: Final Review

### Checkpoint — Confirm before generating:
Before writing any remaining files, present the full picture to the user:
project name, architecture, stack per component, directory structure, milestones,
and first features. Ask: **"Does this match what you had in mind? Anything to adjust?"**
Only proceed to file generation after confirmation.

Present a summary:

```markdown
## Setup Complete

### Project: [Name]
### Stack: [Component → Language + Framework for each]

### Files Created:
- [list of generated config files]

### Structure:
- [directory tree of src/]

### Commands Available:
- [list from package.json / Makefile / etc.]

### Next Steps:
1. Review the generated configuration files.
2. Install dependencies: [command]
3. Run the dev server: [command]
4. Check `spec/tracking/milestone.md` for your first tasks.
```

### Actions:
- Remove `[REPLACE: ...]` placeholders from all files.
- **Delete `_meta/` directory** (base-only files, not needed in the project).
- Remove `stacks/` directory if not needed (guides have served their purpose).
  Or keep as reference — ask the user.
- Verify all files are consistent (no leftover template content).
- Run a final check: can the project build/run? Are tests passing?

---

## Post-Setup Checklist

Verify before declaring setup complete:

- [ ] CLAUDE.md has no `[REPLACE]` placeholders
- [ ] AGENTS.md has no `[REPLACE]` placeholders
- [ ] README.md reflects the actual project
- [ ] spec/tracking/milestone.md has real milestones with `Done when` criteria
- [ ] .env.example exists with documented variables
- [ ] Project builds/runs successfully
- [ ] At least one test exists and passes
- [ ] Git is initialized with an initial commit (if requested)
- [ ] `_meta/` directory deleted
- [ ] All tracking template files are cleaned of placeholder rows
