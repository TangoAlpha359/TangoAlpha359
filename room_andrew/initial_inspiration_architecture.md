# Initial Inspiration Architecture: peteroravec.com

Source reviewed: https://peteroravec.com/  
Review date: 2026-04-28  
Purpose: architectural download and inspiration notes for how the site appears to be built from the public site, delivered HTML, production assets, and the site's own "Under the Hood" section.

## Executive Summary

Peter Oravec's portfolio is not a normal portfolio page dressed up with game-like visuals. It is closer to a browser game with a portfolio UI layered on top.

The core pattern is:

- Angular is the application shell.
- Phaser.js is the interactive game/rendering engine.
- The game world runs in an HTML canvas.
- Angular renders regular DOM UI above the canvas: modals, menus, content panels, map overlays, contact info, CV, projects, and "Under the Hood" notes.
- Static map/content assets are generated and served as JSON/images.
- Heavy or repeated game logic is isolated behind managers, services, entity classes, and Web Workers.
- Deployment appears to be static hosting on Netlify, with hashed Angular bundles and Netlify RUM injected.

The result feels like a hybrid between:

- single-page app
- 2D pixel-art game
- interactive resume
- game map / content exploration system
- static Jamstack site with a highly interactive client runtime

## Publicly Visible Stack

### Frameworks And Libraries

- Angular 19, stated directly in the site's "Under the Hood" section.
- Phaser.js 3, loaded separately as `assets/js/phaser.min.js`.
- Angular production build output:
  - `polyfills-A7F7OIKC.js`
  - `main-RV3Z53H4.js`
  - module preloads for `chunk-RA2FASQA.js` and `chunk-JI7HG47Y.js`
  - global stylesheet `styles-DVTBSD34.css`
- NES.css-style UI components/classes are visible in the DOM through classes like `nes-btn`, `nes-icon`, `is-error`, `is-primary`, and `is-bordered`.
- EasyStar.js is mentioned by the site as the pathfinding library used by NPCs in a Web Worker.
- Tiled is the map editor used for the pixel world.

### Hosting And Delivery

- The site is served by Netlify.
- Response headers include `server: Netlify`.
- The page includes a Netlify RUM script at `/.netlify/scripts/rum`.
- Static assets are fingerprinted where Angular controls the bundle output.
- The home page cache header is `public,max-age=0,must-revalidate`, which is common for HTML entry points on static deployments.
- The asset strategy appears to rely on hashed filenames for long-lived cache safety and immediate HTML freshness.

## High-Level Architecture

```text
Browser
  |
  |-- index.html
  |     |-- critical inline CSS for loading/play screen
  |     |-- SEO/social metadata
  |     |-- structured data JSON-LD
  |     |-- preload hints for critical game and map assets
  |
  |-- Angular app root
  |     |-- app shell
  |     |-- routing / language handling
  |     |-- modal content
  |     |-- overlay UI
  |     |-- minimap / big map DOM
  |     |-- mobile menu / touch controls
  |     |-- communication services
  |
  |-- Phaser runtime
  |     |-- canvas
  |     |-- WebGL or Canvas renderer
  |     |-- game loop
  |     |-- tilemap layers
  |     |-- player
  |     |-- NPCs / cars / monsters / effects
  |     |-- collision and camera
  |
  |-- Web Workers
        |-- pathfinding
        |-- smoke/effect computations, per the site's notes
```

The important architectural move is that Angular and Phaser do not compete for the same rendering layer. Phaser owns the game canvas. Angular owns the HTML overlay. They communicate through services/global callbacks.

## Page Shell

The delivered HTML is a full Angular app bootstrapped into `<app-root>`, but it also includes meaningful static fallback content inside `app-root`.

Notable shell details:

- `<base href="/">` indicates normal Angular client routing.
- `lang="en"` and `dir="ltr"` are set at the document level.
- There is an immediate full-screen `#init-load` loading layer before Angular finishes booting.
- A visually hidden `<h1>` provides an accessible/SEO title even before the app fully initializes.
- The first visible experience is a "Play" start screen, not a conventional landing page.
- The game container includes a canvas that is styled to preserve pixel art rendering.
- The DOM already contains modal sections for content such as:
  - Technologies
  - About
  - Curriculum Vitae
  - collectible/memo cards
  - Contact
  - Big Map
  - Projects
  - Under the Hood

