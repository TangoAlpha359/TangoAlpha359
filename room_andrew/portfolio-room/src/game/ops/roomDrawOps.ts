import type { RoomDefinition } from "../repo/roomRepo";

export function drawRoom(scene: Phaser.Scene, room: RoomDefinition) {
  const floorColor = room.kind === "engineering" ? 0x08141f : room.kind === "mess" ? 0x10111f : 0x080816;
  scene.add.rectangle(room.width / 2, room.height / 2, room.width, room.height, floorColor);

  for (let x = 60; x < room.width; x += 96) {
    scene.add.rectangle(x, 32, 54, 10, 0xff9c39, 0.85);
    scene.add.rectangle(x + 36, 32, 18, 10, 0x73d6ff, 0.85);
  }

  for (let y = 80; y < room.height - 60; y += 80) {
    scene.add.line(0, 0, 52, y, room.width - 52, y, 0x263a66, 0.45).setOrigin(0);
  }

  drawRoomFurnishings(scene, room);

  scene.add.text(46, 55, room.label.toUpperCase(), {
    fontFamily: "Arial",
    fontSize: "18px",
    color: "#ff9c39",
    fontStyle: "bold",
  });
}

function drawRoomFurnishings(scene: Phaser.Scene, room: RoomDefinition) {
  if (room.kind === "ready") {
    scene.add.rectangle(room.width / 2, 320, 360, 210, 0x101d3a, 0.7).setStrokeStyle(4, 0x73d6ff, 0.6);
    scene.add.rectangle(480, 305, 115, 58, 0x172554, 0.95).setStrokeStyle(3, 0xff9c39);
    return;
  }

  if (room.kind === "bridge") {
    scene.add.ellipse(480, 250, 430, 170, 0x101d3a, 0.92).setStrokeStyle(4, 0x73d6ff, 0.6);
    scene.add.rectangle(480, 175, 360, 48, 0x15122c).setStrokeStyle(4, 0xff9c39);
    scene.add.rectangle(360, 310, 145, 70, 0x111827).setStrokeStyle(4, 0xff9c39);
    scene.add.rectangle(600, 310, 145, 70, 0x111827).setStrokeStyle(4, 0xb98cff);
    scene.add.ellipse(480, 420, 155, 70, 0x15122c).setStrokeStyle(4, 0x73d6ff);
    return;
  }

  if (room.kind === "mess") {
    for (const [x, y] of [
      [360, 345],
      [570, 345],
      [465, 455],
    ]) {
      scene.add.rectangle(x, y, 150, 62, 0x15122c).setStrokeStyle(4, 0xffd166);
      scene.add.rectangle(x - 86, y, 18, 46, 0x2b324a);
      scene.add.rectangle(x + 86, y, 18, 46, 0x2b324a);
    }
    scene.add.rectangle(210, 235, 170, 84, 0x111827).setStrokeStyle(4, 0x06d6a0);
    return;
  }

  if (room.kind === "engineering") {
    scene.add.rectangle(480, 300, 120, 165, 0x0b2440).setStrokeStyle(6, 0x73d6ff);
    scene.add.rectangle(480, 300, 54, 190, 0x73d6ff, 0.2);
    scene.add.rectangle(285, 315, 175, 62, 0x15122c).setStrokeStyle(4, 0xff9c39);
    scene.add.rectangle(750, 315, 175, 62, 0x15122c).setStrokeStyle(4, 0xef476f);
    return;
  }

  scene.add.rectangle(480, 320, 770, 255, 0x101d3a, 0.65).setStrokeStyle(4, 0x73d6ff, 0.45);
  scene.add.rectangle(480, 185, 190, 88, 0x111827).setStrokeStyle(5, 0x73d6ff);
  scene.add.text(427, 176, "TURBOLIFT", {
    fontFamily: "Arial",
    fontSize: "14px",
    color: "#fff2cc",
    fontStyle: "bold",
  });
}
