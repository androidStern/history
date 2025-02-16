'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { ImageAsset, Layer, Scene } from '@/game/types'
import { cn } from '@/lib/utils'
import { useDraggableItemContext, useGameStore } from '@/stores/useGameStore'
import { Copy, ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react'
import React from 'react'

interface DraggableImageItemProps extends React.HTMLAttributes<HTMLLIElement> {
  itemId: ImageAsset['id']
  sceneId: Scene['id']
  layerId?: Layer['id']
  content: string
  url: string
}

/**
 * This component renders a draggable "image" item.
 * All DnD logic is lifted into DnDItemWrapper, so we only:
 *   - Wrap the UI with <DnDItemWrapper type="image" ...>
 *   - Use isDragging/isOver from useDraggableItemContext() for styling
 *   - Implement normal UI logic (delete, open in new tab, etc.)
 */
export const DraggableImageItem: React.FC<DraggableImageItemProps> =
  React.forwardRef<HTMLLIElement, DraggableImageItemProps>(
    ({ itemId, sceneId, layerId, content, url, ...props }, ref) => {
      const deleteItem = useGameStore(state => state.deleteItem)
      const { isDragging, isOver } = useDraggableItemContext()

      const handleCopyUrl = async () => {
        try {
          await navigator.clipboard.writeText(url)
        } catch (err) {
          console.error('Failed to copy URL:', err)
        }
      }

      const handleOpenInNewTab = () => {
        window.open(url, '_blank')
      }

      const handleDelete = () => {
        deleteItem('image', sceneId, itemId, layerId)
      }

      return (
        <SidebarMenuItem
          ref={ref}
          {...props}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          className={cn(
            'bg-sidebar-accent cursor-move transition-all duration-300 ease-in-out',
            isOver && 'bg-sidebar-accent/80'
          )}
        >
          <SidebarMenuButton asChild>
            <span className="text-sidebar-foreground/70 truncate">{content}</span>
          </SidebarMenuButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction>
                <MoreHorizontal />
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
              <DropdownMenuContent className="z-[99999] dropdown-menu">
                <DropdownMenuItem onClick={handleCopyUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy Image URL</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenInNewTab}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span>Open Image in New Tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </SidebarMenuItem>
      )
    }
  )
