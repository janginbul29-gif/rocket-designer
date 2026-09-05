# src/io/

`.rocket.json` 형식(REQUIREMENTS.md 6절)의 내보내기/불러오기. 순수 함수만 두고, 실제 파일
다운로드·선택 같은 브라우저 동작은 `src/ui/`에서 처리한다 (ARCHITECTURE.md 3절).

## 파일

- `rocketFile.js`
  - `buildRocketDocument(rocket)` — summary(총질량/TWR/총Δv)를 계산해 붙인 문서와 검증 결과를 만든다.
  - `exportRocketToJson(rocket)` — 문자열로 직렬화. 치명적 검증 오류가 있으면
    `RocketValidationError`를 던진다 (경고만 있으면 허용).
  - `parseRocketJson(jsonString)` — 문자열을 읽어 `{ rocket, validation }`을 반환한다.
    `formatVersion`이 다르면 오류.

## 사용 예시

```js
import { exportRocketToJson, parseRocketJson, RocketValidationError } from './rocketFile.js';

try {
  const json = exportRocketToJson(myRocket);
  // 다운로드는 src/ui/에서: new Blob([json]) 등으로 처리
} catch (e) {
  if (e instanceof RocketValidationError) showErrors(e.errors);
}

const { rocket, validation } = parseRocketJson(fileContents);
```

테스트: [`../../tests/rocketFile.test.js`](../../tests/rocketFile.test.js).
