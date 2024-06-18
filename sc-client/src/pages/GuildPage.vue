<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="guild-card q-mt-md q-pa-md">
        <div class="col-12 justify-center">
          <q-card class="q-mt-md q-pa-md">
            <div class="row justify-end" style="width: 92%">
              <member-handle></member-handle>
            </div>
            <div class="row justify-center" style="width: 100%">
              <div class="col-10 justify-center">
                <scoreboard></scoreboard>
              </div>
            </div>
            <div class="row justify-end guild-header">
              <div class="col-4 text-right q-pr-md">
                <router-link
                  class="guild-header"
                  v-if="canRegisterToQuest"
                  :to="{
                    name: 'guild_admin',
                    params: { guild_id: currentGuild!.id },
                  }"
                  >>>go to admin page</router-link
                >
              </div>
            </div>
            <div class="col-12" v-if="currentGuild">
              <h1 class="text-center">
                {{ currentGuild.name }}
                <q-btn
                  v-if="
                    member &&
                    !isMember &&
                    currentGuild.open_for_applications
                  "
                  label="Join Guild"
                  @click="joinToGuild()"
                  style="margin-right: 1em"
                  class="bg-dark-blue"
                />
              </h1>
              <span v-if="!currentGuild.open_for_applications">
                guild closed</span
              >
              <span
                v-if="
                  !member && currentGuild.open_for_applications
                "
              >
                login or register to join</span
              >
            </div>
            <div class="row justify-center">
              <div class="column; guild-description-col">
                <q-card class="q-mb-md">
                  <div class="content-container">
                    <div
                      class="content"
                      v-html="currentGuild!.description"
                    ></div>
                  </div>
                </q-card>
              </div>
            </div>
            <div class="row">
              <div class="col-12 items-center">
                <div style="width: 100%">
                  <q-card
                    class="bg-secondary q-mb-md q-pb-sm"
                    style="width: 100%"
                  >
                    <div class="row text-center">
                      <div class="col-12">
                        <h2 class="q-mt-md q-mb-md">Registered Quests</h2>
                      </div>
                    </div>
                    <div class="row justify-start">
                      <div v-if="activeQuests.length > 0">
                        <div v-for="quest in activeQuests" :key="quest.id">
                          <q-radio
                            v-model="questStore.currentQuest"
                            color="black"
                            :val="quest.id"
                            :label="quest.name"
                            class="q-ml-xl"
                          >
                            <q-btn
                              v-if="
                                isMember && !memberStore.guildPerQuest[quest.id]
                              "
                              label="Play"
                              @click="prompt = true"
                              id="radio-btn"
                              size="md"
                              class="bg-primary q-ml-md"
                            />
                            <q-btn
                              v-else-if="
                                memberStore.guildPerQuest[quest.id] &&
                                memberStore.guildPerQuest[quest.id] ==
                                  guildStore.currentGuild
                              "
                              class="q-ml-md bg-primary"
                              label="Go To Quest"
                              id="radio-btn"
                              size="sm"
                              @click="
                                router.push({
                                  name: 'conversation_column',
                                  params: { node_id: String(nodeId) },
                                })
                              "
                            />
                            <router-link
                              v-if="
                                memberStore.guildPerQuest[quest.id] &&
                                memberStore.guildPerQuest[quest.id] !=
                                  guildStore.currentGuild
                              "
                              :to="{
                                name: 'guild',
                                params: {
                                  guild_id: memberStore.guildPerQuest[quest.id],
                                },
                              }"
                              >Playing in guild</router-link
                            >
                          </q-radio>
                        </div>
                      </div>

                      <div v-else class="col-12">
                        <h2 h2 class="q-mt-md q-mb-md">
                          You are not registered to any quests
                        </h2>
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
            <div class="row">
              <div
                v-if="
                currentQuest &&
                  questStore.isPlayingQuestInGuild(
                    currentQuest.id,
                    currentGuild!.id,
                  )
                "
                class="col-12"
              >
                <castingRoleEdit
                  class="casting-role"
                  v-if="availableRoles.length"
                  :availableRoles="availableRoles"
                  :castingRoles="castingRoles"
                  :guildId!="guildId"
                  :questId="currentQuestId"
                  :memberId="member!.id"
                  v-on:castingRoleAdd="castingRoleAdded"
                  v-on:castingRoleRemove="castingRoleRemoved"
                ></castingRoleEdit>
              </div>
            </div>
            <div class="row justify-center">
              <div class="col-12 q-mb-md q-mt-md">
                <guild-members
                  :guild="currentGuild!"
                  :quest="currentQuest"
                  :members="getGuildMembers"
                />
              </div>
            </div>

            <div class="row justify-centetr">
              <div
                class="column items-center"
                style="width: 100%"
                v-if="pastQuests.length > 0"
              >
                <q-card style="width: 100%">
                  <q-table
                    title="Past Quests"
                    :rows="pastQuests"
                    :columns="columns"
                    row-key="desc"
                    id="quest_table"
                    style="width: 100%"
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="desc" :props="props">
                          {{ props.row.name }}</q-td
                        >
                        <q-td key="handle" :props="props">{{
                          props.row.handle
                        }}</q-td>
                        <q-td key="status" :props="props">{{
                          props.row.status
                        }}</q-td>
                        <q-td key="end" :props="props">{{
                          props.row.end
                        }}</q-td>
                        <q-td key="questNodeId" auto-width :props="props">
                          <router-link
                            :to="{
                              name: 'quest_page',
                              params: { quest_id: props.row.id },
                            }"
                            >Enter</router-link
                          > </q-td
                        >admin
                      </q-tr>
                    </template>
                  </q-table>
                </q-card>
              </div>
            </div>
            <q-dialog v-model="prompt" persistent>
              <member-game-registration
                :guildId="guildId!"
                :questId="questStore.currentQuest"
              />
            </q-dialog>
          </q-card>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import memberHandle from '../components/member-handle.vue';
