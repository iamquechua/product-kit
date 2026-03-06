const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getWorkspaceRoot } = require('../utils/fileUtils');

async function list() {
  const root = process.cwd();
  const commandsDir = path.join(root, '.claude', 'commands');

  if (!fs.existsSync(commandsDir)) {
    console.error(chalk.red('No slash commands found.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const files = fs.readdirSync(commandsDir)
    .filter(f => f.startsWith('productkit.') && f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.log(chalk.yellow('No Product Kit slash commands found.'));
    process.exit(0);
  }

  console.log();
  console.log(chalk.bold('Available slash commands:'));
  console.log();

  // Show workspace landscape command if in a workspace
  const workspaceRoot = getWorkspaceRoot(root);
  if (workspaceRoot) {
    const landscapePath = path.join(workspaceRoot, '.claude', 'commands', 'productkit.landscape.md');
    if (fs.existsSync(landscapePath)) {
      const content = fs.readFileSync(landscapePath, 'utf-8');
      let description = '';
      const match = content.match(/^---\s*\n[\s\S]*?description:\s*(.+)\n[\s\S]*?---/);
      if (match) description = match[1].trim();

      console.log(`  ${chalk.cyan('/productkit.landscape')} ${chalk.dim('(workspace)')}`);
      if (description) console.log(`    ${description}`);
      console.log();
    }
  }

  for (const file of files) {
    const name = '/' + file.replace('.md', '');
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf-8');

    // Extract description from front-matter
    let description = '';
    const match = content.match(/^---\s*\n[\s\S]*?description:\s*(.+)\n[\s\S]*?---/);
    if (match) {
      description = match[1].trim();
    }

    console.log(`  ${chalk.cyan(name)}`);
    if (description) {
      console.log(`    ${description}`);
    }
    console.log();
  }
}

module.exports = list;
