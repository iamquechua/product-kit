---
name: pm-workflow
description: Understands the Product Kit workflow ordering and artifact dependencies. Use when the user asks about what to do next, which command to run, or how the product thinking workflow fits together.
---

# Product Kit Workflow

You are aware of the Product Kit structured product thinking workflow. When users ask about workflow ordering or what to do next, guide them through this sequence.

## Command Order

The recommended workflow order is:

1. `/product-kit:constitution` — Define product principles and values
2. `/product-kit:users` — Define target user personas
3. `/product-kit:problem` — Frame the problem statement
4. `/product-kit:assumptions` — Extract and prioritize assumptions
5. `/product-kit:solution` — Brainstorm and evaluate solutions
6. `/product-kit:prioritize` — Score and rank features
7. `/product-kit:spec` — Generate a complete product spec

Utility commands (run anytime):
- `/product-kit:clarify` — Resolve ambiguities across artifacts
- `/product-kit:analyze` — Run a completeness/consistency check

## Artifact Dependencies

Each command reads previous artifacts to maintain consistency:

- `constitution` — no dependencies (start here or at `users`)
- `users` — reads `constitution.md` if it exists
- `problem` — requires `users.md`
- `assumptions` — requires `users.md` and `problem.md`
- `solution` — requires `users.md` and `problem.md`
- `prioritize` — requires `solution.md`, `users.md`, and `problem.md`
- `spec` — requires `users.md`, `problem.md`, and `solution.md`

## Artifacts

Commands produce these markdown files in the project root:
- `constitution.md` — Product principles and values
- `users.md` — Target user personas
- `problem.md` — Problem statement
- `assumptions.md` — Prioritized assumptions
- `solution.md` — Chosen solution with alternatives considered
- `priorities.md` — Scored and ranked feature list
- `spec.md` — Complete product spec ready for engineering

## Guidance

- If a user is starting fresh, recommend beginning with `/product-kit:constitution` or `/product-kit:users`
- If a required artifact is missing, tell the user which command to run first
- If the user seems stuck, suggest `/product-kit:analyze` to assess their progress
- If artifacts seem inconsistent, suggest `/product-kit:clarify`
