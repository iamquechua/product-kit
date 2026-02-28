# {{PROJECT_NAME}}

A product research project powered by [Product Kit](https://github.com/iamquechua/product-kit). See the [full guide](https://iamquechua.github.io/product-kit/) for a walkthrough.

## Getting Started

```bash
claude
```

Then use the slash commands to build your product foundation:

0. `/productkit.landscape` — Capture company, team, and domain context
1. `/productkit.constitution` — Define your product principles
2. `/productkit.users` — Define target user personas
3. `/productkit.problem` — Frame the problem statement
4. `/productkit.assumptions` — Extract and prioritize assumptions
5. `/productkit.validate` — Validate assumptions with interviews and surveys
6. `/productkit.solution` — Brainstorm and evaluate solutions
7. `/productkit.prioritize` — Score and rank features
8. `/productkit.spec` — Generate a product spec
9. `/productkit.clarify` — Resolve ambiguities
10. `/productkit.analyze` — Check consistency and completeness
11. `/productkit.bootstrap` — Auto-draft all artifacts from existing codebase
12. `/productkit.audit` — Compare spec against actual implementation
13. `/productkit.learn` — Index knowledge directory for faster commands
14. `/productkit.techreview` — Review spec against codebase, flag engineering questions
15. `/productkit.stories` — Break spec into user stories with acceptance criteria

## Artifacts

Artifacts are written to the project root by default. If `artifact_dir` is set in `.productkit/config.json`, they are written there instead.

| File | Description |
|------|-------------|
| `landscape.md` | Company, team, and domain landscape |
| `constitution.md` | Product principles and values |
| `users.md` | Target user personas |
| `problem.md` | Problem statement |
| `assumptions.md` | Prioritized assumptions |
| `validation.md` | Assumption validation, interview scripts, survey questions |
| `solution.md` | Chosen solution with alternatives considered |
| `priorities.md` | Scored and ranked feature list |
| `spec.md` | Complete product spec ready for engineering |
| `audit.md` | Spec vs codebase audit with gap analysis |
| `knowledge-index.md` | Summary index of research files in `knowledge/` |
| `techreview.md` | Technical feasibility review with effort estimates |
| `stories.md` | User stories grouped by epic with acceptance criteria |

## Workspaces

If this project lives inside a workspace (created with `productkit workspace <name>`), the workspace root contains shared `landscape.md` and `knowledge/` that all projects inherit automatically.

## Knowledge Directory

Drop raw research files into the `knowledge/` directory — interview transcripts, survey results, analytics exports, PDFs, etc. Run `/productkit.learn` to index these files into `knowledge-index.md` — all other slash commands read this index instead of scanning raw files directly. If inside a workspace, `/productkit.learn` also indexes the workspace-level `knowledge/` directory.
