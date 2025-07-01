<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { Node, Edge, NodeMouseEvent, GraphNode } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { useLayout } from 'src/components/useLayout';
import {
  addButtonEdge,
  branchEdges,
  branchNode,
  conditionalNodes,
  goToNode,
  initialEdges,
  initialNodes,
  simpleNode
} from 'src/components/elements';
import EdgeAddButtonComponent from 'src/components/vueflow/AddButtonEdge.vue';
import AddNodeDrawer from 'src/components/drawers/AddNode.vue';
import EditNodeDrawer from 'src/components/drawers/EditNode.vue';
import NodeComponent from 'src/components/vueflow/NodeComponent.vue';
import NodeGoTo from 'src/components/vueflow/NodeGoTo.vue';

let idCounter = 3;

const {
  findNode,
  addNodes,
  updateNode,
  addEdges,
  removeEdges,
  fitView,
  getNodes,
  getEdges,
  setNodes
} = useVueFlow();

const { layout } = useLayout(findNode);

const isOpenAddNode = ref(false);
const isOpenEditNode = ref(false);
const edegeAddNode = ref<Edge | null>(null);
const gotoNode = ref<Node | null>(null);
const editNode = ref<Node | null>(null);
const editConditional = ref<GraphNode[]>([]);

const nodes = ref<Node[]>(initialNodes);

const edges = ref<Edge[]>(initialEdges);

// funcion para abrir Drawer de insertar nodos
function openAddNodeDrawer(edgeProps: Edge) {
  edegeAddNode.value = edgeProps;
  isOpenAddNode.value = true;
}

// funcion para editar nodos
function openEditNodeDrawer(node: Node, conditionals: GraphNode[] = []) {
  if (node.type !== 'output' && node.type !== 'input') {
    editNode.value = node;
    editConditional.value = conditionals;
    isOpenEditNode.value = true;
  }
}

// funcion para cerrar Drawer de editar nodos
function closeEditNode() {
  isOpenEditNode.value = false;
  editNode.value = null;
  editConditional.value = [];
}

// funcion para cerrar/abrir drawer de agregar nodos
function toggleOpenAddNode() {
  isOpenAddNode.value = !isOpenAddNode.value;
}

// funcion para agregar nodos y edges
function addNodeEdges({
  node,
  edges = [],
  extraNodes = []
}: {
  node: Node;
  edges: Edge[];
  extraNodes?: Node[];
}) {
  addNodes([node, ...extraNodes]);
  removeEdges([edegeAddNode.value!.id]);
  addEdges(edges);
  layoutGraph();
  void nextTick(async () => {
    await nextTick();
    layoutGraph();
  });
  toggleOpenAddNode();
}

// funcion para eliminar nodos
function removeNode(id: string) {
  const allNodes = getNodes.value;
  const removedNodes = allNodes.filter((node) => node.id !== id);
  setNodes(removedNodes);
}

