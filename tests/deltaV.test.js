import assert from 'node:assert/strict';
import { computeDeltaV } from '../src/physics/deltaV.js';
import { G0 } from '../src/utils/units.js';
import { makeFalconHeavyLike, makeSingleStageRocket } from './fixtures.js';

// 단일단: 치올콥스키 방정식과 정확히 일치해야 한다.
{
  const rocket = makeSingleStageRocket();
  const stage = rocket.stages[0];
  const m0 = rocket.payloadMassKg + stage.dryMassKg + stage.propellantMassKg;
  const mf = rocket.payloadMassKg + stage.dryMassKg;
  const expected = stage.engines.ispVacuumS * G0 * Math.log(m0 / mf);

  const { legs, totalDeltaVMps } = computeDeltaV(rocket);
  assert.equal(legs.length, 1);
  assert.ok(Math.abs(totalDeltaVMps - expected) < 1e-6, `기대값 ${expected}, 실제 ${totalDeltaVMps}`);
  console.log(`단일단 Δv = ${totalDeltaVMps.toFixed(1)} m/s (이론값과 일치)`);
}

// 팔콘 헤비형: 3구간(부스터, 코어, 상단)이 나오고 총 Δv가 현실적인 범위여야 한다.
{
  const rocket = makeFalconHeavyLike();
  const { legs, totalDeltaVMps } = computeDeltaV(rocket);
  assert.equal(legs.length, 3, `구간은 3개(부스터/코어/상단)여야 함, 실제 ${legs.length}`);
  console.log(
    '단별 Δv:',
    legs.map((l) => `${l.stageId}: ${l.deltaVMps.toFixed(0)} m/s`).join(' | '),
  );
  console.log(`총 Δv = ${totalDeltaVMps.toFixed(0)} m/s`);
  assert.ok(totalDeltaVMps > 8000 && totalDeltaVMps < 16000, '총 Δv가 현실적인 궤도 도달 범위여야 함');
  legs.forEach((l) => assert.ok(l.deltaVMps > 0, `${l.stageId} 구간 Δv는 양수여야 함`));
}

console.log('deltaV.test.js 통과');
