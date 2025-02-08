<template>
  <div>
    <div v-if="shouldShowGuildChannels && isMember" class="q-pa-md q-gutter-sm">
      <channel-list
        :guild_id="rightDrawerProps.currentGuild.id"
        :inPage="false"
        title="Guild Channels"
      />
    </div>
    <div v-if="canShowBothChannels && isMember" class="q-pa-md q-gutter-sm">
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
import { computed, onBeforeMount, watch } from 'vue';
import { useChannelStore } from 'src/stores/channel';
import { useGuildStore } from 'src/stores/guilds';

const channelStore = useChannelStore();
const guildStore = useGuildStore();

const rightDrawerProps = defineProps<{
  currentQuest?: QuestData;
  currentGuild?: GuildData;
}>();
const isMember = computed<boolean>({
  get: () => {
    if (rightDrawerProps.currentGuild) {
      return !!guildStore.isGuildMember(rightDrawerProps.currentGuild!.id);
    }
  },
  set: (value) => {
    return value;
  },
});

const shouldShowGuildChannels = computed(() => !!rightDrawerProps.currentGuild);
const canShowBothChannels = computed(
  () => !!rightDrawerProps.currentGuild && !!rightDrawerProps.currentQuest,
);
watch(isMember, (newVal) => {
  channelStore.ensureChannels(channelStore.getChannelsCurrentGuildId);
});

onBeforeMount(async () => {
  channelStore.ensureChannels(channelStore.getChannelsCurrentGuildId);
});
</script>
