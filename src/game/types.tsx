export interface ImageAsset {
  id: string
  name: string
  url: string
  x: number
  y: number
  zoomFactor?: number
}

export const LAYERS = ['bg', 'mid', 'fg'] as const
export type LayerId = (typeof LAYERS)[number]

export interface Layer {
  id: LayerId
  name?: string
  items: ImageAsset[]
  parallaxFactor?: number
}
export type Choice = {
  id: string
  label: string
  nextSceneId: string
}

export type Dialogue = {
  id: string
  speaker: string
  text: string
}

export type Scene = {
  id: string
  width: number
  name: string
  layers: Layer[]
  dialogue: Dialogue[]
  choices?: Choice[]
}

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
