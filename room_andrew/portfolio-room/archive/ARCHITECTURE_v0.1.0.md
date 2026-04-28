# Portfolio Room Architecture

This document describes the current `portfolio-room` prototype and the general process for extending it with new areas, NPCs, interaction types, assets, and actions.

The current MVP is intentionally small but now multi-room: a 2D LCARS-inspired ship interior with a Ready Room, Bridge, Mess Hall, Engineering, and a Main Corridor with a turbolift-style destination selector.

## Current Stack

- Vite for local dev/build tooling.
- React for the website/UI layer.
- Phaser 3 for the interactive 2D world.
- TypeScript across the app.
- CSS in `src/styles.css` for the LCARS-inspired HTML overlay.

## Runtime Shape

```text
React app
  |
  |-- App.tsx
  |     |-- mounts the Phaser game canvas
  |     |-- listens for game events
  |     |-- opens/closes UI modals
  |
  |-- UI components
  |     |-- AboutModal
  |     |-- ProjectsModal
  |     |-- ContactModal
  |     |-- ModalFrame
  |
  |-- Phaser game
        |-- GameCanvas creates/destroys Phaser.Game
        |-- GameScene draws and updates the active room
        |-- Player owns movement controls
        |-- mapLoader provides room definitions
        |-- events bridges Phaser to React
```

The key architectural split is:

- Phaser owns the world: movement, camera, collisions, NPCs, doors, interactable proximity.
- React owns the website content: modals, links, text, layout, HUD.
- `src/game/events.ts` is the bridge between those worlds.

## Important Files

### `src/App.tsx`

The React application shell.

Responsibilities:

- Mounts `<GameCanvas />`.
- Shows the top HUD.
- Tracks `activeModal`.
- Listens for `portfolio:open-modal` browser events.
- Renders `AboutModal`, `ProjectsModal`, or `ContactModal`.
- Closes modals on `Escape`.

### `src/game/GameCanvas.tsx`

The React wrapper around Phaser.

Responsibilities:

- Creates `new Phaser.Game(...)`.
- Points Phaser at the React-owned DOM node.
- Configures renderer, scale mode, physics, and scene list.
- Destroys the Phaser instance when React unmounts.

### `src/game/GameScene.ts`

The current single playable scene.

Responsibilities:

- Loads the room definition from `loadPrototypeRoom()`.
- Sets world/camera bounds.
- Generates temporary character textures.
- Draws the LCARS-inspired room using Phaser primitives.
- Builds collision walls.
- Creates the sliding door.
- Creates interactable consoles.
- Creates NPCs.
- Creates the player.
- Updates player movement, door animation, prompt visibility, NPC patrols, and modal triggers.

### `src/game/Player.ts`

The player controller.

Responsibilities:

- Creates the player sprite.
- Handles WASD and arrow-key input.
- Applies arcade physics velocity.
- Keeps movement normalized so diagonal movement is not faster.

### `src/game/mapLoader.ts`

The current map/data source.

Responsibilities:

- Defines room data types:
  - `RoomWall`
  - `InteractionPoint`
  - `NpcDefinition`
  - `DoorDefinition`
  - `RoomDefinition`
- Provides `loadRoom(roomId)`.
- Defines the available room IDs:
  - `ready-room`
  - `bridge`
  - `mess-hall`
  - `engineering`
  - `corridor`

This file is intentionally shaped like a future loader. Today it returns hard-coded room data. Later it can load/normalize Tiled JSON while preserving the same `RoomDefinition` shape.

The current room model includes:

- `kind`: visual theme for the room.
- `walls`: Arcade Physics collision rectangles.
- `doors`: animated sliding door visuals.
- `interactables`: proximity-triggered consoles, exits, and turbolift controls.
- `npcs`: named ambient characters with patrol routes.

### `src/game/events.ts`

The bridge from Phaser to React.

Responsibilities:

