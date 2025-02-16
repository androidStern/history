import { DraggedItem, ItemType, Layer, Scene } from '@/game/types'
import {
  DraggableItemContext,
  DroppableItemContext,
  useGameStore
} from '@/stores/useGameStore'
import { Root } from '@radix-ui/react-slot'
import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
import { ConnectableElement, DragSourceMonitor, useDrag, useDrop } from 'react-dnd'

interface DnDItemWrapperProps extends PropsWithChildren {
  type: ItemType
  itemId: string
  sceneId: Scene['id']
  layerId?: Layer['id']
  index: number
}

interface DragCollectedProps {
  isDragging: boolean
}

export function DnDItemWrapper({
  type,
  itemId,
  sceneId,
  layerId,
  index,
  children
}: DnDItemWrapperProps) {
  const [canDrag, setCanDrag] = useState(true)
  const moveItem = useGameStore(s => s.moveItem)
  const reorderItem = useGameStore(s => s.reorderItem)
  const createSnapshot = useGameStore(s => s.createSnapshot)
  const restoreSnapshot = useGameStore(s => s.restoreSnapshot)
  const ref = useRef<ConnectableElement | null>(null)

  const [{ isDragging }, drag] = useDrag<DraggedItem, void, DragCollectedProps>({
    type: `${type}-item`,
    canDrag: () => canDrag,
    item: () => {
      createSnapshot()
      return { id: itemId, index, type, sceneId, layerId } satisfies DraggedItem
    },
    end: (_item, monitor) => {
      if (!monitor.didDrop()) {
        restoreSnapshot()
      }
    },
    collect: (
      monitor: DragSourceMonitor<DraggedItem, void>
    ): DragCollectedProps => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver }, drop] = useDrop({
    accept: `${type}-item`,
    hover: (dragItem: DraggedItem) => {
      if (!ref.current) return

      const dragIndex = dragItem.index
      const hoverIndex = index
      const dragSceneId = dragItem.sceneId
      const dragLayerId = dragItem.layerId

      if (
        dragIndex === hoverIndex &&
        dragSceneId === sceneId &&
        dragLayerId === layerId
      ) {
        return
      }

      if (type === 'dialogue') {
        if (dragSceneId === sceneId) {
          reorderItem(type, sceneId, dragIndex, hoverIndex)
        } else {
          moveItem(type, dragSceneId, sceneId, dragItem.id, hoverIndex)
          dragItem.sceneId = sceneId
        }
      } else {
        // type === 'image'
        if (dragSceneId === sceneId && dragLayerId === layerId) {
          reorderItem(type, sceneId, dragIndex, hoverIndex, layerId)
        } else {
          moveItem(
            type,
            dragSceneId,
            sceneId,
            dragItem.id,
            hoverIndex,
            dragLayerId,
            layerId
          )
          dragItem.sceneId = sceneId
          dragItem.layerId = layerId
        }
      }

      dragItem.index = hoverIndex
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  })

  const myRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        ref.current = drag(drop(node))
      }
    },
    [drag, drop]
  )

  return (
    <DraggableItemContext.Provider
      value={{ isDragging, canDrag, setCanDrag, isOver }}
    >
      <Root ref={myRef}>{children}</Root>
    </DraggableItemContext.Provider>
  )
}

interface DnDDroppableWrapperProps extends PropsWithChildren {
  sceneId: Scene['id']
  layerId?: Layer['id']
  type: ItemType
  isSameCollection: (draggedItem: DraggedItem) => boolean
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: () => void
}

export const DnDDroppableWrapper: React.FC<DnDDroppableWrapperProps> = ({
  sceneId,
  layerId,
  children,
  type,
  isSameCollection,
  onDragEnter,
  onDragLeave,
  onDrop
}) => {
  const moveItem = useGameStore(state => state.moveItem)

  const [isFromSameCollection, setIsFromSameCollection] = useState(false)

  const [{ isOver }, drop] = useDrop({
    accept: `${type}-item`,
    hover: (item: DraggedItem) => {
      setIsFromSameCollection(isSameCollection(item))
    },
    drop: (item: DraggedItem) => {
      if (isSameCollection(item)) return
      moveItem(
        type,
        item.sceneId,
        sceneId,
        item.id,
        0,
        item.layerId,
        layerId || item.layerId
      )
      onDrop()
    },
    collect: monitor => ({ isOver: !!monitor.isOver() })
  })

  // Track previous isOver value to detect enter/leave transitions
  const prevIsOverRef = useRef(false)

  useEffect(() => {
    if (isOver && !prevIsOverRef.current) {
      onDragEnter()
    } else if (!isOver && prevIsOverRef.current) {
      onDragLeave()
    }
    prevIsOverRef.current = isOver
  }, [isOver, onDragEnter, onDragLeave])

  const myRef = useCallback(
    (node: HTMLElement | null) => {
      if (node) drop(node)
    },
    [drop]
  )

  return (
    <DroppableItemContext.Provider value={{ isFromSameCollection, isOver }}>
      <Root ref={myRef}>{children}</Root>
    </DroppableItemContext.Provider>
  )
}
