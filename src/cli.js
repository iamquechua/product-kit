#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const initCommand = require('./commands/init');
const checkCommand = require('./commands/check');

const program = new Command();

program
  .name('productkit')
  .description(chalk.cyan.bold('Product thinking toolkit for Claude Code'))
  .version('1.1.0');

program
  .command('init <projectName>')
  .description('Initialize a new product research project')
  .action(initCommand);

program
  .command('check')
  .description('Verify Claude Code is installed and available')
  .action(checkCommand);

program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
