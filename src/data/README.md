# src/data/

부품 카탈로그 등 숫자 데이터를 보관한다. 계산 로직이나 DOM에 의존하지 않는다.

## 파일

- `parts.js` — `PART_CATALOG`: 부품 목록(엔진/탱크/탑재체/페어링/디커플러/착륙다리/부스터연결부).
  각 항목은 REQUIREMENTS.md 3절의 속성(건조질량, 추력, Isp 등)과 3D 표시용 `sizeM`을 갖는다.
  값은 팔콘 9/헤비의 공개된 제원 근사치다.

## 사용 예시

```js
import { PART_CATALOG, findPart, partsByType } from './parts.js';

const engine = findPart('engine_merlin1d');
// { id:'engine_merlin1d', type:'engine', dryMassKg:470, thrustSeaLevelN:845000, ... }

const allTanks = partsByType('tank');
```
