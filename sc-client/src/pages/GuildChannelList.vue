<template>
  <q-page class="bg-secondary page" v-if="ready">
    <div class="row justify-center q-mt-lg">
      <h3>
        Channels of guild
        <router-link
          :to="{
            name: 'guild',
            params: {
              guild_id: guildId,
            },
          }"
          >{{ currentGuild.name }}</router-link
        >
      </h3>
    </div>
    <div class="col-3 q-md q-mb-md">
      <channel-list :guild_id="guildId" :inPage="true" title="Guild Channels" />
      <q-btn
        v-if="canAddChannel && !creating"
        @click="createGuildChannel"
        label="Create Guild Channel"
      />
      <!-- todo: create_guild_channel permission -->
      <q-input
        v-if="creating"
        v-model="newChannelName"
        label="Channel name"
        id="channel_name"
      />
      <q-btn
        v-if="creating"
        @click="cancelCreateGuildChannel()"
        label="Cancel"
      />
      <q-btn
        v-if="creating"
        @click="confirmCreateGuildChannel()"
        label="Confirm"
      />
      <!-- todo: only active if non-empty name -->
    </div>
  </q-page>
</template>

<script setup lang="ts">
import ChannelList from '../components/ChannelListComponent.vue';
import { waitUserLoaded } from '../app-access';
import {
  ibis_node_type_enum,
  meta_state_enum,
  permission_enum,
  publication_state_enum,
} from '../enums';
import { ConversationNode } from '../types';
import { computed, onBeforeMount, ref } from 'vue';
import { useGuildStore } from 'src/stores/guilds';
import { useBaseStore } from 'src/stores/baseStore';
import { useChannelStore } from 'src/stores/channel';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const route = useRoute();
const q = useQuasar();
const guildStore = useGuildStore();
const baseStore = useBaseStore();
const channelStore = useChannelStore();
const currentGuild = computed(() => guildStore.getCurrentGuild!);
const guildId = ref<number>();
const ready = ref(false);
const creating = ref(false);
const newChannelName = ref('');
const canAddChannel = computed({
  get: () => {
    return baseStore.hasPermission(permission_enum.guildAdmin, guildId.value);
  },
  set: () => {},
});

function createGuildChannel() {
  creating.value = true;
}
function cancelCreateGuildChannel() {
  creating.value = false;
}
async function confirmCreateGuildChannel() {
  try {
    let channel: Partial<ConversationNode> = {
      title: newChannelName.value,
      node_type: ibis_node_type_enum.channel,
      meta: meta_state_enum.channel,
      status: publication_state_enum.guild_draft,
      guild_id: guildId.value,
    };
    await channelStore.createChannelNode(channel);
    q.notify({
      message: `Added new conversation node`,
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in creating conversation node ', err);
    q.notify({
      message: `There was an error creating new conversation node.`,
      color: 'negative',
    });
  }
  creating.value = false;
}
onBeforeMount(async () => {
  if (typeof route.params.guild_id === 'string')
    guildId.value = Number.parseInt(route.params.guild_id);
  await waitUserLoaded();
  guildStore.setCurrentGuild(guildId.value!);
  const promises = [
    guildStore.ensureGuild(guildId.value!),
    channelStore.ensureChannels(guildId.value!),
  ];
  await Promise.all(promises);
  ready.value = true;
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
