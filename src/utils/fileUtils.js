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

module.exports = {
  isProductKitProject,
  getProjectRoot,
  getArtifactDir,
};
