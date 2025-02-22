# History - an interactive story (choose your own adventure) builder

## Features

- Drag and drop image assets onto the sidebar "Assets" section. Those images can now be dragged into the game and positioned within a scene.
  - Scenes have 3 layers (foreground, mid, and background). The further back a layer is, the lower its parallax factor is, causing it to move slower and create a sense of depth when transitioning between scenes.
- Add/edit/delete game dialogue from the editor sidebar
- Drag-and-drop images and dialogue between scenes to reorder.
  - Use option+drag to copy.
  - Hovering a dragged dialogue or image item over a collapsed sidebar section will open the section for drop.
- Toggle "Graph Mode" to view and edit the narrative structure as a network. Here you can visually edit the possible paths through the game.
- Hover over an image within the game to reveal a resize handle at the bottom right corner. Drag images within the game to reposition them. Size and position are saved in project state.
- Save/Load/Rename current project (aka the game you're building) via the sidebar footer. The default game is called "History". Try making some changes and saving.
- Project state is exported as json so you can manually edit and explore other configuration options available (the UI doesn't expose everything yet)

... there's more features coming: scene thumbnails in graph-mode, rive interactive vector graphics, ai generated stories, more characters, inline/wysiwyg game editing etc.

## Setup

1. `pnpm i`
2. `pnpm run dev`

## Disclaimer

> Very few best practices being followed as its still a proof of concept and an opportunity for me to try out a lot of new tools (react-dnd, path finding algos, zuztand + immer, sprite animations, etc). So folders/files lack consistent naming conventions, git commits are cryptic nonsense, features are in unintuitive locations. If you look in eslint.config.js you'll see the beginnings of me experimenting with imposing some project organization conventions on myself but I haven't had time to flesh it all out yet. In the future I'd like to enforce cleaner module/feature boundries and do a better job making sure file dependencies flow "up" the tree rather than random util.ts files importing types from component files (lol). I haven't even begun to think about unnecessary renders and data loading yet.