import { waitUserLoaded } from '../app-access';
import { useRoute, useRouter } from 'vue-router';
import {
  registration_status_enum,
  quest_status_enum,
  permission_enum,
} from '../enums';
import { Quest, GamePlay, Casting, Role, PublicMember } from '../types';
import { computed, ref, watchEffect } from 'vue';
import castingRoleEdit from '../components/casting_role_edit.vue';
import guildMembers from '../components/guild-members.vue';
import memberGameRegistration from '../components/member_game_registration.vue';
import '../css/app.scss';
import { QTableProps } from 'quasar';
import { onBeforeMount } from 'vue';
import { useBaseStore } from 'src/stores/baseStore';
import { useMemberStore } from '../stores/member';
import { useMembersStore } from 'src/stores/members';
import { useQuestStore } from 'src/stores/quests';
import { useGuildStore } from 'src/stores/guilds';
import { useRoleStore } from 'src/stores/role';
import { useChannelStore } from 'src/stores/channel';
import { useConversationStore } from 'src/stores/conversation';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

// Route
const router = useRouter();
const route = useRoute();
// Stores
const baseStore = useBaseStore();
const guildStore = useGuildStore();
const memberStore = useMemberStore();
const membersStore = useMembersStore();
const questStore = useQuestStore();
const roleStore = useRoleStore();
const channelStore = useChannelStore();
const conversationStore = useConversationStore();

// Quasar
const $q = useQuasar();

//Reactive Variables
const canRegisterToQuest = ref(false);
const isMember = ref(false);
const prompt = ref(false);
const guildId = ref<number | null>(null);
const ready = ref(false);
const { member } = storeToRefs(memberStore);

//Non Reactive Variables
const allRoles = roleStore.role;
let activeQuests: Quest[] = [];
let memberPlaysQuestInThisGuild = false;
let guildGamePlays: GamePlay[] = [];
let casting: Casting|undefined;
let pastQuests: Quest[] = [];

