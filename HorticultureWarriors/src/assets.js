// assets.js
export const tilesets = {
    tilesetA: new Image(),
    tilesethouse: new Image(),
    tilesetinhouse: new Image()
};
tilesets.tilesetA.src = "./tilesets/tilesetA.png";
tilesets.tilesethouse.src = "./tilesets/tilesethouse.png";
tilesets.tilesetinhouse.src = "./tilesets/tilesetinhouse.png";

export const playerAnimateImg = new Image();
playerAnimateImg.src = './tilesets/playeranimate.png';

export const playerImg = new Image();
playerImg.src = './tilesets/player.png';

export function imageLoaded(img) {
    return new Promise(resolve => {
        if (img.complete) resolve();
        else img.onload = () => resolve();
    });
}
