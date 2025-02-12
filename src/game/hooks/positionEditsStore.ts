import { DialogueItem, LayerItem as Item, Scene } from '@/game/types'
import { nanoid } from 'nanoid'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { scenes } from '@/game/gameData'

type PositionState = {
  scenes: Record<string, Scene>
  snapshot: Record<string, Scene> | null
}

type PositionActions = {
  // Items (images)
  update: (sceneId: string, layerId: string, itemId: string, item: Partial<Item>) => void
  addItem: (sceneId: string, layerId: string, item: Partial<Item>) => void
  moveItem: (params: MoveItemParams) => void
  deleteItem: (sceneId: string, layerId: string, itemId: string) => void
  // Dialogue
  updateDialogue: (sceneId: string, dialogItem: Partial<DialogueItem>) => void
  moveDialogue: (params: MoveDialogueParams) => void
  addDialogue: (sceneId: string, dialogueItem: Partial<DialogueItem>) => DialogueItem
  deleteDialogue: (sceneId: string, dialogueId: string) => void
  //Snapshots
  takeSnapshot: () => void
  restoreSnapshot: () => void
  clearSnapshot: () => void
}

type MoveItemParams = {
  from: { sceneId: string; layerId: string; itemId: string }
  to: { sceneId: string; layerId: string }
}

type MoveDialogueParams = {
  from: { sceneId: string; dialogueId: string }
  to: { sceneId: string; index: number }
}

export const usePositionStore = create<PositionState & PositionActions>()(
  immer(set => ({
    scenes: scenes,
    snapshot: null,
    takeSnapshot: () => {
      set(state => {
        state.snapshot = JSON.parse(JSON.stringify(state.scenes))
      })
    },
    restoreSnapshot: () => {
      set(state => {
        state.scenes = JSON.parse(JSON.stringify(state.snapshot))
        state.snapshot = null
      })
    },
    clearSnapshot: () => {
      set(state => {
        state.snapshot = null
      })
    },
    updateDialogue: (sceneId: string, newDialogue: Partial<DialogueItem>) => {
      set(state => {
        const dialog = state.scenes[sceneId]?.dialogue.find(d => d.id === newDialogue.id)

        if (!dialog) return
        Object.assign(dialog, newDialogue)
      })
    },
    moveDialogue: ({ from, to }: MoveDialogueParams) => {
      set(state => {
        const fromScene = state.scenes[from.sceneId]
        const toScene = state.scenes[to.sceneId]

        if (!fromScene || !toScene) return

        const dialogueIndex = fromScene.dialogue.findIndex(d => d.id === from.dialogueId)
        if (dialogueIndex === -1) return

        const [movedDialogue] = fromScene.dialogue.splice(dialogueIndex, 1)

        toScene.dialogue.splice(to.index, 0, movedDialogue)
      })
    },
    addDialogue: (sceneId: string, dialogueItem: Partial<DialogueItem>) => {
      const completeDialogueItem: DialogueItem = {
        id: nanoid(),
        text: dialogueItem.text ?? '',
        speaker: dialogueItem.speaker ?? ''
      }

      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) return
        scene.dialogue.push(completeDialogueItem)
      })

      return completeDialogueItem
    },
    deleteDialogue: (sceneId: string, dialogueId: string) => {
      set(state => {
        const scene = state.scenes[sceneId]
        if (!scene) return
        state.scenes[sceneId].dialogue = scene.dialogue.filter(d => d.id !== dialogueId)
      })
    },
    deleteItem: (sceneId: string, layerId: string, itemId: string) => {
      set(state => {
        const layer = state.scenes[sceneId]?.layers.find(l => l.id === layerId)
        if (!layer) return
        layer.items = layer.items.filter(item => item.id !== itemId)
      })
    },
    moveItem: ({ from, to }: MoveItemParams) => {
      set(state => {
        const fromScene = state.scenes[from.sceneId]
        if (!fromScene) return
        const fromLayer = fromScene.layers.find(l => l.id === from.layerId)
        if (!fromLayer) return
        const index = fromLayer.items.findIndex(item => item.id === from.itemId)
        if (index === -1) return
        const toScene = state.scenes[to.sceneId]
        if (!toScene) return
        const toLayer = toScene.layers.find(l => l.id === to.layerId)
        if (!toLayer) return

        const item = fromLayer.items[index]

        toLayer.items.push(item)
        fromLayer.items.splice(index, 1)
      })
    },
    addItem: (sceneId: string, layerId: string, newItem: Partial<Item>) => {
      set(state => {
        if (!newItem.imageUrl) return

        const scene = state.scenes[sceneId]
        if (!scene) return
        const layer = scene.layers.find(l => l.id === layerId)
        if (!layer) return

        const completeItem: Item = {
          id: nanoid(),
          imageUrl: newItem.imageUrl,
          x: newItem.x ?? 0, // Default to 0 if not provided
          y: newItem.y ?? 0, // Default to 0 if not provided
          zoomFactor: newItem.zoomFactor // Optional, can be undefined
        }

        layer.items.push(completeItem)
      })
    },
    update: (sceneId: string, layerId: string, itemId: string, newItem: Partial<Item>) => {
      set(state => {
        const layer = state.scenes[sceneId].layers.find(l => l.id === layerId)
        if (!layer) return

        const item = layer.items.find(i => i.id === itemId)
        if (item) {
          // Update existing item
          Object.assign(item, newItem)
        } else if (newItem.imageUrl) {
          // Add new item
          layer.items.push({
            id: itemId,
            x: newItem.x ?? 0,
            y: newItem.y ?? 0,
            zoomFactor: newItem.zoomFactor ?? 1,
            imageUrl: newItem.imageUrl
          })
        }
      })
    }
  }))
)
