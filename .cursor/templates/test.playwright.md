<!-- ai/template/test.playwright.md -->

# ✅ Playwright Test Prompt (Auto-Enhanced)

## 🎯 목적

주요 사용자 시나리오를 **E2E 테스트**로 검증한다.
E2E 테스트 코드를 생성하고 자동으로 실행하여 실패 시 수정까지 한 번에 처리한다.

---

## 📌 사용 방법

1. 테스트 대상 컴포넌트/플로우를 지정한다.
2. 주요 시나리오(AC 기반)를 적는다.
3. Cursor Agent (⌃+I)에 붙여넣는다.
4. **자동으로 테스트 실행 및 결과 분석**
5. **실패 시 자동 수정 제안 및 재실행**

---

## 🚦 가드레일

You are in **AUTO-ENHANCED-TEST-GENERATION** mode.
MUST create runnable Playwright test code (`*.spec.ts`) AND automatically execute it.
Follow project conventions (TypeScript, Playwright setup).
Keep tests fast, deterministic (no arbitrary `timeout`).

**CRITICAL WORKFLOW:**

1. Generate test code based on scenarios
2. Execute test automatically
3. If test fails, analyze error and fix test code
4. Retry up to 3 times with automatic fixes
5. Only modify test code, never modify source code

---

## 입력 템플릿

Context:

- 테스트 대상 (페이지/컴포넌트):
- 시나리오 (AC):
  - [ ] 시나리오 1
  - [ ] 시나리오 2
  - [ ] 시나리오 3

Constraints:

- Zustand state only (no other state libs)
- Mock external dependencies (GitHub API, file system)
- VSCode webview environment

---

## Output contract

- Playwright test code in TypeScript (`*.spec.ts`)
- 테스트는 Happy Path + Critical Regression 최소 커버
- 코드 블록은 반드시 실행 가능해야 함
- Use `page.waitForSelector` for dynamic content
- **반드시 파일 생성**: `packages/view/tests/{component-name}.e2e.spec.ts` 경로에 저장
- **자동 실행**: 생성 후 즉시 `npm run test:e2e` 실행
- **자동 수정**: 실패 시 에러 분석 후 수정된 코드 제안
- **최대 3회 재시도**: 테스트 코드만 수정하여 성공할 때까지 시도
- **소스 코드 수정 금지**: 테스트 코드만 변경 가능

## 🔄 자동 수정 규칙

### 로케이터 오류 수정

- `page.locator()` → `page.waitForSelector()` + `page.locator().first()`
- 더 구체적인 셀렉터 사용
- `data-testid` 우선 사용

### 타이밍 이슈 수정

- `timeout` 값 2배 증가
- `page.waitForLoadState('networkidle')` 추가
- `page.waitForTimeout()` 적절히 사용

### 네트워크 에러 수정

- `page.route()` 사용하여 API 모킹
- `beforeEach`에 네트워크 모킹 추가

### 콘솔 에러 수정

- `page.on('console')` 이벤트 리스너 추가
- 에러 로깅 및 처리

End with:

- CONFIRM: TEST CASES GENERATED AND EXECUTED
