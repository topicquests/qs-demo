<template>
  <router-view />
</template>

<script setup lang="ts">
import Vue from 'vue';
import VueRouter from 'vue-router';
import router from './router';
import { useMemberStore } from 'stores/member';
import { useQuestStore } from 'stores/quests';
import { useGuildStore } from 'stores/guilds';
import { useConversationStore } from 'stores/conversation';
import { useChannelStore } from 'stores/channel';
import { initWSClient } from './wsclient';
import { getCurrentInstance } from 'vue';

declare const ws_url: string;
// const memberStore = useMemberStore();
// const questStore = useQuestStore();
// const guildStore = useGuildStore();
// const conversationStore = useConversationStore();
// const channelStore = useChannelStore();
// initWSClient(store, ws_url);

/*
function dummy() {
  return {
    name: 'App',
    router: router(),
    watch: {
      currentUser(newUser, oldUser) {
        // reload quests an guilds
        if (newUser?.id !== oldUser?.id) {
          questStore.resetQuests();
          guildStore.resetGuilds();
          conversationStore.resetConversation();
          channelStore.resetChannel();
        }
        if (newUser === null) {
          //this.$router.push("/");
        } else {
          if (this.$route.path === '/login') {
            this.$router.push('/account');
          }
        }
      },
    },
    methods: {
      ...mapActions('member', ['ensureLoginUser', 'renewToken']),
    },
    computed: {
      ...mapState('member', {
        currentUser: (state: MemberState) => state.member,
      }),
    },
  }
}
*/

// in Component.vue
// const app = useCurrentApp()
</script>
