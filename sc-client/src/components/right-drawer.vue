<template>
  <div>
    <div v-if="rightDrawerProps.currentGuild" class="q-pa-md q-gutter-sm">
      <channel-list
        :guild_id="rightDrawerProps.currentGuild.id"
        :inPage="false"
        title="Guild Channels"
      />
    </div>
    <div
      v-if="rightDrawerProps.currentGuild && rightDrawerProps.currentQuest"
      class="q-pa-md q-gutter-sm"
    >
      <channel-list
        v-bind:guild_id="rightDrawerProps.currentGuild.id"
        v-bind:quest_id="rightDrawerProps.currentQuest.id"
        :inPage="false"
        title="Game Channels"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { GuildData, QuestData } from 'src/types';
import channelList from '../components/ChannelListComponent.vue';

const rightDrawerProps = defineProps<{
  currentQuest?: QuestData;
  currentGuild?: GuildData;
}>();
</script>
