<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { MarkerType, VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import EdgeAddButtonComponent from 'src/components/vueflow/EdgeAddButtonComponent.vue';
import { useLayout } from 'src/components/useLayout';
import { watch } from 'vue';

let idCounter = 3;
const position = { x: 0, y: 0 };
const { getNodes, findNode, addNodes, addEdges, removeEdges, onPaneReady } = useVueFlow();

const openAddNode = ref(false);
const edgeForNodeAddition = ref<Edge | null>(null);

const nodes = ref<Node[]>([
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
]);

const edges = ref<Edge[]>([
  {
    id: 'e1->2',
    type: 'add-button',
    source: '1',
    target: '2',
    markerEnd: MarkerType.ArrowClosed
  }
]);

function openAddNodeModal(edgeProps: Edge) {
  edgeForNodeAddition.value = edgeProps; // Guardamos los datos del edge
  openAddNode.value = true; // Mostramos el modal
}

function handleNodeTypeSelected(nodeType: string) {
  if (!edgeForNodeAddition.value) return;

  const parentEdge = edgeForNodeAddition.value;
  const sourceNode = findNode(parentEdge.source);
  const targetNode = findNode(parentEdge.target);

  const newNodeId = `node_${idCounter++}`;
  let newNode;

  // Creamos el nuevo nodo según el tipo seleccionado
  if (nodeType === 'conditional') {
    newNode = {
      id: newNodeId,
      type: 'conditional', // Usamos el tipo para el nodo personalizado
      position,
      data: { label: 'Nueva Condición' }
    };
  } else {
    newNode = {
      id: newNodeId,
      type: 'default', // Nodo estándar
      label: `Nuevo Nodo ${newNodeId}`,
      position
    };
  }

  console.log('Adding new node:', newNode);

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

  toggleOpenAddNode();
  // Cerramos y reseteamos el estado del modal
}

onPaneReady((i) => {
  void i.fitView();
});

watch(getNodes, (nodes) => {
  console.log('Nodes changed:', nodes);

  layoutGraph();
});

function toggleOpenAddNode() {
  openAddNode.value = !openAddNode.value;
}

const { layout } = useLayout();

const { fitView } = useVueFlow();

function layoutGraph() {
  console.log('Layouting graph...', nodes.value, edges.value);
  nodes.value = layout(nodes.value, edges.value, 'TB');

  void nextTick(async () => {
    await fitView();
  });
}
</script>

<template>
  <q-page>
    <VueFlow :nodes="nodes" :edges="edges">
      <Background />

      <template #edge-add-button="edgeAddButtonProps">
        <EdgeAddButtonComponent v-bind="edgeAddButtonProps" @add-node="openAddNodeModal" />
      </template>
    </VueFlow>

    <q-drawer elevated v-model="openAddNode" bordered overlay side="right">
      <h3 class="text-subtitle1">Agregar nodo</h3>
      <q-list>
        <q-item-label @click="handleNodeTypeSelected('default')">Default</q-item-label>
      </q-list>
      <q-list>
        <q-item-label @click="handleNodeTypeSelected('conditional')">Condicional</q-item-label>
      </q-list>
    </q-drawer>
  </q-page>
</template>

<style lang="scss">
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
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
</style>
