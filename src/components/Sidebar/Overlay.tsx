import { DragOverlay } from '@dnd-kit/core'
import DialogueEditor from '@/components/Sidebar/DialogueEditor'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton
} from '@/components/ui/sidebar'
import DragableSidebarMenuItem from '@/components/Sidebar/DragableSidebarMenuItem'
import { File } from 'lucide-react'
import { DraggedItemType } from '@/components/Sidebar/types'
import { useKeyboardState } from '@/stores/keyboardStateStore'
import { useGameStore } from '@/stores/useGameStore'

export default function Overlay({
  draggedItem
}: {
  draggedItem: DraggedItemType | null
}) {
  const { isOptionKeyPressed } = useKeyboardState()
  const scenes = useGameStore(state => state.scenes)

  if (!draggedItem?.sceneId) return null

  return (
    <DragOverlay
      dropAnimation={{
        duration: 200,
        easing: 'ease'
      }}
    >
      {draggedItem?.type === 'dialogue' ? (
        <div
          style={{
            cursor: 'grabbing',
            backgroundColor: 'white'
          }}
        >
          <DialogueEditor
            initialText={
              scenes[draggedItem.sceneId]?.dialogue.find(
                d => d.id === draggedItem.data.id
              )?.text || ''
            }
            dialogueId={draggedItem.data.id}
            sceneId={draggedItem.sceneId}
          />
        </div>
      ) : draggedItem ? (
        <SidebarGroup>
          <SidebarMenu>
            <DragableSidebarMenuItem item={draggedItem}>
              <SidebarMenuButton
                style={{ cursor: isOptionKeyPressed ? 'copy' : 'drag' }}
              >
                <File className="h-4 w-4" />
                <span>{draggedItem.data.id}</span>
              </SidebarMenuButton>
            </DragableSidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      ) : null}
    </DragOverlay>
  )
}
