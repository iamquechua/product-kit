#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const initCommand = require('./commands/init');
const checkCommand = require('./commands/check');
const statusCommand = require('./commands/status');
const updateCommand = require('./commands/update');
const resetCommand = require('./commands/reset');
const listCommand = require('./commands/list');

const program = new Command();

program
  .name('productkit')
  .description(chalk.cyan.bold('Product thinking toolkit for Claude Code'))
  .version('1.6.0');

program
  .command('init [projectName]')
  .description('Initialize a new product research project')
  .option('--existing', 'Add Product Kit to the current directory')
  .action(initCommand);

program
  .command('check')
  .description('Verify Claude Code is installed and available')
  .action(checkCommand);

program
  .command('status')
  .description('Show which artifacts exist and what steps remain')
  .action(statusCommand);

program
  .command('update')
  .description('Refresh slash commands to the latest version')
  .action(updateCommand);

program
  .command('reset')
  .description('Remove all artifacts and start over')
  .action(resetCommand);

program
  .command('list')
  .description('Show available slash commands with descriptions')
  .action(listCommand);

program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
