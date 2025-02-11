import { create } from 'zustand'
import { Scene, LayerItem as Item } from '@/game/types'

import { scenes } from '../gameData'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'

type PositionState = {
  scenes: Record<string, Scene>
}

type PositionActions = {
  update: (sceneId: string, layerId: string, itemId: string, item: Partial<Item>) => void
  addItem: (sceneId: string, layerId: string, item: Partial<Item>) => void
  moveItem: (params: MoveItemParams) => void
}

type MoveItemParams = {
  from: { sceneId: string; layerId: string; itemId: string }
  to: { sceneId: string; layerId: string }
}

export const usePositionStore = create<PositionState & PositionActions>()(
  immer(set => ({
    scenes: scenes,
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
