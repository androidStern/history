import { useGameStore } from '@/stores/useGameStore'
import { SmartStepEdge } from '@/smart_edges/SmartStepEdge'
import { MarkerType, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const edgeTypes = {
  nonOverlapping: SmartStepEdge
}

export function SceneGraph() {
  const store = useGameStore()
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = store

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{
          animated: true,
          type: 'nonOverlapping',
          markerEnd: MarkerType.ArrowClosed
        }}
      />
    </div>
  )
}