//Table Columns 
const columns: QTableProps['columns'] = [
  {
    name: 'desc',
    required: true,
    label: 'Quest',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'status',
    required: false,
    label: 'Handle',
    align: 'left',
    field: 'status',
    sortable: true,
  },
  {
    name: 'handle',
    required: false,
    label: 'Status',
    align: 'left',
    field: 'handle',
    sortable: true,
  },
  {
    name: 'start',
    required: false,
    label: 'Start Date',
    align: 'left',
    field: 'start',
    sortable: true,
  },
  {
    name: 'questNodeId',
    required: false,
    label: 'Action',
    align: 'left',
    field: 'id',
    sortable: true,
  },
];

//Computed Properties
const currentQuestId = computed(() => questStore.currentQuest)
const currentGuild = computed(() => guildStore.getCurrentGuild)
const currentQuest = computed(() => questStore.getCurrentQuest)
const currentGuildId = computed(() => guildStore.currentGuild)
const nodeId = computed(() => conversationStore.neighbourhoodRoot)

watchEffect(async() => {
  if (!currentQuest.value) {
    return;
  }
  await membersStore.ensureMemberById({ id: currentQuest.value!.creator });
  await guildStore.ensureGuildsPlayingQuest({ quest_id: currentQuest.value!.id });
  const questCasting = currentQuest.value!.casting?.find(
    (ct: Casting) => ct.member_id == member!.value?.id,
  );
  if (questCasting) {
    if (questCasting.guild_id == currentGuildId.value) {
      memberPlaysQuestInThisGuild = true;
      casting = questCasting;
    }
  }
  const gamePlay: Partial<GamePlay> | undefined = findPlayOfGuild(currentQuest.value!.game_play);
  var node_id = gamePlay?.focus_node_id;
  if (!node_id) {
    await conversationStore.ensureRootNode(questStore.currentQuest);
    node_id = conversationStore.conversationRoot?.id;
  }
  if (node_id && typeof currentGuildId.value === 'number') {
    await conversationStore.ensureConversationNeighbourhood({ node_id, guild: currentGuildId.value });
  } else {
    // ill-constructed quest
    await conversationStore.resetConversation();
  }
  return 'success';
});

function castingRoles(): Role[] {
  const castingRoles =
    membersStore.castingRolesPerQuest(member!.value?.id, currentQuest.value!.id) ||
    [];
  const roles = castingRoles.map((cr) => allRoles[cr.role_id]);
  return roles;
}
const availableRoles = (): Role[] => {
  if (!member || !member.value?.id || !guildId.value) {
    return [];
  }
  return membersStore
    .getAvailableRolesForMemberAndGuild(member.value.id, guildId.value)
    .map((cr) => allRoles[cr.role_id]);
};

const getGuildMembers = computed((): PublicMember[] | undefined => {
  if (currentGuild.value) {
    return guildStore.getMembersOfCurrentGuild;
  }
  return [];
})
async function initializeQuest() {
  var quest_id: number | undefined | null = questStore.currentQuest;
  if (
    quest_id &&
    !guildGamePlays.find((gp: GamePlay) => gp.quest_id == quest_id)
  ) {
    quest_id = null;
  }
  if (!quest_id) {
    const gamePlay = guildGamePlays[0];
    await questStore.setCurrentQuest(gamePlay.quest_id);
  }
}
async function joinToGuild() {
  if (typeof guildStore.currentGuild === 'number')
    await guildStore.addGuildMembership({
      guild_id: guildStore.currentGuild,
      member_id: member!.value?.id,
    });
  isMember.value = true;
  await channelStore.resetChannel();
  $q.notify({
    type: 'positive',
    message: 'You are joining guild ' + guildStore.currentGuild,
  });
  return;
}

