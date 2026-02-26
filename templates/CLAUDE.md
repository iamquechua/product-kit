# Product Kit Project

This project uses Product Kit for structured product thinking.

## Slash Commands

Use these commands in order to build your product foundation:

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
12. `/productkit.audit` — Compare spec against codebase and surface gaps

## Artifacts

Product artifacts are written as markdown files. Check `.productkit/config.json` for an `artifact_dir` field — if set, artifacts live in that directory instead of the project root. Default artifact locations:
- `constitution.md` — Product principles and values
- `users.md` — Target user personas
- `problem.md` — Problem statement
- `assumptions.md` — Prioritized assumptions
- `validation.md` — Assumption validation results, interview scripts, and survey questions
- `solution.md` — Chosen solution with alternatives considered
- `priorities.md` — Scored and ranked feature list
- `spec.md` — Complete product spec ready for engineering

## Workflow

Start with `/productkit.constitution` or `/productkit.users`, then work through the commands in order. Each command reads previous artifacts to maintain consistency.

For existing projects, use `/productkit.bootstrap` to auto-draft all artifacts from your codebase in one session.
