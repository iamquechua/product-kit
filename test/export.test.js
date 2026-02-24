const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const PROJECT_DIR = path.join(__dirname, '..', 'test-export-output');

describe('export command', () => {
  before(() => {
    fs.removeSync(PROJECT_DIR);
    execSync(`node ${CLI} init test-export-output`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });
    // Create some artifacts
    fs.writeFileSync(path.join(PROJECT_DIR, 'users.md'), '# Users\n\nTarget users here.\n');
    fs.writeFileSync(path.join(PROJECT_DIR, 'problem.md'), '# Problem\n\nProblem statement here.\n');
  });

  after(() => {
    fs.removeSync(PROJECT_DIR);
  });

  it('exports existing artifacts to export.md', () => {
    execSync(`node ${CLI} export`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const output = fs.readFileSync(path.join(PROJECT_DIR, 'export.md'), 'utf-8');
    assert.ok(output.includes('Product Kit Export'));
    assert.ok(output.includes('# Users'));
    assert.ok(output.includes('# Problem'));
    // Constitution not created, should not appear
    assert.ok(!output.includes('# Constitution'));
  });

  it('exports to custom filename with --output', () => {
    execSync(`node ${CLI} export --output combined.md`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    assert.ok(fs.existsSync(path.join(PROJECT_DIR, 'combined.md')));
    const output = fs.readFileSync(path.join(PROJECT_DIR, 'combined.md'), 'utf-8');
    assert.ok(output.includes('# Users'));
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} export`, {
        cwd: __dirname,
        stdio: 'pipe',
      });
    });
  });

  it('fails when no artifacts exist', () => {
    const emptyDir = path.join(__dirname, '..', 'test-export-empty');
    fs.removeSync(emptyDir);
    execSync(`node ${CLI} init test-export-empty`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'ignore',
    });

    assert.throws(() => {
      execSync(`node ${CLI} export`, {
        cwd: emptyDir,
        stdio: 'pipe',
      });
    });

    fs.removeSync(emptyDir);
  });
});
