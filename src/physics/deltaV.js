// 단별/총 Δv 계산 (치올콥스키 로켓 방정식, REQUIREMENTS.md 4절).
// 병렬 부스터가 있는 첫 단은 REQUIREMENTS.md 4절의 "유효 배기속도" 근사법을 쓴다
// (원본 인수 문서가 가리킨 "03_physics.md 6.3절" 질량 표는 전달받지 못해 근사식으로 대체함.
//  DECISIONS.md 참고). DOM에 의존하지 않는다.

import { G0, sum } from '../utils/units.js';
import { totalMassKg } from './massBudget.js';

function stageMdotVacKgps(stage) {
  return (stage.engines.count * stage.engines.thrustVacuumN) / (stage.engines.ispVacuumS * G0);
}

function stageThrustVacN(stage) {
  return stage.engines.count * stage.engines.thrustVacuumN;
}

/**
 * 로켓의 단별 Δv와 총 Δv를 계산한다.
 * 반환: { legs: [{ stageId, deltaVMps, note }], totalDeltaVMps }
 */
export function computeDeltaV(rocket) {
  const stages = rocket.stages;
  const minOrder = Math.min(...stages.map((s) => s.separationOrder));
  const boosters = stages.filter((s) => s.role === 'parallel' && s.separationOrder === minOrder);
  const serialStages = stages
    .filter((s) => s.role === 'serial')
    .slice()
    .sort((a, b) => a.separationOrder - b.separationOrder);

  const legs = [];
  let mass = totalMassKg(rocket);

  if (boosters.length > 0) {
    const core = serialStages.find((s) => s.separationOrder === minOrder + 1);

    const boosterMdot = sum(boosters, stageMdotVacKgps);
    const boosterThrustVac = sum(boosters, stageThrustVacN);
    const boosterPropellant = sum(boosters, (s) => s.propellantMassKg);

    let coreMdotThrottled = 0;
    let coreThrustThrottled = 0;
    if (core) {
      const throttle = core.throttleWhileBoosters ?? 1;
      coreMdotThrottled = stageMdotVacKgps(core) * throttle;
      coreThrustThrottled = stageThrustVacN(core) * throttle;
    }

    const boosterBurnTimeS = boosterPropellant / boosterMdot;
    const corePropBurnedInPhase = core ? Math.min(core.propellantMassKg, coreMdotThrottled * boosterBurnTimeS) : 0;

    const totalMdotPhase = boosterMdot + coreMdotThrottled;
    const totalThrustPhase = boosterThrustVac + coreThrustThrottled;
    const vEff = totalThrustPhase / totalMdotPhase; // 유효 배기속도 (m/s)

    const massBeforeBoosterSep = mass - boosterPropellant - corePropBurnedInPhase;
    const dv1 = vEff * Math.log(mass / massBeforeBoosterSep);
    legs.push({
      stageId: boosters.map((s) => s.id).join('+'),
      label: boosters.map((s) => s.label ?? s.id).join(' + '),
      deltaVMps: dv1,
      note: '부스터 동시연소 구간',
    });

    const boosterDryMass = sum(boosters, (s) => s.dryMassKg);
    mass = massBeforeBoosterSep - boosterDryMass; // 부스터 분리

    if (core) {
      const coreRemainingProp = core.propellantMassKg - corePropBurnedInPhase;
      if (coreRemainingProp > 1e-6) {
        const massAfterCoreBurn = mass - coreRemainingProp;
        const dv2 = core.engines.ispVacuumS * G0 * Math.log(mass / massAfterCoreBurn);
        legs.push({ stageId: core.id, label: core.label ?? core.id, deltaVMps: dv2, note: '코어 단독연소 구간' });
        mass = massAfterCoreBurn;
      }
      mass -= core.dryMassKg; // 코어 분리
    }

    const rest = serialStages.filter((s) => s.separationOrder > minOrder + 1);
    for (const stage of rest) {
      const massAfterBurn = mass - stage.propellantMassKg;
      const dv = stage.engines.ispVacuumS * G0 * Math.log(mass / massAfterBurn);
      legs.push({ stageId: stage.id, label: stage.label ?? stage.id, deltaVMps: dv, note: null });
      mass = massAfterBurn - stage.dryMassKg;
    }
  } else {
    for (const stage of serialStages) {
      const massAfterBurn = mass - stage.propellantMassKg;
      const dv = stage.engines.ispVacuumS * G0 * Math.log(mass / massAfterBurn);
      legs.push({ stageId: stage.id, label: stage.label ?? stage.id, deltaVMps: dv, note: null });
      mass = massAfterBurn - stage.dryMassKg;
    }
  }

  const totalDeltaVMps = sum(legs, (l) => l.deltaVMps);
  return { legs, totalDeltaVMps };
}
