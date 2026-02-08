# Setup Wizard

This document guides an AI assistant through converting the base project
into a project-specific setup. Follow each step in order. Ask the user
for input at each decision point.

---

## Prerequisites

Before starting:
- This base has been copied to the new project directory.
- Read `_meta/technical-reference.md` for a full map of all files and their purposes.
- The user is ready to answer questions about their project.

---

## Step 1: Project Identity

Ask the user:
1. **What is the project name?** (used in CLAUDE.md, AGENTS.md, README.md, package files)
2. **Describe the project in one sentence.** (used in project memory files)
3. **What type of project is this?**

| | Type | Examples |
|---|---|---|
| 🌐 | Web Application | SaaS, dashboard, e-commerce |
| 🔌 | API / Backend | REST API, GraphQL, microservice |
| 🖥️ | Desktop Application | Electron, MAUI, WPF |
| 📱 | Mobile Application | React Native, MAUI, Flutter |
| 🎮 | Game | Unity, Godot, custom engine |
| 📦 | Library / Package | npm package, PyPI package, NuGet |
| 🛠️ | CLI Tool | Command-line utility |
| 🤖 | AI / ML Project | Model training, inference pipeline |
| 📊 | Data Pipeline | ETL, analytics, reporting |

### Actions:
- Update `CLAUDE.md`: Replace `[REPLACE: Project Name]` and `[REPLACE: One-sentence...]`
- Update `AGENTS.md`: Same replacements
- Update `README.md`: Replace title and add project-specific overview
- Update `spec/tracking/milestone.md`: Remove template rows

---

## Step 2: Tech Stack Selection

Ask the user:
1. **What is the primary language?**

| | Language | Stack Guide |
|---|---|---|
| 📘 | TypeScript / Node.js | `stacks/typescript/guide.md` |
| 🐍 | Python | `stacks/python/guide.md` |
| 💜 | C# / .NET | `stacks/csharp/guide.md` |
| 🔧 | Other | Research best practices on the fly |

2. **What framework?** (present relevant options from the stack guide)
3. **What database?** (if applicable)
4. **Any other key technologies?** (auth, hosting, etc.)

### Actions:
- Read the relevant `stacks/*/guide.md` for best practices.
- Update `CLAUDE.md` tech stack section.
- Update `AGENTS.md` tech stack section.

---

## Step 3: Generate Configuration Files

Based on the stack guide and user's choices, generate project configuration files.
Research current best practices for the chosen stack before generating.

### For TypeScript/Node.js:
- `package.json` with recommended scripts and dependencies
- `tsconfig.json` with strict settings per guide
- `biome.json` (or eslint config) per guide
- `vitest.config.ts` if using Vitest

### For Python:
- `pyproject.toml` with project metadata, dependencies, tool configs
- `.python-version` file
- `ruff` and `pyright` configuration within pyproject.toml

### For C#/.NET:
- `.sln` file
- `.csproj` with recommended properties per guide
- `.editorconfig` with C# style rules
- `Directory.Packages.props` if using central package management

### For All:
- `.env.example` with placeholder values grouped by service
- Update `.gitignore` with stack-specific entries
- Add stack-specific cursor rules to `.cursor/rules/` if needed

### Actions:
- Generate config files in the project root.
- Update `CLAUDE.md` commands section with actual commands.
- Update `AGENTS.md` commands section.

---

## Step 4: Project Structure

Based on project type and stack, create the source directory structure.

Ask the user:
1. **Do you want feature-based organization?** (Recommended for most projects)
2. **What are the initial features/modules?** (Creates initial directories)

### Actions:
- Create `src/` directory structure per `spec/architecture.md` patterns.
- If feature-based: create `src/features/`, `src/shared/`, `src/app/`.
- If the project has a specific framework convention (Next.js `app/`, etc.), follow it.
- Update `CLAUDE.md` architecture section with the actual structure.

---

## Step 5: Initialize Tracking

Ask the user:
1. **What are your initial milestones?** (MVP, Core, Polish, etc.)
2. **What features belong to the first milestone?**
3. **Any known technical decisions that need to be made?**

### Actions:
- Populate `spec/tracking/milestone.md` with actual milestones and inline tasks (Phase 1).
- Do NOT create feature spec files yet — inline tasks are sufficient for MVP.
- Feature specs are extracted later when a feature outgrows inline tracking (see `spec/workflow.md`).
- Add any open questions to `spec/tracking/decisions.md`.
- Clear template placeholder rows from all tracking files.

---

## Step 6: Testing Setup

Based on stack guide, set up the testing infrastructure.

Ask the user:
1. **What testing frameworks do you prefer?** (or use guide defaults)
2. **Any specific testing requirements?** (E2E, visual, performance)

### Actions:
- Install/configure test framework per stack guide.
- Create test directory structure.
- Add test commands to `CLAUDE.md` and `AGENTS.md`.
- Create a sample test file demonstrating the project's test conventions.
- Add stack-specific testing rules to `.claude/rules/code-rules.md` (and mirror to `.cursor/rules/001-code-rules.mdc`).

---

## Step 7: Git Initialization

Ask the user:
1. **Initialize a new git repository?**
2. **Set up git hooks?** (Recommended: pre-commit with lint + type-check)

### Actions:
- `git init` if requested.
- Set up pre-commit hooks per stack guide (Husky, pre-commit framework, etc.).
- Create initial commit with the base structure.

---

## Step 8: Final Review

Present the user with a summary of everything that was set up:

```markdown
## Setup Complete

### Project: [Name]
### Stack: [Language + Framework + Database]

### Files Created:
- [list of generated config files]

### Structure:
- [directory tree of src/]

### Commands Available:
- [list of commands from package.json / Makefile / etc.]

### Next Steps:
1. Review the generated configuration files.
2. Install dependencies: [command]
3. Run the dev server: [command]
4. Check `spec/tracking/milestone.md` for your first tasks.
```

### Actions:
- Remove `[REPLACE: ...]` placeholders from all files.
- **Delete `_meta/` directory** (base-only files, not needed in the project).
- Remove `stacks/` directory if not needed (the guides have served their purpose).
  Or keep them as reference - ask the user.
- Verify all files are consistent (no leftover template content).
- Run a final check: can the project build/run? Are tests passing?

---

## Post-Setup Checklist

Verify these before declaring setup complete:

- [ ] CLAUDE.md has no `[REPLACE]` placeholders
- [ ] AGENTS.md has no `[REPLACE]` placeholders
- [ ] README.md reflects the actual project
- [ ] spec/tracking/milestone.md has real milestones
- [ ] .env.example exists with documented variables
- [ ] Project builds/runs successfully
- [ ] At least one test exists and passes
- [ ] Git is initialized with an initial commit (if requested)
- [ ] `_meta/` directory deleted
- [ ] All tracking template files are cleaned of placeholder rows
