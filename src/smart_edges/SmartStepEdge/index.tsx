import type { Edge, EdgeProps, Node } from '@xyflow/react'
import { StepEdge, useNodes } from '@xyflow/react'
import { pathfindingJumpPointNoDiagonal, svgDrawStraightLinePath } from '../functions'
import type { SmartEdgeOptions } from '../SmartEdge'
import { SmartEdge } from '../SmartEdge'

const StepConfiguration: SmartEdgeOptions = {
  drawEdge: svgDrawStraightLinePath,
  generatePath: pathfindingJumpPointNoDiagonal,
  fallback: StepEdge,
  gridRatio: 10
}

export function SmartStepEdge<
  EdgeDataType extends Edge<Record<string, unknown>, string | undefined> = Edge<
    Record<string, unknown>,
    string | undefined
  >,
  NodeDataType extends Node['data'] = Node['data']
>(props: EdgeProps<EdgeDataType>) {
  const nodes = useNodes<Node<NodeDataType>>()

  const nodesWithDefaults = nodes.map(node => ({
    ...node,
    position: node.position || { x: 0, y: 0 },
    width: node.width || 150,
    height: node.height || 40,
    getBoundingBox: () => ({
      x: node.position?.x || 0,
      y: node.position?.y || 0,
      width: node.width || 150,
      height: node.height || 40
    })
  }))

  return (
    <SmartEdge<EdgeDataType, NodeDataType>
      {...props}
      options={StepConfiguration}
      nodes={nodesWithDefaults}
    />
  )
}
