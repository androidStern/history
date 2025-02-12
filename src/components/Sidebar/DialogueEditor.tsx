import { usePositionStore } from "@/game/hooks/positionEditsStore"
import { DialogueItem, Scene } from "@/game/types"
import { X } from "lucide-react"
import { useCallback, useRef, useState, KeyboardEvent } from "react"

interface DialogueEditorProps {
  initialText: string
  dialogueId: DialogueItem['id']
  sceneId: Scene['id']
  defaultIsEditing?: boolean
  onCancel?: () => void
  onComplete?: () => void
  ref?: React.RefObject<HTMLDivElement>
}

export default function DialogueEditor({ initialText, dialogueId, sceneId, defaultIsEditing = false, onCancel, onComplete }: DialogueEditorProps) {
  const [isEditing, setIsEditing] = useState(defaultIsEditing)
  const dialogue = usePositionStore(state => state.scenes[sceneId]?.dialogue.find(d => d.id === dialogueId))
  const [text, setText] = useState(dialogue?.text ?? initialText)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { updateDialogue, addDialogue } = usePositionStore()

  const handleCommit = useCallback(() => {
    if (!dialogue) {
      addDialogue(sceneId, { text })
    } else {
      updateDialogue(sceneId, { id: dialogueId, text })
    }

    setIsEditing(false)
    onComplete?.()
  }, [dialogue, onComplete, addDialogue, sceneId, text, updateDialogue, dialogueId])

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      // Keep focus on textarea to prevent blur
      textareaRef.current?.focus()
      setText(initialText)
      // Use RAF to ensure the text is reset before closing
      requestAnimationFrame(() => {
        setIsEditing(false)
        console.log('cancel')
        onCancel?.()
      })
    },
    [initialText, onCancel]
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCommit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setText(initialText)
      setIsEditing(false)
      onCancel?.()
    }
  }

  if (!isEditing) {
    return (
      <div
        className="min-h-[24px] px-2 py-1 cursor-pointer hover:bg-accent/50 rounded-md"
        onClick={() => {
          setIsEditing(true)
          setTimeout(() => textareaRef.current?.focus(), 0)
        }}
      >
        {text}
      </div>
    )
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={e => {
          // Only commit if the related target is not the cancel button
          if (!(e.relatedTarget instanceof HTMLButtonElement && e.relatedTarget.dataset.action === 'cancel')) {
            handleCommit()
          }
        }}
        className="w-full min-h-[24px] px-2 py-1 rounded-md bg-accent/50 resize-none outline-none"
        rows={Math.max(1, text.split('\n').length)}
        autoFocus
      />
      <button onClick={handleCancel} data-action="cancel" className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground">
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
