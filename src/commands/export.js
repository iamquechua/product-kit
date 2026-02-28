const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { getArtifactDir, getWorkspaceRoot, ARTIFACTS } = require('../utils/fileUtils');

function escapeCsvField(field) {
  if (field == null) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseStoriesCsv(content) {
  const lines = content.split('\n');
  // Detect mode from document headers produced by /productkit.stories
  const isTeamMode = lines.some(l => l.trim() === '# User Stories');

  if (isTeamMode) {
    return parseTeamMode(lines);
  }
  return parseSoloMode(lines);
}

function parseTeamMode(lines) {
  const headers = ['ID', 'Title', 'Epic', 'Priority', 'Estimate', 'Depends On', 'Acceptance Criteria', 'Definition of Done', 'Notes'];
  const rows = [];
  let currentEpic = '';
  let currentRow = null;
  let collectingAC = false;

  for (const line of lines) {
    const epicMatch = line.match(/^## Epic \d+:\s*(.+)/);
    if (epicMatch) {
      if (currentRow) rows.push(currentRow);
      currentEpic = epicMatch[1].trim();
      currentRow = null;
      collectingAC = false;
      continue;
    }

    const storyMatch = line.match(/^### (E\d+-S\d+):\s*(.*)/);
    if (storyMatch) {
      if (currentRow) rows.push(currentRow);
      collectingAC = false;
      currentRow = { ID: storyMatch[1], Title: storyMatch[2].trim(), Epic: currentEpic, Priority: '', Estimate: '', 'Depends On': '', 'Acceptance Criteria': [], 'Definition of Done': '', Notes: '' };
      continue;
    }

    if (!currentRow) continue;

    if (collectingAC) {
      const checkMatch = line.match(/^\s*- \[[ x]\]\s*(.+)/);
      if (checkMatch) {
        currentRow['Acceptance Criteria'].push(checkMatch[1].trim());
        continue;
      }
      collectingAC = false;
    }

    const titleMatch = line.match(/^- \*\*Title:\*\*\s*(.+)/);
    if (titleMatch) { currentRow.Title = titleMatch[1].trim(); continue; }

    const prioMatch = line.match(/^- \*\*Priority:\*\*\s*(.+)/);
    if (prioMatch) { currentRow.Priority = prioMatch[1].trim(); continue; }

    const estMatch = line.match(/^- \*\*Estimate:\*\*\s*(.+)/);
    if (estMatch) { currentRow.Estimate = estMatch[1].trim(); continue; }

    const depMatch = line.match(/^- \*\*Depends on:\*\*\s*(.+)/);
    if (depMatch) { currentRow['Depends On'] = depMatch[1].trim(); continue; }

    if (line.match(/^- \*\*Acceptance Criteria:\*\*/)) {
      collectingAC = true;
      continue;
    }

    const dodMatch = line.match(/^- \*\*Definition of Done:\*\*\s*(.+)/);
    if (dodMatch) { currentRow['Definition of Done'] = dodMatch[1].trim(); continue; }

    const notesMatch = line.match(/^- \*\*Notes:\*\*\s*(.+)/);
    if (notesMatch) { currentRow.Notes = notesMatch[1].trim(); continue; }
  }

  if (currentRow) rows.push(currentRow);

  const csvRows = rows.map(r => {
    const ac = Array.isArray(r['Acceptance Criteria']) ? r['Acceptance Criteria'].join('; ') : r['Acceptance Criteria'];
    return headers.map(h => escapeCsvField(h === 'Acceptance Criteria' ? ac : r[h])).join(',');
  });

  return [headers.join(','), ...csvRows].join('\n') + '\n';
}

function parseSoloMode(lines) {
  const headers = ['ID', 'Task', 'Effort', 'Depends On', 'Done When', 'Watch Out For'];
  const rows = [];
  let currentRow = null;
  let collectingDone = false;

  for (const line of lines) {
    const taskMatch = line.match(/^### (T\d+):\s*(.*)/);
    if (taskMatch) {
      if (currentRow) rows.push(currentRow);
      collectingDone = false;
      currentRow = { ID: taskMatch[1], Task: taskMatch[2].trim(), Effort: '', 'Depends On': '', 'Done When': [], 'Watch Out For': '' };
      continue;
    }

    if (!currentRow) continue;

    if (collectingDone) {
      const checkMatch = line.match(/^\s*- \[[ x]\]\s*(.+)/);
      if (checkMatch) {
        currentRow['Done When'].push(checkMatch[1].trim());
        continue;
      }
      collectingDone = false;
    }

    const effortMatch = line.match(/^- \*\*Effort:\*\*\s*(.+)/);
    if (effortMatch) { currentRow.Effort = effortMatch[1].trim(); continue; }

    const depMatch = line.match(/^- \*\*Depends on:\*\*\s*(.+)/);
    if (depMatch) { currentRow['Depends On'] = depMatch[1].trim(); continue; }

    if (line.match(/^- \*\*Done when:\*\*/)) {
      collectingDone = true;
      continue;
    }

    const watchMatch = line.match(/^- \*\*Watch out for:\*\*\s*(.+)/);
    if (watchMatch) { currentRow['Watch Out For'] = watchMatch[1].trim(); continue; }
  }

  if (currentRow) rows.push(currentRow);

  const csvRows = rows.map(r => {
    const dw = Array.isArray(r['Done When']) ? r['Done When'].join('; ') : r['Done When'];
    return headers.map(h => escapeCsvField(h === 'Done When' ? dw : r[h])).join(',');
  });

  return [headers.join(','), ...csvRows].join('\n') + '\n';
}

async function exportCommand(options) {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const artifactDir = getArtifactDir(root);

  if (options.storiesCsv) {
    const storiesPath = path.join(artifactDir, 'stories.md');
    if (!fs.existsSync(storiesPath)) {
      console.error(chalk.red('No stories.md found. Run /productkit.stories first.'));
      process.exit(1);
    }
    const content = fs.readFileSync(storiesPath, 'utf-8');
    const csv = parseStoriesCsv(content);
    const outputFile = options.output === 'export.md' ? 'stories.csv' : options.output;
    fs.writeFileSync(path.join(root, outputFile), csv);
    console.log(chalk.green.bold(`Exported stories to ${outputFile}`));
    return;
  }

  const existing = ARTIFACTS.filter(a => fs.existsSync(path.join(artifactDir, a.file)));

  // Check for workspace landscape
  const workspaceRoot = getWorkspaceRoot(root);
  const hasLandscape = workspaceRoot && fs.existsSync(path.join(workspaceRoot, 'landscape.md'));

  if (existing.length === 0 && !hasLandscape) {
    console.error(chalk.red('No artifacts found. Run some slash commands first.'));
    process.exit(1);
  }

  const sections = [];

  if (hasLandscape) {
    sections.push(fs.readFileSync(path.join(workspaceRoot, 'landscape.md'), 'utf-8'));
  }

  for (const artifact of existing) {
    const content = fs.readFileSync(path.join(artifactDir, artifact.file), 'utf-8');
    sections.push(content);
  }

  const projectName = path.basename(root);
  const header = `# ${projectName} — Product Kit Export\n\n_Exported: ${new Date().toISOString().split('T')[0]}_\n\n---\n`;
  const combined = header + sections.join('\n\n---\n\n') + '\n';

  const outputFile = options.output || 'export.md';
  fs.writeFileSync(path.join(root, outputFile), combined);

  const totalCount = existing.length + (hasLandscape ? 1 : 0);
  console.log(chalk.green.bold(`Exported ${totalCount} artifact(s) to ${outputFile}`));
}

module.exports = exportCommand;
