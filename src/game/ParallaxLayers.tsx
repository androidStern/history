import { Layer } from '@/game/types'
import { useDevModeDrag } from '@/game/hooks/useDevModeDrag'
import { useState, useEffect, useCallback } from 'react'
import { Expand } from 'lucide-react'

interface SceneSegmentProps {
  segment: {
    id: string
    width: number
    startX: number
    layers: Layer[]
  }
  cameraX: number
}

const devMode = true

export default function ParallaxLayers({ segment, cameraX }: SceneSegmentProps) {
  const baseOffset = segment.startX - cameraX
  const progress = Math.min(Math.abs(cameraX - segment.startX) / segment.width, 1)

  const { scenes, handleMouseDown, handleMouseMove, handleMouseUp, handleZoom, handleDrop } = useDevModeDrag(devMode)
  const scene = { ...segment, ...scenes[segment.id] }

  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ pointerEvents: devMode ? 'auto' : 'none' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={e => {
        if (!devMode) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
      }}
      onDrop={e => handleDrop(e, segment.id)}
    >
      {scene.layers.map(layer => {
        const factor = layer.parallaxFactor ?? 1
        const effectiveFactor = factor + (1 - factor) * progress
        const layerOffsetX = baseOffset * effectiveFactor
        const zIndex = layer.id === 'bg' ? 0 : layer.id === 'mid' ? 1 : 2

        return (
          <div key={layer.id} style={{ transform: `translateX(${layerOffsetX}px)`, pointerEvents: devMode ? 'auto' : 'none' }}>
            {layer.items.map(item => {
              const finalX = item.x + layerOffsetX
              const finalY = item.y
              const zoomFactor = item.zoomFactor ?? 1

              return (
                <ResizableImage
                  key={item.id}
                  src={item.url}
                  alt={item.id}
                  x={finalX}
                  y={finalY}
                  zIndex={zIndex}
                  zoomFactor={zoomFactor}
                  devMode={devMode}
                  onDragStart={e => handleMouseDown(e, segment.id, layer.id, item.id, item.x, item.y)}
                  onZoomChange={newZoom => handleZoom(segment.id, layer.id, item.id, newZoom)}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

interface ResizableImageProps {
  src: string
  alt: string
  x: number
  y: number
  zIndex: number
  zoomFactor: number
  devMode: boolean
  onDragStart: (e: React.MouseEvent<HTMLImageElement>) => void
  onZoomChange: (zoom: number) => void
}

function ResizableImage({ src, alt, x, y, zIndex, zoomFactor, devMode, onDragStart, onZoomChange }: ResizableImageProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startZoom, setStartZoom] = useState(1)
  const [showZoomBadge, setShowZoomBadge] = useState(false)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartZoom(zoomFactor)
    setShowZoomBadge(true)
  }

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return
      e.preventDefault()

      const deltaX = e.clientX - startX
      // Adjust this multiplier to control resize sensitivity
      const newZoom = Math.max(0.1, startZoom + deltaX / 200)
      onZoomChange(newZoom)
    },
    [isResizing, startX, startZoom, onZoomChange]
  )

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    // Hide zoom badge after a delay
    setTimeout(() => setShowZoomBadge(false), 1500)
  }, [])

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove)
      window.addEventListener('mouseup', handleResizeEnd)
      return () => {
        window.removeEventListener('mousemove', handleResizeMove)
        window.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [isResizing, handleResizeMove, handleResizeEnd])

  return (
    <div
      className="absolute group"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoomFactor})`,
        zIndex
      }}
    >
      <img
        src={src}
        alt={alt}
        className="block"
        style={{
          cursor: devMode ? 'grab' : 'default'
        }}
        onMouseDown={onDragStart}
      />
      {devMode && (
        <>
          {/* Resize handle */}
          <div
            className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize transition-all duration-150 flex items-center justify-center
              ${isResizing ? 'text-blue-500' : 'text-white/70 opacity-0 group-hover:opacity-100'}`}
            style={{
              transform: `scale(${1 / zoomFactor})` // Counter-scale the handle
            }}
            onMouseDown={handleResizeStart}
          >
            <Expand className="w-4 h-4" />
          </div>
          {/* Zoom indicator badge */}
          {(showZoomBadge || isResizing) && (
            <div
              className="absolute -top-8 left-1/2 bg-black/80 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
              style={{
                transform: `scale(${1 / zoomFactor}) translateX(-50%)` // Counter-scale the badge
              }}
            >
              {(zoomFactor * 100).toFixed(0)}%
            </div>
          )}
        </>
      )}
    </div>
  )
}
