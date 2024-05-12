<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 90%" class="q-mt-md">
        <div>
          <member></member>
        </div>
        <div class="row justify-center q-mt-lg">
          <h3 class="q-mt-md">
            {{ questStore.getCurrentQuest!.name }}
            <q-btn
              v-if="questStore.getCurrentQuest!.description"
              class="q-ml-xs q-mt-md"
              size="md"
              :flat="true"
              icon="info"
            >
              <q-tooltip self="bottom middle" max-width="25rem">
                <div v-html="questStore.getCurrentQuest!.description"></div>
              </q-tooltip>
            </q-btn>
          </h3>
          <router-link
            :to="{
              name: 'quest_teams',
              params: { quest_id: questStore.getCurrentQuest!.id },
            }"
            class="q-ml-sm q-mt-md"
            >Teams</router-link
          >
        </div>
        <div class="row justify-center q-mt-lg">
          <span v-if="!memberId">
            <router-link :to="{ name: 'signin' }">Login to play</router-link>
          </span>
          <span v-else-if="questStore.isQuestMember(questId!)">
            You can
            <router-link
              :to="{ name: 'quest_edit', params: { quest_id: questId } }"
              >administer</router-link
            >
            this quest.
          </span>
          <span v-else-if="guildId">
            You're playing in guild
            <router-link
              :to="{ name: 'guild', params: { guild_id: guildId } }"
              >{{ guildStore.getCurrentGuild!.name }}</router-link
            >
          </span>
          <span
            v-else-if="questStore.getCurrentQuest!.status != 'registration'"
          >
            The game has started
          </span>
          <span v-else-if="myPlayingGuilds.length == 1">
            Your guild
            <router-link
              :to="{
                name: 'guild',
                params: {
                  guild_id: myPlayingGuilds[0].id,
                },
              }"
              >{{ myPlayingGuilds[0].name }}</router-link
            >
            is playing!
            <q-btn
              label="Join the game"
              @click="registerMemberDialog = true"
              style="margin-right: 1em"
              class="bg-primary q-ml-md"
            />
          </span>
          <span v-else-if="myPlayingGuilds.length > 1">
            You are part of many guilds which are playing this quest. Pick one:
            <ul>
              <li v-for="guild in myPlayingGuilds" :key="guild.id">
                <router-link
                  :to="{ name: 'guild', params: { guild_id: guild.id } }"
                  >{{ guild.name }}</router-link
                >
              </li>
            </ul>
          </span>
          <span v-else-if="myGuilds(true).length == 1">
            You are a leader in {{ myGuilds(true)[0].name }}. Maybe you want to
            <router-link
              :to="{
                name: 'guild',
                params: {
                  guild_id: myGuilds(true)[0].id,
                },
              }"
              >join</router-link
            >
            this quest?
          </span>
          <span v-else-if="myGuilds(true).length > 1">
            You are a leader in many guilds:
            <ul>
              <li v-for="guild in myGuilds(true)" :key="guild.id">
                <router-link
                  :to="{ name: 'guild', params: { guild_id: guild.id } }"
                  >{{ guild.name }}</router-link
                >
              </li>
            </ul>
            Maybe you want one of them to join this quest?
          </span>
          <span v-else-if="myGuilds().length == 1">
            You are a member in {{ myGuilds()[0].name }}. You could tell the
            guild leader to join this quest!
          </span>
          <span v-else-if="myGuilds().length > 1">
            You are a member in many guilds:
            <ul>
              <li v-for="guild in myGuilds()" :key="guild.id">
                <router-link
                  :to="{ name: 'guild', params: { guild_id: guild.id } }"
                  >{{ guild.name }}</router-link
                >
              </li>
            </ul>
            You could tell the guild leader in one of them to join this quest!
          </span>
          <span v-else-if="guildsPlayingGame(false, true).length > 1">
            Here are guilds playing the game which you could join:
            <ul>
              <li
                v-for="guild in guildsPlayingGame(false, true)"
                :key="guild.id"
              >
                <router-link
                  :to="{ name: 'guild', params: { guild_id: guild.id } }"
                  >{{ guild.name }}</router-link
                >
              </li>
            </ul>
          </span>
          <span v-else>
            Maybe try to join
            <router-link :to="{ name: 'guild_list' }">a guild</router-link>
            which could be interested in this quest?
          </span>
        </div>
        <div class="row justify-center q-mt-lg">
          <div class="col-11 q-md q-mr-lg">
            <node-tree
              :currentQuestId="questId"
              :currentGuildId="guildId"
              :initialSelectedNodeId="selectedNodeId"
              @tree-selection="selectionChanged"
              :channelId="null"
              :isChannel="false"
              :editable="true"
            />
          </div>
        </div>
        <q-dialog v-model="registerMemberDialog" persistent>
          <member-game-registration
            :guildId="mySelectedPlayingGuildId"
            :questId="questId"
          />
        </q-dialog>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import member from '../components/member-handle.vue';
