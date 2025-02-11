import { create } from 'zustand'
import { Button } from '@/components/ui/button'
import { usePositionStore } from '@/game/hooks/positionEditsStore'
import { Layer, LayerItem } from '@/game/types'
import { useAssetStore } from '@/stores/assetStore'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, getClientRect, MeasuringConfiguration, useDraggable, useDroppable } from '@dnd-kit/core'
import { ChevronRight, Copy, ExternalLink, File, Folder, Layers, MoreHorizontal, Plus, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from './ui/sidebar'

type OptionKeyStore = {
  isOptionKeyPressed: boolean
  setOptionKeyPressed: (pressed: boolean) => void
}

const useOptionKeyStore = create<OptionKeyStore>(set => ({
  isOptionKeyPressed: false,
  setOptionKeyPressed: pressed => set({ isOptionKeyPressed: pressed })
}))

const measuringConfig: MeasuringConfiguration = {
  draggable: {
    measure: getClientRect
  }
}

type DragItem = LayerItem & {
  id: string
  type: 'item'
  parentLayerId: string
  parentSceneId: string
}

// Presentational component
interface ItemContentProps {
  item: DragItem
  showDropdown?: boolean
  style?: React.CSSProperties
  ref?: React.Ref<HTMLLIElement>
  className?: string
  isDragging?: boolean
}

const ItemContent = ({ item, showDropdown = true, style, ref, isDragging, ...props }: ItemContentProps) => {
  const { isOptionKeyPressed } = useOptionKeyStore()

  let cursor = 'auto'
  if (isDragging) cursor = 'drag'
  if (isOptionKeyPressed) cursor = 'copy'

  return (
    <SidebarMenuItem ref={ref} style={style} {...props}>
      <SidebarMenuButton style={{ cursor }}>
        <File className="h-4 w-4" />
        <span>{item.id}</span>
      </SidebarMenuButton>
      {showDropdown && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuAction showOnHover>
              <MoreHorizontal className="h-4 w-4" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Copy Image URL</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Open Image in New Tab</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SidebarMenuItem>
  )
}
ItemContent.displayName = 'ItemContent'

// Draggable wrapper component
function DraggableItem({ item }: { item: DragItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item }
  })

  const { isOptionKeyPressed } = useOptionKeyStore()

  console.log({ isOptionKeyPressed })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'translate3d(0, 0, 0)',
    opacity: isDragging ? 0 : 1,
    transition: 'opacity 0.2s ease'
  }

  return <ItemContent isDragging={isDragging} ref={setNodeRef} item={item} style={style} {...attributes} {...listeners} />
}

function DroppableLayer({ layer, sceneId, children }: { layer: Layer; sceneId: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${sceneId}-${layer.id}`,
    data: { type: 'layer', layerId: layer.id, sceneId }
  })

  return (
    <SidebarMenuItem ref={setNodeRef}>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className={`transition-all duration-200 ${isOver ? 'bg-primary/10 translate-y-1' : ''}`}>
            <ChevronRight className="transition-transform" />
            <Layers className="h-4 w-4" />
            <span>{layer.id}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function CustomDragOverlay({ item }: { item: DragItem }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <ItemContent item={item} />
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default function AssetPalette() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { assetMap, addAsset } = useAssetStore()
  const [isAssetsOpen, setIsAssetsOpen] = useState(false)
  const { scenes, moveItem, addItem } = usePositionStore()
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)

  const { isOptionKeyPressed, setOptionKeyPressed } = useOptionKeyStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setOptionKeyPressed(true)
      }
    },
    [setOptionKeyPressed]
  )

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      console.log({ e })
      if (e.key === 'Alt') {
        setOptionKeyPressed(false)
      }
    },
    [setOptionKeyPressed]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  const handleDragStart = (event: DragStartEvent) => {
    if (!event.active.data.current) return
    console.log('setDraggedItem: ', { event })
    setDraggedItem(event.active.data.current.item)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    console.log({
      event,
      active,
      over,
      draggedItem
    })

    if (over && draggedItem) {
      const [targetSceneId, targetLayerId] = (over.id as string).split('-')
      console.log({ targetSceneId, targetLayerId })

      if (targetSceneId !== draggedItem.parentSceneId || targetLayerId !== draggedItem.parentLayerId) {
        if (isOptionKeyPressed) {
          addItem(targetSceneId, targetLayerId, draggedItem)
        } else {
          moveItem({
            from: {
              sceneId: draggedItem.parentSceneId,
              layerId: draggedItem.parentLayerId,
              itemId: draggedItem.id
            },
            to: {
              sceneId: targetSceneId,
              layerId: targetLayerId
            }
          })
        }
      }
    }

    setDraggedItem(null)
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const dataUrl = e.target?.result as string
        addAsset(file.name, dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} measuring={measuringConfig}>
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
          <SidebarHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Asset Library</h2>
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </SidebarHeader>
          <SidebarGroup>
            {/* <SidebarGroupLabel>Assets</SidebarGroupLabel> */}
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
                <SidebarMenuItem key={sceneId}>
                  <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <ChevronRight className="transition-transform" />
                        <Folder className="h-4 w-4" />
                        <span>{scene.id}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {scene.layers.map(layer => (
                          <DroppableLayer key={layer.id} layer={layer} sceneId={scene.id}>
                            {layer.items.map(item => (
                              <DraggableItem
                                key={item.id}
                                item={{
                                  ...item,
                                  parentLayerId: layer.id,
                                  parentSceneId: scene.id,
                                  type: 'item'
                                }}
                              />
                            ))}
                          </DroppableLayer>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
      </Sidebar>
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease'
        }}
      >
        {draggedItem ? <CustomDragOverlay item={draggedItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
