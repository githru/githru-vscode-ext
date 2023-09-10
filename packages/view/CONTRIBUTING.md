# 기여하기

변경을 요청하거나 기여에 참여하기 전에 아래 텍스트를 읽어 주시기 바랍니다.

# 기여방법

### 설치 및 디버그

- 설치방법은 [여기](https://github.com/githru/githru-vscode-ext/blob/main/CONTRIBUTING.md#installation)를 참고해주세요.

- 웹 브라우저로 디버그하는 방법과 vscode로 디버그하는 방법이 있습니다.

  - 다음은 웹 브라우저로 디버그하는 명령어입니다. 웹 브라우저로 디버그하는 것은 vscode에서 디버그하는 것과 차이가 있을 수 있습니다. 정확한 view는 vscode에서 확인해주세요.

    ```bash
    cd packages/view && npm start
    ```

  - 다음은 vscode로 디버그하는 방법입니다. 이 방법은 다음에서 소개되었습니다.
    - [vscode 디버그 방법](https://github.com/githru/githru-vscode-ext/blob/main/CONTRIBUTING.md#debugging)

### 코드 리뷰

프로젝트 구성원의 제출을 포함한 모든 제출은 검토가 필요합니다. 우리는 이를 위해 깃허브 풀 리퀘스트 _(이하 PR)_ 를 사용합니다. 그리고 PR을 병합 _(이하 merge)_ 하기 위해서는 최소 2회 이상 approve를 받아야 하며 CI를 통과해야 합니다. PR merge는 `squash and merge`를 사용해주시기 바랍니다.

다음은 PR 보내는 프로세스입니다.

1. 이슈를 생성합니다.

   제목 양식은 다음과 같습니다:

   ```bash
   [namespace] content
   ```

   - namespace는 대괄호 안에 작성하며 필수사항입니다. `engine | view | vscode | fix request | question | discussion | knowledge | bug | warning` 중에서 한 가지를 반드시 선택해야 합니다.

2. PR을 보내기 전에 다음이 완료되었는지 확인해주세요.

   - 저장소를 Fork하고 main 브랜치에서 새 브랜치를 만듭니다.

   - 저장소 루트에서 `npm i` 이나 `npm install`을 실행해주세요.

   - 코드를 작성하거나 수정합니다.

   - 테스트를 통과하는지 `npm run test`로 확인 바랍니다.

   - 코드가 lint되었는지는 `npm run lint`로 확인해주세요.

3. PR을 보냅니다.

   제목 양식은 다음과 같습니다:

   ```bash
   label(namespace): content
   ```

   1. _label_ 은 다음 중 하나를 따릅니다.

      - `fix` - 버그 수정
      - `feat` - 기능 추가
      - `docs` - 문서 수정
      - `test` - 테스트 인프라 변경
      - `refactor` - 코드 리팩토링
      - `chore` - 이전 범주에 속하지 않는 모든 것, e.g. 빌드 업무 수정, 패키지 매니저 수정

   2. _namespace_ 은 라벨 뒤에 괄호 안에 넣으며 선택 사항입니다. `engine | view | vscode` 중 하나여야 합니다.

   3. _content_ 은 변경 사항의 간략한 요약입니다.

   예시:

   ```bash
   feat(view): return Summary value and modify content data
   ```

4. merge 조건을 만족한다면 `squash and merge`를 실행합니다.

### 코딩 스타일

- 코딩 스타일은 [.eslintrc](https://github.com/githru/githru-vscode-ext/blob/main/packages/view/.eslintrc.json)에 모두 정의되어있습니다.

code linter를 사용하기 위해서는 다음 명령어를 실행하시기 바랍니다.

```bash
npm run lint
```

## Conventions

### 폴더 구조

폴더 구조는 다음을 따릅니다.

```bash
FEATURE
 ㄴ index.ts
 ㄴ FEATURE.tsx
 ㄴ FEATURE.scss
 ㄴ FEATURE.type.ts
 ㄴ FEATURE.util.ts
 ㄴ FEATURE.const.ts
 ㄴ ...
 ㄴ COMPONENT
    ㄴ index.ts
    ㄴ COMPONENT.tsx
    ㄴ COMPONENT.scss
    ㄴ COMPONENT.type.ts
    ㄴ COMPONENT.util.ts
    ㄴ COMPONENT.const.ts
    ㄴ ...
```

예시:

```
VerticalClusterList
  ㄴ index.ts
  ㄴ VerticalClusterList.tsx
  ㄴ VerticalClusterList.scss
  ㄴ VerticalClusterList.type.ts

  ㄴ Summary
    ㄴ index.ts
    ㄴ Summary.tsx
    ㄴ Summary.scss
    ㄴ Summary.util.ts
    ㄴ Summary.const.ts
    ㄴ Summary.type.ts

  ㄴ Graph
    ㄴ index.ts
    ㄴ Graph.tsx
    ㄴ Graph.scss
    ㄴ Graph.util.ts
    ㄴ Graph.const.ts
```

### css

- css naming은 [BEM method](https://getbem.com/naming/)을 따릅니다.

  예시:

  ```css
  .summary__name .author-bar-chart__name;
  ```

- value가 0으로 지정되어야 하는 상황이라면 0px로 기재합니다.

  좀 더 자세한 논의는 discussion [#99](https://github.com/githru/githru-vscode-ext/discussions/99)를 참고해주시기 바랍니다.

  예시:

  ```css
  margin: 0px 0px 12px 0px;
  padding: 10px 0px;
  ```

### type naming

- Component Props 이름은 component name + `Prop` 형식을 따릅니다.

  예시:

  ```bash
  const Detail = ({data}:DetailProp) => { ... }
  ```

- Util type 이름은 [CamelCase](https://en.wikipedia.org/wiki/Camel_case) 형식을 따릅니다.

  예시:

  ```bash
  function GetData( ... ) { ... }
  ```

# Manifesto

## 색상

좀 더 자세한 논의는 issue [#84](https://github.com/githru/githru-vscode-ext/issues/84)를 참고해주시기 바랍니다.

- body background-color
- Main theme color
- sub color
- font color

## 폰트

- font family
- font size
- 각 컴포넌트에서 사용하는 font size 단위

  좀 더 자세한 논의는 discussion [#99](https://github.com/githru/githru-vscode-ext/discussions/99)를 참고해주시기 바랍니다.

## Unit 테스트 코드 작성

- 라이브러리 : jest, RTL

- 목표해야할 특성들

1.명확성 : 테스트 코드는 명확해야 합니다. 누군가가 코드를 읽을 때, 테스트가 무엇을 하는지 쉽게 이해할 수 있어야 합니다.

```text
테스트 코드는 input과 output에 집중하는 테스트가 목적이지 로직을 구현하는게 목표가 아닙니다. 코드가 복잡할 이유가 없습니다. 
```

2.독립성 : 각 테스트는 독립적으로 실행될 수 있어야 합니다. 테스트 간에 상태가 공유되면 안 됩니다.

```text
unit 테스트는 말 그대로 단위 테스트입니다. 테스트 타겟 함수가 아닌 다른 로직에 의존성을 갖는 경우는 mocking을 사용합니다.
```

- 코드 구조

describe, it 또는 test 블록을 사용해 테스트 구조를 만듭니다.
일치 불일치와 같은 간단한 테스트는 test를 써도 됩니다.

```test
test('renders correctly', () => {
  // 테스트 코드
});
```

가능한 테스트에 대한 정보를 상세히 전달하기 위해 descriibe로 큰 스코프를 형상하고 그 안에 it으로 세부 테스크를 설명합니다.

```test
describe('Example Component', () => {
  it('renders correctly', () => {
    // 테스트 코드
  });
});
```

- 파일명

App.spec.ts 명을 기본적으로 사용합니다.

- 파일 위치

unit 테스트 코드는 타겟 파일과 같은 위치에 위치시킵니다.
