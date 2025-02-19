import { Layer, Scene, sceneSchema, SpriteConfig } from '@/game/types'
import { toRFEdges, toRFNodes } from '@/stores/useGameStore'
import { Edge, Node } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { z } from 'zod'

const canyonRockPath =
  '/assets/craftpix-net-675652-free-rocks-pixel-art-asset-pack/canyon_rocks/canyon_rock1.png'

const DEFAULT_LAYERS = ['bg', 'mid', 'fg'] as const

const getDefaultLayer = (id: (typeof DEFAULT_LAYERS)[number]): Layer => ({
  id,
  name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter for name
  parallaxFactor: id === 'bg' ? 0.5 : id === 'mid' ? 0.8 : 1.2,
  items: []
})

export const applyDefaults = (scene: Partial<Scene>): Scene => {
  // Ensure all required layers exist with defaults
  const existingLayers = new Set(scene.layers?.map(l => l.id))
  const defaultedLayers = [...(scene.layers || [])]

  for (const layerId of DEFAULT_LAYERS) {
    if (!existingLayers.has(layerId)) {
      defaultedLayers.push(getDefaultLayer(layerId))
    }
  }

  // Sort layers to maintain consistent order
  defaultedLayers.sort((a, b) => {
    const aIndex = DEFAULT_LAYERS.indexOf(a.id as (typeof DEFAULT_LAYERS)[number])
    const bIndex = DEFAULT_LAYERS.indexOf(b.id as (typeof DEFAULT_LAYERS)[number])
    return aIndex - bIndex
  })

  return {
    ...scene,
    id: scene.id || nanoid(),
    name: scene.name || `Scene ${scene.id}`, // Default name if missing
    layers: defaultedLayers,
    dialogue: scene.dialogue || [],
    choices: scene.choices || [],
    width: scene.width || 2000,
    graphX: scene.graphX || 0,
    graphY: scene.graphY || 0
  }
}

const rawScenes: Record<string, Scene> = {
  sceneA: {
    id: 'sceneA',
    name: 'Forest Scene',
    width: 2000,
    graphX: 100,
    graphY: 100,
    layers: [
      {
        id: 'bg',
        parallaxFactor: 0.5,
        items: [{ id: 'bg1', url: canyonRockPath, name: 'Canyon Rock', x: 300, y: 400 }]
      },
      {
        id: 'mid',
        parallaxFactor: 0.8,
        items: [
          {
            id: 'treeCluster2',
            url: '/assets/trees_mid.png',
            name: 'Tree Cluster Mid',
            x: 800,
            y: 50
          }
        ]
      },
      {
        id: 'fg',
        parallaxFactor: 1.2,
        items: [
          {
            id: 'fg1',
            url: '/assets/trees_fg.png',
            name: 'Trees Foreground',
            x: 0,
            y: 0
          },
          { id: 'rock', url: '/assets/rock.png', name: 'Rock', x: 400, y: 200 }
        ]
      }
    ],
    dialogue: [
      {
        id: 'dlg1',
        speaker: 'Narrator',
        text: 'In the hush of the forest, the day begins with mystery.'
      },
      {
        id: 'dlg2',
        speaker: 'Hero',
        text: 'I must gather my courage and step forward.'
      }
    ],
    // The choices array defines interactive options that the player can select.
    choices: [
      {
        id: 'choice1',
        label: 'Follow the winding path',
        nextSceneId: 'sceneB'
      },
      {
        id: 'choice2',
        label: 'Climb the ancient tree',
        nextSceneId: 'sceneC'
      }
    ]
  },
  sceneB: {
    id: 'sceneB',
    name: 'Desert Scene',
    width: 2200,
    graphX: 200,
    graphY: 200,
    layers: [
      {
        id: 'bg',
        parallaxFactor: 0.5,
        items: [
          {
            id: 'bg-1',
            url: '/assets/desert_bg.png',
            name: 'Desert Background',
            x: 250,
            y: 0
          }
        ]
      },
      {
        id: 'fg',
        parallaxFactor: 1.2,
        items: [
          {
            id: 'fg-1',
            url: '/assets/desert_fg.png',
            name: 'Desert Foreground',
            x: 450,
            y: 0
          }
        ]
      }
    ],
    dialogue: [
      {
        id: 'dlg3',
        speaker: 'Narrator',
        text: 'The desert reveals a harsh beauty under the blazing sun.'
      }
    ],
    choices: [
      {
        id: 'choice1',
        label: 'Return to the forest',
        nextSceneId: 'sceneA'
      }
    ]
  }
}

export type GameData = {
  scenes: Record<string, Scene>
  heroConfig?: SpriteConfig
  name: string
  assetMap?: Map<string, string>
  nodes: Node[]
  edges: Edge[]
}

export const loadGameData = (): GameData => {
  const processedScenes: Record<string, Scene> = {}

  for (const [sceneId, scene] of Object.entries(rawScenes)) {
    processedScenes[sceneId] = applyDefaults(scene)
  }

  return {
    scenes: processedScenes,
    heroConfig,
    name: 'History',
    nodes: toRFNodes(processedScenes),
    edges: toRFEdges(processedScenes)
  }
}

export const gameConfigSchema = z.object({
  scenes: z.record(z.string(), sceneSchema),
  heroConfig: z.object({}).passthrough().optional(),
  name: z.string(),
  assetMap: z.record(z.string(), z.string())
})

export type GameConfig = z.infer<typeof gameConfigSchema>

const frameRate = 20
export const heroConfig: SpriteConfig = {
  imageUrl: '/assets/universal-lpc-sprite_male_01_full.png',
  rows: [
    { name: 'faceAwayDance', frames: 7, frameRate },
    { name: 'faceLeftDance', frames: 7, frameRate },
    { name: 'faceForwardDance', frames: 7, frameRate },
    { name: 'faceRightDance', frames: 7, frameRate },
    // posing
    { name: 'poseAway', frames: 8, frameRate },
    { name: 'poseLeft', frames: 8, frameRate },
    { name: 'poseForward', frames: 8, frameRate },
    { name: 'poseRight', frames: 8, frameRate },
    // walking
    { name: 'walkAway', frames: 9, frameRate },
    { name: 'walkLeft', frames: 9, frameRate },
    { name: 'walkForward', frames: 9, frameRate },
    { name: 'walkRight', frames: 9, frameRate },
    // alt pose
    { name: 'altPoseAway', frames: 6, frameRate },
    { name: 'altPoseLeft', frames: 6, frameRate },
    { name: 'altPoseForward', frames: 6, frameRate },
    { name: 'altPoseRight', frames: 6, frameRate },
    // fight pose
    { name: 'fightPoseAway', frames: 13, frameRate },
    { name: 'fightPoseLeft', frames: 13, frameRate },
    { name: 'fightPoseForward', frames: 13, frameRate },
    { name: 'fightPoseRight', frames: 13, frameRate },
    // falling
    { name: 'falling', frames: 6, frameRate }
  ]
}
