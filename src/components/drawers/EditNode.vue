<script setup lang="ts">
const props = defineProps({
  isOpenEditNode: {
    type: Boolean,
    required: true
  }
});

const { isOpenEditNode } = props;

// const emit = defineEmits(['editNode', 'toggleOpenEditNode']);

// function onClick(type: string) {
//   emit('editNode', type);
// }
</script>

<script lang="ts">
export default {};
</script>

<template>
  <q-drawer elevated v-model="isOpenEditNode" :width="500" bordered overlay side="right">
    <div class="q-pa-md">
      <h3 class="text-subtitle1 text-bold text-green">Tipos de paso simple</h3>
    </div>
  </q-drawer>
</template>
