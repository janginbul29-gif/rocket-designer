// .rocket.json 내보내기/불러오기 (REQUIREMENTS.md 6절). DOM에 의존하지 않는다
// (다운로드/파일선택 같은 브라우저 동작은 src/ui/에서 처리한다).

import { totalMassKg, liftoffTwr } from '../physics/massBudget.js';
import { computeDeltaV } from '../physics/deltaV.js';
import { validateRocket } from '../physics/validation.js';

export const FORMAT_VERSION = 1;

export class RocketValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'RocketValidationError';
    this.errors = errors;
  }
}

/** 현재 설계에서 summary(총질량/TWR/총Δv)를 계산해 붙인 문서 객체와 검증 결과를 만든다. */
export function buildRocketDocument(rocket) {
  const validation = validateRocket(rocket);
  const summary = {
    totalMassKg: totalMassKg(rocket),
    liftoffTwr: liftoffTwr(rocket),
    totalDeltaVMps: computeDeltaV(rocket).totalDeltaVMps,
  };
  const doc = { ...rocket, formatVersion: FORMAT_VERSION, summary };
  return { doc, validation };
}

/**
 * 로켓 설계를 .rocket.json 문자열로 직렬화한다.
 * 치명적 검증 오류(errors)가 있으면 RocketValidationError를 던진다 (경고는 허용, V-06).
 */
export function exportRocketToJson(rocket) {
  const { doc, validation } = buildRocketDocument(rocket);
  if (!validation.ok) {
    throw new RocketValidationError('발사 가능 조건을 만족하지 않아 내보낼 수 없습니다', validation.errors);
  }
  return JSON.stringify(doc, null, 2);
}

/**
 * .rocket.json 문자열을 읽어 로켓 문서와 검증 결과를 반환한다.
 * 형식 버전이 다르면 오류를 던진다. 검증은 항상 수행하되, 결과 판단은 호출자에게 맡긴다
 * (불러오기 자체는 허용하고, 발사 가능 여부만 별도로 안내하기 위함).
 */
export function parseRocketJson(jsonString) {
  const doc = JSON.parse(jsonString);
  if (doc.formatVersion !== FORMAT_VERSION) {
    throw new Error(`지원하지 않는 formatVersion입니다: ${doc.formatVersion} (현재 지원: ${FORMAT_VERSION})`);
  }
  const validation = validateRocket(doc);
  return { rocket: doc, validation };
}
