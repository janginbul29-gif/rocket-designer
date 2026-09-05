# src/physics/

로켓 설계의 질량/추력/Δv 계산과 발사 가능 조건 검증. DOM에 의존하지 않으며, `.rocket.json`과 같은
형태의 순수 객체(REQUIREMENTS.md 6절 스키마)를 입력으로 받는다. Node에서 바로 테스트할 수 있다.

## 파일

- `massBudget.js` — `totalMassKg`, `stagesIgnitedAtLiftoff`, `liftoffThrustN`, `liftoffTwr`.
  총질량과 발사 시 추력대중량비(TWR)를 계산한다 (REQUIREMENTS.md 4절).
- `deltaV.js` — `computeDeltaV(rocket)`: 치올콥스키 방정식으로 단별/총 Δv를 계산한다.
  병렬 부스터가 있으면 "부스터 동시연소 구간"과 "코어 단독연소 구간"으로 나눈다 (근사법,
  DECISIONS.md 참고).
- `validation.js` — `validateRocket(rocket)`: REQUIREMENTS.md 5절의 V-01~V-07 규칙을 검사해
  `{ ok, errors, warnings }`를 반환한다. `errors`가 있으면 발사/내보내기 불가, `warnings`는 참고용.

## 사용 예시

```js
import { totalMassKg, liftoffTwr } from './massBudget.js';
import { computeDeltaV } from './deltaV.js';
import { validateRocket } from './validation.js';

const m0 = totalMassKg(rocket);       // kg
const twr = liftoffTwr(rocket);       // 1보다 커야 이륙
const { legs, totalDeltaVMps } = computeDeltaV(rocket);
const { ok, errors, warnings } = validateRocket(rocket);
```

테스트: [`../../tests/massBudget.test.js`](../../tests/massBudget.test.js),
[`../../tests/deltaV.test.js`](../../tests/deltaV.test.js),
[`../../tests/validation.test.js`](../../tests/validation.test.js).
