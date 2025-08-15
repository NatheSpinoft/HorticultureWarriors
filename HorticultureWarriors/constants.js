export const tileSize = 32;
export const tilesPerRow = 4;

export const impassableTiles = new Set([
  2001, 2002, 2003, 2004,
  4001, 4002, 4003, 4004, 4005, 4006, 4007, 4009, 4010, 4111
]);

export const maps = {
  map001: './maps/DomainA01/map001.json',
  map002: './maps/DomainA01/map002.json',
  map002HA: './maps/DomainA01/map002HA.json',
};

export const transitions = {
  map001: {
    top: { nextMap: 'map002', spawnX: null, spawnY: mapData => mapData.map.length - 1 },
    bottom: { nextMap: 'map002', spawnX: null, spawnY: 0 }
  },
  map002: {
    top: { nextMap: 'map001', spawnX: null, spawnY: mapData => mapData.map.length - 1 },
    bottom: { nextMap: 'map001', spawnX: null, spawnY: 0 }
  }
};

export const specialTransitions = {
  map002: {
    '11,11': { nextMap: 'map002HA', spawnX: 8, spawnY: 13 }
  },
  map002HA: {
    '8,13': { nextMap: 'map002', spawnX: 11, spawnY: 11 }
  }
};
