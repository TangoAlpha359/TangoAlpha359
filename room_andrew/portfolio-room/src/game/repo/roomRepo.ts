import type { PortfolioModalId, RoomId } from "../events";

export type RoomWall = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type InteractionAction =
  | { type: "openModal"; modal: PortfolioModalId }
  | { type: "navigate"; roomId: RoomId }
  | { type: "openTurbolift" };

export type InteractionPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  accent: number;
  action: InteractionAction;
};

export type NpcTextureKey = "jamaal" | "jonathan" | "kapa";

export type NpcDefinition = {
  name: string;
  textureKey: NpcTextureKey;
  x: number;
  y: number;
  patrol: Phaser.Math.Vector2[];
};

export type DoorDefinition = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  triggerX: number;
  triggerY: number;
  accentLeft: number;
  accentRight: number;
};

export type RoomKind = "ready" | "bridge" | "mess" | "engineering" | "corridor";

export type RoomDefinition = {
  id: RoomId;
  label: string;
  kind: RoomKind;
  width: number;
  height: number;
  playerStart: Phaser.Math.Vector2;
  walls: RoomWall[];
  interactables: InteractionPoint[];
  npcs: NpcDefinition[];
  doors: DoorDefinition[];
};

const baseWalls: RoomWall[] = [
  { x: 0, y: 0, width: 960, height: 28 },
  { x: 0, y: 612, width: 960, height: 28 },
  { x: 0, y: 0, width: 28, height: 640 },
  { x: 932, y: 0, width: 28, height: 640 },
  { x: 120, y: 118, width: 250, height: 24 },
  { x: 590, y: 118, width: 250, height: 24 },
  { x: 120, y: 500, width: 190, height: 24 },
  { x: 650, y: 500, width: 190, height: 24 },
];

const exitDoor = (id: string, x = 432, y = 82): DoorDefinition => ({
  id,
  x,
  y,
  width: 96,
  height: 48,
  triggerX: x + 48,
  triggerY: y + 48,
  accentLeft: 0xb98cff,
  accentRight: 0xff9c39,
});

const npc = (
  name: string,
  textureKey: NpcTextureKey,
  x: number,
  y: number,
  x2: number,
  y2: number,
): NpcDefinition => ({
  name,
  textureKey,
  x,
  y,
  patrol: [new Phaser.Math.Vector2(x, y), new Phaser.Math.Vector2(x2, y2)],
});

const exitToCorridor = (label = "Exit"): InteractionPoint => ({
  id: "exit-corridor",
  label,
  x: 480,
  y: 138,
  width: 150,
  height: 54,
  accent: 0x73d6ff,
  action: { type: "navigate", roomId: "corridor" },
});

