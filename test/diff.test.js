const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const PROJECT_DIR = path.join(os.tmpdir(), 'test-diff-output');

describe('diff command', () => {
  before(() => {
    fs.removeSync(PROJECT_DIR);
    execSync(`node ${CLI} init test-diff-output`, {
      cwd: os.tmpdir(),
      stdio: 'ignore',
    });
    // Init git repo with dummy user for CI, create an artifact and commit it
    execSync('git init && git config user.email "test@test.com" && git config user.name "Test"', {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });
    fs.ensureDirSync(path.join(PROJECT_DIR, '.productkit', 'artifacts'));
    fs.writeFileSync(path.join(PROJECT_DIR, '.productkit', 'artifacts', 'users.md'), '# Users\n\nOriginal.\n');
    execSync('git add -A && git commit -m "initial"', {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(PROJECT_DIR);
  });

  it('shows no changes when artifacts are unchanged', () => {
    const output = execSync(`node ${CLI} diff`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('No changes'));
  });

  it('shows diff when an artifact is modified', () => {
    fs.writeFileSync(path.join(PROJECT_DIR, '.productkit', 'artifacts', 'users.md'), '# Users\n\nUpdated content.\n');

    const output = execSync(`node ${CLI} diff`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Updated content'));
    assert.ok(output.includes('Original'));

    // Revert
    execSync('git checkout -- .productkit/artifacts/users.md', { cwd: PROJECT_DIR, stdio: 'ignore' });
  });

  it('shows staged changes with --staged', () => {
    fs.writeFileSync(path.join(PROJECT_DIR, '.productkit', 'artifacts', 'users.md'), '# Users\n\nStaged change.\n');
    execSync('git add .productkit/artifacts/users.md', { cwd: PROJECT_DIR, stdio: 'ignore' });

    const output = execSync(`node ${CLI} diff --staged`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Staged change'));

    // Reset
    execSync('git reset HEAD .productkit/artifacts/users.md', { cwd: PROJECT_DIR, stdio: 'ignore' });
    execSync('git checkout -- .productkit/artifacts/users.md', { cwd: PROJECT_DIR, stdio: 'ignore' });
  });

  it('ignores non-artifact files', () => {
    fs.writeFileSync(path.join(PROJECT_DIR, 'random.txt'), 'not an artifact\n');

    const output = execSync(`node ${CLI} diff`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(!output.includes('random.txt'));
    assert.ok(output.includes('No changes'));

    fs.removeSync(path.join(PROJECT_DIR, 'random.txt'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} diff`, {
        cwd: __dirname,
        stdio: 'pipe',
      });
    });
  });
});
