// R-05, R-06: 실시간 계산(총질량/TWR/Δv)과 발사 가능 조건 검증 결과 표시.

import { totalMassKg, liftoffTwr } from '../physics/massBudget.js';
import { computeDeltaV } from '../physics/deltaV.js';
import { validateRocket } from '../physics/validation.js';

function fmt(n, digits = 0) {
  return Number(n).toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function renderStats(container, rocketDoc) {
  const m0 = totalMassKg(rocketDoc);
  const twr = liftoffTwr(rocketDoc);
  const { legs, totalDeltaVMps } = computeDeltaV(rocketDoc);
  const { ok, errors, warnings } = validateRocket(rocketDoc);

  const twrClass = twr > 1 ? (twr >= 1.2 ? 'ok' : 'warn') : 'bad';

  container.innerHTML = `
    <h2>실시간 계산</h2>
    <div class="stat-grid">
      <div class="stat"><div class="stat-k">총질량</div><div class="stat-v">${fmt(m0 / 1000, 1)} t</div></div>
      <div class="stat"><div class="stat-k">발사 시 TWR</div><div class="stat-v ${twrClass}">${fmt(twr, 2)}</div></div>
      <div class="stat"><div class="stat-k">총 Δv</div><div class="stat-v">${fmt(totalDeltaVMps)} m/s</div></div>
    </div>

    <div class="deltav-breakdown">
      ${legs.map((l) => `<div class="deltav-row"><span>${l.note ? `${l.label} — ${l.note}` : l.label}</span><span>${fmt(l.deltaVMps)} m/s</span></div>`).join('')}
    </div>

    <div class="validation ${ok ? 'validation--ok' : 'validation--error'}">
      <div class="validation-status">${ok ? '✓ 발사 가능 조건 통과' : '✕ 발사 가능 조건 미달'}</div>
      ${errors.map((e) => `<div class="validation-msg validation-msg--error">[${e.code}] ${e.message}</div>`).join('')}
      ${warnings.map((w) => `<div class="validation-msg validation-msg--warn">[${w.code}] ${w.message}</div>`).join('')}
    </div>
  `;

  return { ok, errors, warnings };
}
