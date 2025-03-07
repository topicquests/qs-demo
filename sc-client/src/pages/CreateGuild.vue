<template>
  <q-page class="bg-secondary create-guild-page" v-if="ready">
    <div class="row justify-center">
      <q-card style="width: 60%" class="q-mt-md create-guild-card">
        <div>
          <member_handle></member_handle>
        </div>
        <div class="column items-center">
          <div class="col-12 q-mb-md" style="width: 75%">
            <scoreboard></scoreboard>
          </div>
        </div>
        <div class="row justify-center">
          <h4 id="h4" class="q-pa-xs q-ma-xs">Create New Guild</h4>
        </div>
        <div class="column items-center">
          <q-card class="q-pl-md" style="width: 80%">
            <div class="row justify-start q-pa-lg">
              <q-option-group
                v-model="guild.public"
                :options="public_private_bool"
                color="primary"
                inline
              >
              </q-option-group>
            </div>
            <div class="row justify-start q-pb-lg">
              <q-input class="guildText" v-model="guild.name" label="Name" />
            </div>
            <div class="row justify-start q-pb-xs">Details<br /></div>
            <div class="row justify-start q-pb-lg">
              <q-editor v-model="description" style="width: 85%"></q-editor>
            </div>
            <div class="row">
              <span class="q-pt-md"> Default Role </span>
              <q-select
                class="q-ml-md"
                style="width: 50%"
                v-model="role"
                :options="roleStore.getRoles"
                option-label="name"
                option-value="id"
              />
            </div>
            <div class="row justify-start q-pb-lg">
              <q-input
                v-model="guild.handle"
                label="Handle"
                class="guildText"
              />
            </div>
            <div class="row justify-start q-pb-lg">
              <q-btn
                label="Submit"
                @click="doSubmit(guild)"
                color="primary"
                class="q-mr-md q-ml-md"
              />
              <q-btn label="Cancel" @click="$router.push({ name: 'home' })" />
            </div>
          </q-card>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import scoreboard from '../components/score-board.vue';
import member_handle from '../components/member-handle.vue';
//import { userLoaded } from '../boot/userLoaded';
import { public_private_bool } from '../enums';
import { GuildData, Role } from './../types';
import { onBeforeMount } from 'vue';
import { useRoleStore } from '../stores/role';
import { useMembersStore } from '../stores/members';
import { useGuildStore } from '../stores/guilds';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { AxiosResponse } from 'axios';
import axios from 'axios';

interface guildType {
  name: string;
  handle: string;
  public: boolean;
  description: string;
  default_role_id: number | null | undefined;
}

const roleStore = useRoleStore();
const membersStore = useMembersStore();
const guildStore = useGuildStore();
const ready = ref(false);
const $q = useQuasar();
const router = useRouter();
const guild = ref<guildType>({
  name: '',
  handle: '',
  public: false,
  description: '',
  default_role_id: null,
});

const role = ref<Partial<Role>>({ name: '' });

const description = computed({
  get: () => guild.value?.description,
  set: (value) => {
    if (guild.value) guild.value.description = value;
  },
});

async function doSubmit(guild: guildType) {
  try {
    guild.default_role_id = role.value.id;
    const res: AxiosResponse<GuildData[]> = await guildStore.createGuild(guild);

    $q.notify({
      message: 'Added new guild',
      color: 'positive',
    });
    router.push({ name: 'guild_admin', params: { guild_id: res.data[0].id } });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.log(error.status);
      $q.notify({
        message: 'There was an error creating new guild.',
        color: 'negative',
      });
    } else {
      console.log('there was an error in creating guild ', error);
      $q.notify({
        message: 'There was an error creating new guild.',
        color: 'negative',
      });
    }
  }
}
onBeforeMount(async () => {
  //await userLoaded;
  await roleStore.ensureAllRoles();
  await membersStore.ensureAllMembers();
  ready.value = true;
});
</script>
<style lang="scss">
.create-guild-page {
  background: url('../statics/images/questBackgroundImage.jpg') no-repeat center
    center fixed !important;
  background-size: cover;
  min-height: 100vh;
  padding: 0rem;
  box-sizing: border-box;
}
.create-guild-card {
  background-color: transparent;
  margin-bottom: 20px;
}

.details {
  max-width: 960px;
  min-height: 800px;
  overflow: auto;
  overflow-wrap: normal;
}
.guildText {
  color: blue;
  font-family: Arial, Helvetica, sans-serif;
  width: 25%;
}
#h4 {
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
}
</style>
