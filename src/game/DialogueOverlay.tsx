import { useState, useEffect, useCallback, useRef } from 'react'
import { gsap } from 'gsap'
import { Button } from '@/components/ui/button'
import { ArrowBigRightDash, Undo2, FastForward, RotateCcw } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface DialogueItem {
  id: string
  speaker: string
  text: string
}

interface Choice {
  id: string
  label: string
  nextSceneId: string
}

interface DialogueOverlayProps {
  dialogue: DialogueItem[]
  choices: Choice[]
  onChoiceSelect: (nextSceneId: string) => void
  goBack: () => void
  showBack: boolean
}

export default function DialogueOverlay({ dialogue, choices, onChoiceSelect, goBack, showBack }: DialogueOverlayProps) {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [showChoices, setShowChoices] = useState(false)
  const [resetDialog, setResetDialog] = useState(new Date())
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const animateText = useCallback((text: string) => {
    // Kill any existing animation
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    setDisplayedText('')
    const tl = gsap.timeline()
    timelineRef.current = tl

    tl.to(setDisplayedText, {
      duration: text.length * 0.05, // Adjust speed as needed
      value: text,
      ease: 'none',
      onUpdate: () => {
        const progress = Math.floor(tl.progress() * text.length)
        setDisplayedText(text.slice(0, progress))
      }
    })
  }, [])

  // Reset dialogue state when new dialogue is received
  useEffect(() => {
    setCurrentDialogueIndex(0)
    setDisplayedText('')
    setShowChoices(false)

    // Start animating the first dialogue if available
    if (dialogue.length > 0) {
      animateText(dialogue[0].text)
    }
  }, [dialogue, animateText, resetDialog])

  useEffect(() => {
    if (currentDialogueIndex < dialogue.length) {
      animateText(dialogue[currentDialogueIndex].text)
      setShowChoices(false) // Hide choices when showing dialogue
    } else if (choices.length > 0) {
      setShowChoices(true)
    }
  }, [currentDialogueIndex, dialogue, choices.length, animateText])

  const restartDialogue = () => {
    setResetDialog(new Date())
  }

  const handleClick = () => {
    if (currentDialogueIndex < dialogue.length - 1) {
      setCurrentDialogueIndex(prev => prev + 1)
    } else {
      setShowChoices(true)
    }
  }

  const skip = () => {
    setCurrentDialogueIndex(dialogue.length)
    setShowChoices(true)
  }

  const onGoBack = () => {
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    setDisplayedText('')
    setCurrentDialogueIndex(0)
    goBack()
  }

  return (
    <div className="absolute top-4 left-4 w-1/5 bg-black/70 text-white rounded-lg cursor-pointer shadow-lg z-50 text-left p-4 pb-1 min-h-[200px] flex flex-col">
      {!showChoices && currentDialogueIndex < dialogue.length && (
        <div className="" onClick={handleClick}>
          <div className="font-bold mb-2 text-sm">{dialogue[currentDialogueIndex].speaker}</div>
          <div className="text-sm">{displayedText}</div>
          <div className="text-xs text-gray-400 mt-2">Click to continue...</div>
        </div>
      )}

      {showChoices && (
        <div className="gap-1">
          {choices.map(choice => (
            <Button key={choice.id} variant="link" className="text-sm text-gray-400 hover:text-gray-300 font-light italic px-0" onClick={() => onChoiceSelect(choice.nextSceneId)}>
              {choice.label}
              <ArrowBigRightDash />
            </Button>
          ))}
        </div>
      )}

      <div className="mt-auto border-t border-white/20">
        <div className="flex items-center justify-between py-1">
          {showBack && (
            <>
              <Button variant="ghost" size="xs" className="flex items-center gap-1 text-[10px] hover:bg-white/20 px-2 py-1" onClick={onGoBack}>
                <Undo2 className="h-3 w-3" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-4 bg-white/20" />
            </>
          )}

          <Button variant="ghost" size="xs" className="flex items-center gap-1 text-[10px] hover:bg-white/20 px-2 py-1" onClick={skip}>
            <FastForward className="h-3 w-3" />
            Skip
          </Button>

          <Separator orientation="vertical" className="h-4 bg-white/20" />

          <Button variant="ghost" size="xs" className="flex items-center gap-1 text-[10px] hover:bg-white/20 px-2 py-1" onClick={restartDialogue}>
            <RotateCcw className="h-3 w-3" />
            Restart
          </Button>
        </div>
      </div>
    </div>
  )
}
