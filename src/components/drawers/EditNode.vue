<script setup lang="ts">
import type { Node, GraphNode } from '@vue-flow/core';
import { ref } from 'vue';

const props = defineProps<{
  isOpenEditNode: boolean;
  node: Node;
  conditionals: GraphNode[];
}>();

const { isOpenEditNode, node, conditionals } = props;

const label = ref(node.data.label || '');

const conditionalNodes = ref<GraphNode[]>(conditionals || []);

const conditionalLabels = ref<string[]>([]);

conditionalNodes.value.forEach((conditional) => {
  conditionalLabels.value.push(conditional.data.label || '');
});

const emit = defineEmits(['editNode', 'closeEditNode']);

function onSubmit() {
  emit('editNode', {
    node: {
      ...node,
      data: {
        ...node.data,
        label: label.value
      }
    },
    conditionals: conditionalNodes.value.map((conditional) => ({
      ...(conditional || {}),
      data: {
        ...(conditional?.data || {}),
        label: conditionalLabels.value[conditionalNodes.value.indexOf(conditional)]
      }
    }))
  });
}
</script>

<script lang="ts">
export default {};
</script>

<template>
  <q-drawer
    v-if="node && node.data"
    elevated
    v-model="isOpenEditNode"
    :width="500"
    bordered
    overlay
    side="right"
  >
    <div class="q-pa-md" v-if="node.data.type === 'simple'">
      <h3 class="text-subtitle1 text-bold text-green">Tipos de paso simple</h3>
      <q-input outlined v-model="label" label="Outlined" />
      <div class="q-py-md justify-end row q-gutter-sm">
        <q-btn color="white" text-color="red" label="Eliminar" />
        <q-btn color="white" text-color="black" label="Cancelar" @click="$emit('closeEditNode')" />
        <q-btn style="background: #333333; color: white" label="Confirmar" @click="onSubmit" />
      </div>
    </div>
    <div class="q-pa-md" v-if="node.data.type === 'branch'">
      <h3 class="text-subtitle1 text-bold text-orange">Tipos de paso branch</h3>
      <q-input class="q-mb-sm" outlined v-model="label" label="Label" />
      <q-input class="q-mb-sm" outlined v-model="conditionalLabels[0]" label="Condicional 1" />
      <q-input outlined v-model="conditionalLabels[1]" label="Condicional 2" />
      <div class="q-py-md justify-end row q-gutter-sm">
        <q-btn color="white" text-color="red" label="Eliminar" />
        <q-btn color="white" text-color="black" label="Cancelar" @click="$emit('closeEditNode')" />
        <q-btn style="background: #333333; color: white" label="Confirmar" @click="onSubmit" />
      </div>
    </div>
  </q-drawer>
</template>
