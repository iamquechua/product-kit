const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');
const { getArtifactDir } = require('../utils/fileUtils');

const ARTIFACTS = [
  { file: 'constitution.md', command: '/productkit.constitution', label: 'Constitution' },
  { file: 'users.md', command: '/productkit.users', label: 'Users' },
  { file: 'problem.md', command: '/productkit.problem', label: 'Problem' },
  { file: 'assumptions.md', command: '/productkit.assumptions', label: 'Assumptions' },
  { file: 'validation.md', command: '/productkit.validate', label: 'Validation' },
  { file: 'solution.md', command: '/productkit.solution', label: 'Solution' },
  { file: 'priorities.md', command: '/productkit.prioritize', label: 'Priorities' },
  { file: 'spec.md', command: '/productkit.spec', label: 'Spec' },
];

const BONUS_ARTIFACTS = [
  { file: 'stories.md', command: '/productkit.stories', label: 'Stories' },
  { file: 'audit.md', command: '/productkit.audit', label: 'Audit' },
];

const STALE_DAYS = 14;

function getGitLastModified(root, filePath) {
  try {
    const rel = path.relative(root, filePath);
    const output = execSync(`git log -1 --format=%aI -- "${rel}"`, {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    return output ? new Date(output) : null;
  } catch {
    return null;
  }
}

function hasGit(root) {
  try {
    execSync('git rev-parse --git-dir', { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function gatherArtifactData(root) {
  const artifactDir = getArtifactDir(root);
  const gitAvailable = hasGit(root);
  const now = new Date();

  function gatherInfo(list) {
    return list.map(artifact => {
      const fullPath = path.join(artifactDir, artifact.file);
      const exists = fs.existsSync(fullPath);
      if (!exists) {
        return { ...artifact, exists: false, fullPath };
      }
      const stat = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const lastModified = stat.mtime;

      let gitDate = null;
      let stale = false;
      if (gitAvailable) {
        gitDate = getGitLastModified(root, fullPath);
        const ref = gitDate || lastModified;
        const daysSince = (now - ref) / (1000 * 60 * 60 * 24);
        stale = daysSince > STALE_DAYS;
      }

      return {
        ...artifact,
        exists: true,
        wordCount,
        lastModified: lastModified.toISOString().split('T')[0],
        gitDate: gitDate ? gitDate.toISOString().split('T')[0] : null,
        stale,
        size: stat.size,
        fullPath,
        content,
      };
    });
  }

  const core = gatherInfo(ARTIFACTS);
  const bonus = gatherInfo(BONUS_ARTIFACTS);
  const completed = core.filter(a => a.exists).length;
  const total = core.length;
  const nextStep = core.find(a => !a.exists) || null;

  return { core, bonus, completed, total, nextStep, projectName: path.basename(root) };
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mdToHtml(md) {
  return esc(md)
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}

function generateHtml(data, projectName) {
  const date = new Date().toISOString().split('T')[0];
  const pct = data.total ? Math.round(data.completed / data.total * 100) : 0;

  // Build flow diagram nodes
  const flowNodes = data.core.map(a => {
    let cls = 'node-missing';
    let clickAttr = '';
    if (a.exists && a.stale) { cls = 'node-stale'; clickAttr = ` onclick="showPage('${a.file}')" style="cursor:pointer"`; }
    else if (a.exists) { cls = 'node-complete'; clickAttr = ` onclick="showPage('${a.file}')" style="cursor:pointer"`; }
    return `<div class="flow-node ${cls}"${clickAttr}><div class="flow-label">${esc(a.label)}</div></div>`;
  }).join('<div class="flow-arrow">&rarr;</div>');

  // Build artifact cards
  const allArtifacts = [...data.core, ...data.bonus.filter(a => a.exists)];
  const coreCards = data.core.map(a => {
    if (a.exists) {
      const staleBadge = a.stale ? '<span class="badge badge-stale">Stale</span>' : '';
      return `<div class="artifact-card artifact-exists" onclick="showPage('${a.file}')" style="cursor:pointer">
        <div class="artifact-header"><span class="artifact-name">${esc(a.label)}</span>${staleBadge}<span class="view-arrow">&rsaquo;</span></div>
        <div class="artifact-file">${esc(a.file)}</div>
        <div class="artifact-meta">${a.wordCount} words &middot; modified ${a.gitDate || a.lastModified}</div>
      </div>`;
    }
    return `<div class="artifact-card artifact-missing">
      <div class="artifact-header"><span class="artifact-name">${esc(a.label)}</span><span class="badge badge-missing">Missing</span></div>
      <div class="artifact-file">${esc(a.file)}</div>
      <div class="artifact-meta">Run <code>${esc(a.command)}</code></div>
    </div>`;
  }).join('\n');

  // Bonus artifacts section
  const bonusCards = data.bonus.filter(a => a.exists).map(a => {
    const staleBadge = a.stale ? '<span class="badge badge-stale">Stale</span>' : '';
    return `<div class="artifact-card artifact-exists" onclick="showPage('${a.file}')" style="cursor:pointer">
      <div class="artifact-header"><span class="artifact-name">${esc(a.label)}</span>${staleBadge}<span class="badge badge-bonus">Bonus</span><span class="view-arrow">&rsaquo;</span></div>
      <div class="artifact-file">${esc(a.file)}</div>
      <div class="artifact-meta">${a.wordCount} words &middot; modified ${a.gitDate || a.lastModified}</div>
    </div>`;
  }).join('\n');

  // Next step callout
  let nextStepHtml = '';
  if (data.nextStep) {
    nextStepHtml = `<div class="next-step">
      <div class="next-step-label">Next Step</div>
      <div class="next-step-command">Run <code>${esc(data.nextStep.command)}</code> to create your ${esc(data.nextStep.label)}</div>
    </div>`;
  } else {
    nextStepHtml = `<div class="next-step next-step-done">
      <div class="next-step-label">All Done</div>
      <div class="next-step-command">All core artifacts are complete!</div>
    </div>`;
  }

  // Build artifact detail pages
  const artifactPages = allArtifacts.filter(a => a.exists).map(a => {
    const staleBadge = a.stale ? ' <span class="badge badge-stale">Stale</span>' : '';
    const contentHtml = mdToHtml(a.content);
    return `<div class="page" id="page-${a.file}">
  <div class="page-header">
    <button class="back-btn" onclick="showOverview()">&larr; Back</button>
    <div class="page-title-group">
      <h2 class="page-title">${esc(a.label)}${staleBadge}</h2>
      <div class="page-meta">${esc(a.file)} &middot; ${a.wordCount} words &middot; modified ${a.gitDate || a.lastModified}</div>
    </div>
  </div>
  <div class="page-content">${contentHtml}</div>
</div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(projectName)} — Artifact Dashboard</title>
<style>
  :root {
    --bg: #0f1117;
    --surface: #1a1d27;
    --surface-hover: #232736;
    --border: #2a2e3a;
    --text: #e4e4e7;
    --text-muted: #8b8fa3;
    --accent: #6366f1;
    --accent-hover: #818cf8;
    --green: #22c55e;
    --yellow: #eab308;
    --red: #ef4444;
    --orange: #f97316;
    --amber: #f59e0b;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); padding: 2rem; max-width: 1000px; margin: 0 auto; }
  h1 { font-size: 1.5rem; font-weight: 600; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
  .header-meta { color: var(--text-muted); font-size: 0.85rem; }
  .progress-summary { text-align: right; }
  .progress-fraction { font-size: 2rem; font-weight: 700; color: var(--accent); }
  .progress-label { color: var(--text-muted); font-size: 0.8rem; }
  .progress-bar { background: var(--border); border-radius: 4px; height: 8px; overflow: hidden; margin-top: 0.5rem; width: 160px; margin-left: auto; }
  .progress-fill { height: 100%; background: var(--accent); border-radius: 4px; }

  .next-step { background: var(--surface); border: 1px solid var(--accent); border-radius: 10px; padding: 1.25rem; margin-bottom: 2rem; }
  .next-step-done { border-color: var(--green); }
  .next-step-label { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); margin-bottom: 0.35rem; }
  .next-step-done .next-step-label { color: var(--green); }
  .next-step-command { font-size: 1rem; }
  .next-step-command code { background: rgba(99,102,241,0.15); padding: 0.15rem 0.5rem; border-radius: 4px; font-family: monospace; color: var(--accent-hover); }

  .section-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

  .flow { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 2rem; padding: 1.25rem; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; justify-content: center; }
  .flow-node { padding: 0.5rem 0.75rem; border-radius: 8px; text-align: center; min-width: 70px; transition: transform 0.1s; }
  .flow-node[onclick]:hover { transform: scale(1.05); }
  .flow-label { font-size: 0.75rem; font-weight: 600; }
  .flow-arrow { color: var(--text-muted); font-size: 0.9rem; }
  .node-complete { background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
  .node-missing { background: rgba(139,143,163,0.08); color: var(--text-muted); border: 1px solid var(--border); }
  .node-stale { background: rgba(245,158,11,0.15); color: var(--amber); border: 1px solid rgba(245,158,11,0.3); }

  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.75rem; margin-bottom: 2rem; }
  .artifact-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; transition: border-color 0.15s, transform 0.1s; }
  .artifact-card[onclick]:hover { border-color: var(--accent); transform: translateY(-1px); }
  .artifact-exists { border-left: 3px solid var(--green); }
  .artifact-missing { border-left: 3px solid var(--text-muted); opacity: 0.7; }
  .artifact-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; }
  .artifact-name { font-weight: 600; font-size: 0.95rem; }
  .view-arrow { margin-left: auto; color: var(--text-muted); font-size: 1.2rem; font-weight: 300; }
  .artifact-file { font-family: monospace; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem; }
  .artifact-meta { font-size: 0.8rem; color: var(--text-muted); }
  .artifact-meta code { background: rgba(99,102,241,0.15); padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.75rem; color: var(--accent-hover); }

  .badge { font-size: 0.65rem; padding: 0.1rem 0.45rem; border-radius: 8px; font-weight: 600; text-transform: uppercase; }
  .badge-stale { background: rgba(245,158,11,0.15); color: var(--amber); }
  .badge-missing { background: rgba(139,143,163,0.1); color: var(--text-muted); }
  .badge-bonus { background: rgba(99,102,241,0.15); color: var(--accent-hover); }

  .page { display: none; }
  .page.active { display: block; }
  .page-header { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
  .back-btn { background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.4rem 0.8rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; white-space: nowrap; }
  .back-btn:hover { border-color: var(--accent); color: var(--accent-hover); }
  .page-title-group { flex: 1; }
  .page-title { font-size: 1.4rem; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
  .page-meta { color: var(--text-muted); font-size: 0.8rem; margin-top: 0.25rem; }
  .page-content { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 2rem; font-size: 0.95rem; line-height: 1.75; }
  .page-content h2 { font-size: 1.3rem; margin-top: 1.5rem; margin-bottom: 0.5rem; padding-bottom: 0.35rem; border-bottom: 1px solid var(--border); }
  .page-content h2:first-child { margin-top: 0; }
  .page-content h3 { font-size: 1.1rem; margin-top: 1.25rem; margin-bottom: 0.4rem; }
  .page-content h4 { font-size: 0.95rem; margin-top: 1rem; margin-bottom: 0.35rem; color: var(--text-muted); }
  .page-content p { margin-bottom: 0.75rem; }
  .page-content li { margin-left: 1.5rem; margin-bottom: 0.3rem; }
  .page-content code { background: rgba(99,102,241,0.15); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85rem; color: var(--accent-hover); }
  .page-content strong { color: var(--text); }
  .page-content em { color: var(--text-muted); }

  .footer { color: var(--text-muted); font-size: 0.75rem; text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); }
</style>
</head>
<body>

<div id="overview">
<div class="header">
  <div>
    <h1>${esc(projectName)}</h1>
    <div class="header-meta">Generated ${date} by Product Kit</div>
  </div>
  <div class="progress-summary">
    <div class="progress-fraction">${data.completed}/${data.total}</div>
    <div class="progress-label">artifacts complete</div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>
</div>

${nextStepHtml}

<div class="section-title">Workflow</div>
<div class="flow">${flowNodes}</div>

<div class="section-title">Artifacts</div>
<div class="cards">
${coreCards}
</div>

${bonusCards ? `<div class="section-title">Bonus</div><div class="cards">${bonusCards}</div>` : ''}

<div class="footer">Product Kit &middot; Read-only progress snapshot</div>
</div>

${artifactPages}

<script>
function showPage(file) {
  document.getElementById('overview').style.display = 'none';
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var page = document.getElementById('page-' + file);
  if (page) { page.classList.add('active'); }
  window.location.hash = file;
  window.scrollTo(0, 0);
}
function showOverview() {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  document.getElementById('overview').style.display = '';
  window.location.hash = '';
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', function() {
  var h = window.location.hash.slice(1);
  if (h && document.getElementById('page-' + h)) { showPage(h); }
  else { showOverview(); }
});
(function() {
  var h = window.location.hash.slice(1);
  if (h && document.getElementById('page-' + h)) { showPage(h); }
})();
</script>
</body>
</html>`;
}

async function dashboardCommand(options) {
  const root = process.cwd();
  const configPath = path.join(root, '.productkit', 'config.json');

  if (!fs.existsSync(configPath)) {
    console.error(chalk.red('Not a Product Kit project.'));
    console.log('Run: productkit init <name>');
    process.exit(1);
  }

  const data = gatherArtifactData(root);
  const projectName = data.projectName;
  const html = generateHtml(data, projectName);

  const outputFile = options.output || 'dashboard.html';
  const outputPath = path.join(root, outputFile);
  fs.writeFileSync(outputPath, html);

  console.log(chalk.green.bold(`Dashboard generated: ${outputFile}`));
  console.log(chalk.cyan(`${data.completed}/${data.total} core artifacts complete`));

  if (data.nextStep) {
    console.log(chalk.yellow(`Next step: ${data.nextStep.command}`));
  }

  // Auto-open in browser
  try {
    const platform = process.platform;
    const cmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    execSync(`${cmd} "${outputPath}"`, { stdio: 'ignore' });
  } catch {
    // Silent fail — user can open manually
  }
}

module.exports = dashboardCommand;
