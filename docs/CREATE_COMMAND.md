# Create Command Guide

## Overview

The `create` command creates a new Git branch in `~/.claude` for managing different Claude.ai configuration profiles. By default, it automatically opens the directory in your IDE after creating the branch.

## Basic Usage

### Create branch and open in IDE (default)
```bash
ccswitch create <branch-name>
```
Creates a new branch and automatically opens `~/.claude` in your IDE.

### Create branch without opening IDE
```bash
ccswitch create <branch-name> --no-edit
```
Creates a new branch without opening the IDE.

## Examples

### Create a minimal configuration
```bash
# Create and open in IDE
ccswitch create slim/minimal
# Output:
# ✓ Created branch: slim/minimal
# Switched to branch 'slim/minimal'
# Opening ~/.claude in VS Code...
# ✓ Opened ~/.claude in your IDE
```

### Create a project-specific configuration
```bash
# Create for a web project
ccswitch create project/my-web-app

# Create for a backend service
ccswitch create project/api-server
```

### Create without IDE
```bash
# Just create the branch, don't open IDE
ccswitch create client/acme-corp --no-edit
# Output:
# ✓ Created branch: client/acme-corp
# Switched to branch 'client/acme-corp'
```

## Branch Naming Conventions

The tool suggests using structured branch names with prefixes:

- **`slim/*`** - Minimal configurations with reduced context
- **`project/*`** - Project-specific settings and instructions
- **`client/*`** - Client-specific configurations
- **`persona/*`** - Persona-focused settings (e.g., persona/teacher, persona/coder)

### Examples of good branch names
```bash
# Minimal configurations
ccswitch create slim/basic
ccswitch create slim/no-context

# Project configurations
ccswitch create project/react-app
ccswitch create project/python-backend
ccswitch create project/data-analysis

# Client configurations
ccswitch create client/startup-x
ccswitch create client/enterprise-y

# Persona configurations
ccswitch create persona/educator
ccswitch create persona/reviewer
ccswitch create persona/architect
```

## Branch Name Validation

Branch names must follow Git naming conventions:
- Can contain letters, numbers, `/`, `-`, and `_`
- Cannot contain spaces or special characters
- Cannot start with a dot (.)
- Cannot end with .lock

### Invalid branch names
```bash
# Spaces not allowed
ccswitch create "my branch"  # ❌ Error

# Special characters not allowed
ccswitch create feature@new   # ❌ Error
ccswitch create config#1      # ❌ Error
```

### Valid branch names
```bash
ccswitch create feature/new-config     # ✅
ccswitch create test_branch_123        # ✅
ccswitch create v2-configuration       # ✅
```

## IDE Integration

After creating a branch, the command automatically:
1. Switches to the new branch
2. Opens `~/.claude` in your detected IDE (VS Code, Cursor, etc.)
3. Shows a success message

### Supported IDEs
- **VS Code** (highest priority)
- **Cursor**
- **Vim** (terminal)
- **Nano** (terminal)

### Skip IDE opening
Use the `--no-edit` flag when you want to:
- Create multiple branches quickly
- Work in a headless environment
- Use a different editor manually

```bash
# Create multiple branches without IDE interruption
ccswitch create slim/minimal --no-edit
ccswitch create slim/basic --no-edit
ccswitch create project/web --no-edit
```

## Workflow Examples

### Basic workflow
```bash
# 1. Initialize if needed
ccswitch init

# 2. Create a new configuration branch
ccswitch create project/my-app

# 3. Edit your configuration files in the IDE
# (IDE opens automatically)

# 4. Test the configuration
ccswitch test

# 5. Switch back to another branch when done
ccswitch switch master
```

### Batch creation workflow
```bash
# Create multiple configurations without IDE
ccswitch create slim/minimal --no-edit
ccswitch create slim/basic --no-edit
ccswitch create project/frontend --no-edit
ccswitch create project/backend --no-edit

# List all branches
ccswitch list

# Edit a specific one
ccswitch edit project/frontend
```

## Error Handling

### Branch already exists
```bash
ccswitch create existing-branch
# Error: Branch 'existing-branch' already exists
# Use 'ccswitch switch' to switch to an existing branch
```

**Solution**: Use `switch` command instead:
```bash
ccswitch switch existing-branch
```

### Not a Git repository
```bash
ccswitch create my-branch
# Error: ~/.claude is not a Git repository
# Run 'ccswitch init' to initialize Git in ~/.claude
```

**Solution**: Initialize first:
```bash
ccswitch init
ccswitch create my-branch
```

### Invalid branch name
```bash
ccswitch create "invalid name"
# Error: Invalid branch name format
# Branch names should only contain letters, numbers, /, -, and _
```

**Solution**: Use a valid branch name:
```bash
ccswitch create valid-name
```

## Tips and Best Practices

1. **Use consistent naming**: Adopt a naming convention and stick to it
2. **Document your branches**: Keep a note of what each branch is for
3. **Clean up old branches**: Delete branches you no longer need
4. **Test after creation**: Always test your configuration after creating

### Recommended workflow for new projects
```bash
# 1. Create a project-specific branch
ccswitch create project/my-new-project

# 2. Add project context to CLAUDE.md
echo "# Project: My New Project" >> ~/.claude/CLAUDE.md
echo "Tech stack: React, TypeScript, TailwindCSS" >> ~/.claude/CLAUDE.md

# 3. Test the configuration
ccswitch test

# 4. Commit your changes
cd ~/.claude
git add .
git commit -m "Add configuration for my-new-project"
```

## Related Commands

- **`edit [branch]`** - Open ~/.claude in IDE, optionally switching branches
- **`switch [branch]`** - Switch between existing branches
- **`list`** - Show all available branches
- **`test [branch]`** - Test configuration performance