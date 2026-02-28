const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

function promptMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    console.log();
    console.log(chalk.cyan('How are you building this product?'));
    console.log('  1. Solo — I\'m building it myself');
    console.log('  2. Team — I\'m working with engineers/designers');
    console.log();
    rl.question('Choose (1 or 2): ', (answer) => {
      rl.close();
      resolve(answer.trim() === '2' ? 'team' : 'solo');
    });
  });
}

function scaffold(projectRoot, projectName, minimal, artifactDir, mode) {
  const templatesDir = path.join(__dirname, '..', '..', 'templates');

  // Create directories
  fs.ensureDirSync(path.join(projectRoot, '.productkit'));
  fs.ensureDirSync(path.join(projectRoot, '.claude', 'commands'));

  // Write config
  const config = {
    version: '1.0.0',
    created: new Date().toISOString(),
  };

  // Detect workspace: check if parent has workspace config
  const parentDir = path.dirname(projectRoot);
  const parentConfigPath = path.join(parentDir, '.productkit', 'config.json');
  try {
    const parentConfig = fs.readJsonSync(parentConfigPath);
    if (parentConfig.type === 'workspace') {
      config.type = 'project';
      config.workspace = '..';
    }
  } catch {}

  if (minimal) {
    config.minimal = true;
  }
  if (artifactDir) {
    config.artifact_dir = artifactDir;
    fs.ensureDirSync(path.join(projectRoot, artifactDir));
  }
  if (mode) {
    config.mode = mode;
  }
  config.knowledge_dir = 'knowledge';
  fs.writeJsonSync(path.join(projectRoot, '.productkit', 'config.json'), config, { spaces: 2 });

  // Copy slash command templates
  const commandsDir = path.join(templatesDir, 'commands');
  const commandFiles = fs.readdirSync(commandsDir);
  for (const file of commandFiles) {
    if (minimal && file === 'productkit.constitution.md') continue;
    // Landscape lives at workspace level, not project level
    if (file === 'productkit.landscape.md') continue;
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

  // Create knowledge directory with README
  const knowledgeDir = path.join(projectRoot, 'knowledge');
  fs.ensureDirSync(knowledgeDir);
  fs.copyFileSync(
    path.join(templatesDir, 'knowledge-README.md'),
    path.join(knowledgeDir, 'README.md')
  );

  // Copy .gitignore (only for new projects)
  if (!fs.existsSync(path.join(projectRoot, '.gitignore'))) {
    fs.copyFileSync(
      path.join(templatesDir, 'gitignore'),
      path.join(projectRoot, '.gitignore')
    );
  }
}

async function init(projectName, options) {
  // Validate and resolve mode
  let mode = options.mode;
  if (mode && mode !== 'solo' && mode !== 'team') {
    console.error(chalk.red('Error: --mode must be "solo" or "team"'));
    process.exit(1);
  }
  if (!mode) {
    if (process.stdin.isTTY) {
      mode = await promptMode();
    } else {
      mode = 'solo';
    }
  }

  if (options.existing) {
    const projectRoot = process.cwd();

    if (fs.existsSync(path.join(projectRoot, '.productkit'))) {
      console.error(chalk.red('Error: This directory is already a Product Kit project.'));
      process.exit(1);
    }

    try {
      scaffold(projectRoot, path.basename(projectRoot), options.minimal, options.artifactDir, mode);

      console.log(chalk.green.bold('Product Kit added to existing project!'));
      console.log();
      console.log(chalk.cyan('Next steps:'));
      console.log('  1. claude');
      console.log(`  2. /productkit.${options.minimal ? 'users' : 'constitution'}`);
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
    scaffold(projectRoot, projectName, options.minimal, options.artifactDir, mode);

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
    console.log(`  3. /productkit.${options.minimal ? 'users' : 'constitution'}`);
    console.log();
  } catch (error) {
    console.error(chalk.red('Error initializing project:'), error.message);
    process.exit(1);
  }
}

module.exports = init;