// funcion para eliminar nodos y edges en caso de eliminar un nodo padre
function removeNodeDescendants(id: string) {
  const allNodes = getNodes.value;
  const allEdges = getEdges.value;

  const nodeToRemove = allNodes.find((n) => n.id === id);
  if (!nodeToRemove) return;

  // valido si uno de los nodos es tipo 'goto' para no eliminar sus hijos
  const incomingEdges = allEdges.filter((e) => e.target === id);
  const hasGotoParent = incomingEdges.some((e) => {
    const parentNode = allNodes.find((n) => n.id === e.source);
    return parentNode?.data?.type === 'goto';
  });

  if (hasGotoParent) {
    const edgesToRemove = incomingEdges
      .filter((e) => {
        const parentNode = allNodes.find((n) => n.id === e.source);
        return parentNode?.data?.type === 'goto';
      })
      .map((e) => e.id);
    removeEdges(edgesToRemove);
    closeEditNode();
    return;
  }

  // busco todos los nodos descendientes
  function getDescendants(nodeId: string, edges: Edge[], acc: Set<string>) {
    const children = edges.filter((e) => e.source === nodeId).map((e) => e.target);
    for (const childId of children) {
      if (!acc.has(childId)) {
        acc.add(childId);
        getDescendants(childId, edges, acc);
      }
    }
    return acc;
  }
  const descendants = getDescendants(id, allEdges, new Set());

  const parentEdge = allEdges.find((e) => e.target === id);
  const parentId = parentEdge ? parentEdge.source : null;

  const nodesToRemove = new Set([id, ...descendants]);
  const remainingNodes = allNodes.filter((n) => !nodesToRemove.has(n.id));
  const remainingEdges = allEdges.filter(
    (e) => !nodesToRemove.has(e.source) && !nodesToRemove.has(e.target)
  );

  // creo un nodo output para colocar al final
  const newOutputId = `output_${Date.now()}`;
  const newOutputNode: Node = {
    id: newOutputId,
    type: 'output',
    position: { x: nodeToRemove.position.x + 100, y: nodeToRemove.position.y },
    data: { label: 'Fin' }
  };
  (remainingNodes as Node[]).push(newOutputNode);

  if (parentId) {
    (remainingEdges as Edge[]).push({
      id: `e-${parentId}-${newOutputId}`,
      source: parentId,
      target: newOutputId,
      type: 'add-button',
      data: {}
    });
  }

  // aplicar cambios
  setNodes(remainingNodes);
  addEdges(remainingEdges);
  layoutGraph();
  closeEditNode();
}

// añadir nodo simple
function handleAddSimpleNode() {
  if (!edegeAddNode.value) return;
  const parentEdge = edegeAddNode.value;
  const sourceNode = findNode(parentEdge.source);
  const targetNode = findNode(parentEdge.target);
  if (!sourceNode || !targetNode) return;
  const newNodeId = `node_${idCounter++}`;
  const newNode = simpleNode(newNodeId);
  const newEdges = addButtonEdge(sourceNode, targetNode, newNodeId);
  addNodeEdges({ node: newNode, edges: newEdges });
}

// añadir nodo branch
function handleAddBranchNode() {
  if (!edegeAddNode.value) return;
  const parentEdge = edegeAddNode.value;
  const sourceNode = findNode(parentEdge.source);
  const targetNode = findNode(parentEdge.target);
  if (!sourceNode || !targetNode) return;
  const newNodeId = `node_${idCounter++}`;
  const newNode = branchNode(newNodeId);
  const alternativeEndNode = conditionalNodes(newNodeId, idCounter);
  const newEdges = branchEdges(alternativeEndNode, sourceNode, targetNode, newNodeId);
  addNodeEdges({ node: newNode, edges: newEdges, extraNodes: alternativeEndNode });
}

// añadir nodo goto
function handleAddGoToNode() {
  if (!edegeAddNode.value) return;
  const parentEdge = edegeAddNode.value;
  const sourceNode = findNode(parentEdge.source);
  const targetNode = findNode(parentEdge.target);
  const newNodeId = `node_${idCounter++}`;
  const newNode = goToNode(newNodeId);
  const newEdges = [
    {
      id: `e-${sourceNode!.id}-${newNodeId}`,
      source: sourceNode!.id,
      target: newNodeId,
      type: 'add-button'
    }
  ];

  removeNode(targetNode!.id);
  addNodeEdges({ node: newNode, edges: newEdges });
}