- Defines `PortfolioModalId`.
- Defines `RoomId`.
- Defines `OPEN_PORTFOLIO_MODAL`.
- Defines `OPEN_TURBOLIFT`.
- Defines `NAVIGATE_TO_ROOM`.
- Defines `ROOM_CHANGED`.
- Provides `openPortfolioModal(modal)`.
- Provides `openTurbolift()`.
- Provides `navigateToRoom(roomId)`.
- Provides `announceRoomChanged(roomId, label)`.

Phaser calls `openPortfolioModal("about")`; React hears the event and renders `<AboutModal />`.

React calls `navigateToRoom("bridge")`; Phaser hears the event and restarts the scene with that room loaded.

Phaser calls `openTurbolift()` when the player interacts with the corridor turbolift. React renders a destination selector.

### `src/ui/*`

React modal components.

Responsibilities:

- Hold portfolio content.
- Render accessible DOM dialogs.
- Use `ModalFrame` for consistent LCARS-style framing.
- Keep links and text as normal HTML rather than canvas text.

## Current Game Loop

The current loop is simple:

```text
GameScene.create()
  |
  |-- load active room definition
  |-- set physics/camera bounds
  |-- generate placeholder textures
  |-- draw room
  |-- create walls
  |-- create doors
  |-- create interactables
  |-- create NPCs
  |-- create player
  |-- attach collision
  |-- start camera follow
  |-- create prompt text
  |-- bind E key

GameScene.update()
  |
  |-- update player movement
  |-- update door open/closed state
  |-- update active interaction prompt
  |-- update NPC patrol positions
  |-- if E pressed near active interaction, run the interaction action
```

## Current Locations

### Ready Room

The original portfolio room. It contains:

- About console.
- Projects console.
- Contact console.
- Exit to corridor.
- Jamaal, Jonathan, and Kapa.

### Bridge

Command-center inspired by starship and naval bridge layouts. It contains:

- Forward display / command platform.
- Helm and Ops consoles.
- Exit to corridor.
- Three ambient NPCs: Maya, Theo, Rina.

### Mess Hall

Crew social/dining space inspired by naval mess areas. It contains:

- Tables and seating.
- Galley console.
- Crew table interaction.
- Exit to corridor.
- Three ambient NPCs: Sato, Imani, Reyes.

### Engineering

Systems/engine room. It contains:

- Central core.
- Diagnostic console.
- Exit to corridor.
- Three ambient NPCs: Quinn, Vega, Lin.

### Main Corridor

Transit area connecting the ship. It contains:

- Turbolift interaction.
- Direct doors to Bridge, Mess Hall, Engineering, and Ready Room.
- Three ambient NPCs: Boatswain Hale, Chief Nadir, Ensign Mori.

## Navigation Model

There are now two navigation paths:

- React nav bar: always-visible direct buttons for Bridge, Mess Hall, Engineering, and Ready Room.
- In-world navigation: walk to an exit, go to the corridor, then use the turbolift or corridor doors.

The nav bar calls:

```ts
navigateToRoom("bridge");
```

`GameScene` listens for `NAVIGATE_TO_ROOM` and restarts itself with the selected room:

```ts
this.scene.restart({ roomId: roomEvent.detail.roomId });
```

When a room starts, `GameScene` announces the active room to React:

```ts
announceRoomChanged(room.id, room.label);
```

React uses that event to update the HUD label and active nav state.

## Adding A New Modal Interaction

Example: add a "Resume" console that opens a Resume modal.

### 1. Add The Modal Type

In `src/game/events.ts`, extend the union:

```ts
export type PortfolioModalId = "about" | "projects" | "contact" | "resume";
```

### 2. Add A React Modal

Create `src/ui/ResumeModal.tsx`:

```tsx
import ModalFrame from "./ModalFrame";

type Props = {
  onClose: () => void;
};

export default function ResumeModal({ onClose }: Props) {
  return (
    <ModalFrame title="Resume" eyebrow="Personnel File" onClose={onClose}>
      <p>Add resume highlights here.</p>
    </ModalFrame>
  );
}
```

### 3. Render It In `App.tsx`

