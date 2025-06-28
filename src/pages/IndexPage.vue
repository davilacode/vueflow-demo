<script setup lang="ts">
import { ref } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { VueFlow, useVueFlow } from '@vue-flow/core';
import { Background } from '@vue-flow/background';

import NodeComponent from 'components/vueflow/NodeComponent.vue';
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
    position: { x: 250, y: 100 },
    data: { label: 'Fin' }
  }
]);

const edges = ref<Edge[]>([
  {
    id: 'e1->2',
    source: '1',
    target: '2'
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
      <template #node-special="specialNodeProps">
        <NodeComponent v-bind="specialNodeProps" />
      </template>

      <template #node-input="inputNodeProps">
        <NodeComponent v-bind="inputNodeProps" />
      </template>

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

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow {
  width: 100%;
  height: 100vh;
}
</style>
