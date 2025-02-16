import {
  AssetActions,
  AssetState,
  GameActions,
  GameState,
  Scene
} from '@/game/types'
import { enableMapSet } from 'immer'
import { StateCreator } from 'zustand'

enableMapSet()

export const createAssetStoreSlice: StateCreator<
  GameState & GameActions & AssetState & AssetActions,
  [['zustand/immer', never]],
  [],
  AssetState & AssetActions
> = (set, get) => ({
  assetMap: new Map(),

  uploadFiles: async (files: FileList | null) => {
    if (!files) return

    const readFile = (file: File): Promise<[string, string]> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = e => resolve([file.name, e.target?.result as string])
        reader.onerror = () =>
          reject(new Error(`Failed to read file: ${file.name}`))
        reader.readAsDataURL(file)
      })
    }

    const fileResults = await Promise.all(Array.from(files).map(readFile))

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
            if (item.url.startsWith('data:')) {
              // Store the data URL mapping
              state.assetMap.set(item.url, item.url)
            }
          })
        })
      })
    }),

  exportSceneData: (scenes: Record<string, Scene>, forProduction = false) => {
    if (!forProduction) return scenes

    // Deep clone the scenes
    const exportedScenes = JSON.parse(JSON.stringify(scenes)) as Record<
      string,
      Scene
    >

    // For production export, we need to convert data URLs to file paths
    Object.values(exportedScenes).forEach(scene => {
      scene.layers.forEach(layer => {
        layer.items.forEach(item => {
          if (item.url.startsWith('data:')) {
            // Convert to a file path based on some naming scheme
            const fileName = `asset-${Date.now()}.png` // You might want a better naming strategy
            item.url = `/assets/${fileName}`
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
})
