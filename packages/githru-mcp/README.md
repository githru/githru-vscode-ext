# githru-mcp

Githru 레포 안에 포함된 **MCP 서버 패키지**.  
Smithery를 통해 **원격 MCP 서버**로 배포되어, Claude Desktop에서 바로 연결해 사용할 수 있습니다.  

---

## 1. 프로젝트 구조

``` 
githru-vscode-ext/
└─ packages/
  └─ githru-mcp/
  ├─ src/
  │ └─ server.ts
  ├─ smithery.yml
  ├─ package.json
  ├─ tsconfig.json
  └─ .gitignore
```

---

## 2. 원격 서버 사용하기

githru-mcp는 Smithery에 배포되어 있으므로, 별도의 빌드나 로컬 실행 없이 원격 MCP 서버를 바로 사용할 수 있습니다.

1. 원격 서버 페이지 접속  
   👉 [https://server.smithery.ai/@Kyoungwoong/githru-vscode-ext/mcp](https://server.smithery.ai/@Kyoungwoong/githru-vscode-ext/mcp)

2. **“Add to Claude”** 버튼 클릭  
   - Claude Desktop에 자동 등록됩니다.  
   - 실패 시 Claude Desktop 설정에서 수동으로 추가할 수 있습니다.  

3. Claude Desktop 재시작 후 MCP 툴 사용  
   - 사용 가능한 툴 예시:
     - `ping` → 서버 상태 확인 ("pong" 반환)
     - `echo` → 입력 텍스트 그대로 반환
     - `bmi_calculator` → 키/몸무게 입력 → BMI 계산 결과 반환

---

## 3. 서버 코드 요약

- ping 툴: 입력 없음 → "pong" 반환
- bmi_calculator 툴: height(cm), weight(kg) 입력 → BMI 계산 후 결과 반환

```src/server.ts``` 안에 툴들이 등록되어 있고, ```npm run build```로 ```dist/server.js```에 컴파일됩니다.

---

4. 로컬 개발 (선택)

원격 서버 대신 직접 개발/테스트하려면 다음을 실행하세요:

cd packages/githru-mcp
npm install
npm install zod
npm run build   # dist/server.js 생성


이후 Claude Desktop 설정(claude_desktop_config.json)에 로컬 빌드된 서버를 등록해 실행할 수 있습니다.
단, 로컬 설정 파일(claude_desktop_config.json)은 개인 환경 전용이므로 git에 커밋하지 마세요.

Claude Desktop은 claude_desktop_config.json 파일에서 MCP 서버를 읽습니다.
```githru-mcp/claude_desktop_config.json```의 args 내부 path를 수정해주셔야합니다.

- macOS: ```~/Library/Application Support/Claude/claude_desktop_config.json```
- Windows: ```%APPDATA%\Claude\claude_desktop_config.json```

```json
{
  "mcpServers": {
      "githru-vscode-ext": {
      "command": "npx",
      "args": [
          "-y",
          "@smithery/cli@latest",
          "run",
          "@Kyoungwoong/githru-vscode-ext",
          "--key",
          "API KEY",
          "--profile",
          "CLAUDE PROFILE"
      ]
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


