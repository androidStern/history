import { Scene, SpriteConfig } from './types'

const canyonRockPath = '/assets/craftpix-net-675652-free-rocks-pixel-art-asset-pack/canyon_rocks/canyon_rock1.png'

export const scenes: Record<string, Scene> = {
  sceneA: {
    id: 'sceneA',
    width: 2000,
    layers: [
      {
        id: 'bg',
        parallaxFactor: 0.5,
        items: [{ id: 'bg1', imageUrl: canyonRockPath, x: 300, y: 400 }]
      },
      {
        id: 'mid',
        parallaxFactor: 0.8,
        items: [{ id: 'treeCluster2', imageUrl: '/assets/trees_mid.png', x: 800, y: 50 }]
      },
      {
        id: 'fg',
        parallaxFactor: 1.2,
        items: [
          { id: 'fg1', imageUrl: '/assets/trees_fg.png', x: 0, y: 0 },
          { id: 'rock', imageUrl: '/assets/rock.png', x: 400, y: 200 }
        ]
      }
    ],
    dialogue: [
      {
        id: 'dlg1',
        speaker: 'Narrator',
        text: 'In the hush of the forest, the day begins with mystery.'
      },
      {
        id: 'dlg2',
        speaker: 'Hero',
        text: 'I must gather my courage and step forward.'
      }
    ],
    // The choices array defines interactive options that the player can select.
    choices: [
      {
        id: 'choice1',
        label: 'Follow the winding path',
        nextSceneId: 'sceneB'
      },
      {
        id: 'choice2',
        label: 'Climb the ancient tree',
        nextSceneId: 'sceneC'
      }
    ]
  },
  sceneB: {
    id: 'sceneB',
    width: 2200,
    layers: [
      {
        id: 'bg',
        parallaxFactor: 0.5,
        items: [
          {
            id: 'bg-1',
            imageUrl: '/assets/desert_bg.png',
            x: 250,
            y: 0
          }
        ]
      },
      {
        id: 'fg',
        parallaxFactor: 1.2,
        items: [
          {
            id: 'fg-1',
            imageUrl: '/assets/desert_fg.png',
            x: 450,
            y: 0
          }
        ]
      }
    ],
    dialogue: [
      {
        id: 'dlg1',
        speaker: 'Narrator',
        text: 'The desert reveals a harsh beauty under the blazing sun.'
      }
    ],
    choices: [
      {
        id: 'choice1',
        label: 'Return to the forest',
        nextSceneId: 'sceneA'
      }
    ]
  }
}

const frameRate = 20
export const heroConfig: SpriteConfig = {
  imageUrl: '/assets/universal-lpc-sprite_male_01_full.png',
  rows: [
    { name: 'faceAwayDance', frames: 7, frameRate },
    { name: 'faceLeftDance', frames: 7, frameRate },
    { name: 'faceForwardDance', frames: 7, frameRate },
    { name: 'faceRightDance', frames: 7, frameRate },
    // posing
    { name: 'poseAway', frames: 8, frameRate },
    { name: 'poseLeft', frames: 8, frameRate },
    { name: 'poseForward', frames: 8, frameRate },
    { name: 'poseRight', frames: 8, frameRate },
    // walking
    { name: 'walkAway', frames: 9, frameRate },
    { name: 'walkLeft', frames: 9, frameRate },
    { name: 'walkForward', frames: 9, frameRate },
    { name: 'walkRight', frames: 9, frameRate },
    // alt pose
    { name: 'altPoseAway', frames: 6, frameRate },
    { name: 'altPoseLeft', frames: 6, frameRate },
    { name: 'altPoseForward', frames: 6, frameRate },
    { name: 'altPoseRight', frames: 6, frameRate },
    // fight pose
    { name: 'fightPoseAway', frames: 13, frameRate },
    { name: 'fightPoseLeft', frames: 13, frameRate },
    { name: 'fightPoseForward', frames: 13, frameRate },
    { name: 'fightPoseRight', frames: 13, frameRate },
    // falling
    { name: 'falling', frames: 6, frameRate }
  ]
}
