import './App.css'

import WorldView from './game/WorldView'
import PrintConfig from './components/print-config'
import AssetPalette from './components/AssetPalette'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

function App() {
  return (
    <ErrorBoundary>
      <SidebarProvider defaultOpen={false}>
        <AssetPalette />
        <SidebarTrigger />
        <main className="w-full h-screen flex-1 flex items-center justify-center">
          <WorldView />
          <PrintConfig />
        </main>
      </SidebarProvider>
    </ErrorBoundary>
  )
}

export default App

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error and errorInfo
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div role="alert">
          <p className="text-red">Something went wrong:</p>
          {this.state.error?.stack && <pre style={{ textAlign: 'left', color: 'red' }}>{this.state.error.stack}</pre>}
          {this.state.errorInfo?.componentStack && <pre style={{ textAlign: 'left', color: 'red' }}>{this.state.errorInfo.componentStack}</pre>}
        </div>
      )
    }

    return this.props.children
  }
}
