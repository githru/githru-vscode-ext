# githru-mcp

Githru 레포 안에 포함된 **MCP 서버 패키지**.  
Claude Desktop에서 **수동 등록**하여 MCP 툴(`ping`, `bmi_calculator` 등)을 바로 실행해볼 수 있습니다.

---

## 1. 프로젝트 구조

``` 
githru-vscode-ext/
└─ packages/
└─ githru-mcp/
├─ src/
│ └─ server.ts
├─ package.json
├─ tsconfig.json
└─ .gitignore
```

---

## 2. 설치 & 빌드

```bash
# githru-mcp 디렉터리로 이동
cd packages/githru-mcp

# 의존성 설치
npm install

# (zod 사용 툴이 있으므로) zod 설치
npm install zod

# TypeScript 빌드
npm run build
# -> dist/server.js 생성
```

---

## 3. 서버 코드 요약

- ping 툴: 입력 없음 → "pong" 반환
- bmi_calculator 툴: height(cm), weight(kg) 입력 → BMI 계산 후 결과 반환

```src/server.ts``` 안에 툴들이 등록되어 있고, ```npm run build```로 ```dist/server.js```에 컴파일됩니다.

---

## 4. Claude Desktop 수동 등록
Claude Desktop은 claude_desktop_config.json 파일에서 MCP 서버를 읽습니다.
```githru-mcp/claude_desktop_config.json```의 args 내부 path를 수정해주셔야합니다.

- macOS: ```~/Library/Application Support/Claude/claude_desktop_config.json```
- Windows: ```%APPDATA%\Claude\claude_desktop_config.json```

```json
{
  "mcpServers": {
    "githru-mcp": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/githru-vscode-ext/packages/githru-mcp/dist/server.js"
      ],
      "env": {
        "NODE_NO_WARNINGS": "1"
      }
    }
  }
}
```

> ⚠️ src/server.ts를 직접 실행하지 말고, 반드시 **빌드된 JS (dist/server.js)**를 등록해야 합니다.
> (TS 원본을 바로 실행하려면 --loader ts-node/esm 옵션이 필요하므로 권장하지 않습니다.)

---

## 5. Claude Desktop 재시작
설정 파일을 수정한 후 Claude Desktop을 완전히 종료하고 다시 실행하세요.
(MCP 서버는 Claude 시작 시 새로 연결됩니다.)

---


