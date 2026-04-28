export class Player {
  public readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private readonly speed = 175;
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "player");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.body.setSize(26, 34);
    this.sprite.body.setOffset(11, 10);
    this.sprite.setFrame(0);
    this.sprite.setDepth(20);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<"up" | "down" | "left" | "right", Phaser.Input.Keyboard.Key>;
  }

  update() {
    const body = this.sprite.body;
    const left = this.cursors.left?.isDown || this.wasd.left.isDown;
    const right = this.cursors.right?.isDown || this.wasd.right.isDown;
    const up = this.cursors.up?.isDown || this.wasd.up.isDown;
    const down = this.cursors.down?.isDown || this.wasd.down.isDown;

    const velocity = new Phaser.Math.Vector2(0, 0);

    if (left) velocity.x -= 1;
    if (right) velocity.x += 1;
    if (up) velocity.y -= 1;
    if (down) velocity.y += 1;

    velocity.normalize().scale(this.speed);
    body.setVelocity(velocity.x, velocity.y);

    if (velocity.lengthSq() === 0) {
      this.sprite.anims.stop();
      return;
    }

    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      this.sprite.play(velocity.x > 0 ? "player-right" : "player-left", true);
    } else {
      this.sprite.play(velocity.y > 0 ? "player-down" : "player-up", true);
    }
  }
}
