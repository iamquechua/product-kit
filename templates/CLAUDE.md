# Product Kit Project

This project uses Product Kit for structured product thinking.

## Slash Commands

Use these commands in order to build your product foundation:

1. `/productkit.constitution` — Define your product principles
2. `/productkit.users` — Define target user personas
3. `/productkit.problem` — Frame the problem statement
4. `/productkit.assumptions` — Extract and prioritize assumptions
5. `/productkit.solution` — Brainstorm and evaluate solutions
6. `/productkit.prioritize` — Score and rank features
7. `/productkit.spec` — Generate a product spec
8. `/productkit.clarify` — Resolve ambiguities across artifacts
9. `/productkit.analyze` — Run a completeness/consistency check
10. `/productkit.bootstrap` — Auto-draft all artifacts from an existing codebase

## Artifacts

Product artifacts are written to the project root as markdown files:
- `constitution.md` — Product principles and values
- `users.md` — Target user personas
- `problem.md` — Problem statement
- `assumptions.md` — Prioritized assumptions
- `solution.md` — Chosen solution with alternatives considered
- `priorities.md` — Scored and ranked feature list
- `spec.md` — Complete product spec ready for engineering

## Workflow

Start with `/productkit.constitution` or `/productkit.users`, then work through the commands in order. Each command reads previous artifacts to maintain consistency.

For existing projects, use `/productkit.bootstrap` to auto-draft all artifacts from your codebase in one session.
