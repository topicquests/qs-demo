<template>
  <div>
    <div v-if="shouldShowGuildChannels" class="q-pa-md q-gutter-sm">
      <channel-list
        :guild_id="rightDrawerProps.currentGuild.id"
        :inPage="false"
        title="Guild Channels"
      />
    </div>
    <div
      v-if="shouldShowGuildChannels && shouldShowGameChannels"
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
import { GuildData, QuestData } from '../types';
import channelList from '../components/ChannelListComponent.vue';
import { computed } from 'vue';

const rightDrawerProps = defineProps<{
  currentQuest?: QuestData;
  currentGuild?: GuildData;
}>();

const shouldShowGuildChannels = computed(() => !!rightDrawerProps.currentGuild);
const shouldShowGameChannels = computed(() => !!rightDrawerProps.currentGuild && !!rightDrawerProps.currentQuest);
</script>