This means much of the portfolio content exists as regular HTML, even though the navigation metaphor is a game world.

## Angular's Role

Angular appears to function as the orchestrating shell rather than the low-level renderer.

Responsibilities:

- Application bootstrapping.
- Route/language shell.
- i18n/localization support.
- DOM-rendered modals.
- Overlay menus and HUD-like UI.
- Modal navigation and scroll behavior.
- Content organization.
- Communication boundary between game events and portfolio content.
- Responsive layout for mobile and desktop.
- Possibly persistent state such as visited points or progress.

### Angular UI Pattern

The UI is conventional DOM, deliberately styled to feel game-native.

Examples:

- Modal windows are regular DOM elements with `visibility: hidden` toggled initially.
- Close buttons are HTML buttons with accessible labels.
- Content panels use pixel-corner framing.
- Buttons use NES-style classes.
- The big map is an HTML image with overlay marker containers.
- Contact links are real anchors.
- Portfolio links are real anchors.

Architectural value: the site gets the expressiveness and accessibility of HTML for content-heavy areas while keeping the fantasy of a game world underneath.

## Phaser's Role

Phaser is the runtime engine for the playable layer.

Responsibilities described by the site:

- HTML5 Canvas rendering.
- WebGL rendering where available.
- Canvas 2D fallback on weaker devices.
- Main game loop, roughly 60 updates per second.
- Tilemap rendering.
- Player movement.
- NPC updates.
- Camera scrolling.
- Collision evaluation.
- Sprite animation.
- Visual effects.
- Input handling for keyboard, mouse, and touch.

This is a strong choice for a pixel-art portfolio because Phaser already solves many problems that would be expensive to build by hand:

- tilemap support
- sprite sheets
- animation timing
- camera movement
- asset loading
- input abstraction
- browser renderer fallback

## Canvas And DOM Layering

The canvas is styled as:

- fixed
- top-left anchored
- pointer events disabled in the visible HTML snapshot
- image-rendering set for crisp/pixelated output
- internally rendered at a small logical size, then scaled up visually

Observed canvas dimensions in the initial HTML:

- internal canvas: `480 x 270`
- CSS display size: `1920 x 1080`

That implies a 16:9 logical render target being scaled to viewport size. This is a classic pixel-art strategy:

- render low resolution
- scale up
- preserve hard edges
- keep game art coherent across displays

Angular overlays sit above the canvas and handle content interaction. The site avoids forcing all text/UI into canvas, which would be harder for accessibility, responsiveness, text selection, links, scrolling, and SEO.

## Content Model

The content is organized around in-world points of interest.

Likely pattern:

- Game markers exist in the tilemap/object layer.
- Player reaches or interacts with a marker.
- Phaser emits an event or calls into Angular.
- Angular opens a corresponding modal.
- Modal content is DOM-rendered, scrollable, and responsive.
- The state of visited markers updates the HUD/map/progress.

Visible content modules:

- `#tech`
- `#about`
- `#cv`
- collectible/memo modals
- `#contact`
- `#big-map`
- `#projects`
- `#under-hood`

Inspiration note: this is a clean way to build an exploratory portfolio without making content retrieval mysterious. The "world" is the navigation layer; the "website" still exists as ordinary sections.

## Map System

The site says the world is designed in Tiled and exported from TMX/XML through a custom build pipeline.

Pipeline described:

```text
Tiled editor
  |
  |-- TMX/XML map
  |
  |-- custom build script
        |-- split map into chunks
        |-- extract collision data
        |-- clean unused tilesets
        |-- generate optimized runtime JSON
        |-- generate object data for markers/routes/zones
  |
  |-- static assets served to browser
```

Observed/preloaded map assets include:

- `assets/maps/final_map_small.json`
- `assets/maps/final_map.json`
- `assets/maps/walls-layer.json`
- `assets/maps/footsteps-layer.json`
- `assets/maps/particle-trajectories.json`
- `assets/maps/big-map.webp`

The map likely has separate data layers for:

- visible terrain/buildings/decorations
- collision/walls
- footstep zones or floor materials
- particles/effects
- object markers
- NPC paths
- dark zones
- crowd zones
- minimap/big map marker positions

## Chunk System

The site emphasizes map chunking as a core performance technique.

Problem:

