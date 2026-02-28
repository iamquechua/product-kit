const fs = require('fs-extra');
const path = require('path');

function isProductKitProject() {
  return fs.existsSync(path.join(process.cwd(), '.productkit'));
}

function getProjectRoot() {
  if (isProductKitProject()) {
    return process.cwd();
  }
  return null;
}

function getArtifactDir(root) {
  const configPath = path.join(root, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.artifact_dir) {
      return path.join(root, config.artifact_dir);
    }
  } catch {}
  return root;
}

function getKnowledgeDir(root) {
  const configPath = path.join(root, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.knowledge_dir) {
      return path.join(root, config.knowledge_dir);
    }
  } catch {}
  return path.join(root, 'knowledge');
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

function getWorkspaceKnowledgeDir(workspaceRoot) {
  const configPath = path.join(workspaceRoot, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.knowledge_dir) {
      return path.join(workspaceRoot, config.knowledge_dir);
    }
  } catch {}
  return path.join(workspaceRoot, 'knowledge');
}

function getMode(root) {
  const configPath = path.join(root, '.productkit', 'config.json');
  try {
    const config = fs.readJsonSync(configPath);
    if (config.mode) {
      return config.mode;
    }
  } catch {}
  return 'solo';
}

module.exports = {
  isProductKitProject,
  getProjectRoot,
  getArtifactDir,
  getKnowledgeDir,
  getWorkspaceRoot,
  getWorkspaceKnowledgeDir,
  getMode,
};
