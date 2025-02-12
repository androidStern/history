import DialogueEditor from '@/components/Sidebar/DialogueEditor'
import { usePositionStore } from '@/game/hooks/positionEditsStore'
import { DialogueItem, Layer, Scene } from '@/game/types'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronRight, Copy, ExternalLink, File, Folder, Layers, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar'
import DragableSidebarMenuItem from '@/components/Sidebar/DragableSidebarMenuItem'
import { useKeyboardState } from '@/stores/keyboardStateStore'
import { nanoid } from 'nanoid'
import { DraggedItemType } from '@/components/Sidebar/types'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'

export default function ScenesSubMenu({ scene }: { scene: Scene }) {
  const [draftDialogue, setDraftDialogue] = useState<DialogueItem | null>(null)
  const { isOptionKeyPressed } = useKeyboardState()
  const { deleteItem, deleteDialogue } = usePositionStore()

  return (
    <SidebarMenuItem key={scene.id}>
      <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder className="size-4" />
            <span>{scene.id}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <DroppableDialogueLayer sceneId={scene.id} menuActionCallback={() => setDraftDialogue({ id: nanoid(), text: '', speaker: '' })}>
            {draftDialogue && (
              <SidebarMenuItem key={draftDialogue.id + scene.id} data-dialogue-id={draftDialogue.id}>
                <DialogueEditor initialText={draftDialogue.text} dialogueId={draftDialogue.id} sceneId={scene.id} defaultIsEditing={true} onComplete={() => setDraftDialogue(null)} onCancel={() => setDraftDialogue(null)} />
              </SidebarMenuItem>
            )}
            {scene.dialogue &&
              scene.dialogue.map((item: DialogueItem) => (
                <SidebarMenuItem key={item.id + scene.id} data-dialogue-id={item.id}>
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <DraggableDialogueItem item={item} sceneId={scene.id} />
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem>
                        <Copy className="size-4 mr-2 text-muted-foreground" />
                        <span>Copy Image URL</span>
                      </ContextMenuItem>
                      <ContextMenuItem>
                        <ExternalLink className="size-4 mr-2 text-muted-foreground" />
                        <span>Open Image in New Tab</span>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => deleteDialogue(scene.id, item.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="size-4 mr-2" />
                        <span>Delete</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                </SidebarMenuItem>
              ))}
          </DroppableDialogueLayer>
          <SidebarMenuSub>
            {scene.layers.map(layer => (
              <DroppableLayer key={layer.id} layer={layer} sceneId={scene.id}>
                {layer.items.map(item => (
                  <DragableSidebarMenuItem
                    key={'sidebar-' + item.id}
                    item={{
                      type: 'asset',
                      data: item,
                      sceneId: scene.id,
                      layerId: layer.id
                    }}
                  >
                    <SidebarMenuButton style={{ cursor: isOptionKeyPressed ? 'copy' : 'drag' }}>
                      <File className="size-4" />
                      <span>{item.id}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal className="size-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem>
                          <Copy className="size-4 mr-2 text-muted-foreground" />
                          <span>Copy Image URL</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="size-4 mr-2 text-muted-foreground" />
                          <span>Open Image in New Tab</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteItem(scene.id, layer.id, item.id)}>
                          <Trash2 className="size-4 mr-2 text-muted-foreground" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DragableSidebarMenuItem>
                ))}
              </DroppableLayer>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  )
}

function DroppableDialogueLayer({ sceneId, children, menuActionCallback }: { sceneId: string; children: React.ReactNode; menuActionCallback?: () => void }) {
  const dialogueIds = usePositionStore(useShallow(state => state.scenes[sceneId]?.dialogue?.map(d => d.id) ?? []))

  const [isDialogueOpen, setIsDialogueOpen] = useState(false)

  return (
    <SortableContext id={`${sceneId}-dialogue-context`} items={dialogueIds}>
      <SidebarMenuSub>
        <Collapsible open={isDialogueOpen} onOpenChange={setIsDialogueOpen} className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton>
                <ChevronRight className="transition-transform" />
                <span>Dialogue</span>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <SidebarMenuAction
              showOnHover
              onClick={() => {
                setIsDialogueOpen(true)
                menuActionCallback?.()
              }}
            >
              <Plus className="size-4" />
            </SidebarMenuAction>
          </SidebarMenuItem>

          <CollapsibleContent>
            <SidebarMenuSub>{children}</SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSub>
    </SortableContext>
  )
}

function DraggableDialogueItem({ item, sceneId }: { item: DialogueItem; sceneId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    data: {
      type: 'dialogue',
      data: item,
      sceneId
    } satisfies DraggedItemType
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
      <DialogueEditor initialText={item.text} dialogueId={item.id} sceneId={sceneId} />
    </div>
  )
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
            <Layers className="size-4" />
            <span>{layer.id}</span>
          </SidebarMenuButton>

        </CollapsibleTrigger>
        <SidebarMenuBadge>{layer.items.length}</SidebarMenuBadge>
        <CollapsibleContent>
          <SidebarMenuSub>{children}</SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>

    </SidebarMenuItem>
  )
}
