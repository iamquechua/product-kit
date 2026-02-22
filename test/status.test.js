const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const TEST_PROJECT = path.join(__dirname, '..', 'test-status-output');

describe('status command', () => {
  before(() => {
    fs.removeSync(TEST_PROJECT);
    execSync(`node ${CLI} init test-status-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(TEST_PROJECT);
  });

  it('shows all artifacts as remaining in a fresh project', () => {
    const output = execSync(`node ${CLI} status`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('0/7'));
    assert.ok(output.includes('todo'));
    assert.ok(output.includes('/productkit.constitution'));
  });

  it('detects completed artifacts', () => {
    fs.writeFileSync(path.join(TEST_PROJECT, 'users.md'), '# Users\n');
    const output = execSync(`node ${CLI} status`, {
      cwd: TEST_PROJECT,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('1/7'));
    assert.ok(output.includes('Users'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} status`, {
        cwd: '/tmp',
        stdio: 'pipe',
      });
    });
  });
});
