<template>
  <q-page class="bg-secondary lobby-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="lobby-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div v-if="getActiveQuests" style="width: 100%">
            <quest-table :quests="getActiveQuests" :title="'Active Quests'" />
            <q-btn :to="{ name: 'quest_list' }">All Quests</q-btn>
          </div>
          <div v-else-if="quests.length" class="col-6" style="width: 100%">
            <quest-table :quests="quests" :title="'Quests'" />
          </div>
          <div v-else class="column items-center q-mt-md">
            <h4>There are no quests</h4>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div v-if="myGuilds.length">
              <guilds-table :guilds="myGuilds" :title="'My Guilds'" />
              <q-btn :to="{ name: 'guild_list' }">All Guilds</q-btn>
            </div>
            <div v-else-if="getOpenGuilds.length">
              <guilds-table :guilds="getOpenGuilds" :title="'Open Guilds'" />
              <p v-if="memberStore.getUserId">
                Consider joining one of these guilds!
              </p>
              <p v-else>Register and join one of these guilds!</p>
              <q-btn
                v-if="getOpenGuilds.length < guildsStore.getGuilds.length"
                :to="{ name: 'guild_list' }"
                >All Guilds</q-btn
              >
            </div>
            <div v-else-if="guildsStore.getGuilds.length">
              <guilds-table :guilds="guildsStore.getGuilds" :title="'Guilds'" />
              <p>No guild is recruiting right now</p>
            </div>
            <h4 v-else style="text-align: center">
              There are currently no guilds
            </h4>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import QuestTable from '../components/quest-table.vue';
import GuildsTable from '../components/guilds-table.vue';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { Guild, GuildData } from '../types';
import { computed, onBeforeMount, ref } from 'vue';
import member from '../components/member-handle.vue';
import { useMembersStore } from '../stores/members';
import { waitUserLoaded } from '../app-access';

// Stores
const memberStore = useMemberStore();
const guildsStore = useGuildStore();
const questsStore = useQuestStore();
const membersStore = useMembersStore();

// Reactive Variables
const ready = ref(false);

// Computed Properties
const quests = computed({
  get: () => questsStore.getQuests,
  set: () => {},
});
const getActiveQuests = computed(() => questsStore.getActiveQuests);
const getOpenGuilds = computed((): GuildData[] =>
  guildsStore.getGuilds.filter(
    (guild: Guild) =>
      guild.open_for_applications && !guildsStore.isGuildMember(guild.id),
  ),
);
const myGuilds = computed((): GuildData[] => guildsStore.getMyGuilds);

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  // all guilds and quests
  await guildsStore.setCurrentGuild(true);
  await questsStore.setCurrentQuest(true);
  await Promise.all([
    questsStore.ensureAllQuests(),
    guildsStore.ensureAllGuilds(),
    membersStore.ensureAllMembers(),
  ]);
  ready.value = true;
});
</script>

<style>
p {
  background-color: lightgrey;
  font-size: 15pt;
}
.lobby-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}

.lobby-card {
  background-color: transparent;
  width: 60%;
}

.scoreboard {
  width: 75%;
}

@media only screen and (max-width: 1300px) {
  .lobby-card {
    width: 80%;
  }
}

@media only screen and (max-width: 800px) {
  .lobby-card {
    width: 98%;
  }
}

@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
  }
}
</style>
