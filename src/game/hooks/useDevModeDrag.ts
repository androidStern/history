import { useRef, MouseEvent, DragEvent, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { useGameStore } from '@/stores/useGameStore'
import { Layer, Scene } from '@/game/types'

/**
 * Returns:
 *  - A dictionary of updated positions
 *  - Handlers to pass to <img> or <div> for drag
 *  - A function to export all changes
 */
export function useDevModeDrag(devMode: boolean) {
  const { scenes, update } = useGameStore()

  // For tracking an in-progress drag
  const dragRef = useRef<{
    sceneId: Scene['id']
    layerId: Layer['id']
    itemId: string
    startMouseX: number
    startMouseY: number
    startItemX: number
    startItemY: number
  } | null>(null)

  // Called when user presses mouse down on an item
  const handleMouseDown = useCallback(
    (
      e: MouseEvent<HTMLImageElement>,
      sceneId: Scene['id'],
      layerId: Layer['id'],
      itemId: string,
      originalX: number,
      originalY: number
    ) => {
      if (!devMode) return
      e.preventDefault()
      e.stopPropagation()

      // record the start drag positions
      dragRef.current = {
        sceneId,
        layerId,
        itemId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startItemX: originalX,
        startItemY: originalY
      }
    },
    [devMode]
  )

  // Called on parent container's onMouseMove
  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!devMode) return
      if (!dragRef.current) return

      e.preventDefault()
      const {
        sceneId,
        layerId,
        itemId,
        startMouseX,
        startMouseY,
        startItemX,
        startItemY
      } = dragRef.current
      const deltaX = e.clientX - startMouseX
      const deltaY = e.clientY - startMouseY
      const newX = startItemX + deltaX
      const newY = startItemY + deltaY

      update(sceneId, layerId, itemId, { x: newX, y: newY })
    },
    [devMode, update]
  )

  // Called on parent container's onMouseUp
  const handleMouseUp = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!devMode) return
      dragRef.current = null
    },
    [devMode]
  )

  const handleZoom = useCallback(
    (sceneId: string, layerId: string, itemId: string, zoomFactor: number) => {
      if (!devMode) return
      update(sceneId, layerId, itemId, { zoomFactor })
    },
    [devMode, update]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, sceneId: string) => {
      if (!devMode) return
      e.preventDefault()

      const url = e.dataTransfer.getData('text/plain')
      if (!url) return

      // Get drop coordinates relative to the container
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Add new item to the scene
      update(sceneId, 'fg', nanoid(), {
        url,
        x,
        y
      })
    },
    [devMode, update]
  )

  return {
    scenes,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleZoom,
    handleDrop
  }
}
