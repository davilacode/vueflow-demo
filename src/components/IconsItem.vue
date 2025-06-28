<script setup lang="ts">
defineProps({
  name: {
    type: String,
    required: true
  }
});
</script>
<script lang="ts">
export default {};
</script>
<template>
  <svg
    v-if="name === 'plus'"
    data-name="Modo de aislamiento"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 15.6 15.6"
  >
    <defs></defs>
    <line
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-miterlimit="10"
      stroke-width="3px"
      x1="7.8"
      y1="1.5"
      x2="7.8"
      y2="14.1"
    />
    <line
      stroke="currentColor"
      fill="none"
      stroke-linecap="round"
      stroke-miterlimit="10"
      stroke-width="3px"
      x1="1.5"
      y1="7.8"
      x2="14.1"
      y2="7.8"
    />
  </svg>
</template>
