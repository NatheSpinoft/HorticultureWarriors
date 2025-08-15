import { renderMap } from './js/renderer.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const tilesPerRow = 4;

// Load tilesets
const tilesets = {
  tilesetA: new Image(),
  tilesethouse: new Image(),
  tilesetinhouse: new Image()
};
tilesets.tilesetA.src = "./tilesets/tilesetA.png";
tilesets.tilesethouse.src = "./tilesets/tilesethouse.png";
tilesets.tilesetinhouse.src = "./tilesets/tilesetinhouse.png";

const playerImg = new Image();
playerImg.src = './tilesets/player.png';

// Globals
let mapData = null;
let playerX = 0;
let playerY = 0;
const playerSpeed = 1;

// Tiles that block movement
const impassableTiles = new Set([
  2001, 2002, 2003, 2004,
  4001, 4002, 4003, 4004, 4005, 4006, 4007, 4009, 4010
]);

// Maps dictionary
const maps = {
  map001: './maps/DomainA01/map001.json',
  map002: './maps/DomainA01/map002.json',
  map002HA: './maps/DomainA01/map002HA.json',
};
let currentMap = 'map001';

// Edge-based transitions (trigger only on tile 1002)
const transitions = {
  map001: {
    top: { nextMap: 'map002', spawnX: null, spawnY: mapData => mapData.map.length - 1 },
    bottom: { nextMap: 'map002', spawnX: null, spawnY: 0 }
  },
  map002: {
    top: { nextMap: 'map001', spawnX: null, spawnY: mapData => mapData.map.length - 1 },
    bottom: { nextMap: 'map001', spawnX: null, spawnY: 0 }
  }
};

// In-map teleports
const specialTransitions = {
  map002: {
    '11,11': { nextMap: 'map002HA', spawnX: 8, spawnY: 13 } // teleport from 4007
  },
  map002HA: {
    '8,13': { nextMap: 'map002', spawnX: 11, spawnY: 11 }   // teleport from 4109
  }
};

// Helpers
function canMoveTo(x, y) {
  if (!mapData) return false;
  if (y < 0 || y >= mapData.map.length || x < 0 || x >= mapData.map[0].length) return false;
  const tileCode = mapData.map[y][x];
  return !impassableTiles.has(tileCode);
}

function imageLoaded(img) {
  return new Promise(resolve => {
    if (img.complete) resolve();
    else img.onload = () => resolve();
  });
}

// Load a map JSON and set player spawn
async function loadMap(mapName, spawnX = 0, spawnY = 0) {
  const response = await fetch(maps[mapName]);
  if (!response.ok) throw new Error(`Failed to load map JSON: ${response.status}`);
  mapData = await response.json();
  currentMap = mapName;

  playerX = spawnX !== null ? spawnX : 0;
  playerY = typeof spawnY === "function" ? spawnY(mapData) : (spawnY !== null ? spawnY : 0);

  canvas.width = mapData.map[0].length * tileSize;
  canvas.height = mapData.map.length * tileSize;

  draw();
}

// Draw map + player
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderMap(ctx, mapData, tilesets, tileSize, tilesPerRow);
  ctx.drawImage(playerImg, playerX * tileSize, playerY * tileSize, tileSize, tileSize);
}

// Check for in-map and edge transitions
function checkMapTransition() {
  if (!mapData) return;

  const tile = mapData.map[playerY][playerX];
  const coordKey = `${playerX},${playerY}`;

  // 1. In-map teleport
  if (specialTransitions[currentMap]?.[coordKey]) {
    const t = specialTransitions[currentMap][coordKey];
    loadMap(t.nextMap, t.spawnX, t.spawnY);
    return;
  }

  // 2. Edge transitions only on tile 1002
  if (tile === 1002) {
    const mapHeight = mapData.map.length;

    if (playerY === 0 && transitions[currentMap]?.top) {
      const spawnY = typeof transitions[currentMap].top.spawnY === "function"
        ? transitions[currentMap].top.spawnY(mapData)
        : transitions[currentMap].top.spawnY;
      loadMap(transitions[currentMap].top.nextMap, playerX, spawnY);
      return;
    }

    if (playerY === mapHeight - 1 && transitions[currentMap]?.bottom) {
      const spawnY = typeof transitions[currentMap].bottom.spawnY === "function"
        ? transitions[currentMap].bottom.spawnY(mapData)
        : transitions[currentMap].bottom.spawnY;
      loadMap(transitions[currentMap].bottom.nextMap, playerX, spawnY);
      return;
    }
  }
}

// Player movement
window.addEventListener('keydown', (e) => {
  let newX = playerX;
  let newY = playerY;

  switch (e.key) {
    case 'ArrowUp': newY -= playerSpeed; break;
    case 'ArrowDown': newY += playerSpeed; break;
    case 'ArrowLeft': newX -= playerSpeed; break;
    case 'ArrowRight': newX += playerSpeed; break;
    default: return;
  }

  if (canMoveTo(newX, newY)) {
    playerX = newX;
    playerY = newY;
    checkMapTransition();
  }

  draw();
});

// Initialize game
async function initialize() {
  await Promise.all([
    imageLoaded(tilesets.tilesetA),
    imageLoaded(tilesets.tilesethouse),
    imageLoaded(tilesets.tilesetinhouse),
    imageLoaded(playerImg)
  ]);
  loadMap(currentMap);
}

initialize();
