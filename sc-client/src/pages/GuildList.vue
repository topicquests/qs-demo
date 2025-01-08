<template>
  <q-page class="bg-secondary guildlist-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="guildlist-card q-mt-md q-pa-md">
        <div>
          <member></member>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md scoreboard">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-6" style="width: 100%">
            <div v-if="guilds.length">
              <guilds-table :guilds="guilds" :title="'Guilds'"> </guilds-table>
            </div>
            <h3 v-else>There currently are no guilds</h3>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import member from '../components/member-handle.vue';
import { waitUserLoaded } from '../app-access';
import GuildsTable from '../components/guilds-table.vue';
import { useGuildStore } from '../stores/guilds';
import { computed, onBeforeMount, ref } from 'vue';
import { useRoleStore } from '../stores/role';
import { useQuestStore } from '../stores/quests';

// Stores
const guildStore = useGuildStore();
const roleStore = useRoleStore();
const questStore = useQuestStore();

// Reactive Variables
const ready = ref(false);

// Computed Properties
const guilds = computed(() => guildStore.getGuilds);

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  await Promise.all([
    guildStore.ensureAllGuilds(),
    await roleStore.ensureAllRoles(),
    guildStore.setCurrentGuild(true),
    questStore.setCurrentQuest(false),
  ]);
  ready.value = true;
});
</script>
<style>
.guildlist-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.guildlist-card {
  width: 60%;
  background-color: transparent;
}

.scoreboard {
  width: 75%;
}

@media only screen and (max-width: 800px) {
  .guildlist-card {
    width: 95%;
    background-color: transparent;
  }
}
@media only screen and (max-width: 1000px) {
  .scoreboard {
    width: 98%;
    background-color: transparent;
  }
}
</style>
