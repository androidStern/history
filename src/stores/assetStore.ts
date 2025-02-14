import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import { Scene } from '@/game/types'

enableMapSet()

type AssetState = {
  // Maps asset URLs (either file paths or data URLs) to their data URLs (if they were uploaded)
  assetMap: Map<string, string>
}

type AssetActions = {
  // When a file is dropped, store its data URL
  addAsset: (originalUrl: string, dataUrl: string) => void
  // Given any URL (file path or data URL), return the appropriate URL to use
  resolveUrl: (url: string) => string
  // Load scene data, scanning for any data URLs to preserve
  loadSceneData: (scenes: Record<string, Scene>) => void
  // Export scene data, optionally converting data URLs to file paths
  exportSceneData: (scenes: Record<string, Scene>, forProduction?: boolean) => Record<string, Scene>
  // Get all stored data URLs for saving to a file
  getStoredAssets: () => Record<string, string>
  uploadFiles: (files: FileList | null) => Promise<void>
}

export const useAssetStore = create<AssetState & AssetActions>()(
  immer((set, get) => ({
    assetMap: new Map(),

    uploadFiles: async (files: FileList | null) => {
      if (!files) return

      const readFile = (file: File): Promise<[string, string]> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve([file.name, e.target?.result as string])
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`))
          reader.readAsDataURL(file)
        })
      }

      const fileResults = await Promise.all(
        Array.from(files).map(readFile)
      )

      set(state => {
        fileResults.forEach(([name, dataUrl]) => {
          state.assetMap.set(name, dataUrl)
        })
      })
    },

    addAsset: (originalUrl: string, dataUrl: string) =>
      set(state => {
        state.assetMap.set(originalUrl, dataUrl)
      }),

    resolveUrl: (url: string) => {
      const state = get()
      return state.assetMap.get(url) || url
    },

    loadSceneData: (scenes: Record<string, Scene>) =>
      set(state => {
        // Scan through scenes looking for data URLs to preserve
        Object.values(scenes).forEach(scene => {
          scene.layers.forEach(layer => {
            layer.items.forEach(item => {
              if (item.imageUrl.startsWith('data:')) {
                // Store the data URL mapping
                state.assetMap.set(item.imageUrl, item.imageUrl)
              }
            })
          })
        })
      }),

    exportSceneData: (scenes: Record<string, Scene>, forProduction = false) => {
      if (!forProduction) return scenes

      // Deep clone the scenes
      const exportedScenes = JSON.parse(JSON.stringify(scenes)) as Record<string, Scene>

      // For production export, we need to convert data URLs to file paths
      Object.values(exportedScenes).forEach(scene => {
        scene.layers.forEach(layer => {
          layer.items.forEach(item => {
            if (item.imageUrl.startsWith('data:')) {
              // Convert to a file path based on some naming scheme
              const fileName = `asset-${Date.now()}.png` // You might want a better naming strategy
              item.imageUrl = `/assets/${fileName}`
            }
          })
        })
      })

      return exportedScenes
    },

    getStoredAssets: () => {
      const state = get()
      return Object.fromEntries(state.assetMap.entries())
    }
  }))
)
