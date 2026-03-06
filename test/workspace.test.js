const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const WORKSPACE_DIR = path.join(os.tmpdir(), 'test-workspace-cmd-output');

describe('workspace command', () => {
  before(() => {
    fs.removeSync(WORKSPACE_DIR);
  });

  after(() => {
    fs.removeSync(WORKSPACE_DIR);
  });

  it('creates a workspace directory with config and knowledge', () => {
    execSync(`node ${CLI} workspace test-workspace-cmd-output`, {
      cwd: os.tmpdir(),
      stdio: 'ignore',
    });

    // Workspace config
    const config = fs.readJsonSync(path.join(WORKSPACE_DIR, '.productkit', 'config.json'));
    assert.strictEqual(config.type, 'workspace');
    const pkg = require('../package.json');
    assert.strictEqual(config.version, pkg.version);
    assert.strictEqual(config.knowledge_dir, 'knowledge');
    assert.ok(config.created);

    // Landscape slash command at workspace level
    assert.ok(fs.existsSync(path.join(WORKSPACE_DIR, '.claude', 'commands', 'productkit.landscape.md')));

    // Knowledge directory
    assert.ok(fs.existsSync(path.join(WORKSPACE_DIR, 'knowledge', 'README.md')));
  });

  it('refuses to overwrite existing workspace', () => {
    assert.throws(() => {
      execSync(`node ${CLI} workspace test-workspace-cmd-output`, {
        cwd: os.tmpdir(),
        stdio: 'pipe',
      });
    });
  });

  it('init inside workspace auto-detects and sets type: project', () => {
    execSync(`node ${CLI} init my-app`, {
      cwd: WORKSPACE_DIR,
      stdio: 'ignore',
    });

    const projectRoot = path.join(WORKSPACE_DIR, 'my-app');
    const projConfig = fs.readJsonSync(path.join(projectRoot, '.productkit', 'config.json'));
    assert.strictEqual(projConfig.type, 'project');
    assert.strictEqual(projConfig.workspace, '..');

    // Project should have slash commands
    assert.ok(fs.existsSync(path.join(projectRoot, '.claude', 'commands', 'productkit.users.md')));
  });

  it('init second project reuses workspace', () => {
    execSync(`node ${CLI} init second-app`, {
      cwd: WORKSPACE_DIR,
      stdio: 'ignore',
    });

    const projConfig = fs.readJsonSync(path.join(WORKSPACE_DIR, 'second-app', '.productkit', 'config.json'));
    assert.strictEqual(projConfig.type, 'project');
    assert.strictEqual(projConfig.workspace, '..');
  });
});
