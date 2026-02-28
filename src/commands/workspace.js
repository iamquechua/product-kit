const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function workspace(workspaceName) {
  if (!workspaceName) {
    console.error(chalk.red('Error: Workspace name is required.'));
    console.error(chalk.dim('Usage: productkit workspace <name>'));
    process.exit(1);
  }

  const workspaceRoot = path.join(process.cwd(), workspaceName);

  if (fs.existsSync(workspaceRoot)) {
    console.error(chalk.red(`Error: Directory "${workspaceName}" already exists`));
    process.exit(1);
  }

  try {
    const templatesDir = path.join(__dirname, '..', '..', 'templates');

    // Create workspace directory and config
    fs.ensureDirSync(path.join(workspaceRoot, '.productkit'));
    fs.writeJsonSync(path.join(workspaceRoot, '.productkit', 'config.json'), {
      type: 'workspace',
      version: '1.0.0',
      created: new Date().toISOString(),
      knowledge_dir: 'knowledge',
    }, { spaces: 2 });

    // Copy landscape slash command to workspace level
    fs.ensureDirSync(path.join(workspaceRoot, '.claude', 'commands'));
    fs.copyFileSync(
      path.join(templatesDir, 'commands', 'productkit.landscape.md'),
      path.join(workspaceRoot, '.claude', 'commands', 'productkit.landscape.md')
    );

    // Create workspace-level knowledge directory
    const knowledgeDir = path.join(workspaceRoot, 'knowledge');
    fs.ensureDirSync(knowledgeDir);
    fs.copyFileSync(
      path.join(templatesDir, 'knowledge-README.md'),
      path.join(knowledgeDir, 'README.md')
    );

    console.log(chalk.green.bold('Workspace created successfully!'));
    console.log();
    console.log(chalk.cyan('Workspace:'), workspaceName);
    console.log();
    console.log(chalk.cyan('Next steps:'));
    console.log(`  1. cd ${workspaceName}`);
    console.log('  2. productkit init my-app');
    console.log('  3. claude');
    console.log(`  4. /productkit.landscape  ${chalk.dim('(writes to workspace root)')}`);
    console.log();
  } catch (error) {
    console.error(chalk.red('Error creating workspace:'), error.message);
    process.exit(1);
  }
}

module.exports = workspace;
