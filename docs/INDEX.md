# 문서 목차 (INDEX)

이 문서는 로켓 설계 프로그램(rocket-designer)의 모든 마크다운 문서를 모아 관리하는 목차입니다.
새 문서(폴더별 README 등)가 추가될 때마다 이 목록을 갱신합니다.

## 기획/계획 문서

- [REQUIREMENTS.md](REQUIREMENTS.md) — 요구사항 명세서 (기능 요구사항, 부품 종류, 계산 공식, 검증 규칙, JSON 형식)
- [ARCHITECTURE.md](ARCHITECTURE.md) — 폴더 구조 및 코드 작성 규칙
- [ROADMAP.md](ROADMAP.md) — 단계별(A0~A7) 구현 로드맵 및 진행 상태
- [DECISIONS.md](DECISIONS.md) — 미결 항목(Q-19~Q-23) 및 확정 시 기록

## 원본 인수 문서

- 이 프로젝트는 "우주여행 시간 지연 계산기 / 3D 발사 시뮬레이션" 팀으로부터 받은
  `08. 로켓 설계 프로그램 인수 문서 (설계 담당자용)` (2026-09-05)를 기준으로 시작되었다.
  본 REQUIREMENTS.md·ARCHITECTURE.md·ROADMAP.md는 그 문서의 내용을 이 저장소용으로 옮겨 적은 것이다.

## 폴더별 코드 설명 문서

- [src/data/README.md](../src/data/README.md) — 부품 카탈로그 (구현 완료)
- [src/physics/README.md](../src/physics/README.md) — 질량/추력/Δv 계산, 검증 규칙 (구현 완료)
- [src/io/README.md](../src/io/README.md) — JSON 내보내기/불러오기 (구현 완료)
- `src/scene/README.md` — Three.js 3D 장면 (A3 착수 후 추가 예정)
- `src/ui/README.md` — 팔레트, 패널 UI (A3 착수 후 추가 예정)
