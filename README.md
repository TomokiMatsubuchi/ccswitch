# ccswitch

[![CI](https://github.com/TomokiMatsubuchi/ccswitch/actions/workflows/ci.yml/badge.svg)](https://github.com/TomokiMatsubuchi/ccswitch/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/ccswitch.svg)](https://badge.fury.io/js/ccswitch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Claude Configuration Switcher - A high-performance CLI tool for managing multiple Claude.ai configuration profiles using Git branches.

## Features

- 🚀 **Fast Branch Switching** - Sub-100ms performance with lazy loading
- 🎯 **Auto-Detection** - Automatically selects configurations based on project context
- 📝 **IDE Integration** - Seamless integration with VS Code, Cursor, Vim, and Nano
- 🔄 **Git-Based Management** - Version control for your configurations
- 🎨 **Smart Suggestions** - Context-aware configuration recommendations
- 📊 **Performance Testing** - Analyze token usage and configuration efficiency
- 🔍 **Interactive Selection** - Fuzzy search for quick branch navigation

## Installation

### Using npm (Recommended)

```bash
npm install -g ccswitch
```

### Using Bun

```bash
bun add -g ccswitch
```

### From Source

```bash
# Clone the repository
git clone https://github.com/TomokiMatsubuchi/ccswitch.git
cd ccswitch

# Install dependencies
bun install

# Build and link globally
bun run build
bun link
```

## Quick Start

```bash
# Initialize ~/.claude directory
ccswitch init

# Create a new configuration branch
ccswitch create project/my-app

# Edit configuration in your IDE
ccswitch edit

# Switch between configurations
ccswitch switch slim/minimal

# Auto-select based on current project
ccswitch auto
```

## Commands

### `init`
Initialize the `~/.claude` directory and Git repository.

```bash
ccswitch init
```

Creates the necessary directory structure and initializes a Git repository for version control.

### `create <branch>`
Create a new configuration branch and optionally open it in your IDE.

```bash
# Create and open in IDE (default)
ccswitch create project/web-app

# Create without opening IDE
ccswitch create project/web-app --no-edit

# Create with custom message
ccswitch create project/web-app -m "Frontend React configuration"
```

**Options:**
- `--no-edit` - Skip opening the IDE after creation
- `-m, --message <msg>` - Custom commit message

### `edit [branch]`
Open `~/.claude` directory in your IDE, optionally switching to a specific branch first.

```bash
# Edit current branch
ccswitch edit

# Switch to branch and edit
ccswitch edit slim/minimal
```

### `switch [branch]`
Switch between configuration branches with interactive selection or direct specification.

```bash
# Interactive selection with fuzzy search
ccswitch switch

# Direct switch
ccswitch switch project/backend

# Switch to previous branch
ccswitch switch -

# Force switch (discard local changes)
ccswitch switch project/api --force
```

**Options:**
- `--force` - Discard local changes and switch

### `list`
List all available configuration branches with metadata.

```bash
# Basic list
ccswitch list

# Verbose output with details
ccswitch list --verbose

# JSON output for scripting
ccswitch list --json
```

**Options:**
- `--verbose` - Show detailed information
- `--json` - Output in JSON format

### `auto`
Automatically select the best configuration based on your current project context.

```bash
# Auto-detect and switch
ccswitch auto

# Preview without switching
ccswitch auto --dry-run

# Verbose output
ccswitch auto --verbose
```

**Options:**
- `--dry-run` - Preview selection without switching
- `--verbose` - Show detailed analysis

**Best Practices:**
- Run `ccswitch auto` when switching between projects
- Use `--dry-run` to preview selections before switching
- Create project-specific branches for frequently used projects

### `test [branch]`
Test configuration performance and analyze token usage.

```bash
# Test current branch
ccswitch test

# Test specific branch
ccswitch test project/frontend

# Detailed metrics
ccswitch test --verbose
```

**Options:**
- `--verbose` - Show detailed metrics

### `delete <branch>`
Delete a configuration branch.

```bash
# Delete branch
ccswitch delete old/config

# Force delete
ccswitch delete old/config --force
```

**Options:**
- `--force` - Force deletion without confirmation

### `status`
Show current branch and repository status.

```bash
ccswitch status
```

### `help`
Display help information.

```bash
# General help
ccswitch help

# Command-specific help
ccswitch help create
```

## Branch Naming Conventions

Organize your configurations using semantic branch names:

- `slim/*` - Minimal, token-efficient configurations
- `project/*` - Project-specific settings
- `client/*` - Client or organization-specific settings  
- `persona/*` - Role-based configurations (developer, writer, etc.)
- `lang/*` - Language or framework-specific settings
- `experiment/*` - Experimental configurations

### Examples

```bash
ccswitch create slim/minimal        # Minimal token usage
ccswitch create project/web-app     # Web application project
ccswitch create client/acme-corp    # Client-specific settings
ccswitch create persona/backend-dev  # Backend developer persona
ccswitch create lang/python         # Python-specific configuration
```

## Project-Type Recommendations

Create project-specific configurations tailored to your technology stack:

| Project Type | Recommended Branch | Key Configurations |
|-------------|-------------------|-------------------|
| Node.js/TypeScript | `project/node-app` | TypeScript settings, package manager, testing framework |
| React/Vue/Angular | `project/[framework]-app` | Component patterns, state management, build tools |
| Python | `project/python-app` | PEP 8 standards, pytest/unittest, package management |
| Ruby/Rails | `project/ruby-app` | Ruby conventions, RSpec/Minitest, Bundler |
| Go | `project/go-app` | Go idioms, module management, error handling |

### Quick Setup Examples

```bash
# Node.js project
ccswitch create project/node-app

# React application
ccswitch create project/react-app

# Python project
ccswitch create project/python-app
```

For detailed configuration examples, see [Auto Command Guide](docs/AUTO_COMMAND_GUIDE.md).

## IDE Support

The tool automatically detects and uses installed IDEs in the following priority order:

1. **VS Code** - `code` command
2. **Cursor** - `cursor` command  
3. **Vim** - Terminal-based editor
4. **Nano** - Fallback terminal editor

To use a specific editor, set the `EDITOR` environment variable:

```bash
export EDITOR="code"  # Use VS Code
export EDITOR="vim"   # Use Vim
```

## Performance

ccswitch is optimized for speed:

- **Lazy Loading** - Modules loaded only when needed
- **Smart Caching** - Frequently used data cached in memory
- **Minimal Dependencies** - Lightweight design for fast execution
- **Native Performance** - Built with Bun for optimal speed

Typical operation times:
- `switch`: ~80ms
- `list`: ~45ms  
- `auto`: ~120ms (with project analysis)

## Advanced Usage

### Scripting Integration

ccswitch supports JSON output for scripting:

```bash
# Get current branch
CURRENT=$(ccswitch status --json | jq -r '.branch')

# List all branches
ccswitch list --json | jq -r '.[].name'

# Auto-switch in CI/CD
ccswitch auto --dry-run --json | jq -r '.recommended'
```

### Git Hooks

Automatically switch configurations using Git hooks:

```bash
# .git/hooks/post-checkout
#!/bin/bash
ccswitch auto
```

### Configuration Best Practices

1. **Start with a minimal base**
   ```bash
   # Begin with slim configuration
   ccswitch switch slim/minimal
   ccswitch create project/my-app
   ```

2. **Layer project-specific settings**
   - Keep common settings in base branches
   - Add only project-specific overrides
   - Use clear, descriptive branch names

3. **Regular maintenance**
   ```bash
   # Test configuration efficiency
   ccswitch test project/my-app
   
   # Remove unused branches
   ccswitch delete old/unused-config
   ```

4. **Team collaboration**
   - Document configuration purposes in CLAUDE.md
   - Share branch naming conventions
   - Use consistent patterns across projects

### Environment Variables

- `CLAUDE_HOME` - Override default `~/.claude` directory
- `EDITOR` - Specify preferred text editor
- `CCSWITCH_DEBUG` - Enable debug output

## Platform Support

| Platform | Support | Notes |
|----------|---------|-------|
| macOS    | ✅ Full  | Primary development platform |
| Linux    | ✅ Full  | Tested on Ubuntu, Debian, Arch |
| Windows  | ⚠️ Partial | WSL recommended |

## Development

### Prerequisites

- Bun v1.2.19 or higher
- Git
- Node.js 18+ (for npm publishing)

### Setup

```bash
# Clone repository
git clone https://github.com/TomokiMatsubuchi/ccswitch.git
cd ccswitch

# Install dependencies
bun install

# Run tests
bun test

# Run with hot reload
bun --hot src/cli.ts

# Build for production
bun run build
```

### Testing

```bash
# Run all tests (local only)
bun run test:all

# Run unit tests
bun run test:unit

# Run E2E tests (local only - requires git)
bun run test:e2e

# Check coverage
bun run test:coverage
```

**Note**: E2E tests require actual git operations and file system access. They are skipped in CI environments and should be run locally before releasing.

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

### Guides

- [Create Command Guide](docs/CREATE_COMMAND.md) - Detailed guide for the create command
- [Edit Command Guide](docs/EDIT_COMMAND.md) - Detailed guide for the edit command  
- [Auto Command Guide](docs/AUTO_COMMAND_GUIDE.md) - Automatic configuration selection

### 日本語ドキュメント

- [Create コマンド ガイド](docs/CREATE_COMMAND_JA.md) - createコマンドの詳細ガイド
- [Edit コマンド ガイド](docs/EDIT_COMMAND_JA.md) - editコマンドの詳細ガイド

### Development

- [Requirements](docs/REQUIREMENTS.md) - Technical requirements and design
- [Performance Guide](PERFORMANCE.md) - Performance benchmarks and optimization
- [Platform Support](PLATFORM_SUPPORT.md) - Detailed platform compatibility
- [Project TODOs](ProjectTODOS.md) - Development roadmap

## Support

- **Issues**: [GitHub Issues](https://github.com/TomokiMatsubuchi/ccswitch/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TomokiMatsubuchi/ccswitch/discussions)
- **Security**: Report vulnerabilities via [Security Policy](SECURITY.md)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Bun](https://bun.sh) for blazing fast performance
- Inspired by Git's branch management system
- Community feedback and contributions

---

Made with ❤️ by the ccswitch contributors