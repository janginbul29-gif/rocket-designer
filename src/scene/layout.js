// 조립 상태(state, src/ui/builderState.js)로부터 3D 표시용 위치를 계산하는 순수 함수.
// Three.js를 import하지 않는다 — src/scene/rocketScene.js와 src/io 양쪽에서 재사용하기 위함
// (내보내는 geometry.parts와 3D 미리보기가 항상 같은 값을 쓰도록).

import { findPart } from '../data/parts.js';

function place(items, y, catalogId, type, stageKey, xOffset = 0) {
  const part = findPart(catalogId);
  const size = part.sizeM;
  const item = { type, stageKey, catalogId, position: [xOffset, y + size[1] / 2, 0], rotation: [0, 0, 0], size };
  items.push(item);
  return y + size[1];
}

function coreStackHeight(stage) {
  let h = 0;
  if (stage.hasLegs) h += findPart('landing_legs').sizeM[1];
  h += findPart(stage.engineCatalogId).sizeM[1];
  h += findPart(stage.tankCatalogId).sizeM[1];
  return h;
}

/**
 * 조립 상태로부터 3D 배치 목록을 계산한다.
 * 반환: { items: [{type, stageKey, catalogId, position:[x,y,z], rotation:[x,y,z], size:[x,y,z]}], totalHeight }
 */
export function computeLayout(state) {
  const items = [];
  let y = 0;

  // 코어(직렬) 스택: 아래에서 위로
  state.stages.forEach((stage, i) => {
    if (stage.hasLegs) y = place(items, y, 'landing_legs', 'landing_legs', stage.id);
    y = place(items, y, stage.engineCatalogId, 'engine', stage.id);
    y = place(items, y, stage.tankCatalogId, 'tank', stage.id);
    if (i < state.stages.length - 1) {
      y = place(items, y, 'decoupler', 'decoupler', stage.id);
    } else {
      if (stage.hasFairing) {
        y = place(items, y, 'fairing', 'fairing', stage.id);
      }
    }
  });

  // 탑재체: 항상 맨 위, 물리적으로는 어느 단에도 속하지 않는다 (payloadMassKg로 별도 관리)
  const payloadStageId = state.stages.length ? state.stages[state.stages.length - 1].id : 'payload';
  const payloadSize = findPart('payload_default').sizeM;
  items.push({
    type: 'payload',
    stageKey: payloadStageId,
    catalogId: 'payload_default',
    position: [0, y - payloadSize[1] * 0.4, 0],
    rotation: [0, 0, 0],
    size: payloadSize,
  });

  const totalHeight = y;

  // 병렬 부스터: 코어의 1단(state.stages[0])과 같은 높이 구간을 좌우로 미러링
  if (state.boosters && state.stages.length) {
    const b = state.boosters;
    const coreTankRadius = findPart(state.stages[0].tankCatalogId).sizeM[0] / 2;
    const boosterTankRadius = findPart(b.tankCatalogId).sizeM[0] / 2;
    const xOffset = coreTankRadius + boosterTankRadius + 0.45;

    for (const side of [-1, 1]) {
      const stageKey = side < 0 ? 'booster-left' : 'booster-right';
      let by = 0;
      if (b.hasLegs) by = place(items, by, 'landing_legs', 'landing_legs', stageKey, side * xOffset);
      by = place(items, by, b.engineCatalogId, 'engine', stageKey, side * xOffset);
      by = place(items, by, b.tankCatalogId, 'tank', stageKey, side * xOffset);
      // 부스터 연결부 (중간 높이, 코어 쪽을 향해)
      const attach = findPart('booster_attach');
      items.push({
        type: 'booster_attach',
        stageKey,
        catalogId: 'booster_attach',
        position: [side * (xOffset - attach.sizeM[1] / 2 - coreTankRadius + coreTankRadius), by * 0.55, 0],
        rotation: [0, 0, 90],
        size: attach.sizeM,
      });
    }
  }

  return { items, totalHeight };
}

export { coreStackHeight };
