const chalk = require('chalk');
const { execSync } = require('child_process');

async function check() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    console.log(chalk.green('Claude Code is installed and available.'));
  } catch {
    console.log(chalk.red('Claude Code is not installed or not in PATH.'));
    console.log();
    console.log('Install it:');
    console.log('  npm install -g @anthropic-ai/claude-code');
    process.exit(1);
  }
}

module.exports = check;
