// game/js/renderer.js
const tilesPerRow = 4;
export function renderMap(ctx, map, tileLookup, tileset, tileSize, tilesPerRow) {
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      let code = map[row][col];
      let tileIndex = tileLookup[code];

      if (tileIndex === undefined) continue; // skip if no mapping

      let sx = (tileIndex % tilesPerRow) * tileSize;
      let sy = Math.floor(tileIndex / tilesPerRow) * tileSize;

      ctx.drawImage(
        tileset,
        sx, sy, tileSize, tileSize,
        col * tileSize, row * tileSize, tileSize, tileSize
      );
    }
  }
}