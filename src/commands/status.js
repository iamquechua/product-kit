const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getArtifactDir, getWorkspaceRoot } = require('../utils/fileUtils');

const ARTIFACTS = [
  { file: 'constitution.md', command: '/productkit.constitution', label: 'Constitution' },
  { file: 'users.md', command: '/productkit.users', label: 'Users' },
  { file: 'problem.md', command: '/productkit.problem', label: 'Problem' },
  { file: 'assumptions.md', command: '/productkit.assumptions', label: 'Assumptions' },
  { file: 'validation.md', command: '/productkit.validate', label: 'Validation' },
  { file: 'solution.md', command: '/productkit.solution', label: 'Solution' },
  { file: 'priorities.md', command: '/productkit.prioritize', label: 'Priorities' },
  { file: 'spec.md', command: '/productkit.spec', label: 'Spec' },
];

async function status() {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const artifactDir = getArtifactDir(root);
  const workspaceRoot = getWorkspaceRoot(root);
  const done = [];
  const remaining = [];

  for (const artifact of ARTIFACTS) {
    const exists = fs.existsSync(path.join(artifactDir, artifact.file));
    if (exists) {
      done.push(artifact);
    } else {
      remaining.push(artifact);
    }
  }

  console.log();

  // Show workspace landscape status if in a workspace
  if (workspaceRoot) {
    const landscapeExists = fs.existsSync(path.join(workspaceRoot, 'landscape.md'));
    console.log(chalk.bold('Workspace:'));
    if (landscapeExists) {
      console.log(chalk.green('  done  Landscape (landscape.md)'));
    } else {
      console.log(chalk.yellow('  todo  Landscape — run /productkit.landscape from workspace root'));
    }
    console.log();
  }

  console.log(chalk.bold(`Progress: ${done.length}/${ARTIFACTS.length} artifacts`));
  console.log();

  if (done.length > 0) {
    console.log(chalk.green.bold('Completed:'));
    for (const a of done) {
      console.log(chalk.green(`  done  ${a.label} (${a.file})`));
    }
    console.log();
  }

  if (remaining.length > 0) {
    console.log(chalk.yellow.bold('Remaining:'));
    for (const a of remaining) {
      console.log(chalk.yellow(`  todo  ${a.label} — run ${a.command}`));
    }
    console.log();
  }

  if (remaining.length === 0) {
    console.log(chalk.green.bold('All artifacts complete!'));
    console.log();
  } else {
    console.log(chalk.cyan(`Next step: ${remaining[0].command}`));
    console.log();
  }
}

module.exports = status;