Import it:

```ts
import ResumeModal from "./ui/ResumeModal";
```

Render it:

```tsx
{activeModal === "resume" && <ResumeModal onClose={() => setActiveModal(null)} />}
```

### 4. Add The Interactable Console

In `src/game/mapLoader.ts`, add a new item to `interactables`:

```ts
{
  id: "resume",
  label: "Resume",
  x: 560,
  y: 500,
  width: 130,
  height: 72,
  accent: 0xffd166,
}
```

That is enough for the current interaction system. `GameScene` will draw it, detect proximity, show the prompt, and dispatch the modal event.

## Adding A New NPC

The current NPC definition is intentionally simple:

```ts
export type NpcDefinition = {
  name: "Jamaal" | "Jonathan" | "Phil";
  x: number;
  y: number;
  color: number;
  patrol: Phaser.Math.Vector2[];
};
```

The current implementation hardcodes texture lookup by name in `GameScene.createNpcs()`.

### Current Fast Path

To add a fourth named NPC today:

1. Extend the `name` union in `NpcDefinition`.
2. Add the NPC to the `npcs` array in `loadPrototypeRoom()`.
3. Add a generated texture in `createGeneratedTextures()`.
4. Add the name-to-texture entry in `createNpcs()`.

Example:

```ts
export type NpcDefinition = {
  name: "Jamaal" | "Jonathan" | "Phil" | "Tara";
  x: number;
  y: number;
  color: number;
  patrol: Phaser.Math.Vector2[];
};
```

Then add:

```ts
{
  name: "Tara",
  x: 380,
  y: 360,
  color: 0xb98cff,
  patrol: [new Phaser.Math.Vector2(380, 360), new Phaser.Math.Vector2(430, 390)],
}
```

### Better Near-Term Refactor

Before adding many NPCs, update `NpcDefinition` to include `textureKey` and maybe `dialogueId`.

Better type:

```ts
export type NpcDefinition = {
  id: string;
  name: string;
  x: number;
  y: number;
  textureKey: string;
  color: number;
  patrol: Phaser.Math.Vector2[];
  interactionId?: string;
};
```

Then `createNpcs()` can use `npc.textureKey` directly and stop hardcoding names.

## Adding NPC Dialogue

The current NPCs are ambient only; they patrol and show names.

Recommended process:

1. Extend `NpcDefinition` with an interaction field:

```ts
dialogueModal?: PortfolioModalId;
```

2. Add an interaction zone around each NPC, similar to consoles.
3. In `updateInteractionPrompt()`, check both console zones and NPC zones.
4. On `E`, dispatch the matching modal or a new dialogue event.

For simple portfolio content, reuse the existing modal event:

```ts
openPortfolioModal(npc.dialogueModal);
```

For actual dialogue boxes, create a new event:

```ts
export const OPEN_DIALOGUE = "portfolio:open-dialogue";
```

Then React can render a dialogue UI separate from the portfolio modals.

## Adding A New Area

There are two different meanings of "area":

- A new zone inside the current room.
- A new scene/room that the player can enter.

### Add A Zone Inside The Current Room

Use this for small expansions:

- new console cluster
- project station
- hallway corner
- NPC lounge
- transporter pad

Process:

1. Increase `width` and/or `height` in `loadPrototypeRoom()`.
2. Add new `walls`.
3. Add new `interactables`.
4. Add new `npcs`.
5. Update `drawRoom()` so the visuals cover the new space.
6. Check camera bounds still match the room dimensions.

Current camera/world bounds are driven by:

```ts
this.physics.world.setBounds(0, 0, room.width, room.height);
this.cameras.main.setBounds(0, 0, room.width, room.height);
```

So if `room.width` and `room.height` grow, the camera can follow.

### Add A New Room With The Current Data Model

The current preferred path is to add a room entry in `src/game/mapLoader.ts`.

Process:

