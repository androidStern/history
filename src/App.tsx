import { ErrorBoundary } from 'react-error-boundary'
import './App.css'

import WorldView from './game/WorldView'

function App() {
  return (
    <ErrorBoundary fallbackRender={fallbackRender}>
      <div className="min-h-screen text-white flex items-center justify-center">
        <WorldView />
      </div>
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
