// 발사 가능 조건 검증 (REQUIREMENTS.md 5절, V-01~V-07). DOM에 의존하지 않는다.

import { liftoffTwr } from './massBudget.js';
import { computeDeltaV } from './deltaV.js';

const MIN_LANDING_RESERVE_FRACTION = 0.05; // Q-20 확정값
const MIN_ORBITAL_DELTA_V_MPS = 9400;

function stageLabel(stage, index) {
  return stage.label ?? stage.id ?? `${index + 1}단`;
}

/**
 * 로켓 설계를 검증한다.
 * 반환: { ok, errors: [{code,message}], warnings: [{code,message}] }
 * ok는 치명적 오류(errors)가 없을 때만 true. 경고(warnings)가 있어도 내보내기는 허용한다 (V-06).
 */
export function validateRocket(rocket) {
  const errors = [];
  const warnings = [];
  const parts = rocket.geometry?.parts ?? [];
  const stages = rocket.stages ?? [];

  // V-01: 탑재체가 정확히 1개
  const payloadParts = parts.filter((p) => p.type === 'payload');
  if (payloadParts.length !== 1) {
    errors.push({ code: 'V-01', message: '탑재체(우주선)를 하나 붙여 주세요' });
  }

  // V-02: 단이 1개 이상, 각 단에 엔진 1개 이상과 탱크(추진제) 1개 이상
  if (stages.length === 0) {
    errors.push({ code: 'V-02', message: '단이 1개 이상 있어야 합니다' });
  } else {
    stages.forEach((s, i) => {
      const label = stageLabel(s, i);
      if (!s.engines || !(s.engines.count >= 1)) {
        errors.push({ code: 'V-02', message: `${label}에 엔진이 없습니다` });
      }
      if (!(s.propellantMassKg > 0)) {
        errors.push({ code: 'V-02', message: `${label}에 탱크(추진제)가 없습니다` });
      }
    });
  }

  // V-07: 부스터 단은 반드시 병렬, 직렬 단은 위아래로만 연결 (role 값 검증)
  stages.forEach((s, i) => {
    if (s.role !== 'serial' && s.role !== 'parallel') {
      errors.push({ code: 'V-07', message: `${stageLabel(s, i)}: role은 serial 또는 parallel이어야 합니다` });
    }
  });

  // V-03: 발사 시 TWR > 1 (단 구조가 유효할 때만 계산)
  if (errors.length === 0) {
    const twr = liftoffTwr(rocket);
    if (!(twr > 1)) {
      errors.push({ code: 'V-03', message: `추력이 부족해 이륙할 수 없습니다 (TWR ${twr.toFixed(2)})` });
    }
  }

  // V-04, V-05: 회수 설정
  stages.forEach((s, i) => {
    if (s.recovery?.enabled) {
      const label = stageLabel(s, i);
      const hasLegs = parts.some((p) => p.type === 'landing_legs' && p.stageId === s.id);
      if (!hasLegs) {
        errors.push({ code: 'V-04', message: `${label}: 회수하려면 착륙 다리를 붙여 주세요` });
      }
      const reserve = s.recovery.reservePropellantFraction ?? 0;
      if (reserve < MIN_LANDING_RESERVE_FRACTION) {
        errors.push({
          code: 'V-05',
          message: `${label}: 착륙용 예비 추진제 비율이 부족합니다 (${(reserve * 100).toFixed(0)}% < ${(MIN_LANDING_RESERVE_FRACTION * 100).toFixed(0)}%)`,
        });
      }
    }
  });

  // V-06: 총 Δv >= 9,400 m/s (경고만, 내보내기는 허용)
  if (errors.length === 0) {
    const { totalDeltaVMps } = computeDeltaV(rocket);
    if (totalDeltaVMps < MIN_ORBITAL_DELTA_V_MPS) {
      warnings.push({
        code: 'V-06',
        message: `총 Δv가 지구 저궤도 도달 기준(약 ${MIN_ORBITAL_DELTA_V_MPS.toLocaleString()} m/s)에 못 미칩니다 (${Math.round(totalDeltaVMps).toLocaleString()} m/s)`,
      });
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
