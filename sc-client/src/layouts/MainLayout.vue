<template>
  <q-layout view="hHh LpR fFf">
    <q-header elevated>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <q-toolbar>
        <q-btn
          id="leftDrawer"
          dense
          flat
          round
          icon="menu"
          name="leftdrawerBtn"
          @click="leftDrawer = !leftDrawer"
        />
        <q-toolbar-title>
          <q-btn flat @click="goTo('home')" id="home">
            <q-img
              src="../statics/sensecraft_icon.png"
              style="width: 60px"
              id="home_image"
            ></q-img>
            <q-img
              src="../statics/sensecraft.png"
              style="width: 160px"
              id="home_image"
            ></q-img>
          </q-btn>
        </q-toolbar-title>
        <div>
          <q-btn
            v-show="!checkIfAuthenticated"
            @click="goTo('signin')"
            roundeded
            label="sign in"
            id="signin"
            name="signinBtn"
            class="q-mr-sm bg-deep-purple-7 gt-sm"
          >
          </q-btn>
          <q-btn
            v-show="!checkIfAuthenticated"
            @click="goTo('register')"
            class="bg-deep-purple-7 gt-sm"
            name="registerBtn"
            roundeded
            label="Register"
            id="register"
          ></q-btn>
        </div>
        <div v-if="checkIfAuthenticated">
          <q-btn
            class="gt-sm"
            @click="onLogout()"
            outline
            roundeded
            label="log off"
            id="logoff"
            name="logoffBtn"
          >
          </q-btn>
        </div>
        <div v-if="checkIfAuthenticated && showTree && currentGuild">
          <q-btn
            flat
            dense
            round
            aria-label="Tree View"
            @click="toggleNav"
            id="channel_list"
          >
            <q-icon name="menu" />
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>
    <q-drawer
      v-model="rightDrawer"
      :breakpoint="200"
      bordered
      side="right"
      id="mySidenav"
      class="sidenav"
      :overlay="true"
    >
      <right_drawer :currentGuild="currentGuild" :currentQuest="currentQuest">
      </right_drawer>
    </q-drawer>
    <q-drawer v-model="leftDrawer" :breakpoint="500" bordered :overlay="true">
      <q-scroll-area class="fit">
        <drawer_menu v-on:onLogout="onLogout"></drawer_menu>
      </q-scroll-area>
    </q-drawer>
    <q-page-container class="q-pa-md">
      <router-view />
    </q-page-container>
    <q-footer class="footer bg-secondary">
      <p id="Pfooter">
        Sensecraft — © <a href="http://topicquests.org">TopicQuests</a> 2022.
        <a href="https://github.com/topicquests/sensecraft">Open Source</a>
      </p>
    </q-footer>
  </q-layout>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMemberStore } from '../stores/member';
import { useGuildStore } from '../stores/guilds';
import { useQuestStore } from '../stores/quests';
import { GuildData } from '../types';
import { useQuasar } from 'quasar';
import drawer_menu from '../components/drawer_menu.vue';
import right_drawer from 'src/components/right-drawer.vue';

const router = useRouter();
const memberStore = useMemberStore();
const guildStore = useGuildStore();
const questStore = useQuestStore();
const $q = useQuasar();
const leftDrawer = ref(false);
const isAuthenticated = ref(false);
const rightDrawer = ref(false);
const showTree = ref(true);
const currentGuild = computed(() => guildStore.getCurrentGuild);
const currentQuest = computed(() => questStore.getCurrentQuest);

const checkIfAuthenticated = computed(
  (): boolean => memberStore.isAuthenticated,
);
function goTo(newRoute: string): void {
  router.push({ name: newRoute });
}
async function onLogout() {
  rightDrawer.value = false;
  leftDrawer.value = false;
  await memberStore.logout();
  goTo('home');
  $q.notify({
    type: 'positive',
    message: 'You are now logged out',
  });
}
function toggleNav() {
  if (rightDrawer.value) {
    closeNav();
  } else {
    rightDrawer.value = true;
  }
}
function closeNav() {
  rightDrawer.value = false;
}
onBeforeMount(async () => {
  isAuthenticated.value = memberStore.isAuthenticated;
});
</script>
