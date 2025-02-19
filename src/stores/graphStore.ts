import { StateCreator } from 'zustand'
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
  MarkerType
} from '@xyflow/react'
import { GraphActions, GraphState, StoreState } from '@/game/types'

export const createGraphSlice: StateCreator<
  StoreState,
  [['zustand/immer', never]],
  [],
  GraphState & GraphActions
> = set => ({
  // Initial state
  nodes: [],
  edges: [],

  // Actions
  onNodesChange: (changes: NodeChange[]) => {
    set(state => {
      console.log('onNodesChange', changes)
      state.nodes = applyNodeChanges(changes, state.nodes)
    })

    const positionChanges = changes.filter(change => change.type === 'position')

    positionChanges.forEach(change => {
      set(state => {
        const scene = state.scenes[change.id]
        if (!scene) return
        scene.graphX = change.position?.x ?? 0
        scene.graphY = change.position?.y ?? 0
      })
    })
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set(state => {
      state.edges = applyEdgeChanges(changes, state.edges)
    })
  },
  setNodes: (nodes: Node[]) => {
    set(state => {
      state.nodes = nodes
    })
  },
  setEdges: (edges: Edge[]) => {
    set(state => {
      state.edges = edges
    })
  },
  onConnect: (connection: Connection) => {
    set(state => {
      const scene = state.scenes[connection.source]
      if (!scene) return
      scene.choices?.push({
        id: `${connection.source}-${connection.target}`,
        nextSceneId: connection.target,
        label: 'Some Label'
      })

      const newEdge: Edge = {
        id: `${scene.id}-${connection.target}`,
        source: scene.id,
        target: connection.target,
        label: 'Some Label',
        type: 'smoothstep',
        markerEnd: MarkerType.ArrowClosed
      }

      state.edges = addEdge(newEdge, state.edges)
    })
  }
})
