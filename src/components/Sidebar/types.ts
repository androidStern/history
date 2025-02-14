import { Dialogue, LayerItem, Scene } from '@/game/types'
import { useDroppable, UseDroppableArguments, useDraggable, UseDraggableArguments } from '@dnd-kit/core'

export type DraggedItemType = {
  type: 'dialogue' | 'asset' | 'dialog-menu'
  data: Dialogue | LayerItem
  sceneId?: Scene['id']
  layerId?: LayerItem['id']
  index: number
}

interface UseTypedDroppableArgs extends Omit<UseDroppableArguments, 'data'> {
  data: DraggedItemType
}

interface UseTypedDraggableArgs extends Omit<UseDraggableArguments, 'data'> {
  data: DraggedItemType
}

export function useTypedDroppable(args: UseTypedDroppableArgs) {
  return useDroppable(args)
}

export function useTypedDraggable(args: UseTypedDraggableArgs) {
  return useDraggable(args)
}
