const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const PROJECT_DIR = path.join(os.tmpdir(), 'test-export-output');

describe('export command', () => {
  before(() => {
    fs.removeSync(PROJECT_DIR);
    execSync(`node ${CLI} init test-export-output`, {
      cwd: os.tmpdir(),
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

  it('exports stories as CSV in team mode', () => {
    const storiesMd = `# User Stories

## Epic 1: Authentication

### E1-S1: Login
- **Title:** User can log in
- **Priority:** High
- **Estimate:** 3 pts
- **Depends on:** None
- **Acceptance Criteria:**
  - [ ] User sees login form
  - [ ] User can submit credentials
- **Definition of Done:** Deployed to staging
- **Notes:** Use OAuth

### E1-S2: Logout
- **Title:** User can log out
- **Priority:** Medium
- **Estimate:** 1 pt
- **Depends on:** E1-S1
- **Acceptance Criteria:**
  - [ ] Session is cleared
- **Definition of Done:** Tested
- **Notes:** Redirect to home
`;
    fs.writeFileSync(path.join(PROJECT_DIR, 'stories.md'), storiesMd);

    execSync(`node ${CLI} export --stories-csv`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const csv = fs.readFileSync(path.join(PROJECT_DIR, 'stories.csv'), 'utf-8');
    const lines = csv.trim().split('\n');
    assert.strictEqual(lines[0], 'ID,Title,Epic,Priority,Estimate,Depends On,Acceptance Criteria,Definition of Done,Notes');
    assert.ok(lines[1].includes('E1-S1'));
    assert.ok(lines[1].includes('Authentication'));
    assert.ok(lines[1].includes('User sees login form; User can submit credentials'));
    assert.strictEqual(lines.length, 3);
  });

  it('exports stories as CSV in solo mode', () => {
    const soloStoriesMd = `# Build Plan

### T1: Set up project
- **Effort:** Small (1-2 hours)
- **Depends on:** None
- **Done when:**
  - [ ] Package.json created
  - [ ] CI runs
- **Watch out for:** Node version

### T2: Build auth
- **Effort:** Large (1-2 days)
- **Depends on:** T1
- **Done when:**
  - [ ] Login works
- **Watch out for:** Rate limiting
`;
    fs.writeFileSync(path.join(PROJECT_DIR, 'stories.md'), soloStoriesMd);

    execSync(`node ${CLI} export --stories-csv`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });

    const csv = fs.readFileSync(path.join(PROJECT_DIR, 'stories.csv'), 'utf-8');
    const lines = csv.trim().split('\n');
    assert.strictEqual(lines[0], 'ID,Task,Effort,Depends On,Done When,Watch Out For');
    assert.ok(lines[1].includes('T1'));
    assert.ok(lines[1].includes('Package.json created; CI runs'));
    assert.ok(lines[2].includes('T2'));
    assert.strictEqual(lines.length, 3);
  });

  it('exports stories as CSV with custom output', () => {
    execSync(`node ${CLI} export --stories-csv --output custom.csv`, {
      cwd: PROJECT_DIR,
      stdio: 'ignore',
    });
    assert.ok(fs.existsSync(path.join(PROJECT_DIR, 'custom.csv')));
  });

  it('fails --stories-csv without stories.md', () => {
    const emptyDir = path.join(os.tmpdir(), 'test-export-csv-empty');
    fs.removeSync(emptyDir);
    execSync(`node ${CLI} init test-export-csv-empty`, {
      cwd: os.tmpdir(),
      stdio: 'ignore',
    });

    assert.throws(() => {
      execSync(`node ${CLI} export --stories-csv`, {
        cwd: emptyDir,
        stdio: 'pipe',
      });
    });

    fs.removeSync(emptyDir);
  });

  it('fails when no artifacts exist', () => {
    const emptyDir = path.join(os.tmpdir(), 'test-export-empty');
    fs.removeSync(emptyDir);
    execSync(`node ${CLI} init test-export-empty`, {
      cwd: os.tmpdir(),
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
