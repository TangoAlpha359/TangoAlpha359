import type { DoorDefinition } from "../repo/roomRepo";
import type { Player } from "../Player";

export type DoorRuntime = {
  definition: DoorDefinition;
  left: Phaser.GameObjects.Rectangle;
  right: Phaser.GameObjects.Rectangle;
  isOpen: boolean;
};

export function createSlidingDoors(scene: Phaser.Scene, doors: DoorDefinition[]): DoorRuntime[] {
  return doors.map((door) => {
    const left = scene.add.rectangle(
      door.x + door.width * 0.25,
      door.y + door.height / 2,
      door.width / 2,
      door.height,
      door.accentLeft,
    );
    const right = scene.add.rectangle(
      door.x + door.width * 0.75,
      door.y + door.height / 2,
      door.width / 2,
      door.height,
      door.accentRight,
    );

    left.setStrokeStyle(2, 0x080816);
    right.setStrokeStyle(2, 0x080816);
    scene.add.rectangle(door.x + door.width / 2, door.y + door.height + 12, door.width + 44, 10, 0x73d6ff, 0.9);

    return { definition: door, left, right, isOpen: false };
  });
}

export function updateDoors(scene: Phaser.Scene, player: Player, doors: DoorRuntime[]) {
  for (const door of doors) {
    const distance = Phaser.Math.Distance.Between(
      player.sprite.x,
      player.sprite.y,
      door.definition.triggerX,
      door.definition.triggerY,
    );
    const shouldOpen = distance < 130;

    if (shouldOpen === door.isOpen) continue;
    door.isOpen = shouldOpen;

    scene.tweens.add({
      targets: door.left,
      x: shouldOpen ? door.definition.x : door.definition.x + door.definition.width * 0.25,
      duration: 260,
      ease: "Sine.easeOut",
    });
    scene.tweens.add({
      targets: door.right,
      x: shouldOpen ? door.definition.x + door.definition.width : door.definition.x + door.definition.width * 0.75,
      duration: 260,
      ease: "Sine.easeOut",
    });
  }
}
