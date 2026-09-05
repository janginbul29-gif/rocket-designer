// R-01: 부품 목록(팔레트). 종류별로 묶어 참고용으로 보여준다.
// 실제 조립에 쓰는 선택(엔진/탱크 종류 선택 등)은 builderPanel.js의 드롭다운에서 이 카탈로그를 사용한다.

import { PART_CATALOG } from '../data/parts.js';

const TYPE_LABEL = {
  engine: '엔진',
  tank: '연료탱크',
  payload: '탑재체',
  fairing: '페어링',
  decoupler: '디커플러',
  landing_legs: '착륙 다리',
  booster_attach: '부스터 연결부',
};

function formatStat(part) {
  if (part.type === 'engine') {
    return `건조 ${part.dryMassKg}kg · 추력(해수면/진공) ${(part.thrustSeaLevelN / 1000).toFixed(0)}/${(part.thrustVacuumN / 1000).toFixed(0)}kN · Isp ${part.ispSeaLevelS}/${part.ispVacuumS}s`;
  }
  if (part.type === 'tank') {
    return `건조 ${part.dryMassKg.toLocaleString()}kg · 추진제 최대 ${part.propellantMassKgMax.toLocaleString()}kg`;
  }
  return `질량 ${(part.massKg ?? 0).toLocaleString()}kg`;
}

export function renderPalette(container) {
  const groups = {};
  for (const part of PART_CATALOG) {
    (groups[part.type] ??= []).push(part);
  }

  container.innerHTML = `
    <h2>부품 목록</h2>
    <p class="palette-hint">부품을 3D 장면으로 드래그해 놓으면 조립됩니다.</p>
    ${Object.entries(groups)
      .map(
        ([type, parts]) => `
      <div class="palette-group">
        <h3>${TYPE_LABEL[type] ?? type}</h3>
        ${parts
          .map(
            (p) => `
          <div class="palette-item" draggable="true" data-catalog-id="${p.id}" data-type="${p.type}" title="드래그해서 3D 장면에 놓기">
            <div class="palette-item-label">${p.label}</div>
            <div class="palette-item-stat">${formatStat(p)}</div>
            ${p.note ? `<div class="palette-item-note">${p.note}</div>` : ''}
          </div>`,
          )
          .join('')}
      </div>`,
      )
      .join('')}
  `;

  container.querySelectorAll('.palette-item').forEach((el) => {
    el.addEventListener('dragstart', (e) => {
      const part = { catalogId: el.dataset.catalogId, type: el.dataset.type };
      e.dataTransfer.setData('application/json', JSON.stringify(part));
      e.dataTransfer.effectAllowed = 'copy';
      el.classList.add('palette-item--dragging');
    });
    el.addEventListener('dragend', () => el.classList.remove('palette-item--dragging'));
  });
}
