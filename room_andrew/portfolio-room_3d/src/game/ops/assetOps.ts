import { characterAssets } from "../repo/assetRepo";

export function preloadCharacterSprites(scene: Phaser.Scene) {
  for (const asset of characterAssets) {
    scene.load.spritesheet(asset.key, asset.url, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
    });
  }
}

export function createCharacterAnimations(scene: Phaser.Scene) {
  const directions = [
    { name: "down", start: 0, end: 2 },
    { name: "left", start: 3, end: 5 },
    { name: "right", start: 6, end: 8 },
    { name: "up", start: 9, end: 11 },
  ];

  for (const asset of characterAssets) {
    for (const direction of directions) {
      const animationKey = `${asset.key}-${direction.name}`;

      if (scene.anims.exists(animationKey)) continue;

      scene.anims.create({
        key: animationKey,
        frames: scene.anims.generateFrameNumbers(asset.key, {
          start: direction.start,
          end: direction.end,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
