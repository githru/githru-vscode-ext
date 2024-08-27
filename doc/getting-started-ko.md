# Getting Started (KO)

로컬 개발환경을 위한 프로젝트 실행방법을 설명합니다.

## install dependencies

```
cd <프로젝트 루트>
npm install
```

## build

```
npm run build:all
```

view → engine → vscode 순서대로 빌드를 시작합니다.

## run on debug mode

1. vscode IDE 를 통해 `<프로젝트 루트>/packages/vscode` 를 불러옵니다.  
   ![](./getting-started-ko/1.png)

2. `<프로젝트 루트>/packages/vscode` 를 실행한 vscode IDE 내에서 `F5` 버튼을 통해 debug mode 로 진입합니다.  
   ![](./getting-started-ko/2.png)

3. debug mode 로 실행된 vscode(githru의 vscode패키지) 에서 다른 git 기반 프로젝트를 불러옵니다.  
   (주의 : debug mode 로 실행된 vscode 로 불러올 경로가 다른 vscode 에서 이미 열려있는 경로라면, 제대로 동작하지 않습니다.)  
   (ex. `<프로젝트 루트>/packages/view/tsconfig.json`)  
    ![](./getting-started-ko/3.png)
   ![](./getting-started-ko/4.png)

4. debug mode 로 실행된 vscode(githru의 vscode패키지) 의 하단 상태표시줄에 "githru" 텍스트 버튼을 통해 githru 화면에 진입합니다.  
   ![](./getting-started-ko/7.png)

5. "확장 'githru-vscode-ext'은(는) GitHub을(를) 사용하여 로그인하려고 합니다."라는 메시지가 뜨면, "허용" 버튼을 클릭하고 외부 페이지에서 GitHub 로그인합니다.
   ![](./getting-started-ko/login-popup.png)

6. 로그인이 완료되면, vscode(githru의 vscode패키지) 에서 githru 화면이 뜹니다.
   ![](./getting-started-ko/8.png)
