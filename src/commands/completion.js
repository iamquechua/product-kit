const chalk = require('chalk');

const ZSH_COMPLETION = `#compdef productkit

_productkit() {
  local -a commands
  commands=(
    'init:Initialize a new product research project'
    'check:Verify Claude Code is installed and available'
    'status:Show which artifacts exist and what steps remain'
    'export:Export all artifacts as a single combined markdown file'
    'diff:Show what changed in artifacts since last commit'
    'doctor:Check project health'
    'update:Refresh slash commands to the latest version'
    'reset:Remove all artifacts and start over'
    'list:Show available slash commands with descriptions'
    'completion:Output shell completion script'
    'workspace:Create a shared workspace for multi-project orgs'
  )

  _arguments -C \\
    '1:command:->command' \\
    '*::arg:->args'

  case "$state" in
    command)
      _describe 'command' commands
      ;;
    args)
      case "$words[1]" in
        init)
          _arguments \\
            '--existing[Add Product Kit to the current directory]' \\
            '--minimal[Skip constitution]' \\
            '--mode[Building mode (solo or team)]:mode:(solo team)' \\
            '--artifact-dir[Store artifacts in a custom directory]:dir:_files -/' \\
            '1:project name:_files -/'
          ;;
        export)
          _arguments \\
            '--output[Output filename]:file:_files' \\
            '--stories-csv[Export stories as CSV for Jira/Linear import]'
          ;;
        diff)
          _arguments \\
            '--staged[Show staged changes instead of unstaged]'
          ;;
        reset)
          _arguments \\
            '--force[Skip confirmation prompt]'
          ;;
      esac
      ;;
  esac
}

_productkit "$@"`;

const BASH_COMPLETION = `_productkit() {
  local cur prev commands
  COMPREPLY=()
  cur="\${COMP_WORDS[COMP_CWORD]}"
  prev="\${COMP_WORDS[COMP_CWORD-1]}"
  commands="init check status export diff doctor update reset list completion workspace"

  case "\${prev}" in
    productkit)
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      return 0
      ;;
    init)
      COMPREPLY=( $(compgen -W "--existing --minimal --mode --artifact-dir" -- "\${cur}") )
      return 0
      ;;
    export)
      COMPREPLY=( $(compgen -W "--output --stories-csv" -- "\${cur}") )
      return 0
      ;;
    diff)
      COMPREPLY=( $(compgen -W "--staged" -- "\${cur}") )
      return 0
      ;;
    reset)
      COMPREPLY=( $(compgen -W "--force" -- "\${cur}") )
      return 0
      ;;
  esac
}

complete -F _productkit productkit`;

async function completion(options) {
  if (options.shell === 'bash') {
    console.log(BASH_COMPLETION);
  } else if (options.shell === 'zsh') {
    console.log(ZSH_COMPLETION);
  } else {
    // Auto-detect
    const shell = process.env.SHELL || '';
    if (shell.includes('zsh')) {
      console.log(ZSH_COMPLETION);
    } else {
      console.log(BASH_COMPLETION);
    }
    console.error();
    console.error(chalk.cyan('Add to your shell config:'));
    if (shell.includes('zsh')) {
      console.error(`  echo 'eval "$(productkit completion)"' >> ~/.zshrc`);
    } else {
      console.error(`  echo 'eval "$(productkit completion)"' >> ~/.bashrc`);
    }
  }
}

module.exports = completion;
