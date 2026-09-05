# 단계별 구현 로드맵 (ROADMAP)

> 전체 문서 목차는 [INDEX.md](INDEX.md)를 참고하세요.
> 인수 문서 8절의 권장 단계를 그대로 따른다.

| 단계 | 이름 | 완료 조건 |
|---|---|---|
| A0 | 계획, 문서, 폴더 골격 | 저장소 README, docs/INDEX.md, 폴더 README 작성 |
| A1 | 부품 데이터와 계산 엔진 | `src/data/parts.js`, `src/physics/massBudget.js`(총질량, TWR), `src/physics/deltaV.js`. tests에서 팔콘 헤비 예제로 검증 |
| A2 | JSON 내보내기, 불러오기 | 화면 없이도 예제 JSON을 만들고 다시 읽을 수 있음. REQUIREMENTS.md 5절 검증 포함 |
| A3 | 빈 3D 장면과 부품 팔레트 | Three.js 장면, 조명, 바닥. 팔레트 목록 표시 |
| A4 | 드래그 조립 (직렬) | 부품을 끌어다 위아래로 붙임. 연결점 표시 |
| A5 | 병렬 부스터 붙이기와 단 편성 | 옆에 붙이기, 단 자동 구분, 분리 순서 편집 |
| A6 | 회수 설정과 실시간 계산 표시 | 단별 회수 켜기, 총질량, TWR, Δv 패널 |
| A7 | 연동 시험 | 내보낸 JSON을 "시간 지연/발사 시뮬레이션" 프로젝트에서 불러와 발사 장면이 재생됨 |

## 진행 상태

- [x] A0: 계획, 문서, 폴더 골격
- [x] A1: 부품 데이터와 계산 엔진 — `src/data/parts.js`, `src/physics/massBudget.js`, `src/physics/deltaV.js`.
      Node가 설치되지 않은 개발 환경이라 `tests/*.test.js`(Node용) 대신
      `tests/browser-check.html`(정적 서버로 열어 브라우저에서 실행)로 검증 완료 — 전체 통과
- [x] A2: JSON 내보내기, 불러오기 — `src/io/rocketFile.js`, `examples/falcon_heavy.rocket.json` 검증 완료
      (총질량 1,411.3 t, TWR 1.43, 총 Δv 13,651 m/s, 오류 없음)
- [ ] A3: 빈 3D 장면과 부품 팔레트
- [ ] A4: 드래그 조립 (직렬)
- [ ] A5: 병렬 부스터 붙이기와 단 편성
- [ ] A6: 회수 설정과 실시간 계산 표시
- [ ] A7: 연동 시험 — "시간 지연/발사 시뮬레이션" 저장소가 준비되면 진행

## 비고

- A1, A2가 먼저 끝났으므로 "시간 지연/발사 시뮬레이션" 프로젝트 쪽에서 로켓 불러오기 기능(그 저장소의
  16단계)을 이 저장소의 A3~A6 완료를 기다리지 않고 `examples/falcon_heavy.rocket.json`으로 먼저
  개발·검증할 수 있다.
- A3~A6(3D 조립 UI)은 다음 작업으로 진행 예정이다.
- 테스트 실행 방법: 이 개발 환경에 Node.js가 설치되어 있지 않아, `node tests/*.test.js`(README 방식)
  대신 정적 서버로 `tests/browser-check.html`을 열어 브라우저에서 같은 검증을 수행했다. Node가 설치되면
  `tests/*.test.js`도 그대로 통과해야 한다 (같은 src 모듈을 그대로 import). DECISIONS.md에 기록.
