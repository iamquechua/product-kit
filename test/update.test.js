const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const TEST_PROJECT = path.join(__dirname, '..', 'test-update-output');

describe('update command', () => {
  before(() => {
    fs.removeSync(TEST_PROJECT);
    execSync(`node ${CLI} init test-update-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(TEST_PROJECT);
  });

  it('refreshes slash commands', () => {
    // Delete a command to simulate an outdated project
    fs.removeSync(path.join(TEST_PROJECT, '.claude', 'commands', 'productkit.spec.md'));
    assert.ok(!fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', 'productkit.spec.md')));

    const output = execSync(`node ${CLI} update`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });

    assert.ok(fs.existsSync(path.join(TEST_PROJECT, '.claude', 'commands', 'productkit.spec.md')));
    assert.ok(output.includes('productkit.spec.md'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} update`, {
        cwd: '/tmp',
        stdio: 'pipe',
      });
    });
  });
});
