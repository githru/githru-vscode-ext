# Ground Rule

- Issue 작성
- PR 작성
- Code Review
- PR merge 조건 => approve 2인 이상 + CI pass
- commit => keyword(view): content

# Convention

- 폴더구조

  ```
  VerticalClusterList
    ㄴ index.ts
    ㄴ VerticalClusterList.tsx
    ㄴ VerticalClusterList.scss
    ㄴ VerticalClusterList.type.scss

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

- css => bem구조

  ```
  ex)
    - summary__name
    - author-bar-chart__name
  ```

- type naming

  - Component Type => ~ Prop

    ```
    ex) const Detail = ({data}:DetailProp) => {}
    ```

  - Util Type => CamelCase
    ```
    ex) getData => GetData
    ```

# Manifesto

# Color

- body background-color
- Main으로 쓸 theme color
- Main과 잘 어울리는 sub color 2~3가지
- font color

- [issue](https://github.com/githru/githru-vscode-ext/issues/84)
