import { BezierEdge, useNodes } from '@xyflow/react'
import React from 'react'
import { SmartEdge } from '../SmartEdge'
import { pathfindingAStarDiagonal, svgDrawSmoothLinePath } from '../functions'
import type { SmartEdgeOptions } from '../SmartEdge'
import type { Edge, EdgeProps, Node } from '@xyflow/react'

const BezierConfiguration: SmartEdgeOptions = {
	drawEdge: svgDrawSmoothLinePath,
	generatePath: pathfindingAStarDiagonal,
	fallback: BezierEdge
}

export function SmartBezierEdge<
	EdgeDataType extends Edge<Record<string, unknown>, string | undefined> = Edge<
		Record<string, unknown>,
		string | undefined
	>,
	NodeDataType extends Node['data'] = Node['data']
>(props: EdgeProps<EdgeDataType>) {
	const nodes = useNodes<Node<NodeDataType>>()

	return (
		<SmartEdge<EdgeDataType, NodeDataType>
			{...props}
			options={BezierConfiguration}
			nodes={nodes}
		/>
	)
}
