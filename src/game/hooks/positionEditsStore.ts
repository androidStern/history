import { create } from 'zustand'
import { Scene } from '../types'

import { scenes } from '../gameData'
import { immer } from 'zustand/middleware/immer'

type PositionState = {
  scenes: Record<string, Scene>
}

type PositionActions = {
  update: (sceneId: string, layerId: string, itemId: string, item: Partial<Item>) => void
}

type Item = {
  x: number
  y: number
  zoomFactor: number
  imageUrl?: string
}

export const usePositionStore = create<PositionState & PositionActions>()(
  immer(set => ({
    scenes: scenes,
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
