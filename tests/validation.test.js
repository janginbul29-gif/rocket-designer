import assert from 'node:assert/strict';
import { validateRocket } from '../src/physics/validation.js';
import { makeFalconHeavyLike, makeSingleStageRocket } from './fixtures.js';

// 정상 구성은 오류 없이 통과해야 한다 (경고는 있을 수 있음).
{
  const result = validateRocket(makeFalconHeavyLike());
  assert.deepEqual(result.errors, [], `오류 없어야 함: ${JSON.stringify(result.errors)}`);
  assert.equal(result.ok, true);
}

{
  const result = validateRocket(makeSingleStageRocket());
  assert.deepEqual(result.errors, []);
  // 단일단 소형 로켓은 궤도 Δv에 못 미쳐 V-06 경고가 나와야 한다.
  assert.ok(result.warnings.some((w) => w.code === 'V-06'));
}

// V-01: 탑재체 없음
{
  const rocket = makeSingleStageRocket();
  rocket.geometry.parts = rocket.geometry.parts.filter((p) => p.type !== 'payload');
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-01'));
  assert.equal(result.ok, false);
}

// V-02: 엔진 없는 단
{
  const rocket = makeSingleStageRocket();
  rocket.stages[0].engines.count = 0;
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-02'));
}

// V-03: 추력 부족 (TWR < 1)
{
  const rocket = makeSingleStageRocket();
  rocket.stages[0].engines.thrustSeaLevelN = 100; // 매우 약한 추력
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-03'));
}

// V-04: 회수 켰는데 착륙 다리 없음
{
  const rocket = makeSingleStageRocket();
  rocket.stages[0].recovery = { enabled: true, target: 'launch_site', reservePropellantFraction: 0.05 };
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-04'));
}

// V-05: 회수 예비 추진제 비율 부족
{
  const rocket = makeFalconHeavyLike();
  rocket.stages[2].recovery.reservePropellantFraction = 0.01; // 코어, 5% 미만
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-05'));
}

// V-07: 잘못된 role 값
{
  const rocket = makeSingleStageRocket();
  rocket.stages[0].role = 'diagonal';
  const result = validateRocket(rocket);
  assert.ok(result.errors.some((e) => e.code === 'V-07'));
}

console.log('validation.test.js 통과');
