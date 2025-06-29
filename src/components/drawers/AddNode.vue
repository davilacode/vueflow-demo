<script setup lang="ts">
import Icons from '../IconsItem.vue';

const props = defineProps({
  isOpenAddNode: {
    type: Boolean,
    required: true
  }
});

const { isOpenAddNode } = props;

const emit = defineEmits(['addSimpleNode', 'addBranchNode', 'toggleOpenAddNode']);

function onClick(type: string) {
  if (type === 'simple') {
    emit('addSimpleNode', type);
    return;
  }
  if (type === 'conditional') {
    emit('addBranchNode', type);
    return;
  }
}
</script>

<script lang="ts">
export default {};
</script>

<template>
  <q-drawer elevated v-model="isOpenAddNode" :width="500" bordered overlay side="right">
    <!-- <div>
      <button
        class="q-mb-md"
        color="primary"
        label="Cerrar"
        icon="close"
        @click="$emit('toggleOpenAddNode')"
      >
        x
      </button>
    </div> -->
    <div class="q-pa-md">
      <h3 class="text-subtitle1 text-bold text-green">Tipos de paso simple</h3>
      <button class="wrap-node btn simple" @click="onClick('simple')">
        <Icons name="simple" />
        Paso simple
      </button>

      <h3 class="text-subtitle1 text-bold text-orange">Tipos de paso branch</h3>
      <button class="wrap-node btn branch" @click="onClick('conditional')">
        <Icons name="branch" />
        Paso branch
      </button>

      <h3 class="text-subtitle1 text-bold text-brown">Otros tipos de paso</h3>
      <button class="wrap-node btn others" @click="onClick('conditional')">
        <Icons name="others" />
        Paso ir a
      </button>
    </div>
  </q-drawer>
</template>
