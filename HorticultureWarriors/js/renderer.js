export function renderMap(ctx, mapData, tilesets, tileSize, tilesPerRow) {
  const map = mapData.map;
  const tileLookup = mapData.tileLookup;

  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const code = map[row][col];
      const tileData = tileLookup[code];

      if (!tileData) continue; // Skip unmapped tiles

      const tileset = tilesets[tileData.tileset]; // Choose tileset per tile
      const tileIndex = tileData.index;

      const sx = (tileIndex % tilesPerRow) * tileSize;
      const sy = Math.floor(tileIndex / tilesPerRow) * tileSize;

      ctx.drawImage(
        tileset,
        sx, sy, tileSize, tileSize,
        col * tileSize, row * tileSize, tileSize, tileSize
      );
    }
  }
}
