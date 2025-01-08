<template>
  <div>
    <div v-if="shouldShowGuildChannels" class="q-pa-md q-gutter-sm">
      <channel-list
        :guild_id="rightDrawerProps.currentGuild.id"
        :inPage="false"
        title="Guild Channels"
      />
    </div>
    <div v-if="canShowBothChannels" class="q-pa-md q-gutter-sm">
      <channel-list
        :guild_id="rightDrawerProps.currentGuild.id"
        :quest_id="rightDrawerProps.currentQuest.id"
        :inPage="false"
        title="Game Channels"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { GuildData, QuestData } from '../types';
import channelList from '../components/ChannelListComponent.vue';
import { computed, onBeforeMount } from 'vue';
import { useChannelStore } from 'src/stores/channel';

const channelStore = useChannelStore();

const rightDrawerProps = defineProps<{
  currentQuest?: QuestData;
  currentGuild?: GuildData;
}>();

const shouldShowGuildChannels = computed(() => !!rightDrawerProps.currentGuild);
const canShowBothChannels = computed(
  () => !!rightDrawerProps.currentGuild && !!rightDrawerProps.currentQuest,
);

onBeforeMount(async () => {
  channelStore.ensureChannels(channelStore.getChannelsCurrentGuildId);
});
</script>
