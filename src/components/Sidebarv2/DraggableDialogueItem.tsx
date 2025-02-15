'use client'

import { useDraggableItemContext, useGameStore } from '@/stores/useGameStore'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { Dialogue, Scene } from '@/game/types'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  ChevronsUpDown,
  CornerDownLeft,
  Edit,
  MessageSquare,
  Save,
  User,
  X
} from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'

interface DraggableDialogueItemProps extends React.HTMLAttributes<HTMLDivElement> {
  itemId: Dialogue['id']
  sceneId: Scene['id']
  content: string
  speaker?: string
  initialIsEditing?: boolean
  onCancel?: () => void
  onSubmit?: () => void
}

export const DraggableDialogueItem: React.FC<DraggableDialogueItemProps> =
  React.forwardRef<HTMLDivElement, DraggableDialogueItemProps>(
    (
      {
        itemId,
        sceneId,
        content,
        speaker = 'Unknown',
        initialIsEditing = false,
        onCancel,
        onSubmit,
        ...props
      },
      ref
    ) => {
      const upsertDialogueText = useGameStore(state => state.upsertDialogue)
      const changeSpeaker = useGameStore(state => state.changeSpeaker)

      const [isEditing, setIsEditing] = React.useState(initialIsEditing)
      const { isDragging, isOver, setCanDrag } = useDraggableItemContext()

      // Focus the textarea when starting to edit
      const textareaRef = React.useRef<HTMLTextAreaElement>(null)
      React.useEffect(() => {
        if (isEditing && textareaRef.current) {
          textareaRef.current.focus()
          setCanDrag?.(false)
        } else {
          setCanDrag?.(true)
        }
      }, [isEditing, setCanDrag])

      const handleClickToEdit = () => {
        if (!isDragging) {
          setIsEditing(true)
        }
      }
      const handleSubmit = (values: { speaker: string; content: string }) => {
        if (values.speaker.trim() === '') return
        if (values.content.trim() === '') return
        upsertDialogueText(
          sceneId,
          itemId,
          values.content.trim(),
          values.speaker.trim()
        )
        onSubmit?.()
        setIsEditing(false)
      }

      return (
        <div
          {...props}
          ref={ref}
          style={{ opacity: isDragging ? 0.5 : 1 }}
          className={cn(
            'group relative p-2 bg-sidebar-accent rounded-md mb-1 cursor-move transition-all duration-300 ease-in-out',
            isEditing && 'bg-background shadow-lg cursor-auto',
            isOver && 'bg-sidebar-accent/80'
          )}
          onClick={handleClickToEdit}
        >
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="dialogue-edit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <InlineDialogueForm
                  initialSpeaker={speaker}
                  initialContent={content}
                  onCancel={() => {
                    setIsEditing(false)
                    onCancel?.()
                  }}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dialogue-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-sidebar-accent/50 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-sidebar-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{speaker}</p>
                  <p className="text-sm text-sidebar-foreground/70 truncate">
                    {content}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={e => {
                    e.stopPropagation() // Prevent firing the container's onClick
                    setIsEditing(true)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-sidebar-accent/50 p-2 rounded-full hover:bg-sidebar-accent"
                >
                  <Edit className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }
  )

interface InlineDialogueFormProps {
  initialSpeaker: string
  initialContent: string
  onCancel: () => void
  onSubmit: (values: { speaker: string; content: string }) => void
}

export function InlineDialogueForm({
  initialSpeaker,
  initialContent,
  onCancel,
  onSubmit
}: InlineDialogueFormProps) {
  const { getAllSpeakers } = useGameStore()

  const speakers = getAllSpeakers()

  const formSchema = z.object({
    speaker: z.string().min(1, 'Speaker is required'),
    content: z.string().min(1, 'Content is required')
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      speaker: initialSpeaker,
      content: initialContent
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent default submission if you don't want a new line inserted
      e.preventDefault()
      form.handleSubmit(onSubmit)()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-3"
        onKeyDown={handleKeyDown}
      >
        <div className="relative flex-1">
          <FormField
            control={form.control}
            name="speaker"
            render={({ field: { value, onChange } }) => (
              <SpeakerAutocomplete
                value={value}
                onChange={onChange}
                speakers={speakers}
              />
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FormControl>
                <div className="relative">
                  <Textarea
                    {...field}
                    autoFocus
                    className="w-full min-h-[80px] p-3 pb-7 text-sm bg-sidebar-accent/50 border-none rounded-lg resize-none"
                    placeholder="Enter dialogue text..."
                  />
                  <MessageSquare className="absolute right-2 top-2 h-4 w-4 text-sidebar-foreground/30" />
                  <div className="absolute bottom-1.5 inset-x-3 flex items-center justify-between text-[10px] tracking-wide text-sidebar-foreground/30">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">⏎</span>
                      <span>to submit</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">esc</span>
                      <span>to cancel</span>
                    </div>
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={e => {
              e.stopPropagation()
              onCancel()
            }}
            className="bg-sidebar-accent/50 p-2 rounded-full hover:bg-sidebar-accent transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.95 }}
            className="bg-primary p-2 rounded-full hover:bg-primary/90 transition-colors duration-200"
          >
            <Save className="h-4 w-4 text-primary-foreground" />
          </motion.button>
        </div>
      </form>
    </Form>
  )
}

interface SpeakerAutocompleteProps {
  value: string
  onChange: (value: string) => void
  speakers: string[]
}

export const SpeakerAutocomplete: React.FC<SpeakerAutocompleteProps> = ({
  value,
  onChange,
  speakers
}) => {
  const [open, setOpen] = React.useState(false)

  const [query, setQuery] = React.useState('')

  const filteredSpeakers = speakers.filter(speaker =>
    speaker.toLowerCase().includes(query.toLowerCase())
  )

  const showCreateOption = query && filteredSpeakers.length === 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-sidebar-accent/50 border-none text-sm h-9 px-3"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-sidebar-foreground/50" />
            <span>{value || 'Select speaker...'}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search speaker..."
          />
          <CommandList>
            <CommandGroup>
              {showCreateOption && (
                <CommandItem
                  value={query}
                  onSelect={currentValue => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>Create speaker</span>
                  <CornerDownLeft className="h-4 w-4 opacity-50" />
                </CommandItem>
              )}
              {filteredSpeakers.length > 0 &&
                filteredSpeakers.map(speaker => (
                  <CommandItem
                    key={speaker}
                    value={speaker}
                    onSelect={currentValue => {
                      onChange(currentValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === speaker ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {speaker}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
