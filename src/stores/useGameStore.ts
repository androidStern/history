import { applyDefaults, loadGameData } from '@/game/gameData'
import { Dialogue, ImageAsset, Scene } from '@/game/types'
import { nanoid } from 'nanoid'
import { createContext, useContext } from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export const ITEM_TYPES = ['dialogue', 'image'] as const
export type ItemType = (typeof ITEM_TYPES)[number]

export interface DraggedItem {
  type: ItemType
  id: string
  sceneId: string
  layerId?: string
  index: number
}

type GameState = {
  scenes: Record<string, Scene>
  snapshot: Record<string, Scene> | null
}
type GameActions = {
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
  getAllSpeakers: () => string[]
  createSnapshot: () => void
  restoreSnapshot: () => void
}

export const useGameStore = create<GameState & GameActions>()(
  immer((set, get) => ({
    scenes: loadGameData(),
    snapshot: null,
    addScene: (name: string) => {
      set(state => {
        const newSceneId = nanoid()
        state.scenes[newSceneId] = applyDefaults({
          id: newSceneId,
          name,
        })
      })
    },
    update: (sceneId, layerId, itemId, newItem) => {
      set(state => {
        const layer = state.scenes[sceneId]?.layers.find(l => l.id === layerId)
        if (!layer) return

        const item = layer.items.find(i => i.id === itemId)
        if (item) {
          // Update existing item
          Object.assign(item, newItem)
        } else if (newItem.url) {
          // Add new item
          layer.items.push({
            name: newItem.name || '',
            id: newItem.id || nanoid(),
            x: newItem.x ?? 0,
            y: newItem.y ?? 0,
            zoomFactor: newItem.zoomFactor ?? 1,
            url: newItem.url
          })
        }
      })
    },
    moveItem: (
      itemType,
      sourceSceneId,
      targetSceneId,
      itemId,
      newIndex,
      sourceLayerId,
      targetLayerId
    ) =>
      set(state => {
        const sourceScene = state.scenes[sourceSceneId]
        const targetScene = state.scenes[targetSceneId]
        if (!sourceScene || !targetScene) {
          return state
        }

        if (itemType === 'dialogue') {
          const itemIndex = sourceScene.dialogue.findIndex(d => d.id === itemId)
          if (itemIndex === -1) {
            return state
          }
          const [item] = sourceScene.dialogue.splice(itemIndex, 1)
          targetScene.dialogue.splice(newIndex, 0, item)
        } else if (itemType === 'image') {
          const sourceLayer = sourceScene.layers.find(l => l.id === sourceLayerId)
          const targetLayer = targetScene.layers.find(l => l.id === targetLayerId)

          if (!sourceLayer || !targetLayer) {
            return state
          }

          const itemIndex = sourceLayer.items.findIndex(i => i.id === itemId)
          if (itemIndex === -1) {
            return state
          }

          const [item] = sourceLayer.items.splice(itemIndex, 1)

          if (targetLayer.items.length === 0) {
            targetLayer.items.push(item)
          } else {
            targetLayer.items.splice(newIndex, 0, item)
          }
        }
      }),
    addImage: (sceneId: string, layerId: string, newItem: Partial<ImageAsset>) => {
      set(state => {
        if (!newItem.url) return

        const scene = state.scenes[sceneId]
        if (!scene) return
        const layer = scene.layers.find(l => l.id === layerId)
        if (!layer) return

        const completeItem: ImageAsset = {
          id: nanoid(),
          name: newItem.name || '',
          url: newItem.url,
          x: newItem.x ?? 0,
          y: newItem.y ?? 0,
          zoomFactor: newItem.zoomFactor ?? 1
        }

        layer.items.push(completeItem)
      })
    },
    deleteItem: (itemType, sceneId, itemId, layerId) =>
      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) {
          return state
        }

        if (itemType === 'dialogue') {
          scene.dialogue = scene.dialogue.filter(d => d.id !== itemId)
        } else if (itemType === 'image' && layerId) {
          const layer = scene.layers.find(l => l.id === layerId)
          if (!layer) {
            return state
          }
          layer.items = layer.items.filter(i => i.id !== itemId)
        }
      }),
    reorderItem: (itemType, sceneId, oldIndex, newIndex, layerId) =>
      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) {
          return state
        }

        if (itemType === 'dialogue') {
          const [item] = scene.dialogue.splice(oldIndex, 1)
          scene.dialogue.splice(newIndex, 0, item)
        } else if (itemType === 'image' && layerId) {
          const layer = scene.layers.find(l => l.id === layerId)
          if (!layer) {
            return state
          }
          const [item] = layer.items.splice(oldIndex, 1)
          layer.items.splice(newIndex, 0, item)
        }
      }),
    updateDialogueText: (sceneId, dialogueId, newText) =>
      set(state => {
        const scene = state.scenes[sceneId]
        if (scene) {
          const dialogueItem = scene.dialogue.find(d => d.id === dialogueId)
          if (dialogueItem) {
            dialogueItem.text = newText
          }
        }
      }),
    upsertDialogue: (sceneId, dialogueId, newText, speaker) =>
      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) return

        const dialogueItem = scene.dialogue.find(d => d.id === dialogueId)
        if (dialogueItem) {
          dialogueItem.text = newText
          dialogueItem.speaker = speaker
        } else {
          scene.dialogue.push({ id: dialogueId, text: newText, speaker })
        }
      }),
    changeSpeaker: (sceneId, dialogueId, newSpeaker) =>
      set(state => {
        const scene = state.scenes[sceneId]
        if (scene) {
          const dialogueItem = scene.dialogue.find(d => d.id === dialogueId)
          if (dialogueItem) {
            dialogueItem.speaker = newSpeaker
          }
        }
      }),
    addDialogue: (sceneId: string, dialogueItem: Partial<Dialogue>) => {
      const completeDialogueItem: Dialogue = {
        id: nanoid(),
        text: dialogueItem.text ?? '',
        speaker: dialogueItem.speaker ?? ''
      }

      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) return
        scene.dialogue.push(completeDialogueItem)
      })

      return completeDialogueItem // @TODO: handle failure cases like not finding a scene
    },
    getAllSpeakers: () => {
      return Array.from(
        new Set(
          Object.values(get().scenes)
            .flatMap(scene => scene.dialogue)
            .map(dialogue => dialogue.speaker)
            .filter(Boolean)
        )
      )
    },
    createSnapshot: () =>
      set(state => {
        state.snapshot = JSON.parse(JSON.stringify(state.scenes))
      }),
    restoreSnapshot: () =>
      set(state => {
        if (state.snapshot) {
          state.scenes = state.snapshot
          state.snapshot = null
        }
      })
  }))
)

/**
 * The context: child can read isDragging, canDrag, etc.
 */
export interface DroppableItemContextValue {
  isFromSameCollection: boolean
  isOver: boolean
}

export interface DraggableItemContextValue {
  isDragging: boolean
  canDrag: boolean
  setCanDrag?: (val: boolean) => void
  isOver: boolean
}

export const DraggableItemContext = createContext<DraggableItemContextValue | null>(
  null
)
export const DroppableItemContext = createContext<DroppableItemContextValue | null>(
  null
)

export function useDraggableItemContext() {
  const context = useContext(DraggableItemContext)
  if (!context) {
    throw new Error('useDraggableItemContext must be used within <DnDItemWrapper>')
  }
  return context
}

export function useDroppableItemContext() {
  const context = useContext(DroppableItemContext)
  if (!context) {
    throw new Error('useDroppableItemContext must be used within <DnDItemWrapper>')
  }
  return context
}
