import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import { SpriteConfig } from '@/game/types'

class CharacterScene extends Phaser.Scene {
  private sprite: Phaser.GameObjects.Sprite | null
  private customConfig: SpriteConfig
  public ready = false

  constructor(customConfig: SpriteConfig) {
    super({ key: 'CharacterScene' })
    this.sprite = null
    this.customConfig = customConfig
  }

  preload() {
    this.load.image('tempSheet', this.customConfig.imageUrl)
  }

  create() {
    const texture = this.textures.get('tempSheet')
    const { width, height } = texture.getSourceImage()
    const rowCount = this.customConfig.rows.length
    const maxFrames = Math.max(...this.customConfig.rows.map(r => r.frames))
    const frameWidth = width / maxFrames
    const frameHeight = height / rowCount

    this.load.spritesheet('characterSheet', this.customConfig.imageUrl, {
      frameWidth,
      frameHeight
    })

    this.load.once('complete', () => {
      this.defineAnimations(maxFrames)
      const gameHeight = this.game.config.height as number
      this.sprite = this.add.sprite(400, gameHeight * 0.8, 'characterSheet', 0)
      this.sprite.setScale(2)
      this.sprite.play('idle')
      this.customConfig.onReady?.()
    })

    this.load.start()
  }

  defineAnimations(maxFrames: number) {
    this.customConfig.rows.forEach((rowData, rowIndex) => {
      const { name, frames, frameRate } = rowData

      const startIndex = rowIndex * maxFrames
      const endIndex = startIndex + frames - 1

      this.anims.create({
        key: name,
        frames: this.anims.generateFrameNumbers('characterSheet', {
          start: startIndex,
          end: endIndex
        }),
        frameRate,
        repeat: -1 // loop forever
      })
    })

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('characterSheet', {
        start: 6 * maxFrames,
        end: 6 * maxFrames
      }),
      frameRate: 0, // 0 frameRate means it won't animate
      repeat: 0 // Don't repeat since it's a single frame
    })
  }

  setAnimation(animName: string) {
    if (this.sprite) {
      this.sprite.play(animName)
    }
  }
}

const PhaserCharacter = ({ spriteConfig, className, characterAction }: { spriteConfig: SpriteConfig; className?: string; characterAction?: string }) => {
  const phaserRef = useRef(null)
  const gameRef = useRef<Phaser.Game>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const scene = new CharacterScene({
      ...spriteConfig,
      onReady: () => {
        setReady(true)
      }
    })

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 3
      },
      parent: phaserRef.current,
      transparent: true,
      scene
    })

    return () => {
      if (gameRef.current) gameRef.current.destroy(true)
    }
  }, [spriteConfig])

  useEffect(() => {
    if (ready && gameRef.current && characterAction) {
      const scene = gameRef.current.scene.getScene('CharacterScene') as CharacterScene
      scene.setAnimation(characterAction)
    }
  }, [characterAction, ready])

  return (
    <div className={className}>
      <div ref={phaserRef}></div>
    </div>
  )
}

export default PhaserCharacter
