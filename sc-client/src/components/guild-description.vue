<template>
  <div>
    <div class="col-12" v-if="currentGuild">
      <h1 class="text-center">
        {{ currentGuild.name }}
        <q-btn
          v-if="member && !isMember && currentGuild.open_for_applications"
          label="Join Guild"
          @click="joinToGuild()"
          style="margin-right: 1em"
          class="bg-dark-blue"
        />
      </h1>
      <span v-if="!currentGuild.open_for_applications">guild closed</span>
      <span v-if="!member && currentGuild.open_for_applications"
        >login or register to join</span
      >
    </div>
    <div class="row justify-center">
      <div class="column guild-description-col">
        <q-card class="q-mb-md">
          <div class="content-container">
            <div class="content" v-html="currentGuild?.description"></div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGuildStore } from '../stores/guilds';
import { useMemberStore } from '../stores/member';

const guildStore = useGuildStore();
const memberStore = useMemberStore();

const currentGuild = computed({
  get:() => {
    return guildStore.getCurrentGuild
  },
  set:() => {}
})
const member = computed(() => memberStore.member);
const isMember = computed({
  get: () => {
    return !!guildStore.isGuildMember(currentGuild.value?.id)
  },
  set:(value) => {
    return value;
  }
})

const joinToGuild = async () => {
  if (typeof currentGuild.value.id === 'number')
    await guildStore.addGuildMembership({
      guild_id: currentGuild.value.id,
      member_id: member.value?.id,
    });
  isMember.value = true;
};
</script>
