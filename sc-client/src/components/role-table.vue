<template>
  <q-table
    :title="RoleTableProps.title"
    :rows="RoleTableProps.roles"
    :columns="columns"
    class="q-pb-md"
  >
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="name" :props="props"> {{ props.row.name }}</q-td>
        <q-td key="guild" :props="props"> {{ props.row.guild_id }}</q-td>
        <q-td key="permissions" :props="props">{{
          props.row.permissions
        }}</q-td>
        <q-td key="publish_state" :props="props">{{
          props.row.max_pub_state
        }}</q-td>
        <q-td key="roleId" auto-width :props="props">
          <router-link
            :to="{ name: 'role_edit', params: { role_id: props.row.id } }"
            >Edit</router-link
          >
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { Role } from '../types';
import { QTableProps } from 'quasar';

const RoleTableProps = defineProps<{
  title?: string;
  roles: Role[];
}>();

const columns: QTableProps['columns'] = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'guild',
    required: true,
    label: 'Guild',
    align: 'left',
    field: 'guild_id',
    sortable: true,
  },
  {
    name: 'permissions',
    required: true,
    label: 'Permissions',
    align: 'left',
    field: 'permissions',
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
    field: 'id',
    sortable: true,
  },
];
</script>
