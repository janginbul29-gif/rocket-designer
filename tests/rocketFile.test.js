import assert from 'node:assert/strict';
import { exportRocketToJson, parseRocketJson, RocketValidationError } from '../src/io/rocketFile.js';
import { makeFalconHeavyLike, makeSingleStageRocket } from './fixtures.js';

// 내보내기 -> 불러오기 왕복 시 값이 보존되고 summary가 채워져야 한다.
{
  const rocket = makeFalconHeavyLike();
  const json = exportRocketToJson(rocket);
  const parsed = JSON.parse(json);
  assert.equal(parsed.formatVersion, 1);
  assert.equal(parsed.payloadMassKg, rocket.payloadMassKg);
  assert.equal(parsed.stages.length, rocket.stages.length);
  assert.ok(parsed.summary.totalMassKg > 0);
  assert.ok(parsed.summary.liftoffTwr > 1);
  assert.ok(parsed.summary.totalDeltaVMps > 0);

  const { rocket: reloaded, validation } = parseRocketJson(json);
  assert.equal(reloaded.name, rocket.name);
  assert.equal(validation.ok, true);
  console.log(`왕복 확인: 총질량 ${(parsed.summary.totalMassKg / 1000).toFixed(1)} t, TWR ${parsed.summary.liftoffTwr.toFixed(2)}, 총Δv ${Math.round(parsed.summary.totalDeltaVMps)} m/s`);
}

// 치명적 검증 오류가 있으면 내보내기가 막혀야 한다.
{
  const rocket = makeSingleStageRocket();
  rocket.geometry.parts = []; // 탑재체 제거 -> V-01
  assert.throws(() => exportRocketToJson(rocket), RocketValidationError);
}

// 지원하지 않는 formatVersion은 불러오기 시 오류.
{
  const rocket = makeSingleStageRocket();
  const doc = { ...rocket, formatVersion: 99 };
  assert.throws(() => parseRocketJson(JSON.stringify(doc)), /formatVersion/);
}

console.log('rocketFile.test.js 통과');
