# Portfolio Room Architecture

This document describes the current `portfolio-room` prototype after adapting the project toward the Rootstock-inspired architecture approach.

The app is a React + Phaser 3 interactive portfolio set inside a small starship/naval-vessel-inspired environment. It currently includes:

- Ready Room
- Bridge
- Mess Hall
- Engineering
- Main Corridor
- Turbolift-style destination selector
- React nav bar for direct travel
- Phaser world for movement, doors, NPCs, and proximity interactions
- React DOM layer for HUD, nav, modal content, and destination UI

The previous architecture document was archived at:

```text
archive/ARCHITECTURE_v0.1.0.md
```

## Current Stack

- Vite for dev/build tooling.
- React for the website/UI layer.
- Phaser 3 for the playable world.
- TypeScript across app, game, data, and orchestration modules.
- CSS in `src/styles.css` for LCARS-inspired HTML UI.
- Static PNG spritesheets in `public/assets/sprites`.

## Architectural Philosophy

This project now borrows the Rootstock principle of strict responsibility boundaries, adapted for a frontend game/site rather than a backend service.

Rootstock uses:

```text
Handler -> Flow -> Ops -> Repo
```

This project maps that to:

```text
React UI / Phaser input -> Flows -> Ops -> Repo
```

The goal is to keep `GameScene` from becoming a giant file that owns every behavior. The scene now composes smaller modules:

- Repo modules hold data and asset manifests.
- Ops modules perform reusable game operations.
- Flow modules orchestrate higher-level application actions.
- React remains the DOM UI handler.
- Phaser remains the realtime world handler.

## Runtime Shape

```text
React app
  |
  |-- App.tsx
  |     |-- HUD
  |     |-- nav bar
  |     |-- modal content
  |     |-- turbolift selector
  |     |-- browser event listeners
  |
  |-- Phaser canvas
        |
        |-- GameCanvas.tsx
        |     |-- creates/destroys Phaser.Game
        |
        |-- GameScene.ts
              |-- scene lifecycle
              |-- world composition
              |-- delegates to flows/ops/repo
```

## Layer Map

### Handler Layer

Handlers are boundaries where input enters the app.

Current handlers:

- `src/App.tsx`
  - React nav buttons
  - modal close buttons
  - turbolift destination buttons
  - DOM event listeners
- `src/game/GameScene.ts`
  - Phaser scene lifecycle
  - keyboard interaction check
  - prompt update call
- `src/game/Player.ts`
  - WASD / arrow-key movement input

Handlers should:

- translate UI/input events into flows or ops
- avoid owning room data
- avoid owning low-level reusable game logic

### Flow Layer

Flows orchestrate higher-level app behavior.

Current flow modules:

```text
src/game/flows/
  interactionFlow.ts
  roomFlow.ts
```

`interactionFlow.ts` owns what happens when an interaction action runs:

- `openModal`
- `navigate`
- `openTurbolift`

`roomFlow.ts` owns room-level orchestration:

- loading the active room from the repo
- announcing active room changes to React
- binding browser navigation events to Phaser scene restarts

Flows should:

- coordinate actions across layers
- call ops or repo modules
- dispatch events when React and Phaser need to communicate
- avoid rendering details

### Ops Layer

Ops modules contain reusable, deterministic-ish game behavior.

Current ops modules:

```text
src/game/ops/
  assetOps.ts
  doorOps.ts
  interactionOps.ts
  npcOps.ts
  roomDrawOps.ts
```

Responsibilities:

- `assetOps.ts`
  - preload character spritesheets
  - create directional animations
- `doorOps.ts`
  - create sliding door runtime objects
  - update door open/close tweens
- `interactionOps.ts`
  - create interactable consoles/zones
  - find the active nearby interaction
- `npcOps.ts`
  - create NPC runtime objects
  - update NPC patrol movement and animations
- `roomDrawOps.ts`
  - draw room backgrounds and furnishings

Ops should:

- stay reusable
- avoid React knowledge
- avoid hardcoded application state where possible
- avoid data fetching

### Repo Layer

Repo modules isolate static data, asset manifests, and future infrastructure access.

Current repo modules:

```text
src/game/repo/
  assetRepo.ts
  roomRepo.ts
```

Responsibilities:

- `assetRepo.ts`
  - describes character sprite assets
  - provides keys, URLs, and frame sizes
- `roomRepo.ts`
  - defines room and interaction data types
  - stores current hard-coded room graph
  - exposes `loadRoom(roomId)`

Repos should:

- expose clean interfaces
- isolate data shape changes
- become the bridge to Tiled JSON, APIs, or a graph database later
- avoid UI behavior and Phaser scene lifecycle concerns

## Current File Layout

```text
src/
  App.tsx
  main.tsx
  styles.css

  ui/
    AboutModal.tsx
    ContactModal.tsx
    ModalFrame.tsx
    ProjectsModal.tsx

  game/
    GameCanvas.tsx
    GameScene.ts
    Player.ts
    events.ts
    mapLoader.ts

    flows/
      interactionFlow.ts
      roomFlow.ts

    ops/
      assetOps.ts
      doorOps.ts
      interactionOps.ts
      npcOps.ts
      roomDrawOps.ts

    repo/
      assetRepo.ts
      roomRepo.ts
```

`mapLoader.ts` currently re-exports `repo/roomRepo.ts` as a compatibility shim. New code should import from `repo/roomRepo.ts` directly.

## Event Bridge

`src/game/events.ts` is the explicit boundary between React and Phaser.

Events:

- `OPEN_PORTFOLIO_MODAL`
- `OPEN_TURBOLIFT`
- `NAVIGATE_TO_ROOM`
- `ROOM_CHANGED`

Functions:

- `openPortfolioModal(modal)`
- `openTurbolift()`
- `navigateToRoom(roomId)`
- `announceRoomChanged(roomId, label)`

Examples:

```ts
navigateToRoom("bridge");
```

```ts
announceRoomChanged(room.id, room.label);
```

This event bridge keeps React from importing Phaser internals and keeps Phaser from rendering DOM UI.

## Current Room Model

Room data lives in `src/game/repo/roomRepo.ts`.

Each room has:

- `id`
- `label`
- `kind`
- `width`
- `height`
- `playerStart`
- `walls`
- `interactables`
- `npcs`
- `doors`

Current room IDs:

- `ready-room`
- `bridge`
- `mess-hall`
- `engineering`
- `corridor`

Current interaction actions:

```ts
type InteractionAction =
  | { type: "openModal"; modal: PortfolioModalId }
  | { type: "navigate"; roomId: RoomId }
  | { type: "openTurbolift" };
```

## Current Locations

### Ready Room

The original portfolio room.

Contains:

- About console
- Projects console
- Contact console
- Exit to corridor
- Jamaal, Jonathan, and Kapa

### Bridge

Command room inspired by starship bridges and naval command centers.

Contains:

- Forward display
- Helm console
- Ops console
- Exit to corridor
- Maya, Theo, and Rina

### Mess Hall

Crew dining/social space inspired by naval mess areas.

Contains:

- Tables and seating
- Galley interaction
- Crew table interaction
- Exit to corridor
- Sato, Imani, and Reyes

### Engineering

Systems room inspired by engine rooms and starship engineering decks.

Contains:

- Central core
- Diagnostic console
- Exit to corridor
- Quinn, Vega, and Lin

### Main Corridor

Transit space connecting the ship.

Contains:

- Turbolift interaction
- Direct doors to Bridge, Mess Hall, Engineering, and Ready Room
- Boatswain Hale, Chief Nadir, and Ensign Mori

## Future Graph Database Compatibility

The current room model is already close to graph-shaped data.

Future graph concepts:

```text
(:Room)
(:Npc)
(:Interaction)
(:Asset)
(:Door)
(:PortfolioContent)

(:Room)-[:CONNECTS_TO]->(:Room)
(:Room)-[:HAS_NPC]->(:Npc)
(:Room)-[:HAS_INTERACTION]->(:Interaction)
(:Interaction)-[:OPENS]->(:PortfolioContent)
(:Npc)-[:USES_ASSET]->(:Asset)
(:Door)-[:LEADS_TO]->(:Room)
```

The current `roomRepo.ts` can later become an adapter over:

- a graph database API
- a local graph-shaped JSON file
- Tiled object layers
- a hybrid of authored Tiled geometry plus graph-backed content metadata

Recommended future repo interface:

```ts
export type RoomGraphRepo = {
  getRoom(roomId: RoomId): Promise<RoomDefinition>;
  getAdjacentRooms(roomId: RoomId): Promise<Array<{ id: RoomId; label: string }>>;
  getRoomNpcs(roomId: RoomId): Promise<NpcDefinition[]>;
  getRoomInteractions(roomId: RoomId): Promise<InteractionPoint[]>;
};
```

For now `loadRoom(roomId)` is synchronous because all data is local. When graph-backed data arrives, `roomFlow.ts` should become the async orchestration layer while `GameScene` stays mostly unchanged.

## Adding A New Room

1. Add the room ID to `RoomId` in `src/game/events.ts`.
2. Add a new room definition in `src/game/repo/roomRepo.ts`.
3. Add nav/turbolift destination entries in `src/App.tsx` if the room should be directly selectable.
4. Add new visual treatment in `roomDrawOps.ts` if the existing `kind` themes are insufficient.
5. Run `npm run build`.

## Adding A New Interaction Type

1. Add a new variant to `InteractionAction` in `roomRepo.ts`.
2. Handle that variant in `flows/interactionFlow.ts`.
3. Keep low-level reusable behavior in an ops module if the action does real game work.
4. Keep DOM rendering in React if the action opens UI.

Example future action:

```ts
| { type: "startDialogue"; dialogueId: string }
```

Then `interactionFlow.ts` could dispatch an `OPEN_DIALOGUE` event for React.

## Adding New NPCs

1. Add or reuse a spritesheet asset in `public/assets/sprites`.
2. Register the asset in `src/game/repo/assetRepo.ts`.
3. Add the NPC to the room's `npcs` array in `roomRepo.ts`.
4. If the asset key is new, extend `NpcTextureKey`.

The NPC runtime behavior is in `ops/npcOps.ts`, so adding NPC data should not require editing `GameScene.ts`.

## Adding New Assets

Character sprites:

```text
public/assets/sprites/
  player.png
  jamaal.png
  jonathan.png
  kapa.png
```

Sprite generation script:

```text
scripts/generate-sprites.mjs
```

After changing generated sprite definitions, run:

```bash
node scripts/generate-sprites.mjs
```

Then build:

```bash
npm run build
```

## Development Commands

Install:

```bash
npm install
```

Run:

```bash
npm run dev -- --port 5173
```

Build:

```bash
npm run build
```

The Phaser bundle still triggers a Vite chunk-size warning. That is expected for now. Code-splitting Phaser is a later optimization.

## Next Architecture Steps

Good next moves:

- Move nav destination data out of `App.tsx` and into a small UI repo/config module.
- Add a `dialogueFlow.ts` before giving NPCs conversations.
- Add a `graphRoomRepo.ts` adapter once a graph database/API exists.
- Make `roomFlow.ts` async-ready before introducing remote room/content data.
- Split `roomDrawOps.ts` by room kind if visual complexity grows.
- Add Playwright smoke tests for nav buttons and turbolift routing.
