import type { Node, Edge } from '@vue-flow/core';
import { MarkerType } from '@vue-flow/core';

const position = { x: 0, y: 0 };

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position,
    data: { label: 'Inicio' }
  },
  {
    id: '2',
    type: 'output',
    position,
    data: { label: 'Fin' }
  }
];

export const initialEdges: Edge[] = [
  {
    id: 'e1->2',
    type: 'add-button',
    source: '1',
    target: '2',
    markerEnd: MarkerType.ArrowClosed
  }
];

const createNode = (
  id: string,
  nodeClass: string,
  data: object,
  width = 180,
  height = 50,
  type?: string
): Node => ({
  id,
  class: nodeClass,
  data: type ? { ...data, type } : data,
  width,
  height,
  position
});

export const simpleNode = (id: string): Node =>
  createNode(id, 'wrap-node simple', { label: 'Paso simple' }, 180, 50, 'simple');

export const goToNode = (id: string): Node =>
  createNode(id, 'wrap-node goto', { type: 'goto', icon: 'goto' }, 50, 50);

export const branchNode = (id: string): Node =>
  createNode(id, 'wrap-node branch', { label: 'Paso branch' }, 180, 50, 'branch');

export const conditionalNodes = (id: string, counter: number): Node[] => [
  createNode(`alt_end_${id}`, 'wrap-node branch text-center', { label: 'Nombre de rama' }),
  createNode(`alt_end_${id}_2`, 'wrap-node branch text-center', { label: 'Nombre de rama' }),
  {
    id: `output_${counter++}`,
    type: 'output',
    position,
    data: { label: 'Fin' }
  }
];

const createAddButtonEdge = (source: string, target: string): Edge => ({
  id: `e-${source}-${target}`,
  source,
  target,
  type: 'add-button',
  markerEnd: MarkerType.ArrowClosed
});

export const addButtonEdge = (sourceNode: Node, targetNode: Node, newNodeId: string): Edge[] => [
  createAddButtonEdge(sourceNode.id, newNodeId),
  createAddButtonEdge(newNodeId, targetNode.id)
];

export const branchEdges = (
  alternativeEndNode: Node[],
  sourceNode: Node,
  targetNode: Node,
  newNodeId: string
): Edge[] => [
  {
    id: `e-${sourceNode.id}-${newNodeId}`,
    source: sourceNode.id,
    target: newNodeId,
    type: 'add-button',
    markerEnd: MarkerType.ArrowClosed
  },
  {
    id: `e-${newNodeId}-no-${alternativeEndNode[0]!.id}`,
    source: newNodeId,
    target: alternativeEndNode[0]!.id,
    type: 'smoothstep'
  },
  {
    id: `e-${newNodeId}-no-${alternativeEndNode[1]!.id}`,
    source: newNodeId,
    target: alternativeEndNode[1]!.id,
    type: 'smoothstep'
  },
  {
    id: `e-${newNodeId}-${targetNode.id}`,
    source: alternativeEndNode[1]!.id,
    target: targetNode.id,
    type: 'add-button',
    markerEnd: MarkerType.ArrowClosed
  },
  {
    id: `e-${newNodeId}-no-${alternativeEndNode[2]!.id}`,
    source: alternativeEndNode[0]!.id,
    target: alternativeEndNode[2]!.id,
    type: 'add-button',
    markerEnd: MarkerType.ArrowClosed
  }
];
