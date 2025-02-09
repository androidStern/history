import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import SceneSegment from './SceneSegment'
import DialogueOverlay from './DialogueOverlay'
import { Scene, Segment } from './types'
import { heroConfig, scenes } from './scenes'
import PhaserCharacter from '@/components/character'
import { createParser, parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'

const sceneParser = createParser({
  parse: (value: string) => scenes[value],
  serialize: (scene: Scene) => scene.id,
  eq: (a: Scene, b: Scene) => a.id === b.id
})

const sceneHistoryParser = createParser({
  parse: (_ids: string) => {
    const ids = parseAsArrayOf(parseAsString).parse(_ids)
    return ids?.map(id => scenes[id]) ?? []
  },
  serialize: (scenes: Scene[]) => parseAsArrayOf(parseAsString).serialize(scenes.map(scene => scene.id)),
  eq: (a: Scene[], b: Scene[]) => a.every((scene, index) => scene.id === b[index].id)
})

const BGPath = '/assets/winter-bg.jpg'

const TWEEN_DURATION = 2

export default function WorldView() {
  const [cameraX, setCameraX] = useState(0)
  const cameraRef = useRef({ value: 0 })
  const [currentScene, setCurrentScene] = useQueryState<Scene>('scene', sceneParser.withDefault(scenes['sceneA']))
  const currentTransitionId = useRef<number | null>(null)

  // The active scene segments in the DOM
  const [activeSegments, setActiveSegments] = useState<Segment[]>([])

  const [sceneHistory, setSceneHistory] = useState<Segment[]>([])
  const [characterAction, setCharacterAction] = useState<string>('idle')
  const [loaded, setLoaded] = useState(false)

  // Load initial scene on mount
  useEffect(() => {
    if (loaded) return
    setLoaded(true)

    const initialSegment: Segment = { ...currentScene, startX: 0, uniqueVisitId: Date.now() }

    setActiveSegments([initialSegment])
    setSceneHistory([initialSegment])
  }, [currentScene, loaded])

  // Keep the cameraRef in sync with cameraX
  useEffect(() => {
    cameraRef.current.value = cameraX
  }, [cameraX])

  const transitionToScene = (nextSceneId: string) => {
    const nextSceneData = scenes[nextSceneId]
    if (!nextSceneData) return

    const newId = Date.now()
    currentTransitionId.current = newId

    const currentTop = sceneHistory[sceneHistory.length - 1]
    if (!currentTop) return

    // Immediately set the new scene and reset dialogue state
    setCurrentScene(nextSceneData)

    // Place new scene to the right
    const newSegmentStart = currentTop.startX + currentTop.width
    const nextSegment: Segment = {
      ...nextSceneData,
      startX: newSegmentStart,
      uniqueVisitId: Date.now()
    }

    // Add the next scene to activeSegments and history immediately
    setActiveSegments(prev => [...prev, nextSegment])
    setSceneHistory(prev => [...prev, nextSegment])

    setCharacterAction('walkRight')

    gsap.to(cameraRef.current, {
      value: newSegmentStart,
      duration: TWEEN_DURATION,
      onUpdate: () => {
        setCameraX(cameraRef.current.value)
      },
      onComplete: () => {
        if (currentTransitionId.current !== newId) return
        setCharacterAction('idle')
        setActiveSegments([nextSegment])
      }
    })
  }

  const goBack = () => {
    if (sceneHistory.length < 2) return

    const newId = Date.now()
    currentTransitionId.current = newId

    // Get current and previous scenes
    const currentTop = sceneHistory[sceneHistory.length - 1]
    const previousTop = sceneHistory[sceneHistory.length - 2]

    // Add both scenes to DOM for transition
    setActiveSegments([previousTop, currentTop])

    setSceneHistory(prev => prev.slice(0, prev.length - 1))
    setCurrentScene(previousTop)

    setCharacterAction('walkLeft')

    // Animate camera back to previous scene
    gsap.to(cameraRef.current, {
      value: previousTop.startX,
      duration: TWEEN_DURATION,
      onUpdate: () => {
        setCameraX(cameraRef.current.value)
      },
      onComplete: () => {
        if (currentTransitionId.current !== newId) return
        setCharacterAction('idle')
        setActiveSegments([previousTop])
      }
    })
  }

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden"
      style={{
        backgroundImage: `url(${BGPath})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {activeSegments.map(segment => (
        <SceneSegment key={segment.id} segment={segment} cameraX={cameraX} />
      ))}
      <div className="absolute inset-0">
        <PhaserCharacter spriteConfig={heroConfig} characterAction={characterAction} className="bg-red w-full h-full" />
      </div>

      {currentScene && <DialogueOverlay dialogue={currentScene.dialogue || []} choices={currentScene.choices || []} onChoiceSelect={transitionToScene} goBack={goBack} showBack={sceneHistory.length > 1} />}
    </div>
  )
}
