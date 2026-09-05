# src/ui/

DOM UI: 조립 상태 모델, 부품 목록(팔레트), 단 편성/부스터/회수 편집 패널, 실시간 계산 표시,
JSON 내보내기/불러오기 버튼.

## 파일

- `builderState.js` — 조립 상태(state) 모델과 `.rocket.json` 변환.
  - `createDefaultState()`, `addStage(state, kind)`, `removeStage(state, id)`, `setBoosters(state, enabled)`
  - `toRocketDocument(state)` — REQUIREMENTS.md 6절 형식(geometry 포함)으로 변환 (`src/scene/layout.js` 재사용)
  - `fromRocketDocument(doc)` — `.rocket.json`을 읽어 조립 상태로 근사 복원 (카탈로그에서 가장 가까운
    부품으로 매칭. 정확한 왕복 보존은 아님 — DECISIONS.md 참고)
- `palette.js` — `renderPalette(container)`: R-01 부품 목록을 종류별로 묶어 보여준다 (참고용).
- `builderPanel.js` — `renderBuilder(container, state, {onStructureChange, onValueChange})`: 단 카드
  (엔진/탱크/충전량/페어링/착륙다리/회수)와 병렬 부스터 토글을 그리고 편집한다. 표시되는 필드 자체가
  바뀌는 조작은 `onStructureChange`(패널 다시 그림), 값만 바뀌는 조작은 `onValueChange`(통계·3D만 갱신)를
  호출해 입력 중 포커스가 끊기지 않게 한다.
- `statsPanel.js` — `renderStats(container, rocketDoc)`: 총질량/TWR/단별·총 Δv와 발사 가능 조건
  검증 결과(R-05, R-06)를 표시한다.
- `exportImport.js` — `renderExportImport(container, {getState, applyImportedState})`: JSON 다운로드,
  파일 선택 불러오기, 팔콘 헤비 예제 불러오기 버튼(R-07~R-09).

## 사용 예시

전체 연결은 [`../main.js`](../main.js) 참고.
