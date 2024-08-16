<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3 v-if="questId">
        Channel of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: guildId,
            },
          }"
          >{{ currentGuild.name }}</router-link
        >
        in quest
        <router-link
          :to="{
            name: 'quest_page',
            params: {
              guild_id: guildId,
            },
          }"
          >{{ currentQuest.name }}</router-link
        >
        (<router-link
          :to="{
            name: 'game_channel_list',
            params: {
              guild_id: guildId,
              quest_id: questId,
            },
          }"
          >more</router-link
        >)
      </h3>
      <h3 v-else>
        Channel of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: guildId,
            },
          }"
          >{{ currentGuild.name }}</router-link
        >
        (<router-link
          :to="{
            name: 'guild_channel_list',
            params: {
              guild_id: guildId,
            },
          }"
          >more</router-link
        >)
      </h3>
    </div>
    <div class="row justify-center q-mt-lg">
      <div class="col-6 q-md q-mr-lg">
        <node-tree
          v-on:updateTree="selectionChanged"
          :currentGuildId="guildId"
          :currentQuestId="questId"
          :channelId="channelId!"
          :isChannel="true"
          :roles="roles"
          :editable="true"
        >
        </node-tree>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import nodeTree from '../components/node-tree.vue';
import { waitUserLoaded } from '../app-access';
import { onBeforeMount, ref } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { useRoute } from 'vue-router';
import { useChannelStore } from '../stores/channel';
import { useRoleStore } from '../stores/role';

/*
  meta: (c) => ({
    // todo: not reactive because not computed
    title: `${c.getCurrentQuest ? "Game" : "Guild"} Channel - ${
      c.getChannelById(c.channelId)?.title
    }`,
  }),
})
*/
const guildStore = useGuildStore();
const questStore = useQuestStore();
const channelStore = useChannelStore();
const roleStore = useRoleStore();
const route = useRoute();
//const ibis_node_type_list: ibis_node_type_type = ibis_node_type_list;
//const publication_state_list: publication_state_type = publication_state_list;
//const public_private_bool: publication_state_type = public_private_bool;
const guildId = ref<number>();
const questId = ref<number>();
const channelId = ref<number>();
let selectedNodeId: number | null = null;
const ready = ref(false);
const currentGuild = guildStore.getCurrentGuild!;
const currentQuest = questStore.getCurrentQuest!;
const roles = roleStore.getRoles!;

function selectionChanged(id: number) {
  selectedNodeId = id;
}

async function initialize() {
  if (typeof route.params.guild_id === 'string')
    guildId.value = Number.parseInt(route.params.guild_id);
  if (typeof route.params.quest_id === 'string')
    questId.value = Number.parseInt(route.params.quest_id);
  if (typeof route.params.channel_id === 'string')
    channelId.value = Number.parseInt(route.params.channel_id);
  channelStore.setCurrentChannel(channelId.value!);
  await waitUserLoaded();
  const promises = [];
  guildStore.setCurrentGuild(guildId.value!);
  questStore.setCurrentQuest(questId.value!);
  if (questId.value) {
    promises.push(questStore.ensureQuest({ quest_id: questId.value }));
    promises.push(channelStore.ensureChannels(guildId.value!));
  }
  promises.push(channelStore.ensureChannels(guildId.value!));
  promises.push(guildStore.ensureGuild(guildId.value!));
  promises.push(roleStore.ensureAllRoles());
  promises.push(
    channelStore.ensureChannelConversation(channelId.value!, guildId.value!),
  );
  await Promise.all(promises);
  ready.value = true;
}
onBeforeMount(async () => {
  await initialize();
});
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
