const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');
const PROJECT_DIR = path.join(os.tmpdir(), 'test-doctor-output');

describe('doctor command', () => {
  before(() => {
    fs.removeSync(PROJECT_DIR);
    execSync(`node ${CLI} init test-doctor-output`, {
      cwd: os.tmpdir(),
      stdio: 'ignore',
    });
  });

  after(() => {
    fs.removeSync(PROJECT_DIR);
  });

  it('passes on a healthy project', () => {
    const output = execSync(`node ${CLI} doctor`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('passed'));
    assert.ok(!output.includes('fail'));
    assert.ok(!output.includes('warn'));
  });

  it('detects missing command template', () => {
    fs.removeSync(path.join(PROJECT_DIR, '.claude', 'commands', 'productkit.users.md'));

    assert.throws(() => {
      execSync(`node ${CLI} doctor`, {
        cwd: PROJECT_DIR,
        stdio: 'pipe',
      });
    }, (err) => {
      assert.ok(err.stdout.toString().includes('Missing command template: productkit.users.md'));
      return true;
    });

    // Restore
    const templatesDir = path.join(__dirname, '..', 'templates', 'commands');
    fs.copyFileSync(
      path.join(templatesDir, 'productkit.users.md'),
      path.join(PROJECT_DIR, '.claude', 'commands', 'productkit.users.md')
    );
  });

  it('detects outdated command template', () => {
    const cmdPath = path.join(PROJECT_DIR, '.claude', 'commands', 'productkit.users.md');
    fs.writeFileSync(cmdPath, '# old content\n');

    const output = execSync(`node ${CLI} doctor`, {
      cwd: PROJECT_DIR,
      encoding: 'utf-8',
    });
    assert.ok(output.includes('Outdated command: productkit.users.md'));
    assert.ok(output.includes('warning'));

    // Restore
    const templatesDir = path.join(__dirname, '..', 'templates', 'commands');
    fs.copyFileSync(
      path.join(templatesDir, 'productkit.users.md'),
      cmdPath
    );
  });

  it('detects invalid config JSON', () => {
    const configPath = path.join(PROJECT_DIR, '.productkit', 'config.json');
    const original = fs.readFileSync(configPath, 'utf-8');
    fs.writeFileSync(configPath, '{bad json');

    assert.throws(() => {
      execSync(`node ${CLI} doctor`, {
        cwd: PROJECT_DIR,
        stdio: 'pipe',
      });
    }, (err) => {
      assert.ok(err.stdout.toString().includes('not valid JSON'));
      return true;
    });

    // Restore
    fs.writeFileSync(configPath, original);
  });

  it('fails outside a productkit project', () => {
    assert.throws(() => {
      execSync(`node ${CLI} doctor`, {
        cwd: __dirname,
        stdio: 'pipe',
      });
    });
  });
});
