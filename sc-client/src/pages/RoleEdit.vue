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
import { onBeforeMount, ref } from "vue";
import scoreboard from "../components/scoreboard.vue";
import member from "../components/member.vue";
import { useRoleStore } from "src/stores/role";
import roleCard from "../components/role-card.vue";
import { Role, RoleNodeConstraint } from "src/types";
import RoleNodeConstraintTable from "src/components/role-node-constraint-table.vue";
import RoleNodeConstraintCard from "src/components/role-node-constraint-card.vue";
import { useRoute } from "vue-router";

const roleStore = useRoleStore();
const route = useRoute()
const name = "RoleEdit";
const newRoleNodeConstraint = false;
let role_id: number;
const isAdmin = false;
const ready = ref(false);
const newRoleNodeConstraintCard: Partial<RoleNodeConstraint> = {
  node_type: "question",
  max_pub_state: "published",
};

  async function updateCurrentRole(role) {
    try {
      await this.updateRole({ data: role });
      await this.fetchRoles();
      this.$q.notify({
        message: `role updated`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in updating role ", err);
      this.$q.notify({
        message: `There was an error updating role.`,
        color: "negative",
      });
    }
  }

  async function deleteRoleById(role: Role) {
    try {
      await this.deleteRole({ params: { id: role.id }, data: {} });
      await this.fetchRoles();
      this.$q.notify({
        message: `role deleted`,
        color: "positive",
      });
    } catch (err) {
      console.log("there was an error in deleting role ", err);
      this.$q.notify({
        message: `There was an error deleting role.`,
        color: "negative",
      });
    }
  }

  async function addRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.createRoleNodeConstraint({ data: roleNodeConstraint });
    this.newRoleNodeConstraintCard = await this.getRoleNodeConstraintsByRoleId(
      this.role_id
    )[0];
  }
  async function updateRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.updateRoleNodeConstraint({
      params: {
        role_id: this.role_id,
        node_type: roleNodeConstraint.node_type,
      },
      data: { role_id: this.role_id, node_type: roleNodeConstraint.node_type },
    });
    this.newRoleNodeConstraintCard = await this.getRoleNodeConstraintsByRoleId(
      this.role_id
    )[0];
  }
  async function deleteRoleNodeConstraint_(roleNodeConstraint: RoleNodeConstraint) {
    roleNodeConstraint.role_id = this.role_id;
    await this.deleteRoleNodeConstraint({
      params: {
        role_id: this.role_id,
        node_type: roleNodeConstraint.node_type,
      },
      data: { role_id: this.role_id, node_type: roleNodeConstraint.node_type },
    });
  }

  async function editRoleNodeConstraint(roleNodeConstraint: RoleNodeConstraint) {
    this.newRoleNodeConstraintCard = roleNodeConstraint[0];
    console.log("Edit Role Constraint", roleNodeConstraint[0]);
    this.newRoleNodeConstraint = true;
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
