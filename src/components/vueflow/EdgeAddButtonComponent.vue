<script setup lang="ts">
import type { Position } from '@vue-flow/core';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core';
import { computed } from 'vue';
import Icons from '../IconsItem.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  sourceX: {
    type: Number,
    required: true
  },
  sourceY: {
    type: Number,
    required: true
  },
  targetX: {
    type: Number,
    required: true
  },
  targetY: {
    type: Number,
    required: true
  },
  sourcePosition: {
    type: String,
    required: true
  },
  targetPosition: {
    type: String,
    required: true
  },
  markerEnd: {
    type: String,
    required: false
  },
  style: {
    type: Object,
    required: false
  },
  data: {
    type: Object,
    required: false
  }
});

const emit = defineEmits(['add-node']);

const path = computed(() =>
  getBezierPath({
    ...props,
    sourcePosition: props.sourcePosition as Position,
    targetPosition: props.targetPosition as Position
  })
);

function onEdgeClick() {
  console.log('Edge clicked:', props);
  emit('add-node', props);
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false
};
</script>

<template>
  <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
  <BaseEdge :id="id" :style="style" :path="path[0]" :marker-end="markerEnd ?? ''" />

  <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
  <EdgeLabelRenderer>
    <div
      :style="{
        pointerEvents: 'all',
        position: 'absolute',
        transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`
      }"
      class="nodrag nopan"
    >
      <button class="add-button" @click="onEdgeClick">
        <Icons name="plus" />
      </button>
    </div>
  </EdgeLabelRenderer>
</template>
