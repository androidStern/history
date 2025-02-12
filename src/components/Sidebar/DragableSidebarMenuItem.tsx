import { DraggedItemType } from '@/components/Sidebar/types';
import { SidebarMenuItem } from '@/components/ui/sidebar';
import { useDraggable } from '@dnd-kit/core';

export default function DragableSidebarMenuItem({ item, style = {}, children }: { item: DraggedItemType; style?: React.CSSProperties; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.data.id,
    data: item satisfies DraggedItemType
  })

  style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : 'translate3d(0, 0, 0)',
    opacity: isDragging ? 0 : 1,
    transition: 'opacity 0.2s ease',
    ...style
  }

  return (
    <SidebarMenuItem ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </SidebarMenuItem>
  )
}
