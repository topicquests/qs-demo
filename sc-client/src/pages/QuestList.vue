<template>
  <q-page class="bg-secondary quest-page" v-if="ready">
    <div class="row justify-center">
      <q-card class="q-mt-sm quest-card">
        <div>
          <member-handle></member-handle>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4 q-pl-md q-pb-sm" style="width: 100%">
            <q-btn
              color="primary"
              v-if="memberStore.member"
              label="New Quest"
              @click="
                router.push({
                  name: 'create_quest',
                })
              "
            />
          </div>
        </div>
        <div class="column items-center">
          <div class="col-4" style="width: 100%">
            <div
              v-if="questStore.getQuests && questStore.getQuests.length"
              class="col-4 q-pa-sm"
              style="width: 100%"
            >
              <quest-table :quests="questStore.getQuests" :title="'Quests'" />
            </div>
            <div v-else class="column items-center q-mt-md">
              <h4>There are no quests</h4>
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import scoreboard from '../components/score-board.vue';
import questTable from '../components/quest-table.vue';

import { waitUserLoaded } from '../app-access';
import { useMemberStore } from '../stores/member';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import memberHandle from '../components/member-handle.vue';

// Stores
const memberStore = useMemberStore();
const questStore = useQuestStore();
const guildStore = useGuildStore();
const router = useRouter();

// Reactive Variables
const ready = ref(false);

// Lifecycle Hooks
onBeforeMount(async () => {
  await waitUserLoaded();
  await Promise.all([
    questStore.ensureAllQuests(),
    guildStore.setCurrentGuild(false),
    questStore.setCurrentQuest(true),
  ]);
  ready.value = true;
});
</script>

<style>
.quest-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}

.quest-card {
  width: 75%;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
}

/* Adjustments for smaller screens */
@media only screen and (max-width: 1300px) {
  .quest-card {
    width: 80%;
  }
}
@media only screen and (max-width: 800px) {
  .quest-card {
    width: 98%;
  }
}

/* Buttons */
.q-btn {
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.q-btn:hover {
  background-color: #0056b3;
}

/* Table Styles */
.quest-table {
  width: 100%;
  border-collapse: collapse;
}
.quest-table th, .quest-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
}
.quest-table th {
  background-color: #004080;
  color: white;
}
.quest-table tr:nth-child(even) {
  background-color: #f2f2f2;
}
.quest-table tr:hover {
  background-color: #e0e0e0;
}
</style>
