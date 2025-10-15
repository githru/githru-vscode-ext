# Cursor AI 도구 모음

이 디렉토리는 Cursor AI를 활용한 개발 도구들을 모아놓은 곳입니다.

## 📁 구조

```
.cursor/
├── rules/                    # Cursor 룰 파일들
│   └── testing.mdc          # 테스트 관련 룰
├── templates/               # AI 프롬프트 템플릿들
│   ├── test.playwright.md   # E2E 테스트 생성 템플릿
│   ├── test.unit.md         # Unit 테스트 생성 템플릿
│   ├── test.integration.md  # 통합 테스트 생성 템플릿
│   └── README.md           # 이 파일
└── generated-tests/         # 템플릿으로 생성된 테스트들
    ├── e2e/                # E2E 테스트
    ├── unit/               # 단위 테스트
    └── integration/        # 통합 테스트
```

## 🚀 사용 방법

### 1. E2E 테스트 생성

1. 템플릿 파일을 열어서 테스트 시나리오를 작성합니다
2. Cursor Agent (⌃+I)에 붙여넣습니다
3. AI가 자동으로 `.cursor/generated-tests/e2e/` 디렉토리에 파일을 생성하고 저장합니다

### 2. Unit 테스트 생성

**템플릿 파일**: `templates/test.unit.md`

1. 템플릿 파일을 열어서 테스트 시나리오를 작성합니다
2. Cursor Agent (⌃+I)에 붙여넣습니다
3. AI가 자동으로 `.cursor/generated-tests/unit/` 디렉토리에 파일을 생성하고 저장합니다

### 3. 통합 테스트 생성

**템플릿 파일**: `templates/test.integration.md`

1. 템플릿 파일을 열어서 테스트 시나리오를 작성합니다
2. Cursor Agent (⌃+I)에 붙여넣습니다
3. AI가 자동으로 `.cursor/generated-tests/integration/` 디렉토리에 파일을 생성하고 저장합니다

**예시**:

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

**BranchSelector 예시**:

```markdown
Context:

- 테스트 대상: BranchSelector 컴포넌트
- 시나리오:
  - [ ] 브랜치 목록이 로드되어야 한다
  - [ ] 브랜치 선택 시 데이터가 갱신되어야 한다
  - [ ] 로딩 중에는 스피너가 표시되어야 한다

Constraints:

- Zustand state only (no other state libs)
- Mock external dependencies (GitHub API, file system)
- VSCode webview environment
```

### 2. 테스트 룰 적용

**룰 파일**: `rules/testing.mdc`

- Cursor가 자동으로 이 룰을 적용하여 일관된 테스트 코드를 생성합니다
- Jest + RTL + Playwright 패턴을 따릅니다
- VSCode webview 환경에 최적화되어 있습니다

## 📋 생성된 테스트 관리

### 파일 명명 규칙

- E2E 테스트: `{component-name}.e2e.spec.ts`
- 단위 테스트: `{component-name}.test.tsx`
- 통합 테스트: `{component-name}.spec.tsx`

### 디렉토리 구조

```
packages/view/tests/          # 실제 테스트 파일 위치
├── branch-selector.e2e.spec.ts      # ✅ 완료된 BranchSelector E2E 테스트
├── temporal-filter-working.e2e.spec.ts  # ✅ 완료된 TemporalFilter E2E 테스트
└── branch-selector.e2e.spec copy.ts     # 기존 테스트 백업

.cursor/generated-tests/      # 템플릿으로 생성된 테스트들 (참고용)
├── e2e/                     # E2E 테스트들
│   ├── temporal-filter.e2e.spec.ts
│   └── branch-selector.e2e.spec.ts
├── unit/                    # 단위 테스트들
│   ├── statistics.test.tsx
│   └── theme-selector.test.tsx
└── integration/             # 통합 테스트들
    └── webview-communication.spec.ts
```

### ✅ 완료된 테스트 현황

#### BranchSelector E2E 테스트 (`branch-selector.e2e.spec.ts`)

- **테스트 시나리오**: 5개 (4개 통과, 1개 스킵)
  1. ✅ 브랜치 목록이 로드되어야 한다
  2. ✅ 브랜치 선택 시 데이터가 갱신되어야 한다
  3. ✅ 로딩 중에는 스피너가 표시되어야 한다
  4. ✅ 브랜치 선택 시 IDE 메시지가 전송되어야 한다
  5. ⏭️ 브랜치 목록이 비어있을 때 적절한 처리가 되어야 한다 (스킵)

#### TemporalFilter E2E 테스트 (`temporal-filter-working.e2e.spec.ts`)

- **테스트 시나리오**: 2개 (모두 통과)
  1. ✅ 기간 브러시 필터링이 정상 작동해야 한다
  2. ✅ 브러시 필터링 후 통계가 갱신되어야 한다

## 🔧 커스터마이징

### 새로운 템플릿 추가

1. `templates/` 디렉토리에 새 `.md` 파일 생성
2. 프롬프트 템플릿 작성
3. 이 README에 사용법 추가

### 룰 수정

1. `rules/testing.mdc` 파일 편집
2. 프로젝트 요구사항에 맞게 가이드라인 조정

## 📚 참고 자료

- [Cursor 공식 문서](https://cursor.sh/docs)
- [Playwright 테스트 가이드](https://playwright.dev/docs/intro)
- [Jest + RTL 가이드](https://testing-library.com/docs/react-testing-library/intro/)
- [Zustand 테스트 패턴](https://github.com/pmndrs/zustand/blob/main/docs/guides/testing.md)

## 🎯 테스트 실행 방법

### E2E 테스트 실행

```bash
# 특정 컴포넌트 테스트 실행
npm run test:e2e -- --grep "BranchSelector"

# 모든 E2E 테스트 실행
npm run test:e2e

# 테스트 리포트 확인
npx playwright show-report
```

### 테스트 결과 확인

```bash
# 마지막 실행 결과 확인
npx playwright show-report

# 특정 브라우저에서 테스트 실행
npx playwright test --project=chromium
```

## ⚠️ 주의사항

- 생성된 테스트는 반드시 실제 실행해보고 검증하세요
- 프로젝트별 특성에 맞게 셀렉터와 로직을 조정하세요
- VSCode webview 환경의 제약사항을 고려하세요
- 로딩 상태가 너무 빠를 경우 스피너 테스트가 스킵될 수 있습니다
- 브랜치 목록이 1개만 있을 경우 선택 테스트가 스킵됩니다

## 🚀 다음 단계

1. **Unit 테스트 추가**: BranchSelector 컴포넌트의 개별 함수들에 대한 단위 테스트
2. **Integration 테스트**: VSCode webview와의 통신 테스트
3. **다른 컴포넌트 테스트**: Statistics, ThemeSelector 등 추가 컴포넌트 테스트
4. **CI/CD 통합**: GitHub Actions에서 자동 테스트 실행 설정
