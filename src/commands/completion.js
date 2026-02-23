const chalk = require('chalk');

const ZSH_COMPLETION = `#compdef productkit

_productkit() {
  local -a commands
  commands=(
    'init:Initialize a new product research project'
    'check:Verify Claude Code is installed and available'
    'status:Show which artifacts exist and what steps remain'
    'update:Refresh slash commands to the latest version'
    'reset:Remove all artifacts and start over'
    'list:Show available slash commands with descriptions'
    'completion:Output shell completion script'
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
            '1:project name:_files -/'
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
  commands="init check status update reset list completion"

  case "\${prev}" in
    productkit)
      COMPREPLY=( $(compgen -W "\${commands}" -- "\${cur}") )
      return 0
      ;;
    init)
      COMPREPLY=( $(compgen -W "--existing" -- "\${cur}") )
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
