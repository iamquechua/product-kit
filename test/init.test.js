const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const TEST_PROJECT = path.join(__dirname, '..', 'test-output');

describe('init command', () => {
  before(() => {
    fs.removeSync(TEST_PROJECT);
  });

  after(() => {
    fs.removeSync(TEST_PROJECT);
  });

  it('scaffolds all expected files and directories', () => {
    execSync(`node ${CLI} init test-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    // Directories
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.productkit')));
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands')));

    // Config
    const config = fs.readJsonSync(path.join(TEST_PROJECT, '.productkit', 'config.json'));
    assert.strictEqual(config.version, '1.0.0');

    // Slash commands
    const commands = [
      'productkit.constitution.md',
      'productkit.users.md',
      'productkit.problem.md',
      'productkit.assumptions.md',
      'productkit.solution.md',
      'productkit.prioritize.md',
      'productkit.spec.md',
      'productkit.validate.md',
      'productkit.clarify.md',
      'productkit.analyze.md',
      'productkit.bootstrap.md',
      'productkit.audit.md',
      'productkit.learn.md',
    ];
    for (const cmd of commands) {
      assert.ok(
        fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', cmd)),
        `Missing command: ${cmd}`
      );
    }

    // Landscape should NOT exist in standalone projects
    assert.ok(
      !fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', 'productkit.landscape.md')),
      'landscape command should not exist in standalone projects'
    );

    // Knowledge directory
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, 'knowledge')));
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, 'knowledge', 'README.md')));

    // Config should have knowledge_dir
    assert.strictEqual(config.knowledge_dir, 'knowledge');

    // Root files
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, 'CLAUDE.md')));
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, 'README.md')));
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.gitignore')));

    // README has project name
    const readme = fs.readFileSync(path.join(TEST_PROJECT, 'README.md'), 'utf-8');
    assert.ok(readme.includes('test-output'));
  });

  it('refuses to overwrite existing directory', () => {
    assert.throws(() => {
      execSync(`node ${CLI} init test-output`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe',
      });
    });
  });
});

describe('init --existing', () => {
  const EXISTING_DIR = path.join(__dirname, '..', 'test-existing-output');

  before(() => {
    fs.removeSync(EXISTING_DIR);
    fs.ensureDirSync(EXISTING_DIR);
  });

  after(() => {
    fs.removeSync(EXISTING_DIR);
  });

  it('scaffolds into the current directory', () => {
    execSync(`node ${CLI} init --existing`, {
      cwd: EXISTING_DIR,
      stdio: 'ignore',
    });

    assert.ok(fs.existsSync(path.join(EXISTING_DIR, '.productkit', 'config.json')));
    assert.ok(fs.existsSync(path.join(EXISTING_DIR, '.claude', 'commands', 'productkit.users.md')));
    assert.ok(fs.existsSync(path.join(EXISTING_DIR, 'CLAUDE.md')));
  });

  it('preserves existing README.md', () => {
    fs.removeSync(EXISTING_DIR);
    fs.ensureDirSync(EXISTING_DIR);
    fs.writeFileSync(path.join(EXISTING_DIR, 'README.md'), '# My Existing Project\n');

    execSync(`node ${CLI} init --existing`, {
      cwd: EXISTING_DIR,
      stdio: 'ignore',
    });

    const readme = fs.readFileSync(path.join(EXISTING_DIR, 'README.md'), 'utf-8');
    assert.ok(readme.includes('My Existing Project'));
  });

  it('refuses if already a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} init --existing`, {
        cwd: EXISTING_DIR,
        stdio: 'pipe',
      });
    });
  });
});

