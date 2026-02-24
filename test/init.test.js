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
      'productkit.clarify.md',
      'productkit.analyze.md',
      'productkit.bootstrap.md',
    ];
    for (const cmd of commands) {
      assert.ok(
        fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', cmd)),
        `Missing command: ${cmd}`
      );
    }

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