- A large tilemap with thousands of 16 x 16 tiles can consume memory and GPU resources if fully active at once.

Solution:

- Split the map into square chunks.
- Track camera/player position.
- Load chunks around the player.
- Destroy chunks outside the active radius.
- Destroy associated tile layers/collision data when no longer needed.

This turns the world into a streaming system rather than one giant static tilemap.

Pseudo-flow:

```text
on camera/player movement:
  currentChunk = getChunkFromWorldPosition(player.position)
  neededChunks = getChunksAround(currentChunk, radius)

  for each loadedChunk not in neededChunks:
    destroy tile layers
    remove collision data
    release references

  for each neededChunk not loaded:
    fetch or read chunk JSON
    create tile layers
    register collisions
    attach objects/NPC zones if needed
```

Inspiration note: chunking is useful even if the first version of a similar site is small. Designing the map pipeline around chunks early keeps the content world expandable.

## NPC System

The NPC system appears to be intentionally performance-aware.

Stated behaviors:

- NPCs are culled by viewport.
- Sprites are destroyed when offscreen.
- Sprites are recreated when they re-enter view.
- Cars are composed from multiple visual pieces:
  - body
  - four wheels
  - brake lights
  - blinkers
  - glow effects
- Different NPC types exist:
  - walking people
  - cars
  - ghosts
  - dancers
  - monsters
  - crowds

The key architectural idea is that logical NPC state and visual sprite state are separate.

Likely split:

```text
NPC logical state
  |-- type
  |-- current route
  |-- current waypoint
  |-- speed
  |-- direction
  |-- behavior flags
  |-- persisted even when offscreen

NPC visual state
  |-- Phaser sprite(s)
  |-- animations
  |-- lights/effects
  |-- destroyed/recreated based on camera visibility
```

This lets the world feel alive without paying to render everything all the time.

## Pathfinding And Workers

The site says pathfinding runs in a Web Worker using EasyStar.js.

Why this matters:

- Pathfinding can be CPU-heavy.
- Browser games are sensitive to main-thread jank.
- Angular, Phaser rendering, input, and DOM overlays all rely on the main thread staying responsive.

Worker-friendly responsibilities:

- route calculations
- precomputed path lookup
- smoke/effect computations, per site notes
- maybe collision/path grid preprocessing

Communication pattern likely resembles:

```text
Main thread:
  send route/path request to worker

Worker:
  calculate or retrieve path
  post result back

Game scene:
  apply path to NPC logical state
```

The site's notes say NPC routes are pre-calculated, so the worker may mostly avoid real-time pathfinding during gameplay.

## Asset Strategy

The site is asset-heavy but uses several performance techniques.

Observed asset decisions:

- Critical images are preloaded:
  - `assets/images/peter-oravec.gif`
  - `assets/images/peteroravec-logo.webp`
- Phaser is preloaded with low fetch priority, then loaded after `app-root` so loading UI can render first.
- Game JSON data is preloaded with low priority.
- Images use WebP where possible.
- The HTML mentions PNG fallback in the site's own optimization notes.
- Non-critical images use `loading="lazy"`.
- Pixel-art images use explicit width/height attributes to reduce layout shift.
- Font loading uses preload with an async stylesheet swap.
- A fallback font is declared for `"Press Start 2P"`.

Architectural takeaway: the app gives the first screen a chance to appear before pulling the heavier game runtime into the critical path.

## Loading Experience

There are several loading layers:

- A simple fixed `Loading...` div before Angular boots.
- A branded preloader with animated/bitmap art.
- A progress percentage display.
- A play screen that gates the start of the portfolio/game experience.

This is useful because the site needs to load more than a typical static page:

- Angular bundle
- Phaser runtime
- map data
- sprites
- images
- fonts
- possibly audio/effects

The "Play" gate also helps with browser policies around audio/input and gives the user a clear transition into the interactive mode.

## Responsive And Mobile Behavior

Mobile support appears to be treated as first-class.

Observed and stated techniques:

- `viewport-fit=cover`, with an Android-specific runtime adjustment to `viewport-fit=contain`.
- CSS variables for `devicePixelRatio`.
- CSS variable `--vh` based on `visualViewport.height` / `innerHeight`.
- Use of `100dvh` and `100dvw`.
- Landscape overlay prompting users to rotate their device.
- Touch controls via virtual joystick, per site notes.
- Responsive DOM modals and menus.
- Pixel-art canvas scaling.
- Reduced or adapted UI sizes on narrow screens.

