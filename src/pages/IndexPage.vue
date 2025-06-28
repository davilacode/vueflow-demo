<script setup lang="ts">
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { MarkerType, VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';

// import NodeInOutComponent from 'components/vueflow/NodeInOutComponent.vue';
import EdgeAddButtonComponent from 'src/components/vueflow/EdgeAddButtonComponent.vue';

const nodes = ref<Node[]>([
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 5 },
    data: { label: 'Inicio' }
  },
  {
    id: '2',
    type: 'output',
    position: { x: 256, y: 120 },
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

const openAddNode = ref(false);
function toggleOpenAddNode() {
  openAddNode.value = !openAddNode.value;
}

const { onInit } = useVueFlow();

onInit((vueFlowInstance) => {
  // instance is the same as the return of `useVueFlow`
  void vueFlowInstance.fitView();
});
</script>

<template>
  <q-page>
    <VueFlow :nodes="nodes" :edges="edges" :defaultViewport="{ x: 0, y: 0, zoom: 1 }">
      <Background />

      <template #edge-add-button="edgeAddButtonProps">
        <EdgeAddButtonComponent v-bind="edgeAddButtonProps" :openAddNode="toggleOpenAddNode" />
      </template>
    </VueFlow>

    <q-drawer v-model="openAddNode" bordered overlay side="right">
      <q-list>
        <q-item-label header> Add Node </q-item-label>
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
