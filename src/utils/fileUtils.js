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

module.exports = {
  isProductKitProject,
  getProjectRoot,
};
