<template>
  <div>
    <q-card id="node-card">
      <section id="node-card-title">
        <h3 class="q-ma-md">
          <IbisButton 
          :node_type="node.node_type">
        </IbisButton>
          {{ node.title }}
        </h3>
      </section>
      <section>
        <div v-if="node.url">
          <a v-bind:href="node.url" target="_blank">
            {{ node.url }}
          </a>
        </div>
        <div>
          <p id="node-card-detail-header">Details<br /></p>
        </div>
        <div v-html="node.description" id="node-card-details"></div>
      </section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import IbisButton from "./ibis-btn.vue";
import { ConversationNode } from "../types";

const NodeCardProps = defineProps<{
    node: ConversationNode;
}>();

function description() {
  return NodeCardProps.node.description || "";
}
</script>
<style>
#node-card {
  text-align: center;
  border: 2px solid black;
  font-size: 1em;
  color: rgb(39, 11, 194);
  background-color: rgb(158, 181, 243);
}
#node-card-details {
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
  text-align: left;
  font-size: 1em;
  padding-top: 3%;
  padding-left: 1%;
  border: 1px solid gray;
}
#node-card-title {
  border: 1px solid gray;
  background-color: lightgray;
  color: rgb(39, 11, 194);
}
#node-card-data {
  text-align: left;
  font-size: 1em;
  background-color: rgb(158, 181, 243);
  color: rgb(39, 11, 194);
}
#node-card-detail-header {
  text-align: center;
  background-color: rgb(158, 181, 243);
  color: black;
  margin-bottom: 0%;
}
</style>
