<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import Icons from '../IconsItem.vue';

const props = defineProps<NodeProps>();
defineEmits(['updateNodeInternals']);
</script>
<script lang="ts">
export default {};
</script>

<template>
  <Icons v-if="props.data.type" :name="props.data.type" />
  {{ props.data.label }}
</template>
