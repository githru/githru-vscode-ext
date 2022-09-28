# githru-vscode-ext/view

[![GitHub license](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/githru/githru-vscode-ext/blob/main/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/githru/githru-vscode-ext/blob/main/packages/view/CONTRIBUTING.md)

Githru view에서는 Githru vscode extension에서 Githru analysis engine의 결과물을 넘겨받아 시각화된 자료를 인터랙션과 함께 보여줍니다.

## 기능

* Temporal Filter

    * 저장소의 전체 commit과 cloc를 라인차트로 보여주고, 날짜 구간을 선택하여 확인할 수 있습니다.

    * 구간을 선택하면 해당 구간의 데이터를 기반으로 Vertical Cluster List, Statistics에서 데이터가 보여집니다.

* Vertical Cluster List
    
    * cluster별로 얼마나 많은 commit을 가지고 있는지 그래프로 확인할 수 있고, 해당 cluster에 어떤 author가 있고, 어떤 내용의 변화가 있는지 간접적으로 알 수 있습니다. 클릭하면 자세한 commit list를 확인할 수 있습니다.

* Detail

    * 선택한 cluster의 commit list와 cluster에서의 몇 명의 author가 작업했는지, 몇 개의 commit이 등록되었는지, 총 몇 개의 file이 change되었는지, code의 additions과 deletions는 얼마나 되는지 보여줍니다.

* Statistics

    * author별로 commit을 얼마나 했는지, insertions은 얼마나 되었는지, deletions는 얼마나 되었는지 bar chart로 보여줍니다.

    * 파일 경로마다 어느 정도의 변화가 있었는지 인터랙션과 함께 icicle chart에서 확인할 수 있습니다.


## 문서

### Temporal Filter

### Vertical Cluster list

### Detail

### Statistics

[이 저장소](https://github.com/githru/githru-vscode-ext/blob/main/packages/view)로 Pull Request를 제출하여 개선할 수 있습니다.

## 기여

이 저장소의 주된 목적은 Git 로그를 분석한 데이터를 시각화하여 사용자가 더 쉽게 이해하기 위함입니다. Githru View의 개발은 GitHub에서 개방적으로 이루어지며, 우리는 버그 수정과 개선에 기여한 커뮤니티에 감사를 표합니다. 참여 방법에 대해 알아보려면 아래를 읽어주세요.

### [기여 가이드라인](https://github.com/githru/githru-vscode-ext/blob/main/packages/view/CONTRIBUTING.md)

우리의 개발 프로세스, 버그 수정 및 개선 제안 방법, Githru View에 대한 변경 내용을 빌드하는 방법에 대해 알아보려면 [기여 가이드라인](https://github.com/githru/githru-vscode-ext/blob/main/packages/view/CONTRIBUTING.md)을 읽어주시기 바랍니다.