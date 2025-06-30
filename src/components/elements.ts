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

export const simpleNode = (id: string): Node => ({
  id,
  class: 'wrap-node simple',
  data: { label: 'Paso simple', type: 'simple' },
  width: 180,
  height: 50,
  position
});
