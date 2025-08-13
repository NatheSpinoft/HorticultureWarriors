import { renderMap } from './js/renderer.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const tilesPerRow = 4;

// Load tilesets
const tilesets = {
  tilesetA: new Image(),
  tilesethouse: new Image()
};
tilesets.tilesetA.src = "./tilesets/tilesetA.png";
tilesets.tilesethouse.src = "./tilesets/tilesethouse.png";

const playerImg = new Image();
playerImg.src = './tilesets/player.png';

// Globals
let mapData = null;  // Current map JSON
let playerX = 0;
let playerY = 0;
const playerSpeed = 1;

// Tiles that block movement
const impassableTiles = new Set([2001, 2002, 2003, 2004]);

// Maps dictionary
const maps = {
  map001: './maps/DomainA01/map001.json',
  map002: './maps/DomainA01/map002.json'
};
let currentMap = 'map001';

// Map transition rules
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

// Check if player is on a transition tile at the map edge
function checkMapTransition() {
  if (!mapData) return;
  const tile = mapData.map[playerY][playerX];
  if (tile !== 1002) return;

  const mapHeight = mapData.map.length;
  const mapWidth = mapData.map[0].length;

  // Top edge
  if (playerY === 0 && transitions[currentMap]?.top) {
    loadMap(transitions[currentMap].top.nextMap, playerX, transitions[currentMap].top.spawnY);
    return;
  }

  // Bottom edge
  if (playerY === mapHeight - 1 && transitions[currentMap]?.bottom) {
    loadMap(transitions[currentMap].bottom.nextMap, playerX, transitions[currentMap].bottom.spawnY);
    return;
  }

  // Left/Right edges (optional)
  // Add similar logic here if you want side transitions
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
    imageLoaded(playerImg)
  ]);
  loadMap(currentMap);
}

initialize();
