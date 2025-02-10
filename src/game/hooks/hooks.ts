import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { Scene, Segment } from '@/game/types'
import { createParser, useQueryState } from 'nuqs'

type SceneTransitionsReturn = {
  cameraX: number
  activeSegments: Segment[]
  currentScene: Scene
  goForward: (nextSceneId: string) => void
  goBack: () => void
  sceneHistory: Segment[]
}

type useSceneTransitionsProps = {
  initialScene: Scene
  scenes: Record<string, Scene>
  onGoForwardStart: () => void
  onGoForwardEnd: () => void
  onGoBackStart: () => void
  onGoBackEnd: () => void
}

const TWEEN_DURATION = 2

export function useSceneTransitions({ initialScene, scenes, onGoForwardStart, onGoForwardEnd, onGoBackStart, onGoBackEnd }: useSceneTransitionsProps): SceneTransitionsReturn {
  const [cameraX, setCameraX] = useState(0)
  const cameraRef = useRef({ value: 0 })
  const [activeSegments, setActiveSegments] = useState<Segment[]>([])
  const [sceneHistory, setSceneHistory] = useState<Segment[]>([])

  const parserFactory = useCallback(() => {
    return createParser({
      parse: (value: string) => scenes[value],
      serialize: (scene: Scene) => scene.id,
      eq: (a: Scene, b: Scene) => a.id === b.id
    })
  }, [scenes])

  const [currentScene, setCurrentScene] = useQueryState<Scene>('scene', parserFactory().withDefault(scenes['sceneA']))
  const currentTransitionId = useRef<number | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize once
  useEffect(() => {
    if (!initialized) {
      const initialSegment: Segment = {
        ...initialScene,
        startX: 0,
        uniqueVisitId: Date.now()
      }
      setActiveSegments([initialSegment])
      setSceneHistory([initialSegment])
      setInitialized(true)
    }
  }, [initialized, initialScene])

  // Keep cameraRef in sync
  useEffect(() => {
    cameraRef.current.value = cameraX
  }, [cameraX])

  function goForward(nextSceneId: string) {
    const nextScene = scenes[nextSceneId]
    if (!nextScene) return

    const newId = Date.now()
    currentTransitionId.current = newId

    const currentTop = sceneHistory[sceneHistory.length - 1]
    if (!currentTop) return

    // Switch the "current scene" right away
    setCurrentScene(nextScene)

    // Create new Segment to the right
    const newSegmentStart = currentTop.startX + currentTop.width
    const nextSegment: Segment = {
      ...nextScene,
      startX: newSegmentStart,
      uniqueVisitId: Date.now()
    }

    // Update state
    setActiveSegments(prev => [...prev, nextSegment])
    setSceneHistory(prev => [...prev, nextSegment])

    // Animate
    // setCharacterAction('walkRight')
    onGoForwardStart()
    gsap.to(cameraRef.current, {
      value: newSegmentStart,
      duration: TWEEN_DURATION, // TWEEN_DURATION
      onUpdate: () => setCameraX(cameraRef.current.value),
      onComplete: () => {
        if (currentTransitionId.current !== newId) return
        // setCharacterAction('idle')
        setActiveSegments([nextSegment])
        onGoForwardEnd()
      }
    })
  }

  function goBack() {
    if (sceneHistory.length < 2) return

    const newId = Date.now()
    currentTransitionId.current = newId

    const currentTop = sceneHistory[sceneHistory.length - 1]
    const previousTop = sceneHistory[sceneHistory.length - 2]

    setActiveSegments([previousTop, currentTop])
    setSceneHistory(prev => prev.slice(0, prev.length - 1))
    setCurrentScene(previousTop)

    // setCharacterAction('walkLeft')
    onGoBackStart()
    gsap.to(cameraRef.current, {
      value: previousTop.startX,
      duration: TWEEN_DURATION,
      onUpdate: () => setCameraX(cameraRef.current.value),
      onComplete: () => {
        if (currentTransitionId.current !== newId) return
        // setCharacterAction('idle')
        setActiveSegments([previousTop])
        onGoBackEnd()
      }
    })
  }

  return {
    cameraX,
    activeSegments,
    currentScene,
    goForward,
    goBack,
    sceneHistory
  }
}

// const sceneHistoryParser = createParser({
//   parse: (_ids: string) => {
//     const ids = parseAsArrayOf(parseAsString).parse(_ids)
//     return ids?.map(id => scenes[id]) ?? []
//   },
//   serialize: (scenes: Scene[]) => parseAsArrayOf(parseAsString).serialize(scenes.map(scene => scene.id)),
//   eq: (a: Scene[], b: Scene[]) => a.every((scene, index) => scene.id === b[index].id)
// })
