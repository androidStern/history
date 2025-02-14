'use client'

import { DraggableDialogueItem } from '@/components/Sidebarv2/DraggableDialogueItem'
import { DraggableImageItem } from '@/components/Sidebarv2/DraggableImageItem'
import { DroppableSection } from '@/components/Sidebarv2/DroppableSection'
import { useGameStore } from '@/stores/useGameStore'
import {
  DnDDroppableWrapper,
  DnDItemWrapper
} from '@/components/Sidebarv2/Wrappers'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ChevronDown, Image, Layers, MessageSquare } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useDebouncedCallback } from 'use-debounce'

const DEBOUNCE_TIME = 200

export const GameEditorSidebar: React.FC = () => {
  const scenes = useGameStore(state => state.scenes)
  const [userOpenSections, setUserOpenSections] = useState<Record<string, boolean>>(
    {}
  )
  const [forcedOpenSections, setForcedOpenSections] = useState<
    Record<string, boolean>
  >({})

  const toggleSection = useCallback((sceneId: string, section: string) => {
    const sectionId = `${sceneId}-${section}`
    setUserOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }, [])

  const handleDragEnter = useDebouncedCallback(
    useCallback(
      (sectionId: string) => {
        // If user didn't explicitly open it, forcibly open
        if (!userOpenSections[sectionId]) {
          setForcedOpenSections(prev => ({ ...prev, [sectionId]: true }))
        }
      },
      [userOpenSections]
    ),
    DEBOUNCE_TIME
  )

  const handleDragLeave = useDebouncedCallback(
    useCallback(
      (sectionId: string) => {
        // If user never opened it, revert forced open
        if (!userOpenSections[sectionId]) {
          setForcedOpenSections(prev => ({ ...prev, [sectionId]: false }))
        }
      },
      [userOpenSections]
    ),
    DEBOUNCE_TIME
  )

  const isOpen = useCallback(
    (sceneId: string, section: string) => {
      const sectionId = `${sceneId}-${section}`
      return userOpenSections[sectionId] || forcedOpenSections[sectionId]
    },
    [userOpenSections, forcedOpenSections]
  )

  const onDrop = useCallback(
    (sectionId: string) => {
      // Get only the truthy entries from forcedOpenSections
      const truthyEntries = Object.fromEntries(
        Object.entries(forcedOpenSections).filter(([, value]) => value)
      )
      setUserOpenSections(prev => ({ ...prev, ...truthyEntries }))
      setForcedOpenSections({})
      setUserOpenSections(prev => ({ ...prev, [sectionId]: true }))
    },
    [forcedOpenSections]
  )

  return (
    <DndProvider backend={HTML5Backend}>
      <Sidebar>
        <SidebarContent>
          {Object.values(scenes).map(scene => (
            <SidebarGroup key={scene.id}>
              <SidebarGroupLabel>{scene.name}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <DroppableSection
                    sceneId={scene.id}
                    sectionType="dialogue"
                    isOpen={isOpen(scene.id, 'dialogue')}
                    onToggle={() => toggleSection(scene.id, 'dialogue')}
                    icon={<MessageSquare className="h-4 w-4 mr-2" />}
                    label="Dialogue"
                  >
                    {scene.dialogue.map((item, index) => (
                      <DnDItemWrapper
                        key={item.id + '-dialogue'}
                        type="dialogue"
                        itemId={item.id}
                        sceneId={scene.id}
                        layerId={undefined}
                        index={index}
                      >
                        <DraggableDialogueItem
                          itemId={item.id}
                          sceneId={scene.id}
                          content={item.text}
                          speaker={item.speaker}
                        />
                      </DnDItemWrapper>
                    ))}
                  </DroppableSection>
                  <DnDDroppableWrapper
                    onDrop={() => onDrop(`${scene.id}-imageAssets`)}
                    onDragEnter={() => handleDragEnter(`${scene.id}-imageAssets`)}
                    onDragLeave={() => handleDragLeave(`${scene.id}-imageAssets`)}
                    key={scene.id + '-image-section'}
                    type="image"
                    sceneId={scene.id}
                    isSameCollection={item => item.sceneId === scene.id}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuSubButton
                        onClick={() => toggleSection(scene.id, 'imageAssets')}
                        className="flex justify-between items-center w-full"
                      >
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          <span>Image Assets</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 rotate-[-90deg] ${
                            isOpen(scene.id, 'imageAssets') ? '!rotate-0' : ''
                          }`}
                        />
                      </SidebarMenuSubButton>
                      {isOpen(scene.id, 'imageAssets') && (
                        <SidebarMenuSub className="pl-4">
                          {scene.layers.length === 0 && (
                            <div className="text-sm text-muted-foreground p-2">
                              Add items here
                            </div>
                          )}
                          {scene.layers.map(layer => (
                            <DnDDroppableWrapper
                              onDrop={() => onDrop(`${scene.id}-layer-${layer.id}`)}
                              onDragEnter={() =>
                                handleDragEnter(`${scene.id}-layer-${layer.id}`)
                              }
                              onDragLeave={() =>
                                handleDragLeave(`${scene.id}-layer-${layer.id}`)
                              }
                              key={layer.id}
                              type="image"
                              sceneId={scene.id}
                              layerId={layer.id}
                              isSameCollection={item =>
                                item.sceneId === scene.id &&
                                item.layerId === layer.id
                              }
                            >
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  onClick={() =>
                                    toggleSection(scene.id, `layer-${layer.id}`)
                                  }
                                  className="flex justify-between items-center w-full group/imagelayer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4" />
                                    <span>{layer.id}</span>
                                  </div>
                                  <ChevronDown
                                    className={cn(
                                      // Base classes
                                      'h-4 w-4 transition-transform duration-200',
                                      // Conditional classes
                                      isOpen(scene.id, `layer-${layer.id}`)
                                        ? 'opacity-100 rotate-0'
                                        : 'opacity-0 rotate-[-90deg] group-hover/imagelayer:opacity-100'
                                    )}
                                  />
                                </SidebarMenuSubButton>
                                {isOpen(scene.id, `layer-${layer.id}`) && (
                                  <SidebarMenuSub>
                                    {layer.items.length === 0 && (
                                      <div className="text-sm text-muted-foreground p-2">
                                        Drop images here
                                      </div>
                                    )}
                                    {layer.items.map((item, index) => (
                                      <DnDItemWrapper
                                        key={item.id + '-image'}
                                        type="image"
                                        itemId={item.id}
                                        sceneId={scene.id}
                                        layerId={layer.id}
                                        index={index}
                                      >
                                        <DraggableImageItem
                                          itemId={item.id}
                                          sceneId={scene.id}
                                          layerId={layer.id}
                                          content={
                                            item.name?.length > 0
                                              ? item.name
                                              : item.url ?? item.id
                                          }
                                          url={item.url}
                                        />
                                      </DnDItemWrapper>
                                    ))}
                                  </SidebarMenuSub>
                                )}
                              </SidebarMenuSubItem>
                            </DnDDroppableWrapper>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  </DnDDroppableWrapper>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </DndProvider>
  )
}