1. Add the room ID to `RoomId` in `src/game/events.ts`.
2. Add a new entry in the `rooms` record in `mapLoader.ts`.
3. Define:
   - `id`
   - `label`
   - `kind`
   - `width`
   - `height`
   - `playerStart`
   - `walls`
   - `doors`
   - `interactables`
   - `npcs`
4. Add a destination button in `src/App.tsx` if it should appear in the nav/turbolift UI.
5. Add room-specific visuals in `GameScene.drawRoomFurnishings()` if the existing themes are not enough.

Example:

```ts
"science-lab": {
  id: "science-lab",
  label: "Science Lab",
  kind: "engineering",
  width: 960,
  height: 640,
  playerStart: new Phaser.Math.Vector2(480, 430),
  walls: [...baseWalls],
  doors: [exitDoor("science-lab-exit")],
  interactables: [exitToCorridor()],
  npcs: [
    npc("Dr. Vale", "kapa", 300, 390, 360, 420),
    npc("Analyst Roe", "jonathan", 520, 330, 580, 350),
    npc("Chief Ames", "jamaal", 705, 390, 650, 425),
  ],
}
```

### Add A Separate Phaser Scene

Use this when the world wants separate rooms:

- Ready Room
- Engineering
- Project Lab
- Contact Comms Room
- Holodeck

This is no longer necessary for normal rooms. Use it only when a location has very different mechanics.

Recommended process:

1. Create another loader function, such as `loadEngineeringRoom()`.
2. Create a second scene, such as `EngineeringScene.ts`, or refactor `GameScene` to accept a room definition.
3. Add a door/portal interaction in the first room.
4. On entering the portal, call:

```ts
this.scene.start("EngineeringScene");
```

5. Register the new scene in `GameCanvas.tsx`:

```ts
scene: [GameScene, EngineeringScene]
```

Better longer-term approach:

- Build a generic `RoomScene`.
- Pass room IDs through scene data.
- Use `mapLoader` to load the requested room.
- Keep doors as data instead of scene-specific code.

Example future model:

```ts
this.scene.start("RoomScene", {
  roomId: "engineering",
  spawnId: "from-ready-room",
});
```

## Adding A New Interaction Type

The current interaction types are:

- `openModal`
- `navigate`
- `openTurbolift`

Good next interaction types:

- `openModal`
- `changeRoom`
- `openExternalLink`
- `playSound`
- `toggleDoor`
- `startDialogue`
- `collectItem`
- `showProject`

Recommended type shape:

```ts
export type InteractionAction =
  | { type: "openModal"; modal: PortfolioModalId }
  | { type: "navigate"; roomId: RoomId }
  | { type: "openTurbolift" }
  | { type: "openExternalLink"; url: string }
  | { type: "startDialogue"; dialogueId: string };

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
```

Then replace the hardcoded `openPortfolioModal(this.activeInteraction.id)` behavior with an action dispatcher:

```ts
private runInteraction(action: InteractionAction) {
  switch (action.type) {
    case "openModal":
      openPortfolioModal(action.modal);
      break;
    case "changeRoom":
      this.scene.start("RoomScene", action);
      break;
    case "openExternalLink":
      window.open(action.url, "_blank", "noopener,noreferrer");
      break;
    case "startDialogue":
      openDialogue(action.dialogueId);
      break;
  }
}
```

This is the right refactor before adding many special-case objects.

## Adding Assets

The current prototype uses generated Phaser graphics for sprites and room pieces. That keeps the MVP dependency-light.

Suggested asset folders:

```text
src/assets/
  maps/
  sprites/
  tilesets/
  ui/
  audio/
```

Vite can import assets from `src`, or static files can live in `public`.

### Phaser Asset Loading

For Phaser-managed assets, add a preload step.

Current `GameScene` does not have `preload()` yet because all textures are generated in code.

Add:

```ts
preload() {
  this.load.image("player", "/assets/sprites/player.png");
  this.load.image("console-about", "/assets/sprites/console-about.png");
}
```

Then remove the generated texture for that key.

### Public vs Src Assets

Use `public/assets/...` when:

