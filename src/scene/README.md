# src/scene/

Three.js 3D 장면. 이 폴더에서만 Three.js를 import한다 (ARCHITECTURE.md 3절). 조립 상태(`src/ui/builderState.js`의
state)를 입력받아 3D 배치를 계산하고 렌더링한다.

## 파일

- `layout.js` — `computeLayout(state)`: Three.js에 의존하지 않는 순수 함수. 조립 상태로부터 각 부품의
  위치·크기(`{type, stageKey, catalogId, position, rotation, size}` 목록)를 계산한다. 3D 미리보기와
  `.rocket.json`의 `geometry.parts`(내보내기, `src/ui/builderState.js`)가 항상 같은 배치를 쓰도록
  이 모듈 하나만 사용한다.
- `rocketScene.js` — `createRocketScene(canvas)`: 장면/카메라/조명/궤도 컨트롤을 만들고,
  `rebuild(state)`로 `layout.js` 결과를 메쉬로 그린다.

## 사용 예시

```js
import { createRocketScene } from './rocketScene.js';

const sceneApi = createRocketScene(document.getElementById('scene-canvas'));
sceneApi.rebuild(builderState); // 조립 상태가 바뀔 때마다 호출
```
