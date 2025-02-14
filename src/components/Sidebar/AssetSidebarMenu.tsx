import { useRef } from "react"
import { SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, Plus } from "lucide-react"
import { useAssetStore } from "@/stores/assetStore"

interface AssetSidebarMenuProps {
    isAssetsOpen: boolean
    setIsAssetsOpen: (open: boolean) => void
}

export default function AssetSidebarMenu({ isAssetsOpen, setIsAssetsOpen }: AssetSidebarMenuProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { assetMap, uploadFiles } = useAssetStore()
    
  return (
    <SidebarMenu>
      <Collapsible asChild open={isAssetsOpen} onOpenChange={setIsAssetsOpen} className="group/collapsible">
        <SidebarMenuItem>
          <SidebarMenuButton>
            <span>🌇</span>
            <span>Assets</span>
          </SidebarMenuButton>
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90" showOnHover>
              <ChevronRight className="h-4 w-4" />
            </SidebarMenuAction>
          </CollapsibleTrigger>
          <SidebarMenuAction showOnHover onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4" />
          </SidebarMenuAction>
          <CollapsibleContent>
            <SidebarMenuSub className="grid grid-cols-3 gap-2 w-full">
              <div className="relative group aspect-square rounded-md border bg-background hover:ring-2 ring-primary overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute inset-0 p-1 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground group-hover:scale-105 transition-transform" />
                </div>
              </div>

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
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={e => uploadFiles(e.target.files)} />
    </SidebarMenu>
  )
}
