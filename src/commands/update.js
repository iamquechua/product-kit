const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function update() {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const templatesDir = path.join(__dirname, '..', '..', 'templates');
  const commandsDir = path.join(templatesDir, 'commands');
  const targetDir = path.join(root, '.claude', 'commands');

  fs.ensureDirSync(targetDir);

  const commandFiles = fs.readdirSync(commandsDir);
  let updated = 0;
  let added = 0;

  for (const file of commandFiles) {
    // Landscape is workspace-only, skip for projects
    if (file === 'productkit.landscape.md') continue;

    const src = path.join(commandsDir, file);
    const dest = path.join(targetDir, file);
    const existed = fs.existsSync(dest);

    fs.copyFileSync(src, dest);

    if (existed) {
      updated++;
    } else {
      added++;
      console.log(chalk.green(`  + ${file}`));
    }
  }

  // Update workspace landscape command if in a workspace
  const { getWorkspaceRoot } = require('../utils/fileUtils');
  const workspaceRoot = getWorkspaceRoot(root);
  if (workspaceRoot) {
    const wsSrc = path.join(commandsDir, 'productkit.landscape.md');
    const wsDest = path.join(workspaceRoot, '.claude', 'commands', 'productkit.landscape.md');
    if (fs.existsSync(wsSrc)) {
      fs.ensureDirSync(path.join(workspaceRoot, '.claude', 'commands'));
      fs.copyFileSync(wsSrc, wsDest);
      console.log(chalk.green('  ~ workspace landscape command updated'));
    }
  }

  // Update CLAUDE.md
  const claudeSrc = path.join(templatesDir, 'CLAUDE.md');
  const claudeDest = path.join(root, 'CLAUDE.md');
  fs.copyFileSync(claudeSrc, claudeDest);

  console.log();
  console.log(chalk.green.bold('Slash commands updated!'));
  console.log(`  ${updated} updated, ${added} new`);
  console.log();
}

module.exports = update;
