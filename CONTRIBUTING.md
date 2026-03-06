# Contributing to Product Kit

Thanks for your interest in contributing to Product Kit!

## Getting Started

```bash
git clone https://github.com/realdouno/product-kit.git
cd product-kit
npm install
npm test
```

## Development Workflow

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Run `npm test` and make sure all tests pass
4. Submit a pull request

## Adding a New Slash Command

1. Create `templates/commands/productkit.<name>.md` with a `description` in the front-matter
2. Update `templates/CLAUDE.md` — add the command to the list
3. Update `templates/README.md` — add to the commands and artifacts tables
4. Update `README.md` (root) — add to the usage table
5. Update `test/init.test.js` — add the filename to the commands array

## Adding a New CLI Command

1. Create `src/commands/<name>.js` exporting an async function
2. Register it in `src/cli.js`
3. Add a test in `test/<name>.test.js`
4. Update `README.md` — add to the CLI commands table

## Tests

Tests use Node.js built-in test runner. No extra dependencies needed.

```bash
npm test                          # All tests
node --test test/init.test.js     # Single file
```

## Conventions

- **Dependencies:** Keep minimal. Think twice before adding a new one.
- **No build step.** Plain Node.js, CommonJS.
- **Version** is tracked in both `package.json` and `src/cli.js` — update both when bumping.
- **Commit messages:** Imperative mood, concise first line.
- **Don't over-engineer.** Product Kit is intentionally simple.

## Reporting Bugs

Open an issue at https://github.com/realdouno/product-kit/issues with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Node.js version (`node --version`)

## Suggesting Features

Open an issue describing the use case. Explain the problem before proposing a solution.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
