# githru-mcp

**MCP Server Package** included in the Githru repository.  
Deployed as a **remote MCP server** via Smithery, allowing direct connection and usage from Claude Desktop.  

---

## 1. Project Structure

``` 
githru-vscode-ext/
└─ packages/
  └─ mcp/
    ├─ src/
    │ └─ index.ts
    ├─ smithery.yml
    ├─ package.json
    ├─ tsconfig.json
    └─ .gitignore
```

---

## 2. Using Remote Server

Since githru-mcp is deployed on Smithery, you can use the remote MCP server directly without any build or local execution.

[About Details](./smithery-description.md)

---

## 3. Server Code Summary

- ping tool: No input → returns "pong"
- bmi_calculator tool: Input height(cm), weight(kg) → Calculate and return BMI result

Tools are registered in ```src/server.ts``` and compiled to ```dist/server.js``` with ```npm run build```.

---

## 4. Local Development (Optional)

If you want to develop/test directly instead of using the remote server, run the following:

```bash
cd packages/mcp
npm install
npm run build
```

After that, you can register the locally built server in Claude Desktop settings (claude_desktop_config.json) and run it.
However, don't commit the local configuration file (claude_desktop_config.json) to git as it's for personal environment only.

Claude Desktop reads MCP servers from the claude_desktop_config.json file.
You need to modify the path inside args in ```githru-mcp/claude_desktop_config.json```.

- macOS: ```~/Library/Application Support/Claude/claude_desktop_config.json```
- Windows: ```%APPDATA%\Claude\claude_desktop_config.json```

```json
{
  "mcpServers": {
      "githru-mcp": {
        "command": "node",
        "args": [
          "AbsolutePath/githru-vscode-ext/packages/mcp/dist/server.js"
        ],
        "env": {
          "NODE_NO_WARNINGS": "1",
          "GITHUB_TOKEN": "ghphvhvhvhvhvhvhvhvhvhvhvhvhvhvhv"
        }
      }
  }
}
```

> ⚠️ Don't run src/server.ts directly, you must register the **built JS (dist/server.js)**.
> (Running the TS source directly would require --loader ts-node/esm option, which is not recommended.)

---

## 5. Restart Claude Desktop
After modifying the configuration file, completely exit Claude Desktop and restart it.
(MCP servers are connected anew when Claude starts.)

---


