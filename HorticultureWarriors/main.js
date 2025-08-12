// game/main.js
import { renderMap } from './js/renderer.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 32;
const tilesPerRow = 4;
const tileset = new Image();
tileset.src = "./tilesets/tilesetA.png";

const playerImg = new Image();
playerImg.src = './tilesets/player.png';

// Globals
let map = [];
let tileLookup = {};
let playerX = 0;
let playerY = 0;
const playerSpeed = 1;

const impassableTiles = new Set([2001, 2002, 2003, 2004]); // Water tiles are blocked


function canMoveTo(x, y) {
  if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) return false;
  const tileCode = map[y][x];
  return !impassableTiles.has(tileCode);
}

async function initialize() {
  try {
    const mapData = await loadMap('./maps/DomainA01/map001.json');
    map = mapData.map;
    tileLookup = mapData.tileLookup;

    await Promise.all([
      imageLoaded(tileset),
      imageLoaded(playerImg),
    ]);

    canvas.width = map[0].length * tileSize;
    canvas.height = map.length * tileSize;

    draw();
  } catch (err) {
    console.error(err);
  }
}

function loadMap(url) {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`Failed to load map JSON: ${res.status}`);
    return res.json();
  });
}

function imageLoaded(img) {
  return new Promise(resolve => {
    if (img.complete) resolve();
    else img.onload = () => resolve();
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderMap(ctx, map, tileLookup, tileset, tileSize, tilesPerRow);
  ctx.drawImage(playerImg, playerX * tileSize, playerY * tileSize, tileSize, tileSize);
}

window.addEventListener('keydown', (e) => {
  let newX = playerX;
  let newY = playerY;

  switch (e.key) {
    case 'ArrowUp': newY -= playerSpeed; break;
    case 'ArrowDown': newY += playerSpeed; break;
    case 'ArrowLeft': newX -= playerSpeed; break;
    case 'ArrowRight': newX += playerSpeed; break;
    default: return; // ignore other keys
  }

  if (canMoveTo(newX, newY)) {
    playerX = newX;
    playerY = newY;
  }

  draw();
});

// Start the game
initialize();
