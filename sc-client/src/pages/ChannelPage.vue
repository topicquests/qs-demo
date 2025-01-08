<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3 v-if="questId">
        Channel of guild
        <router-link
          v-if="guildId && currentGuild?.name"
          :to="{ name: 'guild', params: { guild_id: guildId } }"
        >
          {{ currentGuild.name }}
        </router-link>
        in quest
        <router-link
          v-if="guildId && currentQuest?.name"
          :to="{ name: 'quest_page', params: { guild_id: guildId } }"
        >
          {{ currentQuest.name }}
        </router-link>
        <router-link
          v-if="guildId && questId"
          :to="{
            name: 'game_channel_list',
            params: { guild_id: guildId, quest_id: questId },
          }"
        >
          more
        </router-link>
      </h3>
      <h3 v-else>
        Channel of guild
        <router-link
          v-if="guildId && currentGuild?.name"
          :to="{ name: 'guild', params: { guild_id: guildId } }"
        >
          {{ currentGuild.name }}
        </router-link>
        (<router-link
          v-if="guildId"
          :to="{ name: 'guild_channel_list', params: { guild_id: guildId } }"
        >
          more </router-link
        >)
      </h3>
    </div>
    <div class="row justify-center q-mt-lg">
      <div class="col-6 q-md q-mr-lg">
        <node-tree
          :initialSelectedNodeId="selectedNodeId"
          @tree-selection="selectionChanged"
          :currentGuildId="guildId"
          :currentQuestId="questId"
          :channelId="channelId"
          :isChannel="true"
          :roles="roles"
          :editable="true"
        >
        </node-tree>
      </div>
    </div>
  </q-page>
  <div v-else class="row justify-center">
    <p>Loading data, please wait...</p>
  </div>
</template>

<script setup lang="ts">
import nodeTree from '../components/node-tree.vue';
import { waitUserLoaded } from '../app-access';
import { computed, onBeforeMount, ref } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';

// Stores
const guildStore = useGuildStore();
const questStore = useQuestStore();
const channelStore = useChannelStore();
const roleStore = useRoleStore();

// Router
const route = useRoute();

// Reactive variables
const guildId = ref<number | null>(null);
const questId = ref<number | null>(null);
const channelId = ref<number | null>(null);
let selectedNodeId: number | null = null;
const ready = ref(false);

// Computed properties
const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentQuest = computed(() => questStore.getCurrentQuest);
const roles = roleStore.getRoles!;

// Lifecycle Hooks
onBeforeMount(async () => {
  await initialize();
});
onBeforeRouteLeave((to, from, next) => {
  guildStore.setCurrentGuild(0);
  questStore.setCurrentQuest(0);
  next();
});

// Functions
function selectionChanged(id: number) {
  selectedNodeId = id;
}

async function initialize() {
  try {
    if (typeof route.params.guild_id === 'string')
      guildId.value = Number.parseInt(route.params.guild_id);
    if (typeof route.params.quest_id === 'string')
      questId.value = Number.parseInt(route.params.quest_id);
    if (typeof route.params.channel_id === 'string')
      channelId.value = Number.parseInt(route.params.channel_id);
    if (channelId.value) {
      channelStore.setCurrentChannel(channelId.value);
    }
    await waitUserLoaded();
    guildStore.setCurrentGuild(guildId.value!);
    if (questId.value) {
      questStore.setCurrentQuest(questId.value);
      await Promise.all([questStore.ensureQuest({ quest_id: questId.value })]);
    }

    await Promise.all([
      guildStore.ensureGuild(guildId.value!),
      roleStore.ensureAllRoles(),
      channelStore.ensureChannelConversation(channelId.value!, guildId.value!),
    ]);

    ready.value = true;
  } catch (error) {
    console.error('Failed to initialize data:', error);
  }
}
</script>

<style scoped>
.page {
  background-color: whitesmoke;
}

.sidenav {
  height: 100%;
  width: 15%;
  position: fixed;
  z-index: 1;
  top: 0;
  right: 0;
  color: black;
  background-color: rgb(230, 234, 238);
  overflow-x: hidden;
  transition: 0.5s;
  padding-top: 60px;
  border: 1px solid gray;
}
</style>
