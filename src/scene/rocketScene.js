// Three.js 3D 장면: 조명, 바닥, 궤도 카메라, 조립 결과 메쉬 렌더링.
// Three.js는 이 폴더에서만 import한다 (ARCHITECTURE.md 3절).

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { computeLayout } from './layout.js';

const COLOR_BY_TYPE = {
  engine: 0x888888,
  tank: 0xd8dde3,
  payload: 0xffb703,
  fairing: 0xcfd8e3,
  decoupler: 0x555555,
  landing_legs: 0x3a3a3a,
  booster_attach: 0x6b7280,
};

function meshFor(item) {
  const [w, h, d] = item.size;
  let geometry;
  if (item.type === 'tank' || item.type === 'engine') {
    geometry = new THREE.CylinderGeometry(w / 2, w / 2, h, 24);
  } else if (item.type === 'fairing') {
    geometry = new THREE.ConeGeometry(w / 2, h, 24);
  } else if (item.type === 'landing_legs') {
    geometry = new THREE.CylinderGeometry(w / 2, w / 2 * 1.3, h, 8, 1, true);
  } else if (item.type === 'booster_attach') {
    geometry = new THREE.CylinderGeometry(w / 2, w / 2, h, 8);
  } else {
    geometry = new THREE.BoxGeometry(w, h, d);
  }
  const material = new THREE.MeshStandardMaterial({
    color: COLOR_BY_TYPE[item.type] ?? 0x999999,
    metalness: 0.2,
    roughness: 0.6,
    transparent: item.type === 'fairing' || item.type === 'landing_legs',
    opacity: item.type === 'fairing' ? 0.55 : item.type === 'landing_legs' ? 0.85 : 1,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...item.position);
  mesh.rotation.set(
    THREE.MathUtils.degToRad(item.rotation[0]),
    THREE.MathUtils.degToRad(item.rotation[1]),
    THREE.MathUtils.degToRad(item.rotation[2]),
  );
  return mesh;
}

export function createRocketScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e1420);
  scene.fog = new THREE.Fog(0x0e1420, 120, 400);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(45, 35, 45);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 20, 0);
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x1a1a1a, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(60, 90, 40);
  scene.add(sun);

  const grid = new THREE.GridHelper(160, 32, 0x2a3448, 0x1a2233);
  scene.add(grid);

  const rocketGroup = new THREE.Group();
  scene.add(rocketGroup);

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function rebuild(state) {
    while (rocketGroup.children.length) {
      const child = rocketGroup.children.pop();
      child.geometry.dispose();
      child.material.dispose();
    }
    const { items, totalHeight } = computeLayout(state);
    for (const item of items) rocketGroup.add(meshFor(item));
    controls.target.set(0, Math.max(totalHeight / 2, 1), 0);
    return { items, totalHeight };
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    resize();
    renderer.render(scene, camera);
  }

  resize();
  animate();

  return { scene, camera, renderer, controls, rebuild, resize };
}
