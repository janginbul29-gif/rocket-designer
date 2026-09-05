// 진입점: 각 모듈을 연결한다.

import { createDefaultState, toRocketDocument, applyPartDrop } from './ui/builderState.js';
import { renderBuilder } from './ui/builderPanel.js';
import { renderPalette } from './ui/palette.js';
import { renderStats } from './ui/statsPanel.js';
import { renderExportImport } from './ui/exportImport.js';
import { createRocketScene } from './scene/rocketScene.js';

let state = createDefaultState();

const canvas = document.getElementById('scene-canvas');
const sceneApi = createRocketScene(canvas);

const builderEl = document.getElementById('builder-panel');
const paletteEl = document.getElementById('palette-panel');
const statsEl = document.getElementById('stats-panel');
const exportEl = document.getElementById('export-panel');

renderPalette(paletteEl);

function recompute() {
  const doc = toRocketDocument(state);
  sceneApi.rebuild(state);
  renderStats(statsEl, doc);
}

function rerenderBuilder() {
  renderBuilder(builderEl, state, {
    onStructureChange: rerenderBuilder,
    onValueChange: recompute,
  });
  recompute();
}

renderExportImport(exportEl, {
  getState: () => state,
  applyImportedState: (newState) => {
    state = newState;
    rerenderBuilder();
  },
});

// R-02: 팔레트에서 3D 장면으로 드래그해 부품을 조립한다.
canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  const hit = sceneApi.hitTestZone(e.clientX, e.clientY);
  sceneApi.setHoveredZoneMesh(hit);
});

canvas.addEventListener('dragleave', () => sceneApi.clearHover());

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  sceneApi.clearHover();
  const raw = e.dataTransfer.getData('application/json');
  if (!raw) return;
  const part = JSON.parse(raw);
  const hit = sceneApi.hitTestZone(e.clientX, e.clientY);
  const zone = hit?.userData?.zone;
  const changed = applyPartDrop(state, zone, part);
  if (changed) rerenderBuilder();
});

rerenderBuilder();
