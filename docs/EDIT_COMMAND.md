# Edit Command Guide

## Overview

The `edit` command opens the `~/.claude` directory in your preferred IDE (VS Code, Cursor, etc.) for easy configuration editing.

## Basic Usage

### Open current branch in IDE
```bash
ccswitch edit
```
Opens `~/.claude` directory in your IDE while staying on the current Git branch.

### Switch branch and open in IDE
```bash
ccswitch edit <branch-name>
```
First switches to the specified branch, then opens `~/.claude` in your IDE.

## Examples

### Open on current branch
```bash
# Simply open ~/.claude in your IDE
ccswitch edit
```

### Switch to a specific branch and edit
```bash
# Switch to the 'slim/minimal' branch and open in IDE
ccswitch edit slim/minimal

# Switch to a project-specific branch and edit
ccswitch edit project/web-app
```

### Error handling
```bash
# If branch doesn't exist
ccswitch edit non-existent-branch
# Error: Branch 'non-existent-branch' does not exist
# Run 'ccswitch list' to see available branches
```

## IDE Support

The command automatically detects and uses the following IDEs in priority order:

1. **VS Code** (highest priority)
2. **Cursor**
3. **Vim** (terminal editor)
4. **Nano** (terminal editor)

### macOS specific behavior
On macOS, the command directly opens VS Code.app if available, avoiding potential conflicts with command-line tools.

## Integration with Other Commands

### Create and Edit
When using the `create` command, the IDE opens automatically by default:

```bash
# Create branch and open IDE (default behavior)
ccswitch create feature/new-config

# Create branch without opening IDE
ccswitch create feature/new-config --no-edit
```

### Workflow example
```bash
# 1. List available branches
ccswitch list

# 2. Switch to a branch and open in IDE
ccswitch edit project/backend

# 3. Make your configuration changes in the IDE

# 4. Test your configuration
ccswitch test

# 5. Switch back to your previous branch
ccswitch switch -
```

## Troubleshooting

### IDE not found
If no supported IDE is installed:
```
Error: No suitable text editor found
Please install VS Code, Cursor, or another text editor
```

**Solution**: Install one of the supported IDEs:
- VS Code: https://code.visualstudio.com/
- Cursor: https://cursor.sh/

### Directory not found
If `~/.claude` doesn't exist:
```
Error: ~/.claude directory does not exist
Run 'ccswitch init' to create the directory first
```

**Solution**: Initialize the directory first:
```bash
ccswitch init
```

### Permission denied
If there are permission issues:
```
Error: Permission denied accessing ~/.claude
Please check your directory permissions
```

**Solution**: Check and fix directory permissions:
```bash
ls -la ~/.claude
chmod 755 ~/.claude
```

## Tips

- The `edit` command is particularly useful when you want to quickly switch between different configuration branches
- Use branch naming conventions for better organization:
  - `slim/*` - Minimal configurations
  - `project/*` - Project-specific settings
  - `client/*` - Client-specific settings
  - `persona/*` - Persona-focused settings