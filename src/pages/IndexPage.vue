<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { Node, Edge, NodeMouseEvent } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import EdgeAddButtonComponent from 'src/components/vueflow/AddButtonEdge.vue';
import NodeComponent from 'src/components/vueflow/NodeComponent.vue';
import { useLayout } from 'src/components/useLayout';
import { initialEdges, initialNodes, simpleNode } from 'src/components/elements';

import AddNodeDrawer from 'src/components/drawers/AddNode.vue';
import EditNodeDrawer from 'src/components/drawers/EditNode.vue';

let idCounter = 3;

const position = { x: 0, y: 0 };

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
const edgeForNodeAddition = ref<Edge | null>(null);
const isOpenEditNode = ref(false);
const nodeForEdit = ref<Node | null>(null);

const nodes = ref<Node[]>(initialNodes);

const edges = ref<Edge[]>(initialEdges);

function openAddNodeDrawer(edgeProps: Edge) {
  edgeForNodeAddition.value = edgeProps; // Guardamos los datos del edge
  isOpenAddNode.value = true; // Mostramos el modal
}
function openEditNodeDrawer(node: Node) {
  if (node.type !== 'output' && node.type !== 'input') {
    nodeForEdit.value = node;
    isOpenEditNode.value = true;
  }
}

function handleAddNode(nodeType: string) {
  if (!edgeForNodeAddition.value) return;

  const parentEdge = edgeForNodeAddition.value;
  const sourceNode = findNode(parentEdge.source);
  const targetNode = findNode(parentEdge.target);

  const newNodeId = `node_${idCounter++}`;
  let newNode;

  if (nodeType === 'conditional') {
    newNode = {
      id: newNodeId,
      type: 'conditional',
      position,
      data: { label: 'Nueva Condición' }
    };
  } else {
    newNode = simpleNode(newNodeId);
  }

  addNodes([newNode]);
  removeEdges([parentEdge.id]);

  const newEdges = [
    {
      id: `e-${sourceNode!.id}-${newNodeId}`,
      source: sourceNode!.id,
      target: newNodeId,
      type: 'add-button'
    },
    {
      id: `e-${newNodeId}-${targetNode!.id}`,
      source: newNodeId,
      target: targetNode!.id,
      type: 'add-button',
      sourceHandle: nodeType === 'conditional' ? 'yes' : null
    }
  ];

  if (nodeType === 'conditional') {
    const alternativeEndNode = {
      id: `alt_end_${newNodeId}`,
      type: 'output',
      position,
      label: 'Ruta "No"'
    };
    addNodes([alternativeEndNode]);
    newEdges.push({
      id: `e-${newNodeId}-no-${alternativeEndNode.id}`,
      source: newNodeId,
      target: alternativeEndNode.id,
      sourceHandle: 'no',
      type: 'custom'
    });
  }

  addEdges(newEdges);

  layoutGraph();

  void nextTick(async () => {
    await nextTick();
    layoutGraph();
  });

  toggleOpenAddNode();
}

function toggleOpenAddNode() {
  isOpenAddNode.value = !isOpenAddNode.value;
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

function onNodeEdit(event: NodeMouseEvent) {
  const { node } = event;
  openEditNodeDrawer(node);
}

function closeEditNode() {
  isOpenEditNode.value = false;
  nodeForEdit.value = null;
}

function handleEditNode(node: Node) {
  console.log(findNode(node.id));

  // Usar updateNode para modificar el nodo en Vue Flow
  updateNode(node.id, { data: node.data });
  // Forzar que VueFlow detecte el cambio: cambiar la referencia del array nodes
  nodes.value = [...getNodes.value];

  closeEditNode();
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
      @addNode="handleAddNode"
    />
    <EditNodeDrawer
      :isOpenEditNode="isOpenEditNode"
      :node="nodeForEdit"
      v-if="nodeForEdit !== null"
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

$green: #66aa2b;
$orange: #ea910f;
$brown: #af885d;

.vue-flow {
  width: 100%;
  height: 100vh;
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
  &.vue-flow__node-default {
    border-color: $green;
    text-align: left;
    &.selected {
      box-shadow: 0 0 0 0.5px $green;
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
  &.others {
    svg {
      color: $brown;
      background: #f4ebe4;
    }
  }
}
</style>
