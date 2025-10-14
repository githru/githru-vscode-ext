# Githru MCP Server

<p align="center">
  <strong>A powerful Model Context Protocol (MCP) server that provides advanced Git repository analysis and visualization tools designed to enhance team collaboration.</strong>
</p>

---

## 🚀 Overview

The **Githru MCP Server** extends Claude’s capabilities through the **Model Context Protocol (MCP)** — enabling real-time access to Git analytics, PR insights, and repository visualization.

This MCP server is deployed on **[smithery.ai](https://smithery.ai)** and can be used directly from Claude’s MCP integration feature.

---

## 🧩 Prerequisites

Before you begin, make sure you have:

- **Claude Desktop App** (with MCP support)  
  👉 [Download here](https://claude.ai/download)
- Access to the deployed **Githru MCP Server** on `smithery.ai`

---

## ⚙️ Setup in Claude

1. **Find the JSON configuration**
   - When you visit the [Githru MCP Server page on Smithery.ai](https://smithery.ai/server/@githru/githru-mcp-v1),  
     click **“Connect → JSON”** to view the configuration details for our MCP server.

2. **Insert the Githru MCP configuration**
   - Claude Desktop reads MCP server settings from the `claude_desktop_config.json` file.  
     You need to modify the `args` path inside your local configuration file.

   **File locations:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

   ```json
   {
      "mcpServers": {
        "githru-mcp-v1": {
          "command": "npx",
          "args": [
            "-y",
            "@smithery/cli@latest",
            "run",
            "@githru/githru-mcp-v1",
            "--key",
            "YOUR_API_KEY",
            "--profile",
            "PROFILE"
          ],
          "env": {
            "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN"
          }
        }
      }
    }
   ```
> 🧠 Tip: Replace the URL above with your actual Smithery MCP endpoint if it differs.

3. Save and reconnecting
  - After saving, Claude will automatically connect to your Githru MCP instance.
  - so reconnect Claude

---

## 🧠 About Model Context Protocol (MCP)

MCP is an open standard that lets Claude connect to external data and services safely and dynamically.
Your Githru MCP Server acts as a “bridge” — providing contextual Git insights directly within the Claude chat interface.

For more on MCP:
👉 (https://modelcontextprotocol.io)[https://modelcontextprotocol.io]

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

We welcome contributions!
If you’d like to improve the Githru MCP Server, please open a PR or file an issue on [GitHub](https://github.com/githru/githru-vscode-ext).