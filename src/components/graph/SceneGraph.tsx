import { MarkerType, ReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useGameStore } from '@/stores/useGameStore'

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
        defaultEdgeOptions={{
          animated: true,
          type: 'smoothstep',
          markerEnd: MarkerType.ArrowClosed
        }}
      />
    </div>
  )
}
