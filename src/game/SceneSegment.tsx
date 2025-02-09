import { Layer } from './types'

interface SceneSegmentProps {
  segment: {
    id: string
    width: number
    startX: number
    layers: Layer[]
  }
  cameraX: number
}

export default function SceneSegment({ segment, cameraX }: SceneSegmentProps) {
  const baseOffset = segment.startX - cameraX

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {segment.layers.map(layer => {
        const factor = layer.parallaxFactor ?? 1
        const layerOffsetX = baseOffset * factor
        const zIndex = layer.id === 'bg' ? 0 : layer.id === 'mid' ? 1 : 2

        return (
          <div key={layer.id}>
            {layer.items.map(item => {
              const finalX = layerOffsetX + item.x
              const finalY = item.y

              return (
                <img
                  key={item.id}
                  src={item.imageUrl}
                  alt={item.id}
                  className="absolute"
                  style={{
                    zIndex,
                    transform: `translate(${finalX}px, ${finalY}px)`
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
