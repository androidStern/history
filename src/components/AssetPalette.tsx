import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { useAssetStore } from '@/stores/assetStore'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarRail, SidebarTrigger } from './ui/sidebar'

export default function AssetPalette() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { assetMap, addAsset } = useAssetStore()

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = e => {
        const dataUrl = e.target?.result as string
        addAsset(file.name, dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <>
      <Sidebar className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-100">
        <SidebarContent>
          <SidebarHeader className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Asset Library</h2>
              <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </SidebarHeader>

          <SidebarGroup>
            <SidebarGroupContent className="p-2">
              <div
                className="grid grid-cols-3 gap-2 w-full"
                onDrop={e => {
                  e.preventDefault()
                  handleFiles(e.dataTransfer.files)
                }}
                onDragOver={e => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'copy'
                }}
              >
                {Array.from(assetMap.entries()).map(([name, dataUrl]) => (
                  <div
                    key={name}
                    className="relative group aspect-square rounded-md border bg-background cursor-grab hover:ring-2 ring-primary overflow-hidden"
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', dataUrl)
                      e.dataTransfer.effectAllowed = 'copy'
                    }}
                  >
                    <div className="absolute inset-0 p-1 flex items-center justify-center">
                      <img src={dataUrl} alt={name} className="w-full h-full object-contain max-w-[80%] max-h-[80%] hover:scale-105 transition-transform" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-1 truncate text-white backdrop-blur-sm">{name}</div>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger>
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarTrigger>
        </SidebarFooter>
      </Sidebar>

      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => handleFiles(e.target.files)} />
    </>
  )
}
