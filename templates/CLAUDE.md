# Product Kit Project

This project uses Product Kit for structured product thinking.

## Slash Commands

Use these commands in order to build your product foundation:

0. `/productkit.landscape` — Capture company, team, and domain context (run once, before everything else)
1. `/productkit.constitution` — Define your product principles
2. `/productkit.users` — Define target user personas
3. `/productkit.problem` — Frame the problem statement
4. `/productkit.assumptions` — Extract and prioritize assumptions
5. `/productkit.validate` — Validate assumptions with interview scripts and surveys
6. `/productkit.solution` — Brainstorm and evaluate solutions
7. `/productkit.prioritize` — Score and rank features
8. `/productkit.spec` — Generate a product spec
9. `/productkit.clarify` — Resolve ambiguities across artifacts
10. `/productkit.analyze` — Run a completeness/consistency check
11. `/productkit.bootstrap` — Auto-draft all artifacts from an existing codebase
12. `/productkit.audit` — Compare spec against codebase and surface gaps (post-build — what was actually implemented vs spec)
13. `/productkit.learn` — Index knowledge directory into a summary for faster commands
14. `/productkit.techreview` — Review spec against codebase and flag what needs engineering input (pre-build — feasibility before implementation)
15. `/productkit.stories` — Break spec into user stories with acceptance criteria

## Mode

Check `.productkit/config.json` for a `mode` field — either `"solo"` (building alone) or `"team"` (working with engineers/designers). Commands should adapt their output based on mode: solo mode can skip team-oriented sections (e.g., handoff notes, engineering specs), while team mode should include collaboration artifacts and detailed technical specs.

## Artifacts

Product artifacts are written as markdown files. Check `.productkit/config.json` for an `artifact_dir` field — if set, artifacts live in that directory instead of the project root. Default artifact locations:
- `landscape.md` — Company, team, and domain landscape
- `constitution.md` — Product principles and values
- `users.md` — Target user personas
- `problem.md` — Problem statement
- `assumptions.md` — Prioritized assumptions
- `validation.md` — Assumption validation results, interview scripts, and survey questions
- `solution.md` — Chosen solution with alternatives considered
- `priorities.md` — Scored and ranked feature list
- `spec.md` — Complete product spec ready for engineering
- `audit.md` — Spec vs codebase audit with gap analysis
- `knowledge-index.md` — Summary index of research files in `knowledge/`
- `techreview.md` — Technical feasibility review with effort estimates
- `stories.md` — User stories grouped by epic with acceptance criteria

## Workflow

Start with `/productkit.landscape` to front-load company knowledge, then `/productkit.constitution` or `/productkit.users`, and work through the commands in order. Each command reads previous artifacts to maintain consistency.

For existing projects, use `/productkit.bootstrap` to auto-draft all artifacts from your codebase in one session.

## Workspaces

If this project lives inside a workspace (created with `productkit workspace`), it shares a workspace directory. The workspace holds:
- `landscape.md` at the workspace root — shared company/domain context across all projects
- `knowledge/` at the workspace root — shared research files

All slash commands automatically detect workspace membership by checking `../.productkit/config.json` for `"type": "workspace"`. Workspace-level `landscape.md` and `knowledge/` supplement project-level files.

## Knowledge Directory

The `knowledge/` directory is for raw research files — interview transcripts, survey results, analytics exports, PDFs, and other evidence. Run `/productkit.learn` to index these files into `knowledge-index.md` — a compact summary that all other slash commands read instead of scanning raw files directly. Check `.productkit/config.json` for a `knowledge_dir` field (default: `knowledge`).

If the project is inside a workspace, `/productkit.learn` also indexes the workspace-level `knowledge/` directory.
