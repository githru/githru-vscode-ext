# Cursor AI 테스트 생성 도구

이 디렉토리는 Cursor AI를 활용하여 **Githru VSCode Extension** 프로젝트의 테스트 코드를 자동 생성하는 도구들을 모아놓은 곳입니다.

## 📁 프로젝트 구조

```
githru-vscode-ext/
├── .cursor/                          # Cursor AI 도구들
│   ├── rules/
│   │   └── testing.mdc              # 테스트 작성 규칙
│   └── templates/
│       ├── test.playwright.md       # E2E 테스트 템플릿
│       └── README.md               # 이 파일
├── packages/
│   ├── view/                        # React 웹뷰 패키지
│   │   ├── src/
│   │   │   ├── components/          # React 컴포넌트들
│   │   │   ├── store/              # Zustand 상태 관리
│   │   │   └── fake-assets/        # 테스트용 모킹 데이터
│   │   └── tests/                  # 실제 테스트 파일들
│   │       ├── pr-commit-detail.e2e.spec.ts
│   │       ├── temporal-filter.e2e.spec.ts
│   │       └── fakeAsset.ts        # 테스트 헬퍼 함수들
│   ├── analysis-engine/             # 분석 엔진 패키지
│   └── vscode/                      # VSCode 확장 패키지
```

## 🚀 빠른 시작 (Quick Start)

### 1. E2E 테스트 생성 (Playwright)

**템플릿 파일**: `.cursor/templates/test.playwright.md`

1. **템플릿 열기**: `.cursor/templates/test.playwright.md` 파일을 엽니다
2. **시나리오 작성**: 아래 예시를 참고해 테스트 시나리오를 작성합니다
3. **AI 실행**: `⌃+I` (Cursor Agent)를 누르고 템플릿을 붙여넣습니다
4. **파일 생성**: AI가 자동으로 `packages/view/tests/`에 테스트 파일을 생성합니다

## 📝 사용 예시

### E2E 테스트 예시 (TemporalFilter)

```markdown
Context:

- 테스트 대상: TemporalFilter 컴포넌트
- 시나리오:
  - [ ] 기간 브러시 필터링이 정상 작동해야 한다
  - [ ] 필터링 후 통계가 갱신되어야 한다
  - [ ] Reset 버튼으로 필터가 해제되어야 한다

Constraints:

- Zustand state only (no other state libs)
- Mock external dependencies (GitHub API, file system)
- VSCode webview environment
```

**결과**: `packages/view/tests/temporal-filter.e2e.spec.ts` 파일 생성

## 🔧 테스트 룰 및 규칙

### 자동 적용되는 룰

**룰 파일**: `.cursor/rules/testing.mdc`

- Cursor가 자동으로 이 룰을 적용하여 일관된 테스트 코드를 생성합니다
- **Jest + RTL + Playwright** 패턴을 따릅니다
- **VSCode webview 환경**에 최적화되어 있습니다
- **Zustand 상태 관리**와 **외부 의존성 모킹**을 자동으로 처리합니다

### 파일 명명 규칙

- **E2E 테스트**: `{component-name}.e2e.spec.ts`

### 실제 테스트 파일 위치

```
packages/view/tests/
```

## 🎯 테스트 실행 방법

### E2E 테스트 실행

```bash
# packages/view 디렉토리로 이동
cd packages/view

# 모든 E2E 테스트 실행
npm run test:e2e

# 특정 테스트 실행
npm run test:e2e -- tests/pr-commit-detail.e2e.spec.ts
npm run test:e2e -- tests/temporal-filter.e2e.spec.ts

# 특정 브라우저에서 실행
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=webkit
```

### 테스트 결과 확인

```bash
# 테스트 리포트 확인
npx playwright show-report

# 헤드리스 모드로 실행
npm run test:e2e -- --headed

# 디버그 모드로 실행
npm run test:e2e -- --debug
```

## 🔧 커스터마이징

### 새로운 템플릿 추가

1. `.cursor/templates/` 디렉토리에 새 `.md` 파일 생성
2. 프롬프트 템플릿 작성
3. 이 README에 사용법 추가

**현재 사용 가능한 템플릿**:

- `test.playwright.md`: E2E 테스트 생성용

### 룰 수정

1. `.cursor/rules/testing.mdc` 파일 편집
2. 프로젝트 요구사항에 맞게 가이드라인 조정

## ⚠️ 주의사항

- **생성된 테스트는 반드시 실제 실행해보고 검증하세요**
- **VSCode webview 환경의 제약사항**을 고려하세요
- **Zustand 상태 관리**와 **외부 의존성 모킹**이 자동으로 적용됩니다
- **로딩 상태가 너무 빠를 경우** 스피너 테스트가 스킵될 수 있습니다
- **실제 DOM 구조**에 맞춰 셀렉터가 자동으로 조정됩니다
