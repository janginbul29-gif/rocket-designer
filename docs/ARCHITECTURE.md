# 프로젝트 구조 및 코드 작성 규칙 (ARCHITECTURE)

> 전체 문서 목차는 [INDEX.md](INDEX.md)를 참고하세요.
> 이 저장소는 "우주여행 시간 지연 계산기 / 3D 발사 시뮬레이션" 프로젝트와 동일한 규칙을 따른다
> (인수 문서 7절).

## 1. 폴더 구조

```
rocket-designer/
├── docs/                # 기획·요구사항 문서 (본 문서, INDEX, REQUIREMENTS, ROADMAP, DECISIONS)
├── examples/            # 검증용 예제 .rocket.json (팔콘 헤비 등)
├── lib/
│   └── three/           # Three.js ES 모듈 빌드 동봉 (CDN 의존 없이 오프라인 실행 가능)
├── src/
│   ├── data/            # 부품 카탈로그 등 숫자 데이터 (parts.js)
│   ├── physics/         # 계산 로직 — DOM 접근 없음 (massBudget.js, deltaV.js, validation.js)
│   ├── io/              # .rocket.json 내보내기/불러오기 (rocketFile.js)
│   ├── ui/              # 팔레트, 통계 패널, 단 목록 등 DOM UI
│   ├── scene/           # Three.js 장면, 부품 메쉬, 드래그 조립
│   ├── utils/            # 공용 상수/헬퍼 (units.js)
│   └── main.js          # 각 모듈을 연결하는 진입점
├── tests/               # Node로 실행하는 물리/IO 검증 테스트
├── index.html           # 앱 진입 페이지
└── README.md
```

- `src/` 하위 폴더는 실제로 해당 기능 코드를 작성하기 시작할 때 생성한다.
- 폴더 하나는 역할 하나. `src/physics/`는 DOM을 참조하지 않아 Node 테스트로 바로 검증할 수 있어야 한다.

## 2. 문서 관리 규칙

1. **폴더별 설명 문서**: `src/` 하위 각 폴더에 코드를 구현할 때 그 폴더용 `README.md`를 함께 만든다.
   폴더의 역할, 포함된 파일과 기능 요약, 주요 함수의 입력·출력·사용 예시를 담는다.
2. **목차 갱신**: 새 문서가 생길 때마다 [INDEX.md](INDEX.md)에 링크를 추가한다.
3. **요구사항 갱신**: 요구사항이 바뀌면 [REQUIREMENTS.md](REQUIREMENTS.md)를 갱신하고 변경 이력에 기록한다.
4. **로드맵 갱신**: 각 단계(A0~A7)가 끝나면 [ROADMAP.md](ROADMAP.md)에서 완료 표시를 한다.
5. **의사결정 기록**: 물리·학술적 사실이 아닌 임의 결정(수치, 기본값, 연동 방식 등)은
   [DECISIONS.md](DECISIONS.md)에 질문과 확정 결과를 기록한다.
6. **문서 언어**: 화면 문자열, 주석, 문서는 한국어. 변수·함수·파일 이름은 영어.

## 3. 코드 작성 원칙

- ES 모듈(`import`/`export`)만 사용한다. 번들러 없이 브라우저에서 바로 동작해야 한다.
- Three.js는 `lib/three/`에 동봉하고 `src/scene/`에서만 import한다. 다른 폴더는 Three.js를 몰라야 한다
  (물리/검증 로직이 3D 라이브러리에 의존하지 않도록).
- 전체 기능을 한 번에 구현하지 않고, [ROADMAP.md](ROADMAP.md)의 순서대로 한 단계씩 구현·검증한다.
- 물리 공식(REQUIREMENTS.md 4절)이 아닌 임의의 설계 결정은 착수 전 사용자/팀에 확인하고 DECISIONS.md에 남긴다.
- 실행은 GitHub Pages(저장소 main 브랜치 루트)를 기준으로 하며, 로컬 확인은 정적 파일 서버로 한다
  (모듈 스크립트는 `file://`에서 CORS로 막히므로 반드시 로컬 서버 필요).