// fucion para detectar click en nodos
function onNodeEdit(event: NodeMouseEvent) {
  const { node } = event;
  if (!node) return;

  // caso sin que ningun gotoNode este activo
  if (!gotoNode.value) {
    if (node.data.type === 'branch') {
      const branchEdges = getEdges.value.filter((e) => e.source === node.id);
      const conditionalNodes = branchEdges
        .map((e) => findNode(e.target))
        .filter((n): n is GraphNode => n !== undefined);
      openEditNodeDrawer(node, conditionalNodes);
    } else if (node.data.type === 'simple') {
      openEditNodeDrawer(node);
    } else if (node.data.type === 'goto') {
      gotoNode.value = node;
      addClassSelectableNodes();
    }
    // caso si gotoNode está activo
  } else {
    const targetNode = findNode(node.id);
    if (targetNode && (targetNode.data.type === 'branch' || targetNode.data.type === 'simple')) {
      // Validar si ya existe un edge desde este gotoNode hacia cualquier nodo
      const existingEdge = getEdges.value.some((e) => e.source === gotoNode.value!.id);
      if (!existingEdge) {
        addEdges([
          {
            id: `e-${gotoNode.value.id}-${targetNode.id}`,
            source: gotoNode.value.id,
            target: targetNode.id,
            animated: true
          }
        ]);
        // actualizo nodo goto para cambiar su icono
        updateNode(gotoNode.value.id, {
          ...gotoNode.value,
          class: [
            ...(Array.isArray(gotoNode.value.class)
              ? gotoNode.value.class.filter((c: string) => c !== 'branch' && c !== 'simple')
              : typeof gotoNode.value.class === 'string'
                ? gotoNode.value.class
                    .split(' ')
                    .filter((c: string) => c !== 'branch' && c !== 'simple')
                : []),
            targetNode.data.type
          ],
          data: {
            ...gotoNode.value.data,
            icon: targetNode.data.type
          }
        });
      }
      removeClassSelectableNodes();
      gotoNode.value = null;
    }
  }
}

// funcion para editar nodos
function handleEditNode(data: { node: Node; conditionals: GraphNode[] }) {
  const { node, conditionals } = data;
  updateNode(node.id, { data: node.data });
  if (conditionals.length > 0) {
    conditionals.forEach((conditional) => {
      updateNode(conditional.id, { data: conditional.data });
    });
  }
  closeEditNode();
}

// funcion para agregar una clase a los posibles nodos seleccionables y activar animación
function addClassSelectableNodes() {
  const allNodes = getNodes.value;
  allNodes.forEach((node) => {
    if (node.data.type === 'branch' || node.data.type === 'simple') {
      updateNode(node.id, {
        ...node,
        class: [node.class, 'gotoSelectable']
      });
    }
  });
}

// elimina la clase de los nodos seleccionables
function removeClassSelectableNodes() {
  const allNodes = getNodes.value;
  allNodes.forEach((n) => {
    if (n.class && Array.isArray(n.class)) {
      updateNode(n.id, {
        ...n,
        class: n.class.filter((c: string) => c !== 'gotoSelectable')
      });
    }
  });
}

// funcion para reordenar los nodos en el pane
function layoutGraph() {
  const currentNodes = getNodes.value;
  const currentEdges = getEdges.value;

  void nextTick(async () => {
    const laidOutNodes = layout(currentNodes, currentEdges);
    setNodes(laidOutNodes);
    await nextTick();
    await fitView({
      offset: {
        x: -120,
        y: 0
      }
    });
  });
}
</script>

<template>
  <q-page>
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      @node-click="onNodeEdit"
      @nodes-initialized="layoutGraph"
      fit-view-on-init
    >
      <Background />

      <template #node-default="nodeProps">
        <NodeComponent v-bind="nodeProps" />
      </template>

      <template #node-goto="nodeGoToProps">
        <NodeGoTo v-bind="nodeGoToProps" />
      </template>

      <template #edge-add-button="edgeAddButtonProps">
        <EdgeAddButtonComponent
          v-bind="edgeAddButtonProps"
          @openAddNodeDrawer="openAddNodeDrawer"
        />
      </template>
    </VueFlow>

    <AddNodeDrawer
      :isOpenAddNode="isOpenAddNode"
      v-model="isOpenAddNode"
      @toggleOpenAddNode="toggleOpenAddNode"
      @addSimpleNode="handleAddSimpleNode"
      @addBranchNode="handleAddBranchNode"
      @addGotoNode="handleAddGoToNode"
    />
    <EditNodeDrawer
      :isOpenEditNode="isOpenEditNode"
      :node="editNode"
      :conditionals="editConditional"
      v-if="editNode !== null"
      v-model="isOpenEditNode"
      @closeEditNode="closeEditNode"
      @editNode="handleEditNode"
      @removeNode="removeNodeDescendants"
    />
  </q-page>
