# Product Kit — Contributor Guide

## What This Is

Product Kit is a CLI that scaffolds Claude Code slash commands for structured product discovery. The CLI is a thin scaffolding tool — all PM workflow lives in the slash command templates.

## Architecture

```
src/
├── cli.js              # Entry point — registers commands with commander
├── commands/
│   ├── init.js         # Scaffolds new projects (copies templates/)
│   ├── check.js        # Verifies Claude Code is installed
│   ├── status.js       # Shows artifact progress
│   ├── export.js       # Exports artifacts as combined markdown
│   ├── diff.js         # Shows artifact changes since last commit
│   └── doctor.js       # Checks project health
└── utils/
    └── fileUtils.js    # Project detection + artifact dir helpers

templates/              # Copied into user projects on `init`
├── commands/           # Slash command prompts (.md files)
├── CLAUDE.md           # Agent context for generated projects
├── README.md           # Project readme ({{PROJECT_NAME}} is replaced)
└── gitignore

test/                   # Node.js built-in test runner
examples/               # Example projects
```

## Key Concepts

- **Slash commands** live in `templates/commands/`. Each is a markdown file with a `description` front-matter field and a structured prompt.
- **Artifacts** are the markdown files slash commands produce (`users.md`, `problem.md`, etc.). They're written to the user's project root by default, or to a custom directory if `artifact_dir` is set in `.productkit/config.json`.
- **Workflow ordering** is enforced by each command reading previous artifacts. If a dependency is missing, the command tells the user which command to run first.
- The `init` command copies everything from `templates/` into the target project. It does NOT generate content — it just copies files.

## Development

```bash
npm install
npm test            # Run all tests
npm link            # Test CLI locally
```

## Tests

Tests use Node.js built-in test runner (`node --test`). Each test scaffolds into a temp directory and cleans up after.

```bash
npm test                              # All tests
node --test test/init.test.js         # Single file
```

When adding a new CLI command, add a corresponding `test/<command>.test.js`.

## Adding a New Slash Command

1. Create `templates/commands/productkit.<name>.md` with front-matter `description`
2. Update `templates/CLAUDE.md` — add the command to the list
3. Update `templates/README.md` — add to the commands and artifacts tables
4. Update `README.md` (root) — add to the usage table
5. Update `test/init.test.js` — add the filename to the commands array
6. Run `npm test` to verify

## Adding a New CLI Command

1. Create `src/commands/<name>.js` exporting an async function
2. Register it in `src/cli.js`
3. Add a test in `test/<name>.test.js`
4. Update `README.md` — add to the CLI commands table
5. Run `npm test` to verify

## Conventions

- Dependencies: keep minimal. Currently only commander, chalk, fs-extra.
- No build step. Plain Node.js, CommonJS.
- Version is tracked in both `package.json` and `src/cli.js` — update both when bumping.
- Commit messages: imperative mood, concise first line, details in body if needed.

## Publishing

```bash
# After merging to main:
# 1. Bump version in package.json and src/cli.js
# 2. Commit and push
# 3. npm publish
```
