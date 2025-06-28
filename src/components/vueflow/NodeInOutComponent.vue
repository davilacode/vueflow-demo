<script setup lang="ts">
import { computed } from 'vue';
import { Position, Handle } from '@vue-flow/core';
import type { NodeProps } from '@vue-flow/core';

const props = defineProps<NodeProps>();

const {
  type,
  data: { label }
} = props;

const handlePosition = computed(() => {
  if (type === 'input') {
    return Position.Bottom;
  } else if (type === 'output') {
    return Position.Top;
  }
  return Position.Bottom;
});
</script>
<script lang="ts">
export default {};
</script>

<template>
  <div>{{ label }}</div>

  <Handle type="source" :position="handlePosition" />
</template>
