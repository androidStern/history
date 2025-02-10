import { useState } from 'react'
import ParallaxLayers from '@/game/ParallaxLayers'
import DialogueOverlay from '@/game/DialogueOverlay'
import { heroConfig } from '@/game/gameData'
import PhaserCharacter from '@/components/character'
import { useSceneTransitions } from '@/game/hooks/hooks'
import { usePositionStore } from './hooks/positionEditsStore'

const BGPath = '/assets/winter-bg.jpg'

export default function WorldView() {
  const [characterAction, setCharacterAction] = useState<string>('idle')
  const { scenes } = usePositionStore()

  const { cameraX, activeSegments, currentScene, goForward, goBack, sceneHistory } = useSceneTransitions({
    initialScene: scenes['sceneA'],
    scenes,
    onGoForwardStart: setCharacterAction.bind(null, 'walkRight'),
    onGoForwardEnd: setCharacterAction.bind(null, 'idle'),
    onGoBackStart: setCharacterAction.bind(null, 'walkLeft'),
    onGoBackEnd: setCharacterAction.bind(null, 'idle')
  })

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
        <ParallaxLayers key={segment.id} segment={segment} cameraX={cameraX} />
      ))}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        <PhaserCharacter spriteConfig={heroConfig} characterAction={characterAction} />
      </div>

      {currentScene && <DialogueOverlay dialogue={currentScene.dialogue || []} choices={currentScene.choices || []} onChoiceSelect={goForward} goBack={goBack} showBack={sceneHistory.length > 1} />}
    </div>
  )
}
