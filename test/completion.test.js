const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execSync } = require('child_process');
const path = require('path');

const CLI = path.join(__dirname, '..', 'src', 'cli.js');

describe('completion command', () => {
  it('outputs bash completion script', () => {
    const output = execSync(`node ${CLI} completion --shell bash`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('complete -F _productkit productkit'));
  });

  it('outputs zsh completion script', () => {
    const output = execSync(`node ${CLI} completion --shell zsh`, {
      encoding: 'utf-8',
    });
    assert.ok(output.includes('#compdef productkit'));
  });

  it('auto-detects shell when no flag provided', () => {
    const output = execSync(`node ${CLI} completion`, {
      encoding: 'utf-8',
    });
    // Should output either bash or zsh completion
    assert.ok(output.includes('productkit'));
  });
});
