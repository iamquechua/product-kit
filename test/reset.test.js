const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const TEST_PROJECT = path.join(__dirname, '..', 'test-reset-output');

describe('reset command', () => {
  before(() => {
    fs.removeSync(TEST_PROJECT);
    execSync(`node ${CLI} init test-reset-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(TEST_PROJECT);
  });

  it('removes existing artifacts', () => {
    // Create some artifacts
    fs.writeFileSync(path.join(TEST_PROJECT, 'users.md'), '# Users\n');
    fs.writeFileSync(path.join(TEST_PROJECT, 'problem.md'), '# Problem\n');

    const output = execSync(`node ${CLI} reset --force`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });

    assert.ok(!fs.existsSync(path.join(TEST_PROJECT, 'users.md')));
    assert.ok(!fs.existsSync(path.join(TEST_PROJECT, 'problem.md')));
    assert.ok(output.includes('2 artifacts removed'));
  });

  it('reports nothing to reset when no artifacts exist', () => {
    const output = execSync(`node ${CLI} reset --force`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Nothing to reset'));
  });

  it('preserves project config and slash commands', () => {
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.productkit', 'config.json')));
    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', 'productkit.users.md')));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} reset --force`, {
        cwd: '/tmp',
        stdio: 'pipe',
      });
    });
  });
});
