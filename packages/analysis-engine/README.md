# @githru-vscode-ext/analysis-engine

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/githru/githru-vscode-ext/blob/main/LICENSE) [![GitHub actions Status](https://github.com/githru/githru-vscode-ext/actions/workflows/analysis-engine.yml/badge.svg)](https://github.com/githru/githru-vscode-ext/actions/workflows/analysis-engine.yml) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/githru/githru-vscode-ext/blob/main/packages/analysis-engine/CONTRIBUTING.md)

Githru Analysis Engine is module for preprocessing Git logs.

- **Convincing:** Design a visual encoding idiom to represent a large Git graph in a scalable manner while preserving the topological structures in the Git graph.
- **Novel-Techniques:** Use graph reconstruction, clustering, and Context-Preserving Squash Merge methods to enable scalable exploration of a large Git commit graph.

## Installation

The easiest way to get started with Githru Analysis Engine is to run the npm command.

```Shell
# Run from your project's root directory
npm install @githru-vscode-ext/analysis-engine
```

## Documentation

### PARSER

### STEM

### CSM

You can improve it by sending pull requests to [this repository](https://github.com/githru/githru-vscode-ext/blob/main/packages/analysis-engine).

## Examples

Here is the first one to get you started:

```ts
import { analyzeGit } from "@githru-vscode-ext/analysis-engine";

async function getAnalyzedGit(gitLog: string) {
  const analyzedGitInformation = await analyzeGit({ gitLog });

  // Add your codes
  return analyzedGitInformation;
}
```

## Contributing

The main purpose of this repository is to continue evolving procedure for analyzing Git logs, making it faster and easier to understand. Development of Githru Analysis Engine happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in.

### [Contributing Guide](https://github.com/githru/githru-vscode-ext/blob/main/packages/analysis-engine/CONTRIBUTING.md)

Read our [contributing guide](https://github.com/githru/githru-vscode-ext/blob/main/packages/analysis-engine/CONTRIBUTING.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes to Githru Analysis Engine.

### Analysis Engine Label

To help you get your feet wet and get you familiar with our contribution process, we have a list of [analysis engine](https://github.com/githru/githru-vscode-ext/labels/%F0%9F%94%8D%20analysis%20engine) that contain information that have a relatively limited scope. This is a great place to get started.

### License

Githru Analysis Engine is Apache License 2.0 licensed.
