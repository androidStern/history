import React from 'react'
import { useDrop } from 'react-dnd'
import { useGameStore } from '@/stores/useGameStore'
import { ChevronDown } from 'lucide-react'
import {
  SidebarMenuButton,
  SidebarGroupContent,
  SidebarMenuItem
} from '@/components/ui/sidebar'

interface DroppableSectionProps {
  sceneId: string
  sectionType: 'dialogue' | 'imageAssets'
  isOpen: boolean
  onToggle: () => void
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

export const DroppableSection: React.FC<DroppableSectionProps> = ({
  sceneId,
  sectionType,
  isOpen,
  onToggle,
  icon,
  label,
  children
}) => {
  const moveItem = useGameStore(state => state.moveItem)

  const [{ isOver }, drop] = useDrop({
    accept: sectionType === 'dialogue' ? 'dialogue-item' : 'image-item',
    drop: (item: { id: string; sceneId: string; layerId?: string }) => {
      if (item.sceneId !== sceneId) {
        moveItem(
          sectionType === 'dialogue' ? 'dialogue' : 'image',
          item.sceneId,
          sceneId,
          item.id,
          0,
          item.layerId
        )
      }
    },
    collect: monitor => ({
      isOver: !!monitor.isOver()
    })
  })

  return (
    <SidebarMenuItem ref={drop}>
      <SidebarMenuButton onClick={onToggle} className="w-full justify-between">
        <span className="flex items-center">
          {icon}
          {label}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </SidebarMenuButton>
      {isOpen && (
        <SidebarGroupContent className="pl-4">
          {children}
          {React.Children.count(children) === 0 && (
            <div className="text-sm text-muted-foreground p-2">Add items here</div>
          )}
        </SidebarGroupContent>
      )}
    </SidebarMenuItem>
  )
}
