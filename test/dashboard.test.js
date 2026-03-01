const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const PROJECT_DIR = path.join(__dirname, '..', 'test-dashboard-output');

describe('dashboard command', () => {
  before(() => {
    fs.removeSync(PROJECT_DIR);
    execSync(`node ${CLI} init test-dashboard-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(PROJECT_DIR);
  });

  it('generates dashboard.html with artifact names visible', () => {
    execSync(`node ${CLI} dashboard`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const output = fs.readFileSync(path.join(PROJECT_DIR, 'dashboard.html'), 'utf-8');
    assert.ok(output.includes('<!DOCTYPE html>'));
    assert.ok(output.includes('Constitution'));
    assert.ok(output.includes('Users'));
    assert.ok(output.includes('Problem'));
    assert.ok(output.includes('Spec'));

    fs.removeSync(path.join(PROJECT_DIR, 'dashboard.html'));
  });

  it('shows existing artifacts as complete', () => {
    fs.writeFileSync(path.join(PROJECT_DIR, 'users.md'), '# Users\n\nSome user research content here for testing.');
    fs.writeFileSync(path.join(PROJECT_DIR, 'problem.md'), '# Problem\n\nThe core problem we are solving.');

    execSync(`node ${CLI} dashboard`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const output = fs.readFileSync(path.join(PROJECT_DIR, 'dashboard.html'), 'utf-8');
    assert.ok(output.includes('artifact-exists'));
    assert.ok(output.includes('users.md'));
    assert.ok(output.includes('problem.md'));
    // Progress should show 2/8
    assert.ok(output.includes('2/8'));

    fs.removeSync(path.join(PROJECT_DIR, 'dashboard.html'));
    fs.removeSync(path.join(PROJECT_DIR, 'users.md'));
    fs.removeSync(path.join(PROJECT_DIR, 'problem.md'));
  });

  it('shows missing artifacts', () => {
    execSync(`node ${CLI} dashboard`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const output = fs.readFileSync(path.join(PROJECT_DIR, 'dashboard.html'), 'utf-8');
    assert.ok(output.includes('artifact-missing'));
    assert.ok(output.includes('0/8'));
    assert.ok(output.includes('/productkit.constitution'));

    fs.removeSync(path.join(PROJECT_DIR, 'dashboard.html'));
  });

  it('respects --output flag', () => {
    execSync(`node ${CLI} dashboard --output custom.html`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    assert.ok(fs.existsSync(path.join(PROJECT_DIR, 'custom.html')));
    const output = fs.readFileSync(path.join(PROJECT_DIR, 'custom.html'), 'utf-8');
    assert.ok(output.includes('<!DOCTYPE html>'));

    fs.removeSync(path.join(PROJECT_DIR, 'custom.html'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} dashboard`, {
        cwd: __dirname,
        stdio: 'pipe',
      });
    });
  });
});
