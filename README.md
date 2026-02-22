# Product Kit

Slash-command-driven product thinking toolkit for [Claude Code](https://claude.com/claude-code).

Product Kit gives PMs a structured workflow for validating product ideas — user personas, problem statements, assumptions mapping — all through guided AI conversations.

## Prerequisites

- **Node.js** 18 or later
- **[Claude Code](https://claude.com/claude-code)** installed and available in your PATH

Verify Claude Code is ready:

```bash
claude --version
```

## Setup

### From npm (once published)

```bash
npm install -g productkit
```

### From source

```bash
git clone https://github.com/douno/product-kit.git
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

This scaffolds a project with slash commands, a `CLAUDE.md` context file, and a `.productkit/` config directory.

### 2. Open Claude Code

```bash
claude
```

### 3. Run the slash commands in order

Each command starts a guided conversation. Claude asks questions, pushes back on vague answers, and writes a markdown artifact when done.

| Step | Command | What it does | Output |
|------|---------|-------------|--------|
| 1 | `/productkit.constitution` | Define product principles and values | `constitution.md` |
| 2 | `/productkit.users` | Define target user personas through dialogue | `users.md` |
| 3 | `/productkit.problem` | Frame the problem statement grounded in user research | `problem.md` |
| 4 | `/productkit.assumptions` | Extract and prioritize hidden assumptions | `assumptions.md` |
| 5 | `/productkit.clarify` | Resolve ambiguities and contradictions across artifacts | Updates existing files |
| 6 | `/productkit.analyze` | Run a consistency and completeness check | Analysis in chat |

Commands build on each other — `/productkit.problem` reads your `users.md` to ground the problem in real user needs. `/productkit.assumptions` reads both `users.md` and `problem.md` to find hidden assumptions. You can run `/productkit.clarify` and `/productkit.analyze` at any stage to check your work.

### 4. Review your artifacts

After running the commands, your project root contains:

```
my-project/
├── constitution.md        # Product principles
├── users.md               # User personas
├── problem.md             # Problem statement
├── assumptions.md         # Prioritized assumptions
├── .productkit/config.json
├── .claude/commands/      # Slash command prompts
├── CLAUDE.md
├── README.md
└── .gitignore
```

These markdown files are your product foundation — share them with your team, commit them to git, or use them as input for solution design.

## CLI Commands

| Command | Description |
|---------|-------------|
| `productkit init <name>` | Scaffold a new project |
| `productkit check` | Verify Claude Code is installed |

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
