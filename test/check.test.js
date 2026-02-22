const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');

describe('check command', () => {
  it('runs without crashing', () => {
    // The command will either succeed (claude installed) or exit 1 (not installed)
    // Either way it should not throw an unexpected error
    try {
      const output = execSync(`node ${CLI} check`, { encoding: 'utf-8' });
      assert.ok(output.includes('Claude Code'));
    } catch (err) {
      // Exit code 1 is expected if claude is not installed
      assert.ok(err.stdout.includes('Claude Code') || err.stderr.includes('Claude Code'));
    }
  });
});
