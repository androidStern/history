import { StraightEdge, useNodes } from '@xyflow/react'
import React from 'react'
import { SmartEdge } from '../SmartEdge'
import {
	pathfindingAStarNoDiagonal,
	svgDrawStraightLinePath
} from '../functions'
import type { SmartEdgeOptions } from '../SmartEdge'
import type { Edge, EdgeProps, Node } from '@xyflow/react'

const StraightConfiguration: SmartEdgeOptions = {
	drawEdge: svgDrawStraightLinePath,
	generatePath: pathfindingAStarNoDiagonal,
	fallback: StraightEdge
}

export function SmartStraightEdge<
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
			options={StraightConfiguration}
			nodes={nodes}
		/>
	)
}
