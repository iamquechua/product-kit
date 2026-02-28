const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execFileSync } = require('child_process');

async function doctor() {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const results = { pass: 0, warn: 0, fail: 0 };

  function pass(msg) { results.pass++; console.log(chalk.green(`  pass  ${msg}`)); }
  function warn(msg) { results.warn++; console.log(chalk.yellow(`  warn  ${msg}`)); }
  function fail(msg) { results.fail++; console.log(chalk.red(`  fail  ${msg}`)); }

  console.log();
  console.log(chalk.bold('Project health check'));
  console.log();

  // 1. Config file
  try {
    const config = fs.readJsonSync(configPath);
    if (config.version) {
      pass('Config file is valid');
    } else {
      warn('Config file missing version field');
    }
  } catch {
    fail('Config file is not valid JSON');
  }

  // 2. Commands directory
  const commandsDir = path.join(root, '.claude', 'commands');
  if (fs.existsSync(commandsDir)) {
    pass('Commands directory exists');
  } else {
    fail('Commands directory missing (.claude/commands/)');
  }

  // 3. Check for expected command templates
  const templatesDir = path.join(__dirname, '..', '..', 'templates', 'commands');
  let expectedCommands;
  try {
    expectedCommands = fs.readdirSync(templatesDir);
  } catch {
    fail('Templates directory missing — Product Kit installation may be corrupted');
    expectedCommands = [];
  }

  // Account for minimal mode
  let config = {};
  try { config = fs.readJsonSync(configPath); } catch {}
  // Landscape is workspace-only; constitution is skipped in minimal mode
  const skippable = ['productkit.landscape.md'];
  if (config.minimal) skippable.push('productkit.constitution.md');

  const missing = [];
  for (const cmd of expectedCommands) {
    if (skippable.includes(cmd)) continue;
    if (!fs.existsSync(path.join(commandsDir, cmd))) {
      missing.push(cmd);
    }
  }

  if (missing.length === 0) {
    pass('All expected command templates present');
  } else {
    for (const m of missing) {
      fail(`Missing command template: ${m}`);
    }
  }

  // 4. Check for outdated commands
  const outdated = [];
  for (const cmd of expectedCommands) {
    if (skippable.includes(cmd)) continue;
    const installedPath = path.join(commandsDir, cmd);
    if (!fs.existsSync(installedPath)) continue;

    const installed = fs.readFileSync(installedPath, 'utf-8');
    const bundled = fs.readFileSync(path.join(templatesDir, cmd), 'utf-8');
    if (installed !== bundled) {
      outdated.push(cmd);
    }
  }

  if (outdated.length === 0) {
    pass('All command templates up to date');
  } else {
    for (const o of outdated) {
      warn(`Outdated command: ${o} — run productkit update`);
    }
  }

  // 5. Git initialized
  try {
    execFileSync('git', ['rev-parse', '--git-dir'], { cwd: root, stdio: 'ignore' });
    pass('Git repository initialized');
  } catch {
    warn('No git repository — consider running git init');
  }

  // Summary
  console.log();
  const parts = [];
  if (results.pass > 0) parts.push(chalk.green(`${results.pass} passed`));
  if (results.warn > 0) parts.push(chalk.yellow(`${results.warn} warning(s)`));
  if (results.fail > 0) parts.push(chalk.red(`${results.fail} failed`));
  console.log(chalk.bold('Result: ') + parts.join(', '));
  console.log();

  if (results.fail > 0) {
    process.exit(1);
  }
}

module.exports = doctor;
