const fs = require('fs-extra');
const path = require('path');

function resolveContainedPath(root, relativePath, fallback) {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return fallback;
  }
  return resolved;
}

function getArtifactDir(root) {
  const configPath = path.join(root, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.artifact_dir) {
      return resolveContainedPath(root, config.artifact_dir, root);
    }
  } catch {}
  return root;
}

function getWorkspaceRoot(projectRoot) {
  const parentDir = path.dirname(projectRoot);
  const configPath = path.join(parentDir, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.type === 'workspace') {
      return parentDir;
    }
  } catch {}
  return null;
}

const ARTIFACT_FILES = [
  'landscape.md',
  'constitution.md',
  'users.md',
  'problem.md',
  'assumptions.md',
  'validation.md',
  'solution.md',
  'priorities.md',
  'spec.md',
  'audit.md',
  'knowledge-index.md',
  'techreview.md',
  'stories.md',
];

const ARTIFACTS_WITH_COMMANDS = [
  { file: 'landscape.md', command: '/productkit.landscape', label: 'Landscape' },
  { file: 'constitution.md', command: '/productkit.constitution', label: 'Constitution' },
  { file: 'users.md', command: '/productkit.users', label: 'Users' },
  { file: 'problem.md', command: '/productkit.problem', label: 'Problem' },
  { file: 'assumptions.md', command: '/productkit.assumptions', label: 'Assumptions' },
  { file: 'validation.md', command: '/productkit.validate', label: 'Validation' },
  { file: 'solution.md', command: '/productkit.solution', label: 'Solution' },
  { file: 'priorities.md', command: '/productkit.prioritize', label: 'Priorities' },
  { file: 'spec.md', command: '/productkit.spec', label: 'Spec' },
  { file: 'audit.md', command: '/productkit.audit', label: 'Audit' },
  { file: 'knowledge-index.md', command: '/productkit.learn', label: 'Knowledge Index' },
  { file: 'techreview.md', command: '/productkit.techreview', label: 'Tech Review' },
  { file: 'stories.md', command: '/productkit.stories', label: 'Stories' },
];

// Lighter version without command info (for export/diff)
const ARTIFACTS = ARTIFACTS_WITH_COMMANDS.map(({ file, label }) => ({ file, label }));

module.exports = {
  getArtifactDir,
  getWorkspaceRoot,
  ARTIFACT_FILES,
  ARTIFACTS,
  ARTIFACTS_WITH_COMMANDS,
};
