# ccswitch

Claude Configuration Switcher - A CLI tool for managing multiple Claude.ai configuration profiles using Git branches.

## Quick Start

```bash
# Install dependencies
bun install

# Initialize ~/.claude directory
bun run src/cli.ts init

# Create a new configuration branch
bun run src/cli.ts create project/my-app

# Edit configuration in your IDE
bun run src/cli.ts edit

# Switch between configurations
bun run src/cli.ts switch slim/minimal
```

## Commands

### `init`
Initialize the `~/.claude` directory and Git repository.
```bash
ccswitch init
```

### `create <branch>`
Create a new configuration branch and open it in your IDE.
```bash
# Create and open in IDE (default)
ccswitch create project/web-app

# Create without opening IDE
ccswitch create project/web-app --no-edit
```

### `edit [branch]`
Open `~/.claude` in your IDE, optionally switching to a specific branch first.
```bash
# Edit current branch
ccswitch edit

# Switch to branch and edit
ccswitch edit slim/minimal
```

### `switch [branch]`
Switch between configuration branches.
```bash
# Interactive selection
ccswitch switch

# Direct switch
ccswitch switch project/backend

# Switch to previous branch
ccswitch switch -
```

### `list`
List all available configuration branches.
```bash
ccswitch list
```

### `auto`
Automatically select the best configuration based on your current project.
```bash
ccswitch auto
```

### `test [branch]`
Test configuration performance and token usage.
```bash
# Test current branch
ccswitch test

# Test specific branch
ccswitch test project/frontend
```

## Branch Naming Conventions

- `slim/*` - Minimal configurations
- `project/*` - Project-specific settings
- `client/*` - Client-specific settings
- `persona/*` - Persona-focused settings

## IDE Support

The tool automatically detects and uses the following IDEs:
1. VS Code (highest priority)
2. Cursor
3. Vim
4. Nano

## Development

```bash
# Run tests
bun test

# Run with hot reload
bun --hot src/cli.ts

# Build
bun build src/cli.ts --compile --outfile=ccswitch
```

## Requirements

- Bun v1.2.19 or higher
- Git
- VS Code, Cursor, or another supported text editor

## Documentation

### English
- [Create Command Guide](docs/CREATE_COMMAND.md) - Detailed guide for the create command
- [Edit Command Guide](docs/EDIT_COMMAND.md) - Detailed guide for the edit command
- [Auto Command Guide](docs/AUTO_COMMAND_GUIDE.md) - Guide for automatic configuration selection

### 日本語
- [Create コマンド ガイド](docs/CREATE_COMMAND_JA.md) - createコマンドの詳細ガイド
- [Edit コマンド ガイド](docs/EDIT_COMMAND_JA.md) - editコマンドの詳細ガイド

### Development
- [Requirements](docs/REQUIREMENTS.md) - Technical requirements and design decisions
- [Project TODOs](ProjectTODOS.md) - Development roadmap and completed features

## License

MIT
