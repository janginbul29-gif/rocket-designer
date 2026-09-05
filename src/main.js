// 진입점: 각 모듈을 연결한다.

import { createDefaultState, toRocketDocument } from './ui/builderState.js';
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

rerenderBuilder();