describe('init --minimal', () => {
  const MINIMAL_DIR = path.join(__dirname, '..', 'test-minimal-output');

  before(() => {
    fs.removeSync(MINIMAL_DIR);
  });

  after(() => {
    fs.removeSync(MINIMAL_DIR);
  });

  it('excludes constitution and sets minimal config', () => {
    execSync(`node ${CLI} init test-minimal-output --minimal`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    // Constitution should NOT exist
    assert.ok(
      !fs.existsSync(path.join(MINIMAL_DIR, '.claude', 'commands', 'productkit.constitution.md')),
      'constitution command should not exist in minimal mode'
    );

    // Other commands should exist
    const expectedCommands = [
      'productkit.users.md',
      'productkit.problem.md',
      'productkit.assumptions.md',
      'productkit.solution.md',
      'productkit.prioritize.md',
      'productkit.spec.md',
      'productkit.clarify.md',
      'productkit.analyze.md',
    ];
    for (const cmd of expectedCommands) {
      assert.ok(
        fs.existsSync(path.join(MINIMAL_DIR, '.claude', 'commands', cmd)),
        `Missing command: ${cmd}`
      );
    }

    // Config should have minimal: true
    const config = fs.readJsonSync(path.join(MINIMAL_DIR, '.productkit', 'config.json'));
    assert.strictEqual(config.minimal, true);
  });
});

describe('init inside workspace (auto-detection)', () => {
  const WORKSPACE_DIR = path.join(__dirname, '..', 'test-workspace-output');

  before(() => {
    fs.removeSync(WORKSPACE_DIR);
    // Create workspace first using the workspace command
    execSync(`node ${CLI} workspace test-workspace-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(WORKSPACE_DIR);
  });

  it('auto-detects workspace and sets type: project', () => {
    execSync(`node ${CLI} init my-app`, {
      cwd: WORKSPACE_DIR,
      stdio: 'ignore',
    });

    const projectRoot = path.join(WORKSPACE_DIR, 'my-app');
    const projConfig = fs.readJsonSync(path.join(projectRoot, '.productkit', 'config.json'));
    assert.strictEqual(projConfig.type, 'project');
    assert.strictEqual(projConfig.workspace, '..');
    assert.ok(fs.existsSync(path.join(projectRoot, '.claude', 'commands', 'productkit.users.md')));
  });

  it('creates second project in same workspace', () => {
    execSync(`node ${CLI} init second-app`, {
      cwd: WORKSPACE_DIR,
      stdio: 'ignore',
    });

    const projConfig = fs.readJsonSync(path.join(WORKSPACE_DIR, 'second-app', '.productkit', 'config.json'));
    assert.strictEqual(projConfig.type, 'project');
    assert.strictEqual(projConfig.workspace, '..');
  });

  it('refuses to overwrite existing project in workspace', () => {
    assert.throws(() => {
      execSync(`node ${CLI} init my-app`, {
        cwd: WORKSPACE_DIR,
        stdio: 'pipe',
      });
    });
  });
});

describe('init --mode', () => {
  const MODE_SOLO_DIR = path.join(__dirname, '..', 'test-mode-solo-output');
  const MODE_TEAM_DIR = path.join(__dirname, '..', 'test-mode-team-output');

  before(() => {
    fs.removeSync(MODE_SOLO_DIR);
    fs.removeSync(MODE_TEAM_DIR);
  });

  after(() => {
    fs.removeSync(MODE_SOLO_DIR);
    fs.removeSync(MODE_TEAM_DIR);
  });

  it('init --mode solo sets mode in config', () => {
    execSync(`node ${CLI} init test-mode-solo-output --mode solo`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    const config = fs.readJsonSync(path.join(MODE_SOLO_DIR, '.productkit', 'config.json'));
    assert.strictEqual(config.mode, 'solo');
  });

  it('init --mode team sets mode in config', () => {
    execSync(`node ${CLI} init test-mode-team-output --mode team`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    const config = fs.readJsonSync(path.join(MODE_TEAM_DIR, '.productkit', 'config.json'));
    assert.strictEqual(config.mode, 'team');
  });
});

describe('init --artifact-dir', () => {
  const ARTDIR_PROJECT = path.join(__dirname, '..', 'test-artdir-output');

  before(() => {
    fs.removeSync(ARTDIR_PROJECT);
  });

  after(() => {
    fs.removeSync(ARTDIR_PROJECT);
  });

  it('creates artifact directory and stores config', () => {
    execSync(`node ${CLI} init test-artdir-output --artifact-dir docs/product`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    // Config should have artifact_dir
    const config = fs.readJsonSync(path.join(ARTDIR_PROJECT, '.productkit', 'config.json'));
    assert.strictEqual(config.artifact_dir, 'docs/product');

    // Artifact directory should exist
    assert.ok(fs.existsSync(path.join(ARTDIR_PROJECT, 'docs', 'product')));
  });

  it('CLI commands use artifact_dir for artifact lookup', () => {
    // Write an artifact in the artifact dir
    fs.writeFileSync(
      path.join(ARTDIR_PROJECT, 'docs', 'product', 'users.md'),
      '# Users\n\nTest users.\n'
    );

    // Status should detect it
    const statusOutput = execSync(`node ${CLI} status`, {
      cwd: ARTDIR_PROJECT,
      encoding: 'utf-8',
    });
    assert.ok(statusOutput.includes('done'));
    assert.ok(statusOutput.includes('Users'));

    // Export should include it
    execSync(`node ${CLI} export`, {
      cwd: ARTDIR_PROJECT,
      stdio: 'ignore',
    });
    const exportContent = fs.readFileSync(path.join(ARTDIR_PROJECT, 'export.md'), 'utf-8');
    assert.ok(exportContent.includes('Test users'));
  });
});
