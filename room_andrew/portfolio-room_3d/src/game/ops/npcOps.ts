import type { NpcDefinition } from "../repo/roomRepo";

export type NpcRuntime = {
  sprite: Phaser.GameObjects.Sprite;
  container: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  route: Phaser.Math.Vector2[];
  targetIndex: number;
  textureKey: string;
};

export function createNpcs(scene: Phaser.Scene, npcs: NpcDefinition[]): NpcRuntime[] {
  return npcs.map((npc) => {
    const sprite = scene.add.sprite(0, 0, npc.textureKey, 0);
    const label = scene.add.text(-34, -44, npc.name, {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#fff2cc",
      backgroundColor: "#080816",
      padding: { x: 5, y: 3 },
    });
    const container = scene.add.container(npc.x, npc.y, [sprite, label]).setDepth(15);
    return { sprite, container, label, route: npc.patrol, targetIndex: 1, textureKey: npc.textureKey };
  });
}

export function updateNpcs(npcs: NpcRuntime[], delta: number) {
  for (const npc of npcs) {
    const target = npc.route[npc.targetIndex];
    const current = new Phaser.Math.Vector2(npc.container.x, npc.container.y);
    const direction = target.clone().subtract(current);

    if (direction.length() < 4) {
      npc.targetIndex = (npc.targetIndex + 1) % npc.route.length;
      continue;
    }

    direction.normalize().scale(0.035 * delta);
    npc.container.x += direction.x;
    npc.container.y += direction.y;
    npc.container.setDepth(npc.container.y);
    npc.label.x = -Math.max(28, npc.label.width / 2);

    const animationDirection = Math.abs(direction.x) > Math.abs(direction.y)
      ? direction.x > 0 ? "right" : "left"
      : direction.y > 0 ? "down" : "up";
    npc.sprite.play(`${npc.textureKey}-${animationDirection}`, true);
  }
}
