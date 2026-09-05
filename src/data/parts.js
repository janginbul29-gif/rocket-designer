// 부품 카탈로그 (REQUIREMENTS.md 3절). 값은 공개된 팔콘 9/헤비 제원의 근사치이며
// 실제 인증값과 다를 수 있다 (교육/설계 보조 목적).

export const PART_CATALOG = [
  {
    id: 'engine_merlin1d',
    type: 'engine',
    label: '멀린 1D',
    dryMassKg: 470,
    thrustSeaLevelN: 845000,
    thrustVacuumN: 914000,
    ispSeaLevelS: 282,
    ispVacuumS: 311,
    sizeM: [1.2, 1.4, 1.2],
    note: '팔콘 9/헤비 1단 엔진 (공개 제원 근사치)',
  },
  {
    id: 'engine_merlin1d_vac',
    type: 'engine',
    label: '멀린 1D 진공형',
    dryMassKg: 470,
    thrustSeaLevelN: 0,
    thrustVacuumN: 981000,
    ispSeaLevelS: 0,
    ispVacuumS: 348,
    sizeM: [1.3, 2.9, 1.3],
    note: '팔콘 상단 엔진, 진공 전용 (공개 제원 근사치)',
  },
  {
    id: 'tank_booster',
    type: 'tank',
    label: '부스터/코어 연료탱크 (Ø3.7m)',
    dryMassKg: 22200,
    propellantMassKgMax: 411000,
    sizeM: [3.7, 42, 3.7],
    note: '팔콘 9/헤비 1단급 (공개 제원 근사치)',
  },
  {
    id: 'tank_upper',
    type: 'tank',
    label: '상단 연료탱크 (Ø3.7m)',
    dryMassKg: 4000,
    propellantMassKgMax: 92670,
    sizeM: [3.7, 12, 3.7],
    note: '팔콘 2단급 (공개 제원 근사치)',
  },
  {
    id: 'payload_default',
    type: 'payload',
    label: '탑재체 (우주선)',
    massKg: 10000,
    sizeM: [3, 4, 3],
  },
  {
    id: 'fairing',
    type: 'fairing',
    label: '페어링',
    massKg: 1700,
    sizeM: [5.2, 13, 5.2],
    note: '2단 점화 후 분리',
  },
  {
    id: 'decoupler',
    type: 'decoupler',
    label: '디커플러',
    massKg: 100,
    sizeM: [3.7, 0.3, 3.7],
  },
  {
    id: 'landing_legs',
    type: 'landing_legs',
    label: '착륙 다리',
    massKg: 2100,
    sizeM: [4.4, 1.5, 4.4],
    note: '이 부품이 붙어 있는 단만 회수(recovery) 설정 가능',
  },
  {
    id: 'booster_attach',
    type: 'booster_attach',
    label: '부스터 연결부',
    massKg: 200,
    sizeM: [0.6, 3, 0.6],
    note: '병렬 부스터를 코어 옆에 붙이는 연결 부품',
  },
];

export function findPart(id) {
  const part = PART_CATALOG.find((p) => p.id === id);
  if (!part) throw new Error(`부품을 찾을 수 없습니다: ${id}`);
  return part;
}

export function partsByType(type) {
  return PART_CATALOG.filter((p) => p.type === type);
}
