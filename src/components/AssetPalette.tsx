import { usePositionStore } from '@/game/hooks/positionEditsStore'
import { useAssetStore } from '@/stores/assetStore'
import { useKeyboardState } from '@/stores/keyboardStateStore'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ChevronRight, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import Overlay from '@/components/Sidebar/Overlay'
import ScenesSubMenu from '@/components/Sidebar/ScenesSubMenu'
import { DraggedItemType } from '@/components/Sidebar/types'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar'

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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { assetMap, addAsset } = useAssetStore()
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)

  const [draggedItem, setDraggedItem] = useState<DraggedItemType | null>(null)
  const { isOptionKeyPressed } = useKeyboardState()

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => addAsset(file.name, e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        const activeData = active.data.current as DraggedItemType
        if (!activeData) return
        takeSnapshot()
        console.log({ active })
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

          const overIndex = scenes[overSceneId].dialogue.findIndex(d => d.id === overData.data.id)

          moveDialogue({
            from: {
              sceneId: activeSceneId,
              dialogueId: activeData.data.id
            },
            to: {
              sceneId: overSceneId,
              // If we found a valid index, use it, otherwise append to end
              index: overIndex >= 0 ? overIndex : scenes[overSceneId].dialogue.length
            }
          })
        }
      }}
      onDragEnd={({ active, over }) => {
        clearSnapshot()

        console.log("state", { ...usePositionStore.getState() })

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
        console.log('cancel')
        console.log(usePositionStore.getState())
        restoreSnapshot()
        setDraggedItem(null)
      }}
    >
      <Sidebar
        onDrop={e => {
          e.preventDefault()
          handleFiles(e.dataTransfer.files)
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
            <SidebarMenu>
              <Collapsible asChild open={isAssetsOpen} onOpenChange={setIsAssetsOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span>🌇</span>
                    <span>Assets</span>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90" showOnHover>
                      <ChevronRight className="h-4 w-4" />
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <SidebarMenuAction showOnHover onClick={() => fileInputRef.current?.click()}>
                    <Plus className="h-4 w-4" />
                  </SidebarMenuAction>
                  <CollapsibleContent>
                    <SidebarMenuSub className="grid grid-cols-3 gap-2 w-full">
                      <div className="relative group aspect-square rounded-md border bg-background hover:ring-2 ring-primary overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="absolute inset-0 p-1 flex items-center justify-center">
                          <Plus className="w-8 h-8 text-muted-foreground group-hover:scale-105 transition-transform" />
                        </div>
                      </div>

                      {Array.from(assetMap.entries()).map(([name, dataUrl]) => (
                        <div
                          key={name}
                          className="relative group aspect-square rounded-md border bg-background cursor-grab hover:ring-2 ring-primary overflow-hidden"
                          draggable
                          onDragStart={e => {
                            e.dataTransfer.setData('text/plain', dataUrl)
                            e.dataTransfer.effectAllowed = 'copy'
                          }}
                        >
                          <div className="absolute inset-0 p-1 flex items-center justify-center">
                            <img src={dataUrl} alt={name} className="w-full h-full object-contain max-w-[80%] max-h-[80%] hover:scale-105 transition-transform" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-1 truncate text-white backdrop-blur-sm">{name}</div>
                        </div>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarMenu>
              {Object.entries(scenes).map(([sceneId, scene]) => (
                <ScenesSubMenu key={sceneId} scene={scene} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
      </Sidebar>
      <Overlay draggedItem={draggedItem}></Overlay>
    </DndContext>
  )
}
