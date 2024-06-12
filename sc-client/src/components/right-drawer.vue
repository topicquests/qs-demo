<template>
    <div>  
      <div v-if="currentGuild" class="q-pa-md q-gutter-sm">
        <channel-list
          :guild_id="currentGuild.id"
          :inPage="false"
          title="Guild Channels"
        />
      </div>
      <div
        v-if="currentGuild && currentQuest"
        class="q-pa-md q-gutter-sm"
      >
        <channel-list
          v-bind:guild_id="currentGuild.id"
          v-bind:quest_id="currentQuest.id"
          :inPage="false"
          title="Game Channels"
        />
      </div>
</div>
</template>
<script setup lang="ts">
import { useGuildStore } from 'src/stores/guilds';
import { GuildData, QuestData } from 'src/types';
import channelList from '../components/ChannelListComponent.vue';

const guildStore = useGuildStore();
const rightDrawerProps = defineProps<{
    currentQuest?: QuestData;
    currentGuild?: GuildData;
}>()
</script>