<script setup lang="ts">
import type { NodeProps } from '@vue-flow/core';
import Icons from '../IconsItem.vue';

const props = defineProps<NodeProps>();
defineEmits(['updateNodeInternals']);

const { data } = props;
</script>
<script lang="ts">
export default {};
</script>

<template>
  <Icons :name="data.icon" />
  {{ data.label }}
</template>
