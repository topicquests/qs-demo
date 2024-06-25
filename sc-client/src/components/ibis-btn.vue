<template>
  <img :src="icon" :height="icon_size" :width="icon_size" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ibis_node_type_type } from '../enums';
import { ibis_node_icon } from '../stores/conversation';

const IbisButtonProps = defineProps<{
  node_type?: ibis_node_type_type;
  small?: boolean;
}>();
const icon = computed(() => 
  ibis_node_icon(IbisButtonProps.node_type!, IbisButtonProps.small)
)
function icon_size() {
  return IbisButtonProps.small ? '16px' : '32px';
}
</script>
