// R-07, R-08, R-09: JSON 내보내기(다운로드), 불러오기(파일 선택), 예제(팔콘 헤비) 불러오기.
// 파일 다운로드/선택 같은 브라우저 동작을 다루므로 src/io/rocketFile.js(순수 로직)를 감싸는 역할만 한다.

import { exportRocketToJson, parseRocketJson, RocketValidationError } from '../io/rocketFile.js';
import { toRocketDocument, fromRocketDocument } from './builderState.js';

const EXAMPLE_URL = new URL('../../examples/falcon_heavy.rocket.json', import.meta.url);

export function renderExportImport(container, { getState, applyImportedState }) {
  container.innerHTML = `
    <button data-action="export">JSON 내보내기 (다운로드)</button>
    <label class="file-import-label">
      JSON 불러오기
      <input type="file" accept=".json,.rocket.json,application/json" data-action="import" hidden>
    </label>
    <button data-action="load-example">팔콘 헤비 예제 불러오기</button>
    <div class="export-status" data-role="status"></div>
  `;

  const status = container.querySelector('[data-role="status"]');
  const setStatus = (msg, isError) => {
    status.textContent = msg;
    status.className = `export-status ${isError ? 'export-status--error' : 'export-status--ok'}`;
  };

  container.querySelector('[data-action="export"]').addEventListener('click', () => {
    const doc = toRocketDocument(getState());
    try {
      const json = exportRocketToJson(doc);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(doc.name || 'rocket').replace(/[^\w가-힣-]+/g, '_')}.rocket.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('내보내기 완료.', false);
    } catch (e) {
      if (e instanceof RocketValidationError) {
        setStatus(`내보내기 실패: ${e.errors.map((er) => er.message).join(' / ')}`, true);
      } else {
        setStatus(`내보내기 실패: ${e.message}`, true);
      }
    }
  });

  container.querySelector('[data-action="import"]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const { rocket, validation } = parseRocketJson(text);
      const newState = fromRocketDocument(rocket);
      applyImportedState(newState);
      setStatus(
        validation.ok
          ? '불러오기 완료.'
          : `불러오기 완료 (주의: ${validation.errors.map((er) => er.message).join(' / ')})`,
        !validation.ok,
      );
    } catch (err) {
      setStatus(`불러오기 실패: ${err.message}`, true);
    } finally {
      e.target.value = '';
    }
  });

  container.querySelector('[data-action="load-example"]').addEventListener('click', async () => {
    try {
      const res = await fetch(EXAMPLE_URL);
      const rocket = await res.json();
      const newState = fromRocketDocument(rocket);
      applyImportedState(newState);
      setStatus('팔콘 헤비 예제를 불러왔습니다.', false);
    } catch (err) {
      setStatus(`예제 불러오기 실패: ${err.message}`, true);
    }
  });
}
