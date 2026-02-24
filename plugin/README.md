# Product Kit — Cowork Plugin

Structured product thinking for Claude Cowork. No command line required.

## Install

### Claude Cowork (GUI)

1. Download `product-kit-plugin.zip` from [GitHub Releases](https://github.com/iamquechua/product-kit/releases)
2. In Cowork, go to **Plugins → + → Upload plugin**
3. Select the zip file

### Claude Code (CLI)

```bash
claude --plugin-dir ./plugin
```

## Commands

| Command | What it does | Output |
|---------|-------------|--------|
| `/product-kit:constitution` | Define product principles and values | `constitution.md` |
| `/product-kit:users` | Define target user personas | `users.md` |
| `/product-kit:problem` | Frame the problem statement | `problem.md` |
| `/product-kit:assumptions` | Extract and prioritize assumptions | `assumptions.md` |
| `/product-kit:solution` | Brainstorm and evaluate solutions | `solution.md` |
| `/product-kit:prioritize` | Score and rank features | `priorities.md` |
| `/product-kit:spec` | Generate a product spec | `spec.md` |
| `/product-kit:clarify` | Resolve ambiguities across artifacts | Updates existing files |
| `/product-kit:analyze` | Run completeness/consistency check | In-conversation report |

## Workflow

Start with `/product-kit:constitution` or `/product-kit:users`, then work through the commands in order. Each command reads previous artifacts to maintain consistency.

## Learn More

See the [main README](../README.md) for full documentation or the [online guide](https://iamquechua.github.io/product-kit/) for a step-by-step walkthrough.
