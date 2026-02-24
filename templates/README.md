# {{PROJECT_NAME}}

A product research project powered by [Product Kit](https://github.com/iamquechua/product-kit). See the [full guide](https://iamquechua.github.io/product-kit/) for a walkthrough.

## Getting Started

```bash
claude
```

Then use the slash commands to build your product foundation:

1. `/productkit.constitution` — Define your product principles
2. `/productkit.users` — Define target user personas
3. `/productkit.problem` — Frame the problem statement
4. `/productkit.assumptions` — Extract and prioritize assumptions
5. `/productkit.solution` — Brainstorm and evaluate solutions
6. `/productkit.prioritize` — Score and rank features
7. `/productkit.spec` — Generate a product spec
8. `/productkit.stories` — Break spec into user stories
9. `/productkit.clarify` — Resolve ambiguities
10. `/productkit.analyze` — Check consistency and completeness
11. `/productkit.bootstrap` — Auto-draft all artifacts from existing codebase

## Artifacts

Artifacts are written to the project root by default. If `artifact_dir` is set in `.productkit/config.json`, they are written there instead.

| File | Description |
|------|-------------|
| `constitution.md` | Product principles and values |
| `users.md` | Target user personas |
| `problem.md` | Problem statement |
| `assumptions.md` | Prioritized assumptions |
| `solution.md` | Chosen solution with alternatives considered |
| `priorities.md` | Scored and ranked feature list |
| `spec.md` | Complete product spec ready for engineering |
| `stories.md` | User stories with acceptance criteria |
