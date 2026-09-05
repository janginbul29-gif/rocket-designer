import assert from 'node:assert/strict';
import { totalMassKg, liftoffTwr, liftoffThrustN } from '../src/physics/massBudget.js';
import { makeFalconHeavyLike, makeSingleStageRocket } from './fixtures.js';

// 총질량: 페이로드 + 모든 단(건조+추진제)
{
  const rocket = makeFalconHeavyLike();
  const expected =
    rocket.payloadMassKg + rocket.stages.reduce((s, st) => s + st.dryMassKg + st.propellantMassKg, 0);
  assert.equal(totalMassKg(rocket), expected);
  console.log(`총질량 m0 = ${(totalMassKg(rocket) / 1000).toFixed(1)} t`);
}

// 발사 시 추력: 부스터(9엔진x2) + 코어(9엔진, 0.6 스로틀)
{
  const rocket = makeFalconHeavyLike();
  const expectedThrust = 2 * 9 * 845000 + 9 * 845000 * 0.6;
  assert.equal(liftoffThrustN(rocket), expectedThrust);

  const twr = liftoffTwr(rocket);
  console.log(`발사 시 추력 = ${(expectedThrust / 1000).toFixed(0)} kN, TWR = ${twr.toFixed(2)}`);
  assert.ok(twr > 1, 'TWR은 1보다 커야 이륙 가능');
  assert.ok(twr < 3, 'TWR이 비정상적으로 크지 않아야 함 (대략적 현실성 확인)');
}

// 단일단 로켓: 부스터 없이 stage 자신만 점화
{
  const rocket = makeSingleStageRocket();
  const expectedThrust = 1 * 20000;
  assert.equal(liftoffThrustN(rocket), expectedThrust);
}

console.log('massBudget.test.js 통과');
