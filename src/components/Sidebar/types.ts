import { DialogueItem, LayerItem, Scene } from "@/game/types"


export type DraggedItemType = {
  type: 'dialogue' | 'asset'
  data: DialogueItem | LayerItem
  sceneId?: Scene['id']
  layerId?: LayerItem['id']
}
