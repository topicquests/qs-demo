<template>
  <q-page class="bg-secondary" v-if="ready">
    <div>
      <member></member>
    </div>
    <div class="column items-center">
      <div class="col-4 q-pa-lg" style="width: 55%">
        <scoreboard></scoreboard>
      </div>
    </div>
    <div class="row justify-center">
      <h3>Edit Role</h3>
    </div>
    <div class="row justify-center">
      <role-card
        v-bind:role="roleStore.getRoleById(role_id)"
        v-bind:edit="true"
        v-on:updateCurrentRole="updateCurrentRole"
        v-on:deleteRoleById="deleteRoleById"
      ></role-card>
      <div class="col-4 q-ml-md">
        <div>
          <role-node-constraint-card
            v-bind:roleNodeConstraint="newRoleNodeConstraintCard"
            v-on:addRoleNodeConstraint_="addRoleNodeConstraint_"
            v-on:updateRoleNodeConstraint_="updateRoleNodeConstraint_"
            v-on:deleteRoleNodeConstraint_="deleteRoleNodeConstraint_"
          ></role-node-constraint-card>
        </div>
      </div>
    </div>
    <div class="row justify-center">
      <span class="q-pt-lg" style="font-size: 2em">Role Node Constraints</span>
    </div>
    <div class="row justify-center q-mt-xs q-pt-none">
      <div class="col-6 q-pa-none">
        <role-node-constraint-table
          v-bind:role="roleStore.getRoleById(role_id)"
          v-on:editRoleNodeConstraint="editRoleNodeConstraint"
        ></role-node-constraint-table>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import scoreboard from '../components/score-board.vue';
import member from '../components/member-handle.vue';
import { useRoleStore } from '../stores/role';
import { Role, RoleNodeConstraint } from '../types';
import { useRoute } from 'vue-router';

const roleStore = useRoleStore();
const route = useRoute();
let newRoleNodeConstraint = false;
let role_id: number;
const ready = ref(false);
let newRoleNodeConstraintCard: Partial<RoleNodeConstraint> = {
  node_type: 'question',
  max_pub_state: 'published',
};

async function updateCurrentRole(role) {
  try {
    await this.updateRole({ data: role });
    await this.fetchRoles();
    this.$q.notify({
      message: `role updated`,
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in updating role ', err);
    this.$q.notify({
      message: `There was an error updating role.`,
      color: 'negative',
    });
  }
}

async function deleteRoleById(role: Role) {
  try {
    await this.deleteRole({ params: { id: role.id }, data: {} });
    await this.fetchRoles();
    this.$q.notify({
      message: `role deleted`,
      color: 'positive',
    });
  } catch (err) {
    console.log('there was an error in deleting role ', err);
    this.$q.notify({
      message: `There was an error deleting role.`,
      color: 'negative',
    });
  }
}

async function addRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
  roleNodeConstraint.role_id = role_id;
  await roleStore.createRoleNodeConstraint(roleNodeConstraint);
  newRoleNodeConstraintCard =
    await roleStore.getRoleNodeConstraintsByRoleId(role_id)[0];
}
async function updateRoleNodeConstraint_(
  roleNodeConstraint: RoleNodeConstraint,
) {
  roleNodeConstraint.role_id = role_id;
  await roleStore.updateRoleNodeConstraint(roleNodeConstraint);
  newRoleNodeConstraintCard =
    await roleStore.getRoleNodeConstraintsByRoleId(role_id)[0];
}
async function deleteRoleNodeConstraint_(
  roleNodeConstraint: RoleNodeConstraint,
) {
  roleNodeConstraint.role_id = role_id;
  await roleStore.deleteRoleNodeConstraint(roleNodeConstraint);
}

async function editRoleNodeConstraint(roleNodeConstraint: RoleNodeConstraint) {
  newRoleNodeConstraintCard = roleNodeConstraint[0];
  console.log('Edit Role Constraint', roleNodeConstraint[0]);
  newRoleNodeConstraint = true;
}

onBeforeMount(async () => {
  if (typeof route.params.role_id === 'number') {
    role_id = Number.parseInt(route.params.role_id);
    await roleStore.ensureRole({ role_id: role_id });
  }
  await roleStore.ensureAllRoles();
  ready.value = true;
});
</script>
