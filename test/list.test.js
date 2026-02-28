const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const TEST_PROJECT = path.join(os.tmpdir(), 'test-list-output');

describe('list command', () => {
  before(() => {
    fs.removeSync(TEST_PROJECT);
    execSync(`node ${CLI} init test-list-output`, {
      cwd: os.tmpdir(),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(TEST_PROJECT);
  });

  it('shows all slash commands with descriptions', () => {
    const output = execSync(`node ${CLI} list`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });

    assert.ok(output.includes('/productkit.constitution'));
    assert.ok(output.includes('/productkit.users'));
    assert.ok(output.includes('/productkit.problem'));
    assert.ok(output.includes('/productkit.spec'));
    assert.ok(output.includes('product principles'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} list`, {
        cwd: '/tmp',
        stdio: 'pipe',
      });
    });
  });
});
