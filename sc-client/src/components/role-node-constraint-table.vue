<template>
  <div v-if="role">
    <q-table
      :title="RoleNodeConstraintTableProps.title"
      :rows="RoleNodeConstraintTableProps.role.role_node_constraint"
      :columns="columns"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="node_type" :props="props"> {{ props.row.node_type }}</q-td>
          <q-td key="publish_state" :props="props">{{
            props.row.max_pub_state
          }}</q-td>
          <q-td key="roleId" auto-width :props="props">
            <q-btn
              label="edit"
              @click="
                editRoleNodeConstraint(props.row.role_id, props.row.node_type)
              "
            ></q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
  <div v-else>
    <span>There are no role node constraints</span>
  </div>
</template>

<script setup lang="ts">
import { QTableProps } from 'quasar';
import { useRoleStore } from 'src/stores/role';
import { Role, RoleNodeConstraint } from 'src/types';

const roleStore = useRoleStore();

const emit = defineEmits<{
  editRoleNodeConstraint: [RoleNodeConstraint[]];
}>();

const RoleNodeConstraintTableProps = defineProps<{
  role: Role;
  title?: string;
}>();
const columns: QTableProps['columns'] = [
  {
    name: 'node_type',
    required: true,
    label: 'Node Type',
    align: 'left',
    field: 'node_type',
    sortable: true,
  },
  {
    name: 'publish_state',
    required: true,
    label: 'Max Publish State',
    align: 'left',
    field: 'max_pub_state',
    sortable: true,
  },
  {
    name: 'roleId',
    required: false,
    label: 'Action',
    align: 'left',
    field: 'role_id',
    sortable: true,
  },
];

async function editRoleNodeConstraint(roleId: number, node_type: string) {
  const roleConstraint = await roleStore.getRoleNodeConstraintByType(
    roleId,
    node_type,
  );
  emit('editRoleNodeConstraint', roleConstraint);
}
</script>
