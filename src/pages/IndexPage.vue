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

function openAddNodeDrawer(edgeProps: Edge) {
  edegeAddNode.value = edgeProps; // Guardamos los datos del edge
  isOpenAddNode.value = true; // Mostramos el modal
}

function openEditNodeDrawer(node: Node, conditionals: GraphNode[] = []) {
  if (node.type !== 'output' && node.type !== 'input') {
    editNode.value = node;
    editConditional.value = conditionals;
    isOpenEditNode.value = true;
  }
}

function closeEditNode() {
  isOpenEditNode.value = false;
  editNode.value = null;
  editConditional.value = [];
}

function toggleOpenAddNode() {
  isOpenAddNode.value = !isOpenAddNode.value;
}

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

function removeNode(id: string) {
  const allNodes = getNodes.value;
  const removedNodes = allNodes.filter((node) => node.id !== id);
  setNodes(removedNodes);
}

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

function onNodeEdit(event: NodeMouseEvent) {
  const { node } = event;

  if (!node) return;

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
  } else {
    const targetNode = findNode(node.id);
    addEdges([
      {
        id: `e-${gotoNode.value.id}-${targetNode!.id}`,
        source: gotoNode.value.id,
        target: targetNode!.id,
        animated: true
      }
    ]);
    removeClassSelectableNodes();
    gotoNode.value = null;
  }
}

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

      <template #node-goto="nodeProps">
        <NodeGoTo v-bind="nodeProps" />
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
  &.vue-flow__node-default {
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
      color: $brown;
      background: #f4ebe4;
    }
  }
}
</style>
