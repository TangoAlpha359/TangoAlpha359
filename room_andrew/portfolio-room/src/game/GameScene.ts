import { runInteractionAction } from "./flows/interactionFlow";
import { bindRoomNavigation, loadActiveRoom } from "./flows/roomFlow";
import { createCharacterAnimations, preloadCharacterSprites } from "./ops/assetOps";
import { createSlidingDoors, updateDoors, type DoorRuntime } from "./ops/doorOps";
import { createInteractables, findActiveInteraction, type InteractionRuntime } from "./ops/interactionOps";
import { createNpcs, updateNpcs, type NpcRuntime } from "./ops/npcOps";
import { drawRoom } from "./ops/roomDrawOps";
import type { RoomId } from "./events";
import { Player } from "./Player";

export class GameScene extends Phaser.Scene {
  private player?: Player;
  private interactables: InteractionRuntime[] = [];
  private interactPrompt?: Phaser.GameObjects.Text;
  private activeInteraction?: InteractionRuntime;
  private eKey?: Phaser.Input.Keyboard.Key;
  private npcs: NpcRuntime[] = [];
  private doors: DoorRuntime[] = [];
  private roomId: RoomId = "ready-room";

  constructor() {
    super("GameScene");
  }

  init(data?: { roomId?: RoomId }) {
    this.roomId = data?.roomId ?? "ready-room";
  }

  preload() {
    preloadCharacterSprites(this);
  }

  create() {
    const room = loadActiveRoom(this.roomId);
    bindRoomNavigation(this);

    this.physics.world.setBounds(0, 0, room.width, room.height);
    this.cameras.main.setBounds(0, 0, room.width, room.height);
    this.cameras.main.setZoom(1.2);

    createCharacterAnimations(this);
    drawRoom(this, room);

    const walls = this.physics.add.staticGroup();
    for (const wall of room.walls) {
      const rect = this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2,
        wall.width,
        wall.height,
        0x15122c,
      );
      rect.setStrokeStyle(2, 0xff9c39);
      walls.add(rect);
    }

    this.doors = createSlidingDoors(this, room.doors);
    this.interactables = createInteractables(this, room.interactables);
    this.npcs = createNpcs(this, room.npcs);

    this.player = new Player(this, room.playerStart.x, room.playerStart.y);
    this.physics.add.collider(this.player.sprite, walls);

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.interactPrompt = this.add
      .text(0, 0, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#ffe6a7",
        backgroundColor: "#15122c",
        padding: { x: 10, y: 6 },
      })
      .setDepth(100)
      .setVisible(false);

    this.eKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  update(_: number, delta: number) {
    if (!this.player) return;

    this.player.update();
    updateDoors(this, this.player, this.doors);
    this.updateInteractionPrompt();
    updateNpcs(this.npcs, delta);

    if (this.activeInteraction && this.eKey && Phaser.Input.Keyboard.JustDown(this.eKey)) {
      runInteractionAction(this.activeInteraction.action);
    }
  }

  private updateInteractionPrompt() {
    if (!this.player || !this.interactPrompt) return;

    this.activeInteraction = findActiveInteraction(this.player, this.interactables);

    if (!this.activeInteraction) {
      this.interactPrompt.setVisible(false);
      return;
    }

    this.interactPrompt
      .setText(`Press E: ${this.activeInteraction.label}`)
      .setPosition(this.player.sprite.x - 58, this.player.sprite.y - 58)
      .setVisible(true);
  }
}
