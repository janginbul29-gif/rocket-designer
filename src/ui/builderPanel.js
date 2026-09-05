// R-01~R-04: 부품 선택(단순화된 팔레트 연동), 단 편성, 병렬 부스터, 회수 설정 UI.
// 구조가 바뀌는 조작(단 추가/삭제, 부스터 켜기/끄기, 체크박스로 필드 표시가 바뀌는 경우)은
// onStructureChange로 패널 전체를 다시 그리고, 값만 바뀌는 조작(슬라이더/숫자/드롭다운)은
// onValueChange로 통계·3D만 갱신해 입력 중 포커스가 끊기지 않게 한다.

import { PART_CATALOG } from '../data/parts.js';
import { addStage, removeStage, setBoosters } from './builderState.js';

const ENGINE_OPTIONS = PART_CATALOG.filter((p) => p.type === 'engine');
const TANK_OPTIONS = PART_CATALOG.filter((p) => p.type === 'tank');

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function selectHtml(options, value, field, stageId) {
  return `<select data-field="${field}" data-stage-id="${stageId}">
    ${options.map((o) => `<option value="${o.id}" ${o.id === value ? 'selected' : ''}>${o.label}</option>`).join('')}
  </select>`;
}

function recoveryFields(recovery, stageId) {
  return `
    <label class="inline"><input type="checkbox" data-field="recovery.enabled" data-stage-id="${stageId}" data-structural="true" ${recovery.enabled ? 'checked' : ''}> 회수(재착륙)</label>
    ${recovery.enabled ? `
      <div class="sub-fields">
        <label>착륙 지점
          <select data-field="recovery.target" data-stage-id="${stageId}">
            <option value="launch_site" ${recovery.target === 'launch_site' ? 'selected' : ''}>발사장</option>
            <option value="drone_ship" ${recovery.target === 'drone_ship' ? 'selected' : ''}>드론십</option>
          </select>
        </label>
        <label>예비 추진제 비율
          <input type="number" min="0" max="0.5" step="0.01" data-field="recovery.reservePropellantFraction" data-stage-id="${stageId}" value="${recovery.reservePropellantFraction}">
        </label>
      </div>` : ''}
  `;
}

function stageCard(s, { title, stageId, isBooster, isFirstStage, hasBoosters, canRemove }) {
  return `
  <div class="stage-card ${isBooster ? 'stage-card--booster' : ''}">
    <div class="stage-card-head">
      <input type="text" class="stage-label" data-field="label" data-stage-id="${stageId}" value="${escapeHtml(isBooster ? '부스터' : s.label)}" ${isBooster ? 'disabled' : ''}>
      <span class="stage-tag">${title}</span>
      ${canRemove ? `<button class="stage-remove" data-action="remove-stage" data-stage-id="${stageId}" title="이 단 삭제">✕</button>` : ''}
    </div>

    <div class="stage-row">
      <label>엔진</label>
      ${selectHtml(ENGINE_OPTIONS, s.engineCatalogId, 'engineCatalogId', stageId)}
      <input type="number" min="1" max="40" class="engine-count" data-field="engineCount" data-stage-id="${stageId}" value="${s.engineCount}" title="엔진 개수">개
    </div>

    <div class="stage-row">
      <label>연료탱크</label>
      ${selectHtml(TANK_OPTIONS, s.tankCatalogId, 'tankCatalogId', stageId)}
    </div>

    <div class="stage-row">
      <label>추진제 충전량</label>
      <input type="range" min="0" max="1" step="0.01" data-field="fill" data-stage-id="${stageId}" value="${s.fill}">
      <span class="fill-readout">${Math.round(s.fill * 100)}%</span>
    </div>

    ${isFirstStage && hasBoosters ? `
    <div class="stage-row">
      <label>부스터 연동 중 스로틀</label>
      <input type="range" min="0" max="1" step="0.01" data-field="coreThrottle" data-stage-id="boosters" value="${hasBoosters}">
      <span class="fill-readout">${Math.round(hasBoosters * 100)}%</span>
    </div>` : ''}

    ${!isBooster ? `<label class="inline"><input type="checkbox" data-field="hasFairing" data-stage-id="${stageId}" data-structural="true" ${s.hasFairing ? 'checked' : ''}> 페어링 포함</label>` : ''}
    <label class="inline"><input type="checkbox" data-field="hasLegs" data-stage-id="${stageId}" data-structural="true" ${s.hasLegs ? 'checked' : ''}> 착륙 다리 포함</label>

    ${recoveryFields(s.recovery, stageId)}
  </div>`;
}

export function renderBuilder(container, state, { onStructureChange, onValueChange }) {
  const html = `
    <h2>조립</h2>
    <div class="field-row">
      <label>로켓 이름</label>
      <input type="text" data-field="name" value="${escapeHtml(state.name)}">
    </div>
    <div class="field-row">
      <label>탑재체 질량 (kg)</label>
      <input type="number" min="0" step="100" data-field="payloadMassKg" value="${state.payloadMassKg}">
    </div>

    <label class="inline booster-toggle"><input type="checkbox" data-action="toggle-boosters" ${state.boosters ? 'checked' : ''}> 병렬 부스터 사용 (좌우 대칭 2기)</label>

    ${state.boosters ? stageCard(state.boosters, { title: '부스터 (좌우 2기)', stageId: 'boosters', isBooster: true, isFirstStage: false, hasBoosters: false, canRemove: false }) : ''}

    <div class="stage-list">
      ${state.stages
        .map((s, i) =>
          stageCard(s, {
            title: i === 0 ? '1단 (발사 시 점화)' : `${i + 1}단`,
            stageId: s.id,
            isBooster: false,
            isFirstStage: i === 0,
            hasBoosters: state.boosters ? state.boosters.coreThrottle ?? 1 : 0,
            canRemove: state.stages.length > 1,
          }),
        )
        .join('')}
    </div>
    <button class="add-stage" data-action="add-stage">+ 단 추가</button>
  `;
  container.innerHTML = html;

  container.querySelectorAll('[data-action="toggle-boosters"]').forEach((el) => {
    el.addEventListener('change', () => {
      setBoosters(state, el.checked);
      onStructureChange();
    });
  });

  container.querySelectorAll('[data-action="add-stage"]').forEach((el) => {
    el.addEventListener('click', () => {
      addStage(state, 'upper');
      onStructureChange();
    });
  });

  container.querySelectorAll('[data-action="remove-stage"]').forEach((el) => {
    el.addEventListener('click', () => {
      removeStage(state, el.dataset.stageId);
      onStructureChange();
    });
  });

  container.querySelectorAll('[data-field]').forEach((el) => {
    const eventName = el.type === 'text' || el.type === 'number' || el.type === 'range' ? 'input' : 'change';
    el.addEventListener(eventName, () => {
      const field = el.dataset.field;
      const stageId = el.dataset.stageId;
      const target = !stageId ? state : stageId === 'boosters' ? state.boosters : state.stages.find((s) => s.id === stageId);
      if (!target) return;

      let value;
      if (el.type === 'checkbox') value = el.checked;
      else if (el.type === 'number' || el.type === 'range') value = parseFloat(el.value);
      else value = el.value;

      if (field.includes('.')) {
        const [a, b] = field.split('.');
        target[a][b] = value;
      } else {
        target[field] = value;
      }

      if (el.dataset.structural === 'true') onStructureChange();
      else onValueChange();
    });
  });
}
