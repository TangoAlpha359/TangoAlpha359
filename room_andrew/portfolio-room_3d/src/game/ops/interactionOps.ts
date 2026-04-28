import type { InteractionPoint } from "../repo/roomRepo";
import type { Player } from "../Player";

export type InteractionRuntime = InteractionPoint & {
  zone: Phaser.GameObjects.Zone;
};

export function createInteractables(scene: Phaser.Scene, points: InteractionPoint[]): InteractionRuntime[] {
  return points.map((point) => {
    const consoleBase = scene.add.rectangle(point.x, point.y, point.width, point.height, 0x15122c);
    consoleBase.setStrokeStyle(4, point.accent);
    scene.add.rectangle(point.x - point.width * 0.22, point.y - 14, point.width * 0.38, 12, point.accent);
    scene.add.rectangle(point.x + point.width * 0.22, point.y + 12, point.width * 0.32, 12, 0x73d6ff);
    scene.add.text(point.x - point.width / 2 + 10, point.y - 7, point.label, {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#fff2cc",
      fontStyle: "bold",
    });

    const zone = scene.add.zone(point.x, point.y, point.width + 60, point.height + 60);
    scene.physics.add.existing(zone, true);

    return { ...point, zone };
  });
}

export function findActiveInteraction(player: Player, interactables: InteractionRuntime[]) {
  return interactables.find((item) => {
    const distance = Phaser.Math.Distance.Between(player.sprite.x, player.sprite.y, item.x, item.y);
    return distance < 95;
  });
}
