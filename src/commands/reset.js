const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const ARTIFACTS = [
  'constitution.md',
  'users.md',
  'problem.md',
  'assumptions.md',
  'solution.md',
  'priorities.md',
  'spec.md',
];

function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function reset(options) {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  // Find existing artifacts
  const existing = ARTIFACTS.filter(file =>
    fs.existsSync(path.join(root, file))
  );

  if (existing.length === 0) {
    console.log();
    console.log(chalk.green.bold('Nothing to reset — no artifacts found.'));
    console.log();
    return;
  }

  // Show what will be deleted
  console.log();
  console.log(chalk.yellow.bold(`Found ${existing.length} artifact${existing.length === 1 ? '' : 's'}:`));
  for (const file of existing) {
    console.log(chalk.yellow(`  ${file}`));
  }
  console.log();

  // Confirm unless --force
  if (!options.force) {
    const yes = await confirm(chalk.red('Delete these artifacts? (y/N) '));
    if (!yes) {
      console.log('Reset cancelled.');
      return;
    }
    console.log();
  }

  for (const file of existing) {
    fs.removeSync(path.join(root, file));
    console.log(chalk.yellow(`  removed ${file}`));
  }

  console.log();
  console.log(chalk.green.bold(`Reset complete. ${existing.length} artifact${existing.length === 1 ? '' : 's'} removed.`));
  console.log();
}

module.exports = reset;
