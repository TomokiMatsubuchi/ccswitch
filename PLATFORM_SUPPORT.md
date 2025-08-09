# Platform Support

## Supported Platforms

### ✅ macOS
- **Status**: Fully tested and supported
- **Requirements**: macOS 10.15+, Bun 1.0+
- **Installation**: Native support

### ⚠️ Linux
- **Status**: Should work (untested)
- **Requirements**: Ubuntu 20.04+, Debian 10+, Fedora 33+
- **Installation**: Requires Bun installation
- **Known Issues**: None reported

### ⚠️ Windows
- **Status**: Requires WSL (Windows Subsystem for Linux)
- **Requirements**: Windows 10/11 with WSL2
- **Installation**: 
  1. Install WSL2
  2. Install Bun in WSL
  3. Run ccswitch within WSL environment
- **Known Issues**: 
  - Direct Windows support not available (Bun limitation)
  - Path handling may require adjustment

## Installation by Platform

### macOS/Linux
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install ccswitch (when published)
bun install -g ccswitch
```

### Windows (WSL)
```bash
# In WSL terminal
curl -fsSL https://bun.sh/install | bash
bun install -g ccswitch
```

## Testing Status

| Platform | Unit Tests | E2E Tests | Production Use |
|----------|------------|-----------|----------------|
| macOS    | ✅ Pass    | ✅ Pass   | ✅ Ready       |
| Linux    | ⏳ Pending | ⏳ Pending| ⚠️ Untested    |
| Windows  | ⏳ Pending | ⏳ Pending| ⚠️ WSL Only    |

## Compatibility Notes

- All file paths use POSIX format
- Git operations are cross-platform compatible
- HOME directory detection works across platforms
- IDE detection supports VS Code, Cursor on all platforms