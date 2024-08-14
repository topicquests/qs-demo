<template>
  <div class="row justify-start">
    <div v-if="activeQuests && activeQuests.length > 0">
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
              ActiveQuestsProps.isMember && !memberStore.guildPerQuest[quest.id]
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
              memberStore.guildPerQuest[quest.id] == guildStore.currentGuild &&
              quest.id
            "
            class="q-ml-md bg-primary"
            label="Go To Quest"
            id="radio-btn"
            size="sm"
            @click="
              router.push({
                name: 'quest_page',
                params: { quest_id: String(quest.id) },
              })
            "
          />
          <router-link
            v-if="
              memberStore.guildPerQuest[quest.id] &&
              memberStore.guildPerQuest[quest.id] != guildStore.currentGuild
            "
            :to="{
              name: 'guild',
              params: {
                guild_id: memberStore.guildPerQuest[quest.id],
              },
            }"
          >
            Playing in guild
          </router-link>
        </q-radio>
      </div>
    </div>

    <div v-else class="col-12">
      <h2 class="q-mt-md q-mb-md">You are not registered to any quests</h2>
    </div>
    <q-dialog v-model="prompt" persistent>
      <member-game-registration
        :guildId="ActiveQuestsProps.guildId!"
        :questId="ActiveQuestsProps.questId"
      />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuestStore } from '../stores/quests';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { Quest } from '../types';
import memberGameRegistration from '../components/member_game_registration.vue';
import { useRouter } from 'vue-router';

// Props
const ActiveQuestsProps = defineProps<{
  isMember: boolean;
  activeQuests: Quest;
  questId?: number;
  guildId?: number;
}>();
const questStore = useQuestStore();
const memberStore = useMemberStore();
const guildStore = useGuildStore();
const router = useRouter();

const prompt = ref(false);
</script>

<style scoped>
/* Add your styles here if needed */
</style>
