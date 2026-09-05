# 현재 상황 (다른 환경에서 이어서 작업하기 위한 요약)

작성일: 2026-09-05. 이 파일은 공식 기획 문서가 아니라 "지금 어디까지 됐고, 다음에 뭘 하면 되는지"를
빠르게 파악하기 위한 인수인계용 메모다. 정식 요구사항/설계 근거는 [docs/](docs/)를 본다
(특히 [docs/ROADMAP.md](docs/ROADMAP.md), [docs/DECISIONS.md](docs/DECISIONS.md)).

## 이 저장소가 뭔지 (한 줄 요약)

KSP처럼 부품을 3D 장면에 드래그해 다단 로켓을 조립하고, 총질량/TWR/Δv를 실시간 계산하며,
`.rocket.json`으로 내보내는 프로그램. "우주여행 시간 지연 계산기 / 3D 발사 시뮬레이션"이라는
**별도 프로젝트**(다른 팀/다른 저장소, 아직 이 컴퓨터에 없음)가 이 JSON을 불러와 쓰는 구조다.

- GitHub: **https://github.com/janginbul29-gif/rocket-designer** (Public, `main` 브랜치)
- 이 폴더(`D:\rocket-designer`)는 그 저장소의 로컬 클론이자 원본 작업 위치.
- 새 환경에서는 `git clone https://github.com/janginbul29-gif/rocket-designer.git` 로 받으면 된다.

## 지금까지 한 것 (A0~A6 완료, 커밋 3개)

1. `A0-A2`: 문서(요구사항/구조/로드맵/의사결정), 부품 카탈로그(`src/data/parts.js`),
   질량·TWR·Δv 계산(`src/physics/`), 발사 가능 조건 검증(V-01~V-07), `.rocket.json`
   내보내기/불러오기(`src/io/rocketFile.js`), 팔콘 헤비 예제(`examples/falcon_heavy.rocket.json`).
2. `A3-A6`: Three.js 3D 장면(`src/scene/`), 부품 팔레트/조립 패널/실시간 계산 패널(`src/ui/`),
   `index.html` + `src/main.js`로 전체 연결.
3. `R-02 개선`: 부품 목록을 실제로 **드래그해서 3D 장면에 놓으면** 조립되도록 개선
   (`src/scene/layout.js`의 zones + 레이캐스팅, `src/ui/builderState.js`의 `applyPartDrop`).
   기존 단 카드의 드롭다운/슬라이더는 개수·충전량·회수 옵션 같은 세부 조정용으로 남아 있음.

**바로 열어보려면**(모듈 스크립트라 `file://`로는 안 열림, 정적 서버 필요):

```bash
cd rocket-designer
python -m http.server 8080   # 또는 npx serve .
# 브라우저에서 http://localhost:8080/index.html
```

"팔콘 헤비 예제 불러오기" 버튼을 누르면 예제가 바로 조립된 상태로 뜬다.

## 검증 상태

- 이 컴퓨터에 **Node.js가 설치되어 있지 않아서** `tests/*.test.js`를 `node`로 직접 돌리진 못했다.
  대신 `tests/browser-check.html`을 정적 서버로 열어 브라우저에서 같은 로직을 검증했고 전체 통과했다
  (총질량 1,411.3t / TWR 1.43 / 총Δv 13,651 m/s, 오류 없음).
- **다른(새) 환경에 Node.js가 있다면** `npm test`로 `tests/*.test.js` 4개를 다시 돌려서 재확인하는 걸
  권장한다 — 같은 `src/` 모듈을 그대로 import하므로 통과해야 정상이다.
- 3D 드래그 조립(R-02)은 Chrome 계열 브라우저에서 실제 드래그 이벤트로 동작 확인함
  (엔진/탱크 교체, 착륙다리 부착, 새 단 추가, 부스터 활성화 — 4가지 드롭 영역 모두 확인).

## 남은 것 / 다음에 할 일

- **A7 연동 시험**: "시간 지연/발사 시뮬레이션" 저장소가 아직 없어서 진행 불가. 그 저장소가 생기면
  거기서 `examples/falcon_heavy.rocket.json`을 불러와 발사 장면이 재생되는지 확인해야 한다.
- **알려진 단순화/한계** (자세한 이유는 [docs/DECISIONS.md](docs/DECISIONS.md)):
  - 병렬 부스터는 좌우 대칭 1쌍만 지원 (여러 부스터 그룹은 미지원).
  - 불러오기(R-08)는 원본 JSON 숫자를 그대로 보존하지 않고, 카탈로그에서 가장 가까운 부품으로
    다시 매칭해서 재구성한다 (재-내보내기 하면 총질량 등이 원본과 살짝 달라질 수 있음).
  - 부품 카탈로그가 요구사항의 "최소 집합"만 있음 (엔진 2종, 탱크 2종).
  - 병렬 부스터 Δv 계산은 "유효 배기속도" 근사법 사용 (인수 문서가 언급한 "03_physics.md 6.3절" 원본을
    받지 못해 대체함).
- 사용성 피드백을 받으면 자유 3D 드래그(연결점 스냅) 방식으로 더 다듬을 수 있음.

## 새 환경에서 필요한 준비물

- **Git**: 이미 되어 있을 가능성 높음. 안 되어 있으면 설치.
- **GitHub 로그인**: 이 컴퓨터는 `gh` CLI로 GitHub 계정 `janginbul29-gif`에 로그인해서 push했다.
  새 환경에서 계속 커밋/푸시하려면 그 환경에서 다시 로그인 필요
  (`gh auth login --web` 또는 자격 증명 관리자에 GitHub 계정 등록).
- **Node.js (선택)**: 있으면 `npm test`로 `tests/*.test.js`를 돌릴 수 있다. 없어도 브라우저 기반
  검증(`tests/browser-check.html`)으로 대체 가능.
- **정적 서버**: `python -m http.server` 또는 `npx serve .` 중 아무거나 있으면 됨.

## 참고: 이 저장소에 없는 것

- 이 로켓 설계기 이전에 있던 **Python 버전 프로토타입**(1차원 수직 상승 시뮬레이션, 3D/JSON 계약 없음)은
  이 GitHub 저장소가 아니라 원래 컴퓨터의 `D:\Team project\_archive\rocket-designer-python\`에만 있고
  올리지 않았다. 필요하면 그 폴더를 따로 챙겨야 한다.
