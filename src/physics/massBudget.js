// 총질량, 발사 시 추력대중량비(TWR) 계산. REQUIREMENTS.md 4절.
// DOM에 의존하지 않는다 (Node에서 바로 테스트 가능).

import { G0, sum } from '../utils/units.js';

/** 로켓 전체 초기 질량(kg) = 탑재체 + 모든 단의 (건조질량 + 추진제질량). */
export function totalMassKg(rocket) {
  const stagesMass = sum(rocket.stages, (s) => s.dryMassKg + s.propellantMassKg);
  return rocket.payloadMassKg + stagesMass;
}

/**
 * 발사 시점(t=0)에 점화되는 모든 단을 찾는다.
 * 규칙: separationOrder가 가장 작은 단(들)은 항상 점화된다. 그중 병렬(부스터) 단이 있으면,
 * separationOrder가 그다음(minOrder+1)이면서 throttleWhileBoosters가 정의된 직렬 단도
 * 부스터와 동시에 점화된 것으로 본다 (예: 팔콘 헤비의 코어).
 */
export function stagesIgnitedAtLiftoff(rocket) {
  const minOrder = Math.min(...rocket.stages.map((s) => s.separationOrder));
  const igniting = rocket.stages.filter((s) => s.separationOrder === minOrder);
  const hasBoosters = igniting.some((s) => s.role === 'parallel');
  let coIgniting = [];
  if (hasBoosters) {
    coIgniting = rocket.stages.filter(
      (s) => s.role === 'serial' && s.separationOrder === minOrder + 1 && s.throttleWhileBoosters != null,
    );
  }
  return [...igniting, ...coIgniting];
}

/** 발사 시점에 점화된 엔진들의 해수면 추력 합(N). */
export function liftoffThrustN(rocket) {
  const igniting = stagesIgnitedAtLiftoff(rocket);
  return sum(igniting, (s) => {
    const throttle = s.throttleWhileBoosters ?? 1;
    return s.engines.count * s.engines.thrustSeaLevelN * throttle;
  });
}

/** 발사 시 추력대중량비 TWR = 해수면 추력 합 / (m0 * g0). 1보다 커야 이륙 가능. */
export function liftoffTwr(rocket, g0 = G0) {
  const m0 = totalMassKg(rocket);
  return liftoffThrustN(rocket) / (m0 * g0);
}
