<template>
  <div>
    <q-card class="q-mt-md q-pa-md">
      <h3 class="justify-item-center">Role Node Constraint</h3>
      <q-select
        style="width: 60%"
        clearable
        filled
        class="q-pt-md"
        v-model="nodeRoleNodeConstraint.node_type"
        label="Node Type"
        :options="ibis_node_type"
      ></q-select>
      <q-select
        style="width: 60%"
        clearable
        filled
        class="q-pt-md"
        v-model="nodeRoleNodeConstraint.max_pub_state"
        label="Max Publish State"
        :options="publication_state"
      ></q-select>
      <div class="row justify-item-center">
        <q-btn
          class="q-mt-xl q-ma-md"
          label="Add"
          @click="addRoleNodeConstraint_(nodeRoleNodeConstraint)"
        ></q-btn>
        <q-btn
          class="q-mt-xl q-ma-md"
          label="Update"
          @click="updateRoleNodeConstraint_(nodeRoleNodeConstraint)"
        ></q-btn>
        <q-btn
          class="q-mt-xl q-ma-md"
          label="Delete"
          @click="deleteRoleNodeConstraint_(nodeRoleNodeConstraint)"
        ></q-btn>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { RoleNodeConstraint } from '../types';
import { publication_state_enum, ibis_node_type_enum } from '../enums';
import { computed } from 'vue';

const emit = defineEmits<{
  addRoleNodeConstraint_: [RoleNodeConstraint];
  updateRoleNodeConstraint_: [RoleNodeConstraint];
  deleteRoleNodeConstraint_: [RoleNodeConstraint];
}>();
const RoleNodeConstraintCardProps = defineProps<{
  roleNodeConstraint: Partial<RoleNodeConstraint>;
}>();
const nodeRoleNodeConstraint = computed(
  () => RoleNodeConstraintCardProps.roleNodeConstraint,
);

const publication_state = Object.keys(publication_state_enum);
const ibis_node_type = Object.keys(ibis_node_type_enum);

function addRoleNodeConstraint_(nodeRoleNodeConstraint) {
  emit('addRoleNodeConstraint_', nodeRoleNodeConstraint);
}
function updateRoleNodeConstraint_(nodeRoleNodeConstraint) {
  emit('updateRoleNodeConstraint_', nodeRoleNodeConstraint);
}
function deleteRoleNodeConstraint_(nodeRoleNodeConstraint) {
  emit('deleteRoleNodeConstraint_', nodeRoleNodeConstraint);
}
</script>
