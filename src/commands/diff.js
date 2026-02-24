const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { getArtifactDir } = require('../utils/fileUtils');

const ARTIFACT_FILES = [
  'constitution.md',
  'users.md',
  'problem.md',
  'assumptions.md',
  'solution.md',
  'priorities.md',
  'spec.md',
  'stories.md',
];

async function diff(options) {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  // Check if git is available
  try {
    execSync('git rev-parse --git-dir', { cwd: root, stdio: 'ignore' });
  } catch {
    console.error(chalk.red('Not a git repository. The diff command requires git.'));
    process.exit(1);
  }

  const artifactDir = getArtifactDir(root);
  const relDir = path.relative(root, artifactDir);
  const existing = ARTIFACT_FILES
    .map(f => relDir && relDir !== '.' ? path.join(relDir, f) : f)
    .filter(f => fs.existsSync(path.join(root, f)));

  if (existing.length === 0) {
    console.error(chalk.red('No artifacts found. Run some slash commands first.'));
    process.exit(1);
  }

  const gitArgs = options.staged ? ['diff', '--cached'] : ['diff'];
  const cmd = ['git', ...gitArgs, '--', ...existing].join(' ');

  let output;
  try {
    output = execSync(cmd, { cwd: root, encoding: 'utf-8' });
  } catch (err) {
    // git diff returns exit code 1 when there are differences in some configs
    output = err.stdout || '';
  }

  if (!output) {
    console.log(chalk.yellow('No changes to artifacts since last commit.'));
    if (!options.staged) {
      console.log(chalk.dim('Tip: use --staged to see staged changes.'));
    }
    return;
  }

  console.log(output);
}

module.exports = diff;
