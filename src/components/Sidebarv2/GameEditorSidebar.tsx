'use client'

import { DraggableDialogueItem } from '@/components/Sidebarv2/DraggableDialogueItem'
import { DraggableImageItem } from '@/components/Sidebarv2/DraggableImageItem'
import {
  DnDDroppableWrapper,
  DnDItemWrapper
} from '@/components/Sidebarv2/Wrappers'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { useGameStore } from '@/stores/useGameStore'
import AssetSidebarMenu from '@/components/Sidebar/AssetSidebarMenu'
import { Button } from '@/components/ui/button'
import { Dialogue, Scene } from '@/game/types'
import { cn } from '@/lib/utils'
import { useAssetStore } from '@/stores/assetStore'
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  GitBranch,
  Image,
  Layers,
  MessageSquare,
  Plus,
  Trash2
} from 'lucide-react'
import { nanoid } from 'nanoid'
import type React from 'react'
import { useCallback, useRef, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useDebouncedCallback } from 'use-debounce'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

const DEBOUNCE_TIME = 200

export const GameEditorSidebar: React.FC = () => {
  const { uploadFiles } = useAssetStore()
  const scenes = useGameStore(state => state.scenes)
  const addScene = useGameStore(state => state.addScene)
  const deleteChoice = useGameStore(state => state.deleteChoice)
  const [userOpenSections, setUserOpenSections] = useState<Record<string, boolean>>(
    {}
  )
  const [forcedOpenSections, setForcedOpenSections] = useState<
    Record<string, boolean>
  >({})

  const [isAssetsOpen, setIsAssetsOpen] = useState(false)

  const [draftDialogue, setDraftDialogue] = useState<
    (Dialogue & { sceneId: Scene['id'] }) | null
  >(null)

  const [draftScene, setDraftScene] = useState<Scene | null>(null)

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
    DEBOUNCE_TIME * 0.2
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
      <Sidebar
        onDrop={e => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            uploadFiles(e.dataTransfer.files)
          }
        }}
        onDragOver={e => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setIsAssetsOpen(true)
          }
        }}
        onDragLeave={e => {
          if (e.dataTransfer.types.includes('Files')) {
            setIsAssetsOpen(false)
          }
        }}
      >
        <SidebarContent>
          <SidebarGroup>
            <AssetSidebarMenu
              isAssetsOpen={isAssetsOpen}
              setIsAssetsOpen={setIsAssetsOpen}
            />
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>
              <SidebarMenuButton>Scenes</SidebarMenuButton>
            </SidebarGroupLabel>
            <SidebarGroupAction
              onClick={() =>
                setDraftScene({
                  id: nanoid(),
                  name: '',
                  width: 1920,
                  layers: [],
                  dialogue: []
                })
              }
              title="Add Scene"
            >
              <Plus /> <span className="sr-only">Add Scene</span>
            </SidebarGroupAction>

            {draftScene && (
              <SidebarGroup key={draftScene.id}>
                <SidebarGroupLabel asChild>
                  <input
                    type="text"
                    value={draftScene.name}
                    onChange={e =>
                      setDraftScene(prev =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        if (draftScene.name.trim().length > 0) {
                          addScene(draftScene.name)
                          setDraftScene(null)
                        }
                      } else if (e.key === 'Escape') {
                        setDraftScene(null)
                      }
                    }}
                    className="bg-transparent outline-none w-full"
                    autoFocus
                  />
                </SidebarGroupLabel>
              </SidebarGroup>
            )}
            {Object.values(scenes).map(scene => (
              <SidebarGroup key={scene.id}>
                <SidebarGroupLabel>{scene.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <DnDDroppableWrapper
                      onDrop={() => onDrop(`${scene.id}-dialogue`)}
                      onDragEnter={() => handleDragEnter(`${scene.id}-dialogue`)}
                      onDragLeave={() => handleDragLeave(`${scene.id}-dialogue`)}
                      key={scene.id + '-dialogue'}
                      type="dialogue"
                      sceneId={scene.id}
                      isSameCollection={item => item.sceneId === scene.id}
                    >
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={() => toggleSection(scene.id, 'dialogue')}
                          className="w-full justify-between group/dialogue"
                        >
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Dialogue
                          </span>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              'opacity-0 rotate-[-90deg] group-hover/dialogue:opacity-100',
                              isOpen(scene.id, 'dialogue') &&
                                'opacity-100 !rotate-0'
                            )}
                          />
                        </SidebarMenuButton>
                        {isOpen(scene.id, 'dialogue') && (
                          <SidebarGroupContent className="pl-4 relative group/addDialogue">
                            {scene.dialogue.length === 0 && (
                              <div className="text-sm text-muted-foreground p-2">
                                Add items here
                              </div>
                            )}
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
                            {!draftDialogue && (
                              <div className="h-12 flex items-end justify-center">
                                <Button
                                  onClick={() =>
                                    setDraftDialogue({
                                      sceneId: scene.id,
                                      id: nanoid(),
                                      text: '',
                                      speaker: ''
                                    })
                                  }
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    'opacity-0 group-hover/addDialogue:opacity-100',
                                    'transition-opacity duration-200',
                                    'flex items-center gap-2',
                                    'text-muted-foreground hover:text-primary',
                                    'hover:bg-primary/5'
                                  )}
                                >
                                  <div className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
                                    <Plus className="w-3 h-3" />
                                  </div>
                                  <span className="italic text-sm">
                                    add dialogue
                                  </span>
                                </Button>
                              </div>
                            )}
                            {draftDialogue &&
                              draftDialogue.sceneId === scene.id && (
                                <DnDItemWrapper
                                  key={draftDialogue.id + '-dialogue'}
                                  type="dialogue"
                                  itemId={draftDialogue.id}
                                  sceneId={scene.id}
                                  index={scene.dialogue.length}
                                >
                                  <DraggableDialogueItem
                                    initialIsEditing={true}
                                    itemId={draftDialogue.id}
                                    sceneId={scene.id}
                                    content={draftDialogue.text}
                                    speaker={draftDialogue.speaker}
                                    onCancel={() => setDraftDialogue(null)}
                                    onSubmit={() => setDraftDialogue(null)}
                                  />
                                </DnDItemWrapper>
                              )}
                            {/* add "new dialogue" button. */}
                          </SidebarGroupContent>
                        )}
                      </SidebarMenuItem>
                    </DnDDroppableWrapper>
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
                          className="flex justify-between items-center w-full group/imageAssets"
                        >
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            <span>Image Assets</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              'opacity-0 rotate-[-90deg] group-hover/imageAssets:opacity-100',
                              isOpen(scene.id, 'imageAssets') &&
                                'opacity-100 !rotate-0'
                            )}
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
                                onDrop={() =>
                                  onDrop(`${scene.id}-layer-${layer.id}`)
                                }
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
                    <Collapsible className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="group/choices w-full !pr-2">
                            <div className="flex items-center w-full">
                              <div className="flex items-center gap-2">
                                <GitBranch className="size-4 text-muted-foreground" />
                                <span>Choices</span>
                              </div>
                              <ChevronRight
                                className={cn(
                                  'ml-auto h-4 w-4 transition-transform duration-200',
                                  'opacity-0 group-hover/choices:opacity-100',
                                  'group-data-[state=open]/collapsible:opacity-100 group-data-[state=open]/collapsible:rotate-90'
                                )}
                              />
                            </div>
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            <SidebarMenuSubItem>
                              <SceneChoicePicker sceneId={scene.id} />
                            </SidebarMenuSubItem>
                            {scene.choices?.map(choice => (
                              <SidebarMenuSubItem key={choice.id}>
                                <SidebarMenuSubButton
                                  className={cn(
                                    !scenes[choice.nextSceneId] &&
                                      'border-red-400 bg-red-400'
                                  )}
                                >
                                  {scenes[choice.nextSceneId] ? (
                                    <span>
                                      {scenes[choice.nextSceneId]?.name ||
                                        scenes[choice.nextSceneId]?.id}
                                    </span>
                                  ) : (
                                    <span>{choice.nextSceneId}</span>
                                  )}
                                </SidebarMenuSubButton>
                                <SidebarMenuAction
                                  asChild
                                  onClick={() => {
                                    deleteChoice(scene.id, choice.id)
                                  }}
                                >
                                  <Trash2 className="size-3" />
                                </SidebarMenuAction>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </DndProvider>
  )
}

const SceneChoicePicker = ({ sceneId }: { sceneId: string }) => {
  const scenes = useGameStore(state => state.scenes)
  const addChoice = useGameStore(state => state.addChoice)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const sceneOptions = Object.entries(scenes)
    .filter(([id]) => id !== sceneId) // cant choose current scene
    .filter(
      ([id]) => !scenes[sceneId].choices?.some(choice => choice.nextSceneId === id) // cant choose scenes already chosen
    )
    .map(([id, scene]) => ({
      value: id,
      label: scene.name || id
    }))

  const handleSubmit = (v: string) => {
    const selectedScene = sceneOptions.find(scene => scene.value === v)
    if (selectedScene) {
      addChoice(sceneId, {
        id: nanoid(),
        label: selectedScene.label,
        nextSceneId: selectedScene.value
      })
      setValue('')
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {value
              ? sceneOptions.find(scene => scene.value === value)?.label
              : 'Add choice...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput ref={inputRef} placeholder="Search scenes..." />
          <CommandList>
            <CommandEmpty>No scenes found.</CommandEmpty>
            <CommandGroup>
              {sceneOptions.map(scene => (
                <CommandItem
                  key={scene.value}
                  value={scene.value}
                  onSelect={currentValue => {
                    console.log('selected')
                    setValue(currentValue === value ? '' : currentValue)
                    handleSubmit(currentValue)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === scene.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {scene.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
