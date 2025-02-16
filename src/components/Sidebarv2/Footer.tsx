import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import * as DD from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import * as SB from '@/components/ui/sidebar'
import { gameConfigSchema } from '@/game/gameData'
import { useGameStore } from '@/stores/useGameStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronsUpDown, FileEdit, FolderOpen, Gamepad2, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Project name is required.'
  })
})

export default function Footer() {
  const name = useGameStore(state => state.name)
  const scenes = useGameStore(state => state.scenes)
  const assetMap = useGameStore(state => state.assetMap)
  const setName = useGameStore(state => state.setName)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name
    }
  })

  const [open, setOpen] = useState(false)

  function onSubmit(values: z.infer<typeof formSchema>) {
    setName(values.name)
    setOpen(false)
    toast('Project renamed successfully!')
  }

  const handleExport = () => {
    // Convert Map to object for serialization

    const gameData: z.infer<typeof gameConfigSchema> = {
      scenes,
      name,
      assetMap: Object.fromEntries(assetMap)
    }
    // Create a blob with the scenes data
    const data = JSON.stringify(gameData, null, 2)
    const blob = new Blob([data], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name}-${new Date()
      .toLocaleDateString('en-US')
      .replace(/\/| /g, '')}.gameConfig`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.gameConfig'

    // Handle file selection
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const jsonData = JSON.parse(text)

        // Validate the imported data
        const result = gameConfigSchema.safeParse(jsonData)
        if (!result.success) {
          console.error('Invalid game config:', result.error)
          alert('Invalid game config file. Please make sure the file is valid.')
          return
        }

        const gameData = result.data
        const assetMap = new Map(Object.entries(gameData.assetMap || {}))

        useGameStore.setState({
          scenes: gameData.scenes,
          name: gameData.name,
          assetMap
        })
        toast('Import successful!')
      } catch (error) {
        console.error('Failed to import game config:', error)
        alert('Failed to import game config. Please make sure the file is valid.')
      }
    }

    // Trigger file selection
    input.click()
  }

  return (
    <SB.SidebarFooter>
      <SB.SidebarMenu>
        <SB.SidebarMenuItem>
          <Dialog open={open} onOpenChange={setOpen}>
            <DD.DropdownMenu>
              <DD.DropdownMenuTrigger asChild>
                <SB.SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Gamepad2 className="h-8 w-8 rounded-lg" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SB.SidebarMenuButton>
              </DD.DropdownMenuTrigger>
              <DD.DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={'right'}
                align="end"
                sideOffset={4}
              >
                <DD.DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Gamepad2 className="h-8 w-8 rounded-lg" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{name}</span>
                    </div>
                  </div>
                </DD.DropdownMenuLabel>
                <DD.DropdownMenuSeparator />
                <DD.DropdownMenuGroup>
                  <DD.DropdownMenuItem onSelect={handleExport}>
                    <Save />
                    Save Project
                  </DD.DropdownMenuItem>
                  <DD.DropdownMenuItem onSelect={handleImport}>
                    <FolderOpen />
                    Open Project
                  </DD.DropdownMenuItem>
                  <DialogTrigger asChild>
                    <DD.DropdownMenuItem>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Rename Project
                    </DD.DropdownMenuItem>
                  </DialogTrigger>
                </DD.DropdownMenuGroup>
              </DD.DropdownMenuContent>
            </DD.DropdownMenu>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Rename Project</DialogTitle>
                <DialogDescription>
                  Change your project name here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4 py-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="grid grid-cols-4 items-center gap-4">
                        <FormLabel className="text-right">Name</FormLabel>
                        <FormControl>
                          <Input className="col-span-3" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </SB.SidebarMenuItem>
      </SB.SidebarMenu>
    </SB.SidebarFooter>
  )
}
