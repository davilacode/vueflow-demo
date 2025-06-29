<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  isOpenEditNode: {
    type: Boolean,
    required: true
  },
  node: {
    type: Object,
    required: true
  }
});

const { isOpenEditNode, node } = props;

const label = ref(node.data.label || '');

const emit = defineEmits(['editNode', 'closeEditNode']);

function onSubmit() {
  emit('editNode', {
    ...node,
    data: {
      ...node.data,
      label: label.value
    }
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
    <div class="q-pa-md">
      <h3 class="text-subtitle1 text-bold text-green">Tipos de paso simple</h3>
      <q-input outlined v-model="label" label="Outlined" />
      <div class="q-pa-md q-gutter-sm">
        <q-btn color="white" text-color="red" label="Eliminar" />
        <q-btn color="white" text-color="black" label="Cancelar" @click="$emit('closeEditNode')" />
        <q-btn style="background: #333333; color: white" label="Confirmar" @click="onSubmit" />
      </div>
    </div>
  </q-drawer>
</template>
