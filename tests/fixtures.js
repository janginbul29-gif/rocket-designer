// 테스트용 로켓 픽스처. 팔콘 헤비와 비슷한 구성 (부스터 2 + 코어 + 상단).

export function makeFalconHeavyLike() {
  return {
    formatVersion: 1,
    name: '팔콘 헤비 (테스트)',
    createdAt: '2026-09-05T00:00:00Z',
    designer: 'test',
    payloadMassKg: 10000,
    stages: [
      {
        id: 'booster-left',
        label: '왼쪽 부스터',
        role: 'parallel',
        separationOrder: 1,
        dryMassKg: 24500,
        propellantMassKg: 411000,
        engines: { count: 9, thrustSeaLevelN: 845000, thrustVacuumN: 914000, ispSeaLevelS: 282, ispVacuumS: 311 },
        recovery: { enabled: true, target: 'launch_site', reservePropellantFraction: 0.05 },
      },
      {
        id: 'booster-right',
        label: '오른쪽 부스터',
        role: 'parallel',
        separationOrder: 1,
        dryMassKg: 24500,
        propellantMassKg: 411000,
        engines: { count: 9, thrustSeaLevelN: 845000, thrustVacuumN: 914000, ispSeaLevelS: 282, ispVacuumS: 311 },
        recovery: { enabled: true, target: 'launch_site', reservePropellantFraction: 0.05 },
      },
      {
        id: 'core',
        label: '중앙 코어',
        role: 'serial',
        separationOrder: 2,
        dryMassKg: 22200,
        propellantMassKg: 411000,
        engines: { count: 9, thrustSeaLevelN: 845000, thrustVacuumN: 914000, ispSeaLevelS: 282, ispVacuumS: 311 },
        throttleWhileBoosters: 0.6,
        recovery: { enabled: true, target: 'drone_ship', reservePropellantFraction: 0.05 },
      },
      {
        id: 'upper',
        label: '상단',
        role: 'serial',
        separationOrder: 3,
        dryMassKg: 4470,
        propellantMassKg: 92670,
        engines: { count: 1, thrustSeaLevelN: 0, thrustVacuumN: 981000, ispSeaLevelS: 0, ispVacuumS: 348 },
        recovery: { enabled: false, target: 'launch_site', reservePropellantFraction: 0 },
      },
    ],
    geometry: {
      parts: [
        { partId: 'booster-left-legs', type: 'landing_legs', stageId: 'booster-left', position: [-4.15, 0.75, 0], rotation: [0, 0, 0], size: [4.4, 1.5, 4.4] },
        { partId: 'booster-right-legs', type: 'landing_legs', stageId: 'booster-right', position: [4.15, 0.75, 0], rotation: [0, 0, 0], size: [4.4, 1.5, 4.4] },
        { partId: 'core-legs', type: 'landing_legs', stageId: 'core', position: [0, 0.75, 0], rotation: [0, 0, 0], size: [4.4, 1.5, 4.4] },
        { partId: 'payload-1', type: 'payload', stageId: 'upper', position: [0, 65, 0], rotation: [0, 0, 0], size: [3, 4, 3] },
      ],
    },
  };
}

/** 단일 단 로켓 (부스터 없이 가장 단순한 검증용). */
export function makeSingleStageRocket() {
  return {
    formatVersion: 1,
    name: '단일단 테스트 로켓',
    createdAt: '2026-09-05T00:00:00Z',
    designer: 'test',
    payloadMassKg: 100,
    stages: [
      {
        id: 'stage-1',
        label: '1단',
        role: 'serial',
        separationOrder: 1,
        dryMassKg: 200,
        propellantMassKg: 1000,
        engines: { count: 1, thrustSeaLevelN: 20000, thrustVacuumN: 22000, ispSeaLevelS: 250, ispVacuumS: 280 },
        recovery: { enabled: false, target: 'launch_site', reservePropellantFraction: 0 },
      },
    ],
    geometry: {
      parts: [{ partId: 'payload-1', type: 'payload', stageId: 'stage-1', position: [0, 5, 0], rotation: [0, 0, 0], size: [1, 1, 1] }],
    },
  };
}
