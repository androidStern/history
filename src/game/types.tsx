import { z } from 'zod'

export const imageAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  x: z.number(),
  y: z.number(),
  zoomFactor: z.number().optional()
})

export type ImageAsset = z.infer<typeof imageAssetSchema>

export const LAYERS = ['bg', 'mid', 'fg'] as const
export type LayerId = (typeof LAYERS)[number]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ITEM_TYPES = ['dialogue', 'image'] as const
export type ItemType = (typeof ITEM_TYPES)[number]

export interface DraggedItem {
  type: ItemType
  id: string
  sceneId: string
  layerId?: string
  index: number
}

export const layerSchema = z.object({
  id: z.enum(LAYERS),
  name: z.string().optional(),
  items: z.array(imageAssetSchema),
  parallaxFactor: z.number().optional()
})

export type Layer = z.infer<typeof layerSchema>

export const choiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  nextSceneId: z.string()
})

export type Choice = z.infer<typeof choiceSchema>

export const dialogueSchema = z.object({
  id: z.string(),
  speaker: z.string(),
  text: z.string()
})

export type Dialogue = z.infer<typeof dialogueSchema>

export const sceneSchema = z.object({
  id: z.string(),
  width: z.number(),
  name: z.string(),
  layers: z.array(layerSchema),
  dialogue: z.array(dialogueSchema),
  choices: z.array(choiceSchema).optional()
})

export type Scene = z.infer<typeof sceneSchema>

export type Segment = Scene & { startX: number; uniqueVisitId: number }

type SpriteRow = {
  name: string
  frames: number
  frameRate: number
}

export type SpriteConfig = {
  imageUrl: string
  rows: SpriteRow[]
  onReady?: () => void
}

export type GameState = {
  scenes: Record<string, Scene>
  snapshot: Record<string, Scene> | null
  name: string
}

export type GameActions = {
  setName: (name: string) => void
  addScene: (name: string) => void
  moveItem: (
    itemType: ItemType,
    sourceSceneId: string,
    targetSceneId: string,
    itemId: string,
    newIndex: number,
    sourceLayerId?: string,
    targetLayerId?: string
  ) => void
  addImage: (sceneId: string, layerId: string, item: Partial<ImageAsset>) => void
  reorderItem: (
    itemType: ItemType,
    sceneId: string,
    oldIndex: number,
    newIndex: number,
    layerId?: string
  ) => void
  deleteItem: (
    itemType: ItemType,
    sceneId: string,
    itemId: string,
    layerId?: string
  ) => void
  update: (
    sceneId: string,
    layerId: string,
    itemId: string,
    newItem: {
      id?: string
      name?: string
      url?: string
      zoomFactor?: number
      x?: number
      y?: number
    }
  ) => void
  updateDialogueText: (sceneId: string, dialogueId: string, newText: string) => void
  upsertDialogue: (
    sceneId: string,
    dialogueId: string,
    newText: string,
    speaker: string
  ) => void
  changeSpeaker: (sceneId: string, dialogueId: string, newSpeaker: string) => void
  addDialogue: (sceneId: string, dialogueItem: Partial<Dialogue>) => Dialogue
  deleteChoice: (sceneId: Scene['id'], choiceId: Choice['id']) => void
  addChoice: (sceneId: Scene['id'], choice: Choice) => void
  getAllSpeakers: () => string[]
  createSnapshot: () => void
  restoreSnapshot: () => void
}

export type AssetState = {
  assetMap: Map<string, string>
}

export type AssetActions = {
  addAsset: (originalUrl: string, dataUrl: string) => void
  resolveUrl: (url: string) => string
  // Load scene data, scanning for any data URLs to preserve
  loadSceneData: (scenes: Record<string, Scene>) => void
  // Export scene data, optionally converting data URLs to file paths
  exportSceneData: (
    scenes: Record<string, Scene>,
    forProduction?: boolean
  ) => Record<string, Scene>
  // Get all stored data URLs for saving to a file
  getStoredAssets: () => Record<string, string>
  uploadFiles: (files: FileList | null) => Promise<void>
}

export type AssetStore = AssetState & AssetActions