- Phaser should load by URL.
- The file should be served directly.
- Tiled JSON references paths by URL.

Use `src/assets/...` when:

- React imports the asset.
- Vite should fingerprint and bundle it.

For Tiled/Phaser work, `public/assets` is often simpler.

## Moving To Tiled

Current state: `mapLoader.ts` returns hard-coded geometry.

Target state: Tiled creates a JSON map that `mapLoader.ts` normalizes into the same `RoomDefinition` shape.

Recommended Tiled layers:

- `Ground`: visible tile layer.
- `Walls`: collision tile layer or object layer.
- `Interactables`: object layer with custom properties.
- `NPCs`: object layer with name, texture, patrol info.
- `Doors`: object layer with target room/spawn information.
- `Spawns`: object layer for player entry points.

Suggested object properties:

For interactables:

```text
id: about
label: About
actionType: openModal
modal: about
accent: #ff9c39
```

For NPCs:

```text
id: jamaal
name: Jamaal
textureKey: npc-yellow
patrol: 250,410|350,430
dialogueId: jamaal-intro
```

For doors:

```text
id: ready-to-engineering
targetRoom: engineering
targetSpawn: from-ready-room
```

`mapLoader.ts` should become the translation layer:

```text
Tiled JSON
  |
  |-- parse layers
  |-- parse object properties
  |-- normalize into RoomDefinition
  |
GameScene
```

Keep `GameScene` unaware of Tiled's raw schema as much as possible.

## Door System

Current door behavior:

- `mapLoader.ts` defines one `door`.
- `GameScene.createSlidingDoor()` draws two panels.
- `GameScene.updateDoor()` checks player distance to a hardcoded point near the door.
- When the player is close, two tweens slide the panels outward.

This is good enough for the MVP, but the door should become data-driven before adding many doors.

Future door type:

```ts
export type DoorDefinition = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  triggerRadius: number;
  targetRoom?: string;
  targetSpawn?: string;
};
```

Future runtime:

- Store all door panels in an array.
- Track open/closed state per door.
- Trigger animation based on each door's own center/radius.
- Optionally change rooms when the player crosses the doorway.

## Styling And LCARS Direction

The LCARS-inspired style currently lives in:

- Phaser room colors and primitives in `GameScene.ts`.
- React/CSS HUD and modal styling in `src/styles.css`.

Current palette:

- deep navy/black background
- orange `#ff9c39`
- lavender `#b98cff`
- cyan `#73d6ff`
- pink/red `#ef476f`
- warm text `#fff8df`

Guidelines:

- Use large rounded color blocks for the React UI.
- Use dark panels with bright accent rails.
- Keep text readable and ordinary HTML.
- Let Phaser handle atmospheric panels, floor lines, doors, consoles, and character movement.
- Avoid making every element the same color family; LCARS works because the accent blocks vary.

## Current Limitations

- The room is drawn with Phaser primitives, not Tiled.
- NPC names are hardcoded into a texture map.
- Interactions only open modals.
- The sliding door is single-instance and partly hardcoded.
- No sound yet.
- No mobile controls yet.
- No minimap yet.
- No save/progress state yet.
- No real sprite sheets or tile assets yet.

These are acceptable for the first playable milestone.

## Recommended Next Refactors

Before expanding too far, do these in order:

1. Add an `InteractionAction` union so interactables can do more than open modals.
2. Make NPC definitions generic with `id`, `name`, and `textureKey`.
3. Make doors an array and remove hardcoded door coordinates from `updateDoor()`.
4. Add a `preload()` method and move placeholder sprites toward real assets.
5. Introduce a Tiled JSON map while preserving the `RoomDefinition` interface.
6. Split room drawing from room logic if the scene grows.
7. Add a second room only after the first room feels good.

## Development Commands

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev -- --port 5173
```

Build:

```bash
npm run build
```

The Phaser bundle currently triggers a Vite chunk-size warning during build. That is normal for this MVP. Code-splitting Phaser can wait until the prototype has more content.
