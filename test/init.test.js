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
      'productkit.clarify.md',
      'productkit.analyze.md',
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