const rooms: Record<RoomId, RoomDefinition> = {
  "ready-room": {
    id: "ready-room",
    label: "Ready Room",
    kind: "ready",
    width: 960,
    height: 640,
    playerStart: new Phaser.Math.Vector2(480, 400),
    walls: [...baseWalls, { x: 422, y: 210, width: 116, height: 54 }],
    doors: [exitDoor("ready-room-exit")],
    interactables: [
      {
        id: "about",
        label: "About",
        x: 160,
        y: 205,
        width: 110,
        height: 70,
        accent: 0xff9c39,
        action: { type: "openModal", modal: "about" },
      },
      {
        id: "projects",
        label: "Projects",
        x: 700,
        y: 205,
        width: 130,
        height: 70,
        accent: 0xb98cff,
        action: { type: "openModal", modal: "projects" },
      },
      {
        id: "contact",
        label: "Contact",
        x: 410,
        y: 500,
        width: 140,
        height: 72,
        accent: 0x73d6ff,
        action: { type: "openModal", modal: "contact" },
      },
      exitToCorridor(),
    ],
    npcs: [
      npc("Jamaal", "jamaal", 250, 410, 350, 430),
      npc("Jonathan", "jonathan", 630, 390, 710, 430),
      npc("Kapa", "kapa", 300, 250, 380, 290),
    ],
  },
  bridge: {
    id: "bridge",
    label: "Bridge",
    kind: "bridge",
    width: 960,
    height: 640,
    playerStart: new Phaser.Math.Vector2(480, 430),
    walls: [...baseWalls, { x: 315, y: 175, width: 330, height: 34 }],
    doors: [exitDoor("bridge-exit")],
    interactables: [
      {
        id: "helm",
        label: "Helm",
        x: 360,
        y: 310,
        width: 130,
        height: 70,
        accent: 0xff9c39,
        action: { type: "openModal", modal: "projects" },
      },
      {
        id: "ops",
        label: "Ops",
        x: 600,
        y: 310,
        width: 130,
        height: 70,
        accent: 0xb98cff,
        action: { type: "openModal", modal: "about" },
      },
      exitToCorridor(),
    ],
    npcs: [
      npc("Maya", "kapa", 290, 390, 360, 405),
      npc("Theo", "jonathan", 510, 330, 580, 350),
      npc("Rina", "jamaal", 705, 390, 650, 425),
    ],
  },
  "mess-hall": {
    id: "mess-hall",
    label: "Mess Hall",
    kind: "mess",
    width: 960,
    height: 640,
    playerStart: new Phaser.Math.Vector2(480, 430),
    walls: [...baseWalls],
    doors: [exitDoor("mess-exit")],
    interactables: [
      {
        id: "galley",
        label: "Galley",
        x: 210,
        y: 235,
        width: 140,
        height: 74,
        accent: 0xffd166,
        action: { type: "openModal", modal: "contact" },
      },
      {
        id: "crew-table",
        label: "Crew Table",
        x: 665,
        y: 360,
        width: 150,
        height: 78,
        accent: 0x06d6a0,
        action: { type: "openModal", modal: "about" },
      },
      exitToCorridor(),
    ],
    npcs: [
      npc("Sato", "kapa", 315, 390, 385, 430),
      npc("Imani", "jamaal", 520, 270, 580, 305),
      npc("Reyes", "jonathan", 710, 470, 640, 455),
    ],
  },
  engineering: {
    id: "engineering",
    label: "Engineering",
    kind: "engineering",
    width: 960,
    height: 640,
    playerStart: new Phaser.Math.Vector2(480, 430),
    walls: [...baseWalls, { x: 430, y: 210, width: 100, height: 150 }],
    doors: [exitDoor("engineering-exit")],
    interactables: [
      {
        id: "core",
        label: "Core",
        x: 480,
        y: 300,
        width: 120,
        height: 150,
        accent: 0x73d6ff,
        action: { type: "openModal", modal: "projects" },
      },
      {
        id: "diagnostics",
        label: "Diagnostics",
        x: 760,
        y: 250,
        width: 150,
        height: 72,
        accent: 0xff9c39,
        action: { type: "openModal", modal: "about" },
      },
      exitToCorridor(),
    ],
    npcs: [
      npc("Quinn", "jonathan", 300, 410, 380, 395),
      npc("Vega", "jamaal", 620, 405, 700, 455),
      npc("Lin", "kapa", 760, 470, 705, 505),
    ],
  },
  corridor: {
    id: "corridor",
    label: "Main Corridor",
    kind: "corridor",
    width: 960,
    height: 640,
    playerStart: new Phaser.Math.Vector2(480, 500),
    walls: [
      { x: 0, y: 0, width: 960, height: 28 },
      { x: 0, y: 612, width: 960, height: 28 },
      { x: 0, y: 0, width: 28, height: 640 },
      { x: 932, y: 0, width: 28, height: 640 },
      { x: 110, y: 92, width: 740, height: 28 },
      { x: 110, y: 520, width: 740, height: 28 },
    ],
    doors: [
      {
        ...exitDoor("turbolift", 408, 116),
        width: 144,
        triggerX: 480,
        triggerY: 178,
        accentLeft: 0x73d6ff,
        accentRight: 0xb98cff,
      },
    ],
    interactables: [
      {
        id: "turbolift",
        label: "Turbolift",
        x: 480,
        y: 185,
        width: 175,
        height: 80,
        accent: 0x73d6ff,
        action: { type: "openTurbolift" },
      },
      {
        id: "ready-room-door",
        label: "Ready Room",
        x: 175,
        y: 320,
        width: 150,
        height: 70,
        accent: 0xff9c39,
        action: { type: "navigate", roomId: "ready-room" },
      },
      {
        id: "bridge-door",
        label: "Bridge",
        x: 355,
        y: 320,
        width: 130,
        height: 70,
        accent: 0xb98cff,
        action: { type: "navigate", roomId: "bridge" },
      },
      {
        id: "mess-door",
        label: "Mess Hall",
        x: 550,
        y: 320,
        width: 150,
        height: 70,
        accent: 0x06d6a0,
        action: { type: "navigate", roomId: "mess-hall" },
      },
      {
        id: "engineering-door",
        label: "Engineering",
        x: 755,
        y: 320,
        width: 170,
        height: 70,
        accent: 0xef476f,
        action: { type: "navigate", roomId: "engineering" },
      },
    ],
    npcs: [
      npc("Boatswain Hale", "jonathan", 245, 455, 345, 455),
      npc("Chief Nadir", "jamaal", 500, 425, 590, 455),
      npc("Ensign Mori", "kapa", 710, 455, 640, 425),
    ],
  },
};

export const destinationRooms: Array<{ id: RoomId; label: string }> = [
  { id: "bridge", label: "Bridge" },
  { id: "mess-hall", label: "Mess Hall" },
  { id: "engineering", label: "Engineering" },
  { id: "ready-room", label: "Ready Room" },
];

export function loadRoom(roomId: RoomId = "ready-room"): RoomDefinition {
  return rooms[roomId];
}
