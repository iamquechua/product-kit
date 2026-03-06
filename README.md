# Product Kit

Slash-command-driven product thinking toolkit for [Claude Code](https://claude.com/claude-code).

Product Kit gives PMs a structured workflow for validating product ideas — user personas, problem statements, assumptions mapping — all through guided AI conversations.

**[Read the full guide →](https://realdouno.github.io/product-kit/)**

## Prerequisites

- **Node.js** 18 or later
- **[Claude Code](https://claude.com/claude-code)** installed and available in your PATH

Verify Claude Code is ready:

```bash
claude --version
```

## Setup

### From npm

```bash
npm install -g productkit
```

### From source

```bash
git clone https://github.com/realdouno/product-kit.git
cd product-kit
npm install
npm link   # makes `productkit` available globally
```

## Usage

### 1. Create a project

```bash
productkit init my-project
cd my-project
```

This scaffolds a project with slash commands, a `CLAUDE.md` context file, a `knowledge/` directory for research files, and a `.productkit/` config directory.

For existing projects:

```bash
cd my-existing-project
productkit init --existing
```

To keep artifacts out of the project root (recommended for busy codebases):

```bash
productkit init --existing --artifact-dir docs/product
```

To create a shared workspace for multi-project orgs:

```bash
productkit workspace my-company
cd my-company
productkit init my-app
productkit init admin-dashboard
```

The workspace holds shared `landscape.md` and `knowledge/` that all projects inside it inherit automatically. `init` auto-detects when it's run inside a workspace.

### 2. Open Claude Code

```bash
claude
```

### 3. Run the slash commands in order

Each command starts a guided conversation. Claude asks questions, pushes back on vague answers, and writes a markdown artifact when done.

| Step | Command | What it does | Output |
|------|---------|-------------|--------|
| 0 | `/productkit.landscape` | Capture company, team, and domain landscape | `landscape.md` |
| 1 | `/productkit.constitution` | Define product principles and values | `constitution.md` |
| 2 | `/productkit.users` | Define target user personas through dialogue | `users.md` |
| 3 | `/productkit.problem` | Frame the problem statement grounded in user research | `problem.md` |
| 4 | `/productkit.assumptions` | Extract and prioritize hidden assumptions | `assumptions.md` |
| 5 | `/productkit.validate` | Validate assumptions with interviews and surveys | `validation.md` |
| 6 | `/productkit.solution` | Brainstorm and evaluate solution ideas | `solution.md` |
| 7 | `/productkit.prioritize` | Score and rank features for v1 | `priorities.md` |
| 8 | `/productkit.spec` | Generate a complete product spec | `spec.md` |
| — | `/productkit.clarify` | Resolve ambiguities and contradictions across artifacts | Updates existing files |
| — | `/productkit.analyze` | Run a consistency and completeness check | Analysis in chat |
| — | `/productkit.bootstrap` | Auto-draft all artifacts from existing codebase | All missing artifacts |
| — | `/productkit.audit` | Compare spec against codebase, surface gaps | `audit.md` |
| — | `/productkit.learn` | Index knowledge directory into a compact summary | `knowledge-index.md` |
| — | `/productkit.techreview` | Review spec against codebase, flag engineering questions | `techreview.md` |
| — | `/productkit.stories` | Break spec into user stories with acceptance criteria | `stories.md` |

Commands build on each other — every command reads `landscape.md` and `knowledge-index.md` for evidence, `/productkit.problem` reads your `users.md`, `/productkit.solution` reads your problem and users, and `/productkit.spec` synthesizes everything into a single document. You can run `/productkit.clarify` and `/productkit.analyze` at any stage to check your work.

### 4. Review your artifacts

After running the commands, your project contains:

```
my-project/
├── landscape.md             # Company & domain landscape
├── constitution.md        # Product principles
├── users.md               # User personas
├── problem.md             # Problem statement
├── assumptions.md         # Prioritized assumptions
├── validation.md          # Validation results & scripts
├── solution.md            # Chosen solution
├── priorities.md          # Ranked feature list
├── spec.md                # Complete product spec
├── audit.md               # Spec vs codebase audit (on demand)
├── knowledge-index.md     # Summary index of knowledge/ files
├── knowledge/             # Raw research files (interviews, surveys, etc.)
├── techreview.md          # Technical feasibility review (on demand)
├── stories.md             # User stories by epic (on demand)
├── .productkit/config.json
├── .claude/commands/      # Slash command prompts
├── CLAUDE.md
├── README.md
└── .gitignore
```

If you used `--artifact-dir docs/product`, artifacts live in `docs/product/` instead of the project root.

These markdown files are your product foundation — share them with your team, commit them to git, or hand `spec.md` to engineering.

## CLI Commands

| Command | Description |
|---------|-------------|
| `productkit init <name>` | Scaffold a new project |
| `productkit init --existing` | Add Product Kit to the current directory |
| `productkit init --minimal` | Skip constitution, start with users/problem |
| `productkit init --mode <solo\|team>` | Set building mode (solo builder vs team with engineers) |
| `productkit init --artifact-dir <dir>` | Store artifacts in a custom directory |
| `productkit workspace <name>` | Create a shared workspace for multi-project orgs |
| `productkit status` | Show progress — which artifacts exist and what's next |
| `productkit export` | Export all artifacts as a single combined markdown file |
| `productkit export --output <file>` | Export to a custom filename |
| `productkit export --stories-csv` | Export stories as CSV for Jira/Linear/Shortcut import |
| `productkit diff` | Show what changed in artifacts since last commit |
| `productkit diff --staged` | Show staged artifact changes |
| `productkit doctor` | Check project health (missing files, outdated commands) |
| `productkit update` | Refresh slash commands to the latest version |
| `productkit reset` | Remove all artifacts and start over |
| `productkit list` | Show available slash commands with descriptions |
| `productkit completion` | Output shell completion script (bash/zsh) |
| `productkit check` | Verify Claude Code is installed |

## Cowork Plugin (No CLI Required)

If you prefer Claude Cowork over the command line, Product Kit is also available as a Cowork plugin. Same guided workflows, no terminal needed.

1. Download [`product-kit-plugin.zip`](https://github.com/realdouno/product-kit/releases/download/latest-plugin/product-kit-plugin.zip) from [GitHub Releases](https://github.com/realdouno/product-kit/releases/tag/latest-plugin)
2. In Cowork, go to **Plugins → + → Upload plugin**
3. Select the zip file

Once installed, type `/product-kit:users`, `/product-kit:problem`, etc. in Cowork's chat. See [plugin/README.md](plugin/README.md) for details.

## How It Works

Product Kit is a thin scaffolding tool. The real work happens in slash commands — markdown prompt files that live in `.claude/commands/`. When you type `/productkit.users` in Claude Code, it reads the prompt file and starts a guided conversation.

Each prompt tells Claude:
- What role to play (PM coach, research specialist, etc.)
- What artifacts to read first (enforces workflow ordering)
- How to guide the conversation (questions to ask, what to push back on)
- What file to write and in what format

You can customize any slash command by editing the files in `.claude/commands/`.

## License

MIT
