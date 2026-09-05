// 조립 상태(state, src/ui/builderState.js)로부터 3D 표시용 위치와 "드롭 영역"을 계산하는 순수 함수.
// Three.js를 import하지 않는다 — src/scene/rocketScene.js와 src/ui/builderState.js(내보내기) 양쪽에서
// 재사용하기 위함 (3D 미리보기와 geometry.parts가 항상 같은 배치를 쓰도록).

import { findPart } from '../data/parts.js';

function place(items, bounds, y, catalogId, type, stageKey, xOffset = 0) {
  const part = findPart(catalogId);
  const size = part.sizeM;
  items.push({ type, stageKey, catalogId, position: [xOffset, y + size[1] / 2, 0], rotation: [0, 0, 0], size });

  const b = bounds.get(stageKey) ?? { yMin: y, yMax: y, radius: 0 };
  b.yMin = Math.min(b.yMin, y);
  b.yMax = Math.max(b.yMax, y + size[1]);
  b.radius = Math.max(b.radius, size[0] / 2);
  bounds.set(stageKey, b);

  return y + size[1];
}

/**
 * 조립 상태로부터 3D 배치 목록과 드래그 드롭 영역을 계산한다.
 * 반환:
 *   items: [{type, stageKey, catalogId, position:[x,y,z], rotation:[x,y,z], size:[x,y,z]}]
 *   totalHeight: number
 *   zones: [{ kind: 'stage'|'new-stage'|'booster-left'|'booster-right', stageId?, yMin, yMax, radius, xOffset }]
 *     드래그한 부품을 놓을 수 있는 3D 영역. kind별 의미는 builderState.js의 applyPartDrop 참고.
 */
export function computeLayout(state) {
  const items = [];
  const bounds = new Map(); // stageKey -> {yMin,yMax,radius}
  let y = 0;

  // 코어(직렬) 스택: 아래에서 위로
  state.stages.forEach((stage, i) => {
    if (stage.hasLegs) y = place(items, bounds, y, 'landing_legs', 'landing_legs', stage.id);
    y = place(items, bounds, y, stage.engineCatalogId, 'engine', stage.id);
    y = place(items, bounds, y, stage.tankCatalogId, 'tank', stage.id);
    if (i < state.stages.length - 1) {
      y = place(items, bounds, y, 'decoupler', 'decoupler', stage.id);
    } else if (stage.hasFairing) {
      y = place(items, bounds, y, 'fairing', 'fairing', stage.id);
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
  const firstStageTankRadius = state.stages.length ? findPart(state.stages[0].tankCatalogId).sizeM[0] / 2 : 1.85;

  if (state.boosters && state.stages.length) {
    const b = state.boosters;
    const boosterTankRadius = findPart(b.tankCatalogId).sizeM[0] / 2;
    const xOffset = firstStageTankRadius + boosterTankRadius + 0.45;

    for (const side of [-1, 1]) {
      const stageKey = side < 0 ? 'booster-left' : 'booster-right';
      let by = 0;
      if (b.hasLegs) by = place(items, bounds, by, 'landing_legs', 'landing_legs', stageKey, side * xOffset);
      by = place(items, bounds, by, b.engineCatalogId, 'engine', stageKey, side * xOffset);
      by = place(items, bounds, by, b.tankCatalogId, 'tank', stageKey, side * xOffset);
      const attach = findPart('booster_attach');
      items.push({
        type: 'booster_attach',
        stageKey,
        catalogId: 'booster_attach',
        position: [side * xOffset, by * 0.55, 0],
        rotation: [0, 0, 90],
        size: attach.sizeM,
      });
    }
  }

  // 드롭 영역 계산
  const zones = [];
  state.stages.forEach((stage) => {
    const b = bounds.get(stage.id);
    if (b) zones.push({ kind: 'stage', stageId: stage.id, yMin: b.yMin, yMax: b.yMax, radius: Math.max(b.radius, 2), xOffset: 0 });
  });

  // 새 단 추가 영역: 스택 맨 위, 약간 띄운 자리
  zones.push({
    kind: 'new-stage',
    yMin: totalHeight + 1.5,
    yMax: totalHeight + 9,
    radius: Math.max(bounds.get(state.stages.at(-1)?.id)?.radius ?? 1.85, 1.85),
    xOffset: 0,
  });

  // 부스터 영역: 이미 있으면 실제 위치, 없으면 기본 탱크 크기로 가상의 영역을 좌우에 둔다
  if (state.boosters) {
    for (const side of ['booster-left', 'booster-right']) {
      const b = bounds.get(side);
      if (b) zones.push({ kind: side, stageId: null, yMin: b.yMin, yMax: b.yMax, radius: Math.max(b.radius, 2), xOffset: side === 'booster-left' ? -1 : 1 });
    }
  } else if (state.stages.length) {
    const guessRadius = 1.85; // tank_booster 기준
    const xOffset = firstStageTankRadius + guessRadius + 0.45;
    const stage0 = bounds.get(state.stages[0].id);
    zones.push({ kind: 'booster-left', stageId: null, yMin: 0, yMax: stage0?.yMax ?? 10, radius: guessRadius, xOffset: -xOffset });
    zones.push({ kind: 'booster-right', stageId: null, yMin: 0, yMax: stage0?.yMax ?? 10, radius: guessRadius, xOffset: xOffset });
  }

  return { items, totalHeight, zones };
}
