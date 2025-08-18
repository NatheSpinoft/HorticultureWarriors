// mapManager.js
import { maps, tileSize, tilesPerRow, impassableTiles, transitions, specialTransitions } from './constants.js';
import { renderMap } from './js/renderer.js';
import { tilesets, playerAnimateImg } from './assets.js';

let mapData = null;
let currentMap = 'map001';
let playerX = 0;
let playerY = 0;
let playerDirection = 'down'; // up, down, left, right
let playerFrame = 0;

export function getPlayerPosition() {
    return { playerX, playerY };
}

export function canMoveTo(x, y) {
    if (!mapData) return false;
    if (y < 0 || y >= mapData.map.length || x < 0 || x >= mapData.map[0].length) return false;
    const tileCode = mapData.map[y][x];
    return !impassableTiles.has(tileCode);
}

export async function loadMap(mapName, spawnX = 0, spawnY = 0, canvas, ctx) {
    const response = await fetch(maps[mapName]);
    if (!response.ok) throw new Error(`Failed to load map JSON: ${response.status}`);
    mapData = await response.json();
    currentMap = mapName;
    playerX = spawnX !== null ? spawnX : 0;
    playerY = typeof spawnY === "function" ? spawnY(mapData) : (spawnY !== null ? spawnY : 0);

    canvas.width = mapData.map[0].length * tileSize;
    canvas.height = mapData.map.length * tileSize;

    draw(canvas, ctx);
}

export function draw(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderMap(ctx, mapData, tilesets, tileSize, tilesPerRow);

    // Player animation frame size
    const frameWidth = playerAnimateImg.width / 3; // 3 frames per row
    const frameHeight = playerAnimateImg.height / 4; // 4 directions

    // Map direction to row index
    const dirMap = { down: 0, right: 1, left: 2, up: 3 };
    const row = dirMap[playerDirection];

    ctx.drawImage(
        playerAnimateImg,
        frameWidth * playerFrame, row * frameHeight, // source x, y
        frameWidth, frameHeight,                     // source width, height
        playerX * tileSize, playerY * tileSize,     // canvas x, y
        tileSize, tileSize                           // canvas width, height
    );
}

export function checkMapTransition(canvas, ctx) {
    if (!mapData) return;

    const tile = mapData.map[playerY][playerX];
    const coordKey = `${playerX},${playerY}`;

    if (specialTransitions[currentMap]?.[coordKey]) {
        const t = specialTransitions[currentMap][coordKey];
        loadMap(t.nextMap, t.spawnX, t.spawnY, canvas, ctx);
        return;
    }

    if (tile === 1002) {
        const mapHeight = mapData.map.length;
        if (playerY === 0 && transitions[currentMap]?.top) {
            const spawnY = typeof transitions[currentMap].top.spawnY === "function" ?
                transitions[currentMap].top.spawnY(mapData) : transitions[currentMap].top.spawnY;
            loadMap(transitions[currentMap].top.nextMap, playerX, spawnY, canvas, ctx);
            return;
        }
        if (playerY === mapHeight - 1 && transitions[currentMap]?.bottom) {
            const spawnY = typeof transitions[currentMap].bottom.spawnY === "function" ?
                transitions[currentMap].bottom.spawnY(mapData) : transitions[currentMap].bottom.spawnY;
            loadMap(transitions[currentMap].bottom.nextMap, playerX, spawnY, canvas, ctx);
            return;
        }
    }
}

export function movePlayer(dx, dy, canvas, ctx) {
    const newX = playerX + dx;
    const newY = playerY + dy;

    // Set direction
    if (dx === 1) playerDirection = 'right';
    else if (dx === -1) playerDirection = 'left';
    else if (dy === 1) playerDirection = 'down';
    else if (dy === -1) playerDirection = 'up';

    if (canMoveTo(newX, newY)) {
        playerX = newX;
        playerY = newY;
        playerFrame = (playerFrame + 1) % 3; // cycle through 3 walking frames
        checkMapTransition(canvas, ctx);
    }
    draw(canvas, ctx);
}