import nodeTree from '../components/node-tree.vue';
import { permission_enum } from '../enums';
import { waitUserLoaded } from '../app-access';
import { useRoute, useRouter } from 'vue-router';
import { Casting, GamePlay, Guild, GuildData } from '../types';
import { computed, ref } from 'vue';
import { useQuestStore } from 'src/stores/quests';
import { useGuildStore } from 'src/stores/guilds';
import { useMemberStore } from 'src/stores/member';
import { useBaseStore } from '../stores/baseStore';
import memberGameRegistration from '../components/member_game_registration.vue';
import { onBeforeMount } from 'vue';

const questStore = useQuestStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const baseStore = useBaseStore();
const router = useRouter();
const route = useRoute();
const memberId = ref(memberStore.member!.id);
const ready = ref(false);
const registerMemberDialog = ref(false);
const questId = ref<number | undefined>(undefined);
let myPlayingGuilds: Guild[];
const selectedNodeId = ref<number | undefined>(undefined);
const mySelectedPlayingGuildId = ref<number | undefined>(undefined);

const guildId = computed((): number | undefined => {
  const quest_id = questStore.getCurrentQuest?.id;
  const casting: Casting = memberStore.castingPerQuest[quest_id!];
  if (casting) {
    return casting.guild_id;
  } else {
    return undefined;
  }
});

//data
//const newNode: Partial<ConversationNode> = {};

//newNodeParent: number = null;
//const selectedIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
//const childIbisTypes: ibis_node_type_type[] = ibis_node_type_list;
//allRoles!: RoleState["role"];

function myGuilds(only_as_leader = false): GuildData[] {
  let memberships = memberStore.member!.guild_membership || [];
  memberships = memberships.filter((gm) => gm.status == 'confirmed');
  let guild_ids = memberships.map((gm) => gm.guild_id);
  if (only_as_leader) {
    guild_ids = guild_ids.filter((gid) =>
      baseStore.hasPermission(permission_enum.joinQuest, gid),
    );
  }
  return guild_ids.map((gid) => guildStore.getGuildById(gid));
}

function guildsPlayingGame(only_mine = false, recruiting = false) {
  let guild_ids =
    questStore.getCurrentQuest!.game_play?.map(
      (gp: GamePlay) => gp.guild_id,
    ) || [];
  if (only_mine) {
    guild_ids = guild_ids.filter((g) =>
      (memberStore.member!.guild_membership || []).some(
        (gm) => gm.guild_id === g && gm.status == 'confirmed',
      ),
    );
  }
  let guilds = guild_ids.map((gid: number) =>
    guildStore.getGuildById(gid),
  );
  if (recruiting) {
    guilds = guilds.filter((g) => g.open_for_applications);
  }
  return guilds;
}

/*
function route(to, from) {
  if (from.params.quest_id != to.params.quest_id) {
        ready.value = false;
        initialize();
  }
 */

function selectionChanged(id: number) {
  router.push({
    name: id ? 'quest_page_node' : 'quest_page',
    params: {
      quest_id: String(questId),
      node_id: id ? String(id) : undefined,
    },
  });
}

async function initialize() {
  if (typeof route.params.quest_id === 'string') {
    questId.value = Number.parseInt(route.params.quest_id);
  }
  if (typeof route.params.node_id === 'string') {
    selectedNodeId.value = Number.parseInt(route.params.node_id);
  }
  await waitUserLoaded();
  questStore.setCurrentQuest(questId.value!);
  const promises: Promise<any>[] = [
    questStore.ensureQuest({ quest_id: questId.value! }),
    guildStore.ensureGuildsPlayingQuest({ quest_id: questId.value! }),
  ];
  await Promise.all(promises);
  // after so we have game_play ready
  await initializeGuildInner();
  ready.value = true;
}
async function initializeGuildInner() {
  if (guildId.value) {
    ready.value = false;
    guildStore.setCurrentGuild(guildId.value);
    if (guildId.value) await guildStore.ensureGuild(guildId.value);
    if (!selectedNodeId.value) {
      selectedNodeId.value = questStore.getCurrentGamePlay!.focus_node_id;
    }
  } else if (member) {
    myPlayingGuilds = guildsPlayingGame(true);
    if (myPlayingGuilds.length) {
      mySelectedPlayingGuildId.value = myPlayingGuilds[0].id;
    }
  }
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