function findPlayOfGuild(gamePlays: GamePlay[]|undefined): Partial<GamePlay | undefined> {
  if (gamePlays)
    return gamePlays.find(
      (gp: GamePlay) => gp.guild_id == guildStore.currentGuild,
    );
  return undefined;
}
function checkPermissions() {
  if (typeof guildStore.currentGuild === 'number') {
    isMember.value = !!guildStore.isGuildMember(guildStore.currentGuild);
    canRegisterToQuest.value = baseStore.hasPermission(
      permission_enum.joinQuest,
      guildStore.currentGuild,
    );
  }
}
async function castingRoleAdded(role_id: number) {
  const guild_id = guildId.value;
  const quest_id: number | undefined = questStore.currentQuest;
  await questStore.addCastingRole({
    member_id: member!.value?.id,
    role_id,
    guild_id: guild_id!,
    quest_id,
  });
}
async function castingRoleRemoved(role_id: number) {
  const guild_id: number | null = guildId.value;
  const quest_id: number | undefined = questStore.currentQuest;
  if (!member || !member.value?.id) {
    return [];
  }
  await questStore.deleteCastingRole(
    member.value.id,
    role_id,
    guild_id!,
    quest_id,
  );
}
async function initialize() {
  if (typeof route.params.guild_id === 'string') {
    guildId.value = Number.parseInt(route.params.guild_id);
  }
  const guild_id = guildId.value;
  await waitUserLoaded();
  guildStore.setCurrentGuild(guild_id!);
  await Promise.all([
    questStore.ensureAllQuests(),
    roleStore.ensureAllRoles(),
    channelStore.ensureChannels(guild_id!),
    membersStore.ensureMembersOfGuild({ guildId: guild_id }),
  ]);
  await initializeStage2();
  ready.value = true;
}
async function initializeStage2() {
  checkPermissions();
  const playQuestIds = currentGuild.value!.game_play.map(
    (gp: GamePlay) => gp.quest_id,
  );
  guildGamePlays = currentGuild.value!.game_play.filter(
    (gp: GamePlay) => gp.status == registration_status_enum.confirmed,
  );
  const confirmedPlayQuestIds = (guildGamePlays || []).map(
    (gp: GamePlay) => gp.quest_id,
  );
  pastQuests = questStore.getQuests.filter(
    (q: Quest) =>
      (q.status == quest_status_enum.finished ||
        q.status == quest_status_enum.scoring) &&
      playQuestIds.includes(q.id),
  );
  activeQuests = questStore.getQuests.filter(
    (q: Quest) =>
      (q.status == quest_status_enum.ongoing ||
        q.status == quest_status_enum.paused ||
        q.status == quest_status_enum.registration) &&
      confirmedPlayQuestIds.includes(q.id),
  );

  if (guildGamePlays.length > 0) {
    await initializeQuest();
  }
}

//Lifecycle Hooks
onBeforeMount(async () => {
  await initialize();
});
</script>

<style lang="scss">
.guild-description-col {
  width: 100%;
}

.guild-card {
  width: 50%;
}
.active-quest-header {
  text-decoration: underline;
  font-family: Arial, Helvetica, sans-serif;
  color: $primary;
}
.guild-header {
  background-color: azure;
  width: 92%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
}
.guild-name {
  text-align: center;
  font-size: 40px;
  background-color: azure;
}
.handles {
  font-size: 20px;
  font-family: pragmatica-web, sans-serif;
}
.card-header {
  text-align: center;
  color: blue;
  text-decoration: underline;
  font-size: 20px;
  padding-bottom: sm;
}
#radio {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  width: 100%;
}
#radio-btn {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
}
#node_card {
  border: 3px solid black;
  font-size: 10pt;
  color: darkblue;
  height: 400px;
  background-color: #caf0f8;
}
#guild-description {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
@media only screen and (max-width: 1300px) {
  .guild-card {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .guild-card {
    width: 98%;
  }
}
@media only screen and (max-width: 800px) {
  .guild-description-col {
    width: 98%;
  }
}
@media only screen and (max-width: 800px) {
  .casting-role {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
.content-container {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
  border: 50px solid #ccc;
  max-height: 300px; /*
Set the maximum height you desire */
  overflow-y: auto;
}
.content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
</style>
