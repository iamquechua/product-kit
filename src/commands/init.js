const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

function scaffold(projectRoot, projectName) {
  const templatesDir = path.join(__dirname, '..', '..', 'templates');

  // Create directories
  fs.ensureDirSync(path.join(projectRoot, '.productkit'));
  fs.ensureDirSync(path.join(projectRoot, '.claude', 'commands'));

  // Write config
  fs.writeJsonSync(path.join(projectRoot, '.productkit', 'config.json'), {
    version: '1.0.0',
    created: new Date().toISOString(),
  }, { spaces: 2 });

  // Copy slash command templates
  const commandsDir = path.join(templatesDir, 'commands');
  const commandFiles = fs.readdirSync(commandsDir);
  for (const file of commandFiles) {
    fs.copyFileSync(
      path.join(commandsDir, file),
      path.join(projectRoot, '.claude', 'commands', file)
    );
  }

  // Copy CLAUDE.md (don't overwrite existing)
  const claudeMdPath = path.join(projectRoot, 'CLAUDE.md');
  if (!fs.existsSync(claudeMdPath)) {
    fs.copyFileSync(path.join(templatesDir, 'CLAUDE.md'), claudeMdPath);
  } else {
    const existing = fs.readFileSync(claudeMdPath, 'utf-8');
    const template = fs.readFileSync(path.join(templatesDir, 'CLAUDE.md'), 'utf-8');
    fs.writeFileSync(claudeMdPath, existing + '\n' + template);
  }

  // Copy README.md with project name substitution (only for new projects)
  if (!fs.existsSync(path.join(projectRoot, 'README.md'))) {
    let readme = fs.readFileSync(path.join(templatesDir, 'README.md'), 'utf-8');
    readme = readme.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    fs.writeFileSync(path.join(projectRoot, 'README.md'), readme);
  }

  // Copy .gitignore (only for new projects)
  if (!fs.existsSync(path.join(projectRoot, '.gitignore'))) {
    fs.copyFileSync(
      path.join(templatesDir, 'gitignore'),
      path.join(projectRoot, '.gitignore')
    );
  }
}

async function init(projectName, options) {
  if (options.existing) {
    const projectRoot = process.cwd();

    if (fs.existsSync(path.join(projectRoot, '.productkit'))) {
      console.error(chalk.red('Error: This directory is already a Product Kit project.'));
      process.exit(1);
    }

    try {
      scaffold(projectRoot, path.basename(projectRoot));

      console.log(chalk.green.bold('Product Kit added to existing project!'));
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log('  1. claude');
      console.log('  2. /productkit.constitution');
      console.log();
    } catch (error) {
      console.error(chalk.red('Error initializing:'), error.message);
      process.exit(1);
    }
    return;
  }

  if (!projectName) {
    console.error(chalk.red('Error: Project name is required. Use --existing to init in current directory.'));
    process.exit(1);
  }

  const projectRoot = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectRoot)) {
    console.error(chalk.red(`Error: Directory "${projectName}" already exists`));
    process.exit(1);
  }

  try {
    scaffold(projectRoot, projectName);

    // Init git repo
    const { execSync } = require('child_process');
    try {
      execSync('git init', { cwd: projectRoot, stdio: 'ignore' });
    } catch {
      // Git not available, skip
    }

    console.log(chalk.green.bold('Project initialized successfully!'));
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(`  1. cd ${projectName}`);
    console.log('  2. claude');
    console.log('  3. /productkit.constitution');
    console.log();
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error.message);
    process.exit(1);
  }
}

module.exports = init;
