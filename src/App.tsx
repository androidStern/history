import { ErrorBoundary } from 'react-error-boundary'
import './App.css'

import WorldView from './game/WorldView'
import PrintConfig from './components/print-config'
import AssetPalette from './components/AssetPalette'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from './components/ui/button'
import { Plus } from 'lucide-react'

function App() {
  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <SidebarProvider>
        <AssetPalette />

        <SidebarTrigger className="fixed left-4 top-4 z-50">
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
        <main className="flex-1 flex items-center justify-center p-4 ml-[--sidebar-width] transition-[margin] duration-200 ease-in-out group-data-[state=collapsed]/sidebar:ml-[--sidebar-width-icon]">
          <div className="w-full max-w-[1200px]">
            <WorldView />
            <PrintConfig />
          </div>
        </main>
      </SidebarProvider>
    </ErrorBoundary>
  )
}

export default App

function fallbackRender({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  console.error(error)

  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>

      {error.stack && <pre style={{ textAlign: 'left' }}>{error.stack}</pre>}

      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}
