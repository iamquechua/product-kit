const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function init(projectName) {
  const projectRoot = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectRoot)) {
    console.error(chalk.red(`Error: Directory "${projectName}" already exists`));
    process.exit(1);
  }

  try {
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

    // Copy CLAUDE.md
    fs.copyFileSync(
      path.join(templatesDir, 'CLAUDE.md'),
      path.join(projectRoot, 'CLAUDE.md')
    );

    // Copy README.md with project name substitution
    let readme = fs.readFileSync(path.join(templatesDir, 'README.md'), 'utf-8');
    readme = readme.replace(/\{\{PROJECT_NAME\}\}/g, projectName);
    fs.writeFileSync(path.join(projectRoot, 'README.md'), readme);

    // Copy .gitignore
    fs.copyFileSync(
      path.join(templatesDir, 'gitignore'),
      path.join(projectRoot, '.gitignore')
    );

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
