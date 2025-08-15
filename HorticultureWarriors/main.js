import { tileSize } from './constants.js';
import { tilesets, playerImg, imageLoaded } from './assets.js';
import { loadMap, movePlayer } from './mapManager.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp': movePlayer(0, -1, canvas, ctx); break;
    case 'ArrowDown': movePlayer(0, 1, canvas, ctx); break;
    case 'ArrowLeft': movePlayer(-1, 0, canvas, ctx); break;
    case 'ArrowRight': movePlayer(1, 0, canvas, ctx); break;
  }
});

async function initialize() {
  await Promise.all([
    imageLoaded(tilesets.tilesetA),
    imageLoaded(tilesets.tilesethouse),
    imageLoaded(tilesets.tilesetinhouse),
    imageLoaded(playerImg)
  ]);
  loadMap('map001', 0, 0, canvas, ctx);
}

initialize();
