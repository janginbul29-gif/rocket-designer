# 로켓 설계기 (Rocket Designer)

KSP처럼 3D 부품을 드래그로 조립해 다단 로켓을 설계하는 프로그램. 조립하는 동안 총질량, 추력대중량비(TWR),
단별/총 Δv를 실시간으로 계산하고, 발사 가능 조건을 검증한 뒤 `.rocket.json`으로 내보낸다.

이 파일은 "우주여행 시간 지연 계산기 / 3D 발사 시뮬레이션" 프로젝트(별도 저장소)가 불러와 발사 장면을
재생하는 데 쓰인다. 두 프로그램의 유일한 연결 고리는 이 JSON 형식이다.

전체 요구사항, 폴더 구조, 구현 로드맵은 [docs/INDEX.md](docs/INDEX.md)에서 확인하세요.

현재 상태: A0~A2 구현 완료 (부품 데이터, 질량/TWR/Δv 계산, 검증, JSON 내보내기/불러오기).
3D 조립 UI(A3~A6)는 다음 작업으로 진행 예정. 진행 상태는 [docs/ROADMAP.md](docs/ROADMAP.md) 참고.

## 실행 방법

모듈 스크립트를 쓰므로 `file://`로 직접 열면 브라우저가 CORS로 막습니다. 로컬 정적 서버로 열어야 합니다.

```bash
npx serve .
# 또는
python -m http.server 8080
```

브라우저에서 `http://localhost:<포트>`로 접속합니다.

## 테스트

Node.js가 설치되어 있으면:

```bash
npm test
```

Node.js가 없으면 정적 서버로 `tests/browser-check.html`을 열어 브라우저에서 같은 검증을 실행할 수 있다
(같은 `src/` 모듈을 그대로 import하므로 동일하게 검증된다).

```bash
python -m http.server 8080
# 브라우저에서 http://localhost:8080/tests/browser-check.html
```
