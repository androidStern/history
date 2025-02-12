import { useCallback, useEffect } from 'react'
import { create } from 'zustand'

export type OptionKeyStore = {
  isOptionKeyPressed: boolean
  setOptionKeyPressed: (pressed: boolean) => void
}

const useKeyboardStateStore = create<OptionKeyStore>(set => ({
  isOptionKeyPressed: false,
  setOptionKeyPressed: pressed => set({ isOptionKeyPressed: pressed })
}))

export const useKeyboardState = () => {
  const { isOptionKeyPressed, setOptionKeyPressed } = useKeyboardStateStore()

  const handleEvent = useCallback(
    (e: globalThis.KeyboardEvent) => {
        setOptionKeyPressed(e.key === 'Alt' && e.type === 'keydown')
    },
    [setOptionKeyPressed]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEvent)
    window.addEventListener('keyup', handleEvent)

    return () => {
      window.removeEventListener('keydown', handleEvent)
      window.removeEventListener('keyup', handleEvent)
    }
  }, [handleEvent])

  return {isOptionKeyPressed}
}
