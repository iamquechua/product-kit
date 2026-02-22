const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const ARTIFACTS = [
  'constitution.md',
  'users.md',
  'problem.md',
  'assumptions.md',
  'solution.md',
  'priorities.md',
  'spec.md',
];

async function reset() {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  let removed = 0;

  for (const file of ARTIFACTS) {
    const filePath = path.join(root, file);
    if (fs.existsSync(filePath)) {
      fs.removeSync(filePath);
      console.log(chalk.yellow(`  removed ${file}`));
      removed++;
    }
  }

  console.log();
  if (removed > 0) {
    console.log(chalk.green.bold(`Reset complete. ${removed} artifact${removed === 1 ? '' : 's'} removed.`));
  } else {
    console.log(chalk.green.bold('Nothing to reset — no artifacts found.'));
  }
  console.log();
}

module.exports = reset;
