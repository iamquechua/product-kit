const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getArtifactDir } = require('../utils/fileUtils');

const ARTIFACTS = [
  { file: 'constitution.md', label: 'Constitution' },
  { file: 'users.md', label: 'Users' },
  { file: 'problem.md', label: 'Problem' },
  { file: 'assumptions.md', label: 'Assumptions' },
  { file: 'validation.md', label: 'Validation' },
  { file: 'solution.md', label: 'Solution' },
  { file: 'priorities.md', label: 'Priorities' },
  { file: 'spec.md', label: 'Spec' },
];

async function exportCommand(options) {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const artifactDir = getArtifactDir(root);
  const existing = ARTIFACTS.filter(a => fs.existsSync(path.join(artifactDir, a.file)));

  if (existing.length === 0) {
    console.error(chalk.red('No artifacts found. Run some slash commands first.'));
    process.exit(1);
  }

  const sections = [];
  for (const artifact of existing) {
    const content = fs.readFileSync(path.join(artifactDir, artifact.file), 'utf-8');
    sections.push(content);
  }

  const projectName = path.basename(root);
  const header = `# ${projectName} — Product Kit Export\n\n_Exported: ${new Date().toISOString().split('T')[0]}_\n\n---\n`;
  const combined = header + sections.join('\n\n---\n\n') + '\n';

  const outputFile = options.output || 'export.md';
  fs.writeFileSync(path.join(root, outputFile), combined);

  console.log(chalk.green.bold(`Exported ${existing.length} artifact(s) to ${outputFile}`));
}

module.exports = exportCommand;
