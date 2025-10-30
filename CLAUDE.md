# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

githru-vscode-ext is a VSCode extension that provides Git visualization and analytics. It's a monorepo with three main packages:

- **analysis-engine**: Core Git analysis engine that parses git logs and GitHub data
- **view**: React-based UI components for visualization (uses D3.js, Material-UI)
- **vscode**: VSCode extension wrapper that bridges the engine and view

## Development Commands

### Root Level
```bash
# Install dependencies for all packages
npm install

# Build all packages
npm run build:all

# Test all packages
npm run test:all

# Lint all packages
npm run lint
npm run lint:fix

# Format code
npm run prettier
npm run prettier:fix
```

### Package-Specific Commands

#### Analysis Engine (packages/analysis-engine)
```bash
# Build with type declarations
npm run build

# Run specific tests
npm run test:stem
npm run test

# Lint
npm run lint
```

#### View (packages/view)
```bash
# Start development server
npm run start

# Build for production
npm run build

# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

#### VSCode Extension (packages/vscode)
```bash
# Build extension (also builds view package)
npm run build

# Watch mode for development
npm run watch

# Package extension
npm run package

# Debug: F5 in VSCode or Run > Start Debugging
```

### Debugging the Extension
1. Run `npm run build:all` from root
2. Open the `packages/vscode` folder in VSCode
3. Press F5 or use Run > Start Debugging
4. In the Extension Development Host, use Command Palette > "Open Githru View"

## Architecture

### Data Flow
1. **VSCode Extension** captures git repository context
2. **Analysis Engine** processes git log and GitHub API data:
   - Parses raw git commits (`parser.ts`)
   - Builds commit dictionary (`commit.util.ts`)
   - Creates stem/branch structure (`stem.ts`)
   - Generates cluster summary map (`csm.ts`)
3. **View** renders interactive visualizations using the processed data

### Key Components

#### Analysis Engine Core Classes
- `AnalysisEngine`: Main orchestrator class
- `PluginOctokit`: GitHub API integration with retry/throttling
- Dependency injection using `tsyringe`

#### View Architecture
- **State Management**: Zustand stores in `src/store/`
- **Components**: Modular React components with D3.js integration
- **IDE Adapter Pattern**: `VSCodeIDEAdapter` bridges VSCode API
- Component structure: `ComponentName/index.ts` exports, separate `.const.ts`, `.type.ts`, `.util.ts` files

#### VSCode Extension
- Extension activation on git repositories
- Webview integration for React UI
- Command palette integration
- GitHub authentication management

## Code Conventions

### Commit Messages
Follow conventional commits with these scopes:
- `feat(engine)`: Analysis engine features
- `feat(view)`: UI/visualization features
- `feat(vscode)`: VSCode extension features
- `fix(scope)`: Bug fixes
- `refactor(scope)`: Code refactoring

### Code Style
- ESLint configuration with Prettier
- TypeScript strict mode
- 2-space indentation, 120 character line width
- Single quotes disabled, trailing commas on ES5

### Testing
- Jest for unit testing
- Playwright for E2E testing (view package)
- Test files: `*.spec.ts` or `*.test.ts`

## Development Environment Setup

### Prerequisites
- Node.js >= 16
- npm >= 8
- VSCode with ESLint extension

### TypeScript Configuration
In VSCode, activate workspace TypeScript:
1. Open a TypeScript file
2. Ctrl/Cmd + Shift + P
3. "Select TypeScript Version"
4. "Use Workspace Version"

### Package Structure
The project uses npm workspaces. Each package has its own dependencies and build configuration but shares root-level linting and formatting rules.