The explicit `--vh` handling is important. Mobile browser chrome can make `100vh` unreliable, especially on iOS/Android. The site updates a CSS variable on resize and visual viewport resize.

## SEO And Accessibility

This site is heavily interactive, but it still includes many traditional web fundamentals.

Observed:

- Descriptive `<title>`.
- Meta description.
- Meta keywords.
- Author metadata.
- Open Graph tags.
- Twitter Card tags.
- Canonical URL.
- `hreflang` alternates for English and Slovak.
- JSON-LD structured data for a Person.
- A hidden H1 in the root.
- Real links for outbound destinations.
- Real buttons for modal controls.
- `aria-label` on close/map buttons.
- Meaningful `alt` text on key images.
- Lazy loading and explicit image dimensions.

Architectural note: content-heavy overlays being real DOM makes SEO/accessibility much more achievable than a canvas-only portfolio.

## Internationalization

The page exposes:

- default English route at `/`
- Slovak alternate at `/sk/`
- `hreflang="en"`
- `hreflang="sk"`
- `hreflang="x-default"`

The Angular bundle includes `$localize`, which suggests Angular i18n/localization tooling or at least Angular localization primitives.

Likely model:

- Angular handles language-specific routes.
- Content strings are compiled or selected by locale.
- Static HTML includes locale alternates for search engines.

## Styling Architecture

The styling appears to combine:

- Angular component-scoped styles.
- Global stylesheet generated by Angular.
- Inline critical CSS in the document head.
- NES.css-like class vocabulary.
- Pixel-art conventions:
  - hard edges
  - crisp image rendering
  - bitmap-style buttons
  - no smooth scaling for sprites
  - decorative pixel frames/corners
  - retro font

Important visual techniques:

- `image-rendering: pixelated`
- `image-rendering: crisp-edges`
- fixed canvas
- DOM overlays
- frame wrappers
- scanline/VHS effects on the big map
- pixel-corner frames
- shadow/text outlines for legibility

## State And Progress

The site includes UI labels such as:

- Info
- Memo
- Visited

There is also a progress gauge in the CSS bundle and map marker containers in the big map modal.

Likely state model:

- Content markers have visited/unvisited status.
- Player progress updates a gauge or completion display.
- Big map markers reflect content types and visited state.
- Some state may live in Angular services.
- Some state may be synchronized from Phaser game events.
- Persistence may use browser storage, though this is inferred rather than confirmed.

## Communication Between Angular And Phaser

The site states that communication happens through Angular services and global callback functions.

Possible event bridge:

```text
Phaser scene detects:
  player overlaps marker
  player presses interaction key
  player opens map
  player visits zone

Phaser calls:
  global callback or injected bridge method

Angular service receives:
  event type
  marker id
  payload

Angular updates:
  modal visibility
  visited state
  minimap/big map UI
  route/language/content state
```

Good boundary principle: Phaser should not directly manage large DOM content; Angular should not micromanage sprite rendering.

## Deployment Shape

The deployment is likely:

```text
Angular build
  |
  |-- dist/browser or static output
        |-- index.html
        |-- main hashed bundle
        |-- polyfills hashed bundle
        |-- chunk bundles
        |-- styles hashed CSS
        |-- assets/
              |-- js/phaser.min.js
              |-- maps/*.json
              |-- maps/*.webp
              |-- images/*
              |-- sprites/tilesets likely
  |
  |-- Netlify static hosting
```

The presence of Netlify RUM suggests either Netlify's observability feature is enabled or injected by the platform.

## What Makes This Site Feel Rich

The architecture works because the game layer and content layer are each used for what they are good at.

Phaser provides:

- motion
- map traversal
- sprite animation
- world atmosphere
- camera feel
- game-like pacing

Angular/HTML provides:

- readable long-form content
- links
- modal layout
- responsive text
- SEO metadata
- accessibility affordances
- app state coordination

The portfolio is not a slideshow of projects. It is a spatial content system.

## Rebuild Blueprint Inspired By This Site

If building a similar experience from scratch, a practical architecture would be:

```text
src/
  app/
    app.component.*
    app.routes.ts
    services/
      game-bridge.service.ts
      modal.service.ts
      progress.service.ts
      i18n.service.ts
    components/
      game-shell/
      hud/
      mini-map/
      big-map-modal/
      modal-frame/
      content-modals/
        about/
        projects/
        contact/
        cv/
        under-the-hood/

  game/
    scenes/
      boot.scene.ts
      preload.scene.ts
      world.scene.ts
    entities/
      player.ts
      npc.ts
      car.ts
      monster.ts
    managers/
      chunk-manager.ts
      npc-manager.ts
      collision-manager.ts
      marker-manager.ts
      asset-manager.ts
      crowd-manager.ts
    systems/
      input-system.ts
      camera-system.ts
      interaction-system.ts
      effects-system.ts
    workers/
      pathfinding.worker.ts
      effects.worker.ts

  tools/
    tiled-build/
      split-map-into-chunks.ts
      extract-collisions.ts
      extract-markers.ts
      optimize-tilesets.ts

assets/
  maps/
    chunks/
    final_map.json
    walls-layer.json
    footsteps-layer.json
    big-map.webp
  sprites/
  tilesets/
  images/
  audio/
```

## Suggested Runtime Flow For A Similar Site

```text
1. Browser loads index.html.
2. Critical CSS shows immediate loading screen.
3. Angular boots.
4. Angular shows branded start/play screen.
5. Phaser script loads.
6. Phaser boot scene loads minimal assets.
7. User presses Play.
8. Game scene starts.
9. Chunk manager loads nearby map chunks.
10. Player explores.
11. Interaction system detects marker overlap.
12. Game bridge emits marker event.
13. Angular opens matching modal.
14. Progress service marks content as visited.
15. HUD/minimap update.
16. Chunks and NPC visuals stream in/out as player moves.
```

## Implementation Notes Worth Borrowing

- Keep long-form content in DOM, not canvas.
- Use Phaser for the world, not for every UI panel.
- Use a bridge service so Angular and Phaser stay decoupled.
- Treat map data as build output, not hand-authored runtime data.
- Use Tiled object layers for marker placement and NPC routes.
- Separate logical entity state from visual sprite state.
- Cull aggressively; recreate visuals when needed.
- Preload only what matters for first interaction.
- Lazy load content images and noncritical assets.
- Use `100dvh` plus a `--vh` fallback for mobile browsers.
- Provide a non-game fallback path where possible through real DOM content.
- Add SEO metadata even if the first screen is playful.
- Make the initial loading state part of the art direction.
- Preserve pixel art with explicit image rendering CSS.
- Use a big map/minimap as both navigation and progress feedback.
- Keep the portfolio navigable even when the game layer is primarily decorative.

## Risks And Complexity

This architecture is impressive, but it carries real complexity.

Main risks:

- Angular and Phaser lifecycle coordination can get messy.
- Memory leaks are easy if sprites, listeners, workers, and chunks are not cleaned up.
- Mobile browser viewport behavior needs constant testing.
- Canvas plus DOM layering can produce pointer-event bugs.
- Pathfinding and NPC systems can become over-engineered for a portfolio.
- SEO can suffer if content only becomes available after game interaction.
- Asset pipelines can become fragile if map editing/build scripts are not documented.
- The playfulness can slow down users who just want contact/projects/CV.

The site mitigates some of this with:

- DOM content already present in the page.
- LinkedIn shortcut on the start screen.
- explicit mobile orientation handling.
- static Netlify deployment.
- chunking and culling.
- worker offloading.

## Questions To Ask Before Building Something Similar

- Is the game world the primary navigation, or a thematic layer around conventional navigation?
- Does every content section need an in-world marker?
- What is the minimum playable map that still feels intentional?
- Can the site degrade gracefully if Phaser fails?
- Should there be a direct menu for users who do not want to explore?
- Which state must persist across sessions?
- How much NPC behavior actually improves the user's understanding of the person/product?
- Can the map pipeline be rebuilt by someone other than the original author?
- How will mobile users navigate without frustration?
- What is the budget for asset creation?

## Architectural Takeaway

The strongest lesson from peteroravec.com is not "make a portfolio as a game." It is more specific:

Use a game engine for spatial atmosphere and interaction, but keep content, accessibility, SEO, and navigation state in a conventional web application layer.

That split is the reason the site can feel playful without abandoning the practical needs of a professional portfolio.
