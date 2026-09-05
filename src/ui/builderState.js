// 조립 화면의 상태 모델과 .rocket.json 변환. DOM에 의존하지 않는다.
// state 구조:
// {
//   name, designer, payloadMassKg,
//   boosters: null | { engineCatalogId, engineCount, tankCatalogId, fill, hasLegs, coreThrottle, recovery },
//   stages: [ { id, label, engineCatalogId, engineCount, tankCatalogId, fill, hasFairing, hasLegs, recovery } ... ]
//     // stages[0]이 가장 먼저(발사 시) 점화되는 단
// }

import { PART_CATALOG, findPart } from '../data/parts.js';
import { computeLayout } from '../scene/layout.js';

let nextId = 1;
function makeId(prefix) {
  return `${prefix}-${nextId++}`;
}

function defaultRecovery() {
  return { enabled: false, target: 'launch_site', reservePropellantFraction: 0.05 };
}

export function createDefaultStage(kind = 'upper') {
  const isUpper = kind === 'upper';
  return {
    id: makeId('stage'),
    label: isUpper ? '상단' : '코어',
    engineCatalogId: isUpper ? 'engine_merlin1d_vac' : 'engine_merlin1d',
    engineCount: isUpper ? 1 : 9,
    tankCatalogId: isUpper ? 'tank_upper' : 'tank_booster',
    fill: 1,
    hasFairing: isUpper,
    hasLegs: false,
    recovery: defaultRecovery(),
  };
}

export function createDefaultBoosters() {
  return {
    engineCatalogId: 'engine_merlin1d',
    engineCount: 9,
    tankCatalogId: 'tank_booster',
    fill: 1,
    hasLegs: true,
    coreThrottle: 0.6,
    recovery: { enabled: true, target: 'launch_site', reservePropellantFraction: 0.05 },
  };
}

export function createDefaultState() {
  return {
    name: '내 로켓',
    designer: '',
    payloadMassKg: findPart('payload_default').massKg,
    boosters: null,
    stages: [createDefaultStage('core')],
  };
}

export function addStage(state, kind = 'upper') {
  state.stages.push(createDefaultStage(kind));
  return state;
}

export function removeStage(state, stageId) {
  if (state.stages.length <= 1) return state;
  state.stages = state.stages.filter((s) => s.id !== stageId);
  return state;
}

export function setBoosters(state, enabled) {
  state.boosters = enabled ? createDefaultBoosters() : null;
  return state;
}

/**
 * R-02: 3D 장면의 드롭 영역(src/scene/layout.js의 zone)에 부품을 놓았을 때 상태를 갱신한다.
 * part: { catalogId, type } (팔레트에서 드래그한 부품).
 * 반환: 상태가 바뀌었으면 true (호출자가 다시 그려야 함), 처리할 수 없는 조합이면 false.
 */
