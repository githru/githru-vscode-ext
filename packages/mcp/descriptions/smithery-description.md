#  Githru MCP Server

<p align="center">
  <strong>A powerful Model Context Protocol (MCP) server that provides advanced Git repository analysis and visualization tools designed to enhance team collaboration.</strong>
</p>


## 🎯 Core Features

### 📊 Feature Impact Analyzer

Analyzes GitHub Pull Requests to compute comprehensive impact metrics such as **scale, dispersion, chaos, isolation, lag, and coupling**.
It features **long-tail–based analysis** to identify outlier file paths and generates detailed reports that help assess the impact of code changes.

#### Key Metrics:
- **Scale** – Total lines of code changed
- **Dispersion** – Number and diversity of affected files
- **Chaos** – Temporal instability in code changes
- **Isolation** – Degree of dependency separation
- **Lag** – Time delay between code changes
- **Coupling** – Inter-module dependency level
- **Long-tail Analysis** – Detects and highlights unusual file path patterns


### 🏆 Contributor Recommender

Intelligently recommends the most relevant contributors for a given file, branch, or Pull Request area by analyzing recent contribution history and activity patterns.

#### Recommendation Modes:
- PR-based recommendations
- File/Directory path–based (supports glob patterns)
- Branch-based analysis
- Custom time range analysis


## 🌐 Multilingual Support

All tools support both **English** and **Korean** via the `locale` parameter (`en` or `ko`).


## 📈 Visualization Options

- **Chart Mode**: Interactive HTML visualizations powered by **Chart.js**


## 🚀 Use Cases

- **Code Review Automation**: Analyze PR impact before merging
- **Team Collaboration**: Identify the most relevant experts for code areas
- **Development Insights**: Understand change patterns and dependency structures


## 📦 Integration

Deploy remotely as an MCP server via **Smithery**, and connect directly with **Claude Desktop** for seamless integration with AI assistants.