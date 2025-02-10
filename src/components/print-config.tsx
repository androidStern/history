import { useState, useEffect } from 'react'
import { usePositionStore } from '@/game/hooks/positionEditsStore'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrintConfig() {
  const { scenes } = usePositionStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1 inch is approximately 96 pixels
      setIsVisible(e.clientY <= 96)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleExport = () => {
    // Create a blob with the scenes data
    const data = JSON.stringify(scenes, null, 2)
    const blob = new Blob([data], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scene-positions-${new Date().toISOString().split('T')[0]}.json`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className={`fixed top-4 right-4 transition-opacity duration-200 z-50 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <Button onClick={handleExport} variant="default" size="default">
        <Download />
        Export Positions
      </Button>
    </div>
  )
}
