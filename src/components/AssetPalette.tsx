import AssetSidebarMenu from '@/components/Sidebar/AssetSidebarMenu'
import Overlay from '@/components/Sidebar/Overlay'
import ScenesSubMenu from '@/components/Sidebar/ScenesSubMenu'
import { DraggedItemType } from '@/components/Sidebar/types'
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu } from '@/components/ui/sidebar'
import { usePositionStore } from '@/game/hooks/positionEditsStore'
import { useAssetStore } from '@/stores/assetStore'
import { useKeyboardState } from '@/stores/keyboardStateStore'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'

export default function AssetPalette() {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const { scenes, moveDialogue, takeSnapshot, restoreSnapshot, addItem, moveItem, clearSnapshot } = usePositionStore()
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<DraggedItemType | null>(null)
  const { isOptionKeyPressed } = useKeyboardState()
  const { uploadFiles } = useAssetStore()

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        const activeData = active.data.current as DraggedItemType
        if (!activeData) return
        takeSnapshot()
        setDraggedItem(activeData)
      }}
      onDragOver={({ active, over }) => {
        const activeData = active.data.current as DraggedItemType
        const overData = over?.data.current as DraggedItemType

        if (over?.data.current?.type === 'layer') return

        if (!activeData || !overData) return

        if (activeData.type === 'dialogue') {
          const activeSceneId = activeData.sceneId
          const overSceneId = overData.sceneId

          if (!activeSceneId || !overSceneId) return

          moveDialogue({
            from: {
              sceneId: activeSceneId,
              dialogueId: activeData.data.id
            },
            to: {
              sceneId: overSceneId,
              // If we found a valid index, use it, otherwise append to end
              index: overData.index
            }
          })
        }
      }}
      onDragEnd={({ active, over }) => {
        clearSnapshot()

        if (!active?.data.current || !over) {
          setDraggedItem(null)
          return
        }

        if (!draggedItem || draggedItem?.type === 'dialogue') return

        const [targetSceneId, targetLayerId] = (over.id as string).split('-')

        if (targetSceneId !== draggedItem.sceneId || targetLayerId !== draggedItem.layerId) {
          if (isOptionKeyPressed) {
            addItem(targetSceneId, targetLayerId, draggedItem.data)
          } else {
            if (!draggedItem.sceneId || !draggedItem.layerId) return

            moveItem({
              from: {
                sceneId: draggedItem.sceneId,
                layerId: draggedItem.layerId,
                itemId: draggedItem.data.id
              },
              to: {
                sceneId: targetSceneId,
                layerId: targetLayerId
              }
            })
          }
        }

        setDraggedItem(null)
      }}
      onDragCancel={() => {
        restoreSnapshot()
        setDraggedItem(null)
      }}
    >
      <Sidebar
        onDrop={e => {
          e.preventDefault()
          uploadFiles(e.dataTransfer.files)
        }}
        onDragOver={e => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          setIsAssetsOpen(true)
        }}
        onDragLeave={() => {
          setIsAssetsOpen(false)
        }}
      >
        <SidebarContent>
          <SidebarHeader>You better be making something cool rn...</SidebarHeader>
          <SidebarGroup>
            <AssetSidebarMenu isAssetsOpen={isAssetsOpen} setIsAssetsOpen={setIsAssetsOpen} />
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {Object.entries(scenes).map(([sceneId, scene]) => (
                <ScenesSubMenu key={sceneId} scene={scene} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Overlay draggedItem={draggedItem}></Overlay>
    </DndContext>
  )
}
