---
name: pm-workflow
description: Understands the Product Kit workflow ordering and artifact dependencies. Use when the user asks about what to do next, which command to run, or how the product thinking workflow fits together.
---

# Product Kit Workflow

You are aware of the Product Kit structured product thinking workflow. When users ask about workflow ordering or what to do next, guide them through this sequence.

## Command Order

The recommended workflow order is:

0. `/product-kit:landscape` — Capture company, team, and domain context (run once, before everything else)
1. `/product-kit:constitution` — Define product principles and values
2. `/product-kit:compete` — Map competitive landscape and surface gaps
3. `/product-kit:users` — Define target user personas
4. `/product-kit:problem` — Frame the problem statement
5. `/product-kit:assumptions` — Extract and prioritize assumptions
6. `/product-kit:validate` — Validate assumptions with interviews and surveys
7. `/product-kit:solution` — Brainstorm and evaluate solutions
8. `/product-kit:prioritize` — Score and rank features
9. `/product-kit:spec` — Generate a complete product spec

Utility commands (run anytime):
- `/product-kit:clarify` — Resolve ambiguities across artifacts
- `/product-kit:analyze` — Run a completeness/consistency check
- `/product-kit:bootstrap` — Auto-draft all artifacts from an existing codebase
- `/product-kit:audit` — Compare spec against codebase and surface gaps
- `/product-kit:learn` — Index knowledge directory into a compact summary

## Artifact Dependencies

Each command reads previous artifacts to maintain consistency:

- `landscape` — no dependencies (run first at workspace or project level)
- `constitution` — reads `landscape.md` if it exists
- `compete` — reads `landscape.md` and `constitution.md` if they exist
- `users` — reads `landscape.md` and `constitution.md` if they exist
- `problem` — requires `users.md`; reads `compete.md`, `landscape.md` if they exist
- `assumptions` — requires `users.md` and `problem.md`; reads `landscape.md` if it exists
- `validate` — requires `assumptions.md`; reads `users.md`, `problem.md`, `landscape.md` if they exist
- `solution` — requires `users.md`, `problem.md`, and `validation.md`; reads `compete.md`, `landscape.md` if they exist
- `prioritize` — requires `solution.md`, `users.md`, and `problem.md`; reads `compete.md`, `landscape.md` if they exist
- `spec` — requires `users.md`, `problem.md`, and `solution.md`; reads `compete.md`, `landscape.md` if they exist

## Artifacts

Commands produce these markdown files in the project root (or in the directory specified by `artifact_dir` in `.productkit/config.json`):
- `landscape.md` — Company, team, and domain landscape
- `constitution.md` — Product principles and values
- `compete.md` — Competitive analysis and market gaps
- `users.md` — Target user personas
- `problem.md` — Problem statement
- `assumptions.md` — Prioritized assumptions
- `validation.md` — Assumption validation results, interview scripts, and survey questions
- `solution.md` — Chosen solution with alternatives considered
- `priorities.md` — Scored and ranked feature list
- `spec.md` — Complete product spec ready for engineering
- `knowledge-index.md` — Summary index of research files in `knowledge/`

## Knowledge Directory

Run `/product-kit:learn` to index the `knowledge/` directory into `knowledge-index.md`. All other slash commands read this index instead of scanning raw files directly. Run `/product-kit:learn` again whenever you add new research files.

## Workspace Support

Projects can live inside a workspace (parent directory with `../.productkit/config.json` containing `"type": "workspace"`). When inside a workspace:
- `landscape.md` at the workspace root provides shared company/domain context
- `knowledge/` at the workspace root provides shared research files (indexed via `/product-kit:learn`)
- All commands automatically detect workspace membership and read both project-level and workspace-level `knowledge-index.md`

## Guidance

- If a user is starting fresh, recommend beginning with `/product-kit:landscape` to front-load company context, then `/product-kit:constitution`, `/product-kit:compete`, and `/product-kit:users`
- If a required artifact is missing, tell the user which command to run first
- If the user seems stuck, suggest `/product-kit:analyze` to assess their progress
- If artifacts seem inconsistent, suggest `/product-kit:clarify`
- For existing projects, suggest `/product-kit:bootstrap` to auto-draft all artifacts from the codebase
- After implementation, suggest `/product-kit:audit` to compare spec against code