</template>

<style lang="scss">
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

@keyframes flashBorder {
  0% {
    box-shadow: 0 0 0 2px $blue-10;
  }
  100% {
    box-shadow: 0 0 5px 8px rgba(0, 0, 0, 0);
  }
}

$green: #66aa2b;
$orange: #ea910f;
$brown: #af885d;

.vue-flow {
  width: 100dvw;
  height: 100dvh;
}
.vue-flow__node {
  &-input,
  &-output {
    width: auto;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    text-align: center;
    border-radius: 10px;
    padding: 0.5rem 1rem;
  }
  &-input {
    background-color: #43a047;
    border-color: #20832d;
    &:focus,
    &.selected {
      border-color: #20832d;
      box-shadow: 0 0 0 0.5px #20832d;
    }
    .vue-flow__handle {
      background-color: #43a047;
      border-color: #20832d;
    }
  }
  &-output {
    background-color: #929292;
    border-color: #929292;
    &:focus,
    &.selected {
      border-color: #929292;
      box-shadow: 0 0 0 0.5px #929292;
    }
    .vue-flow__handle {
      translate: 0 35%;
      background-color: #929292;
      border-color: #929292;
    }
  }
}
.vue-flow__edge-labels {
  .add-button {
    border-radius: 50%;
    height: 1.2rem;
    width: 1.2rem;
    padding: 0.25rem;
    color: #666666;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #666666;
    cursor: pointer;
    svg {
      width: 1rem;
      height: 1rem;
    }
    &:active,
    &:focus {
      height: calc(1.2rem + 2px);
      width: calc(1.2rem + 2px);
      border: 2px solid #666666;
    }
  }
}

.text-green {
  color: $green;
}
.text-orange {
  color: $orange;
}
.text-brown {
  color: $brown;
}

.wrap-node {
  background: #fff;
  display: flex;
  padding: 0.5rem;
  align-items: center;
  gap: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  &.gotoSelectable {
    animation: flashBorder 1s infinite;
  }
  &.vue-flow__node {
    text-align: left;
    &.simple {
      border-color: $green;
      &.selected {
        box-shadow: 0 0 0 0.5px $green;
      }
    }
    &.branch {
      border-color: $orange;
      &.selected {
        box-shadow: 0 0 0 0.5px $orange;
      }
    }
    &.goto {
      border: 1px solid black;
      border-radius: 50%;
      &.selected.simple {
        border-color: $green;
        box-shadow: 0 0 0 0.5px $green;
      }
      &.selected.branch {
        border-color: $orange;
        box-shadow: 0 0 0 0.5px $orange;
      }
      svg {
        background: transparent;
        height: 2rem;
        width: 2rem;
        padding: 0.4rem;
      }
    }
    svg {
      height: 2rem;
      width: 2rem;
      padding: 0.4rem;
      border-radius: 8px;
    }
  }
  &.btn {
    border: 1px solid #e5e5e5;
    width: 100%;
    &:hover {
      border: 1px solid #666;
    }
    svg {
      height: 3rem;
      width: 3rem;
      padding: 0.75rem;
      border-radius: 8px;
    }
  }
  &.simple {
    svg {
      color: $green;
      background: #e8efe1;
    }
  }
  &.branch {
    svg {
      color: $orange;
      background: #fff1d7;
    }
  }
  &.goto {
    svg {
      background: #f4ebe4;
    }
  }
}
</style>