export function applyPartDrop(state, zone, part) {
  if (!zone) return false;

  if (zone.kind === 'new-stage') {
    if (part.type !== 'engine' && part.type !== 'tank') return false;
    const stage = createDefaultStage('upper');
    if (part.type === 'engine') stage.engineCatalogId = part.catalogId;
    if (part.type === 'tank') stage.tankCatalogId = part.catalogId;
    state.stages.push(stage);
    return true;
  }

  if (zone.kind === 'booster-left' || zone.kind === 'booster-right') {
    if (!state.boosters) setBoosters(state, true);
    if (part.type === 'engine') state.boosters.engineCatalogId = part.catalogId;
    else if (part.type === 'tank') state.boosters.tankCatalogId = part.catalogId;
    else if (part.type === 'landing_legs') state.boosters.hasLegs = true;
    else if (part.type !== 'booster_attach') return false;
    return true;
  }

  if (zone.kind === 'stage') {
    const stage = state.stages.find((s) => s.id === zone.stageId);
    if (!stage) return false;
    const isLastStage = state.stages.at(-1)?.id === zone.stageId;

    switch (part.type) {
      case 'engine':
        stage.engineCatalogId = part.catalogId;
        return true;
      case 'tank':
        stage.tankCatalogId = part.catalogId;
        return true;
      case 'landing_legs':
        stage.hasLegs = true;
        return true;
      case 'fairing':
        if (!isLastStage) return false; // 페어링은 맨 위 단에만
        stage.hasFairing = true;
        return true;
      case 'decoupler': {
        const idx = state.stages.findIndex((s) => s.id === zone.stageId);
        state.stages.splice(idx + 1, 0, createDefaultStage('upper'));
        return true;
      }
      case 'booster_attach':
        if (!state.boosters) setBoosters(state, true);
        return true;
      case 'payload':
        state.payloadMassKg = findPart(part.catalogId).massKg;
        return true;
      default:
        return false;
    }
  }

  return false;
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

function stageToRocketStage(s, role, separationOrder, extraDryMassKg = 0, throttleWhileBoosters = null) {
  const engine = findPart(s.engineCatalogId);
  const tank = findPart(s.tankCatalogId);
  let dryMassKg = engine.dryMassKg * s.engineCount + tank.dryMassKg + extraDryMassKg;
  if (s.hasLegs) dryMassKg += findPart('landing_legs').massKg;
  if (s.hasFairing) dryMassKg += findPart('fairing').massKg;

  const stage = {
    id: s.id,
    label: s.label,
    role,
    separationOrder,
    dryMassKg,
    propellantMassKg: tank.propellantMassKgMax * clamp01(s.fill),
    engines: {
      count: s.engineCount,
      thrustSeaLevelN: engine.thrustSeaLevelN,
      thrustVacuumN: engine.thrustVacuumN,
      ispSeaLevelS: engine.ispSeaLevelS,
      ispVacuumS: engine.ispVacuumS,
    },
    recovery: { ...s.recovery },
  };
  if (throttleWhileBoosters != null) stage.throttleWhileBoosters = throttleWhileBoosters;
  return stage;
}

/** 조립 상태를 REQUIREMENTS.md 6절 형식의 로켓 문서(geometry 포함)로 변환한다. */
export function toRocketDocument(state) {
  const stages = [];
  const decouplerMass = findPart('decoupler').massKg;

  if (state.boosters) {
    const b = state.boosters;
    const attachMass = findPart('booster_attach').massKg;
    stages.push({
      ...stageToRocketStage(
        { ...b, id: 'booster-left', label: '왼쪽 부스터' },
        'parallel',
        1,
        attachMass,
      ),
    });
    stages.push({
      ...stageToRocketStage(
        { ...b, id: 'booster-right', label: '오른쪽 부스터' },
        'parallel',
        1,
        attachMass,
      ),
    });
  }

  const baseOrder = state.boosters ? 2 : 1;
  state.stages.forEach((s, i) => {
    const isLast = i === state.stages.length - 1;
    const extraDry = !isLast ? decouplerMass : 0;
    const throttle = i === 0 && state.boosters ? (state.boosters.coreThrottle ?? 1) : null;
    stages.push(stageToRocketStage(s, 'serial', baseOrder + i, extraDry, throttle));
  });

  const layout = computeLayout(state);
  const parts = layout.items.map((it, idx) => ({
    partId: `${it.stageKey}-${it.type}-${idx}`,
    type: it.type,
    stageId: it.stageKey,
    position: it.position,
    rotation: it.rotation,
    size: it.size,
  }));

  return {
    name: state.name,
    createdAt: new Date().toISOString(),
    designer: state.designer || '',
    payloadMassKg: state.payloadMassKg,
    stages,
    geometry: { parts },
  };
}

function closestEngineCatalogId(engineSpec) {
  const engines = PART_CATALOG.filter((p) => p.type === 'engine');
  let best = engines[0];
  let bestDiff = Infinity;
  for (const p of engines) {
    const diff = Math.abs(p.ispVacuumS - engineSpec.ispVacuumS) + Math.abs(p.thrustVacuumN - engineSpec.thrustVacuumN) / 1000;
    if (diff < bestDiff) {
      bestDiff = diff;
      best = p;
    }
  }
  return best.id;
}

function closestTank(propellantMassKg) {
  const tanks = PART_CATALOG.filter((p) => p.type === 'tank').sort((a, b) => a.propellantMassKgMax - b.propellantMassKgMax);
  for (const t of tanks) {
    if (propellantMassKg <= t.propellantMassKgMax * 1.02) return t;
  }
  return tanks[tanks.length - 1];
}

/** .rocket.json 문서를 읽어 조립 상태로 되돌린다 (근사 복원 — 카탈로그에 가장 가까운 부품으로 매칭). */
export function fromRocketDocument(doc) {
  const parts = doc.geometry?.parts ?? [];
  const parallel = doc.stages.filter((s) => s.role === 'parallel');
  const serial = doc.stages
    .filter((s) => s.role === 'serial')
    .slice()
    .sort((a, b) => a.separationOrder - b.separationOrder);

  let boosters = null;
  if (parallel.length) {
    const b = parallel[0];
    const tank = closestTank(b.propellantMassKg);
    boosters = {
      engineCatalogId: closestEngineCatalogId(b.engines),
      engineCount: b.engines.count,
      tankCatalogId: tank.id,
      fill: clamp01(b.propellantMassKg / tank.propellantMassKgMax),
      hasLegs: parts.some((p) => p.type === 'landing_legs' && p.stageId === b.id),
      coreThrottle: serial[0]?.throttleWhileBoosters ?? 1,
      recovery: { ...b.recovery },
    };
  }

  const stages = serial.map((s) => {
    const tank = closestTank(s.propellantMassKg);
    return {
      id: s.id,
      label: s.label ?? s.id,
      engineCatalogId: closestEngineCatalogId(s.engines),
      engineCount: s.engines.count,
      tankCatalogId: tank.id,
      fill: clamp01(s.propellantMassKg / tank.propellantMassKgMax),
      hasFairing: parts.some((p) => p.type === 'fairing' && p.stageId === s.id),
      hasLegs: parts.some((p) => p.type === 'landing_legs' && p.stageId === s.id),
      recovery: { ...s.recovery },
    };
  });

  return {
    name: doc.name || '불러온 로켓',
    designer: doc.designer || '',
    payloadMassKg: doc.payloadMassKg,
    boosters,
    stages: stages.length ? stages : [createDefaultStage('core')],
  };
}
