export type LayerItem = {
  id: string
  imageUrl: string
  x: number
  y: number
  zoomFactor?: number
}
type LayerId = 'bg' | 'mid' | 'fg'
export type Layer = {
  id: LayerId
  parallaxFactor?: number
  items: LayerItem[]
}

export type Choice = {
  id: string
  label: string
  nextSceneId: string
}

export type DialogueItem = {
  id: string
  speaker: string
  text: string
}

export type Scene = {
  id: string
  width: number
  layers: Layer[]
  dialogue: DialogueItem[]
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
