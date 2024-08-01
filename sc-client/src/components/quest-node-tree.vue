<template>
  <div style="width: 100%; padding: 0; margin: 0">
    <div style="width: 100%">
      <node-tree
        :currentQuestId="questId"
        :currentGuildId="guildId"
        :initialSelectedNodeId="selectedNodeId"
        @tree-selection="selectionChanged"
        :channelId="undefined"
        :isChannel="false"
        :editable="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import nodeTree from '../components/node-tree.vue';

const questNodeTreeProps = defineProps<{
  questId?: number;
  guildId?: number;
  selectedNodeId?: number;
}>();

const router = useRouter();

const selectionChanged = (selectedNodeId: number) => {
  router.push({
    name: selectedNodeId ? 'quest_page_node' : 'quest_page',
    params: {
      quest_id: String(questNodeTreeProps.questId.value),
      node_id: selectedNodeId
        ? String(questNodeTreeProps.selectedNodeId)
        : undefined,
    },
  });
};
</script>
