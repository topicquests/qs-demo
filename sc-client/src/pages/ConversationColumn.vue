<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center">
      <q-card class="node-card q-mt-md q-pa-md">
        <q-card class="q-mt-md q-pa-md">
          <div class="row justify-end" style="width: 92%">
            <member-handle></member-handle>
          </div>
          <div class="row justify-center" style="width: 100%">
            <div class="col-10 justify-center">
              <scoreboard></scoreboard>
            </div>
          </div>
          <div class="row justify-center q-mt-lg">
            <router-link
              v-if="questId"
              :to="{
                name: 'quest_page',
                params: { quest_id: questId },
              }"
            >
              Quest Play Page
            </router-link>
          </div>
          <q-card>
            <div class="row justify-left q-mb-sm">
              <div>
                <h5>
                  <q-icon :name="getIcon(node!.id)" class="q-mr-sm" />
                  {{ node?.title }}
                </h5>
              </div>
            </div>
            <div class="row justify-center">
              <div class="column; quest-description-col">
                <q-card class="q-mb-md">
                  <div class="content-container">
                    <div class="content" v-html="node!.description"></div>
                    <section v-if="node!.url || node!.node_type == 'reference'">
                      <div class="row q-ml-md">
                        <a v-bind:href="node!.url" target="_blank">
                          <span> url: </span> {{ node!.url }}
                        </a>
                      </div>
                    </section>
                  </div>
                </q-card>
              </div>
            </div>
            <div class="row justify-center items-center">
              <div class="col-4 q-pa-sm" style="width: 100%">
                <q-card class="q-ma-md">
                  <div
                    class="row justify-center items-center q-pb-lg q-pt-lg"
                    style="flex-wrap: wrap"
                  >
                    <q-card
                      v-if="parent"
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        min-width: 200px;
                        height: 100px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                      "
                    >
                      <span>Parent Node</span>
                      <div>
                        <q-icon
                          :name="getIcon(parent!.id)"
                          style="width: 30px; height: 30px"
                          class="q-mb-md"
                        />
                      </div>
                      <div>
                        <a
                          class="q-ml-md q-mr-md"
                          href="#"
                          @click.prevent="updateNodeId(parent.id)"
                        >
                          {{ parent!.title }}
                        </a>
                      </div>
                    </q-card>
                  </div>
                </q-card>
              </div>
            </div>
            <div class="row justify-center items-center">
              <div class="col-4 q-pa-sm" style="width: 100%">
                <q-card class="q-ma-md">
                  <div
                    class="row justify-center items-center q-pb-lg q-pt-lg"
                    style="flex-wrap: wrap"
                  >
                    <!-- First Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes with rounded corners and title in the same row -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="issueIcon"
                          alt="Issue Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Question</span>
                      </div>
                      <!-- Question Data -->
                      <div
                        v-if="filteredQuestions.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="question in filteredQuestions"
                          :key="question!.id"
                          style="margin: 0"
                        >
                          <a
                            href="#"
                            @click.prevent="updateNodeId(question!.id)"
                          >
                            <div>{{ question?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(question.guild_id)
                                  ?.name || 'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Second Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes with rounded corners and title in the same row -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="positionIcon"
                          alt="Position Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Answer</span>
                      </div>
                      <!-- Answer Data -->
                      <div
                        v-if="filteredAnswers.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="answer in filteredAnswers"
                          :key="answer!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(answer!.id)">
                            <div>{{ answer?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(answer.guild_id)
                                  ?.name || 'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Third Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="proIcon"
                          alt="Pro Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Pro</span>
                      </div>
                      <!-- Pro Data -->
                      <div
                        v-if="filteredPro.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="pro in filteredPro"
                          :key="pro!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(pro!.id)">
                            <div>{{ pro?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(pro.guild_id)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Fourth Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="
                        width: 17%;
                        min-width: 200px;
                        height: 200px;
                        margin-right: 16px;
                      "
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="conIcon"
                          alt="Con Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Con</span>
                      </div>
                      <!-- Con Data -->
                      <div
                        v-if="filteredCon.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="con in filteredCon"
                          :key="con!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(con!.id)">
                            <div>{{ con?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(con.guild_id)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                    <!-- Fifth Card -->
                    <q-card
                      class="q-pl-sm q-ml-md q-mb-md"
                      style="width: 17%; min-width: 200px; height: 200px"
                    >
                      <!-- Header Nodes -->
                      <div
                        class="row q-pa-md q-pt-md q-pb-sm items-center"
                        style="
                          border-top-left-radius: 8px;
                          border-top-right-radius: 8px;
                          background-color: #f5f5f5;
                        "
                      >
                        <q-img
                          :src="refIcon"
                          alt="Ref Icon"
                          class="icon"
                          style="margin-right: 8px"
                        />
                        <span>Ref</span>
                      </div>
                      <!-- Ref Data -->
                      <div
                        v-if="filteredRef.length"
                        style="height: calc(100% - 56px); overflow-y: auto"
                      >
                        <div
                          v-for="ref in filteredRef"
                          :key="ref!.id"
                          style="margin: 0"
                        >
                          <a href="#" @click.prevent="updateNodeId(ref!.id)">
                            <div>{{ ref?.title }}</div>
                            <div style="font-size: 0.875rem; color: #666">
                              {{
                                guildStore.getGuildById(ref.guild_id)?.name ||
                                'Unknown Guild'
                              }}
                            </div>
                          </a>
                        </div>
                      </div>
                    </q-card>
                  </div>
                </q-card>
              </div>
            </div>
          </q-card>
        </q-card>
      </q-card>
    </div>
  </q-page>
</template>
<script setup lang="ts">
// Imports
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { waitUserLoaded } from '../app-access';
import { useConversationStore } from '../stores/conversation';
import { QTreeNode } from '../types';
import { ibis_node_type_enum } from '../enums';
import issueIcon from '../statics/images/ibis/issue_sm.png';
import positionIcon from '../statics/images/ibis/position_sm.png';
import proIcon from '../statics/images/ibis/plus_sm.png';
import conIcon from '../statics/images/ibis/minus_sm.png';
import refIcon from '../statics/images/ibis/reference_sm.png';
import scoreboard from '../components/score-board.vue';
import memberHandle from '../components/member-handle.vue';
import { useGuildStore } from '../stores/guilds';

// Stores
const conversationStore = useConversationStore();
const guildStore = useGuildStore();

// Route
const route = useRoute();

// Reactive Variables
const q = ref<Partial<QTreeNode[]> | undefined>(undefined);
const tree = ref<Partial<QTreeNode[]> | undefined>(undefined);
const nodeId = ref();
const questId = ref<number | undefined>();
const ready = ref(false);

// Computed Properties
const node = computed(() =>
  conversationStore.getConversationNodeById(nodeId.value),
);
const parent = computed((): QTreeNode => {
  if (node.value.parent_id && node.value.parent_id) {
    return conversationStore.getConversationNodeById(node.value.parent_id);
  }
  return null;
});
const filteredQuestions = computed(
  () =>
    q.value?.filter(
      (item) => item!.node_type === ibis_node_type_enum.question,
    ) || [],
);
const filteredAnswers = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.answer),
);
const filteredPro = computed(
  () =>
    q.value?.filter((item) => item!.node_type === ibis_node_type_enum.pro) ||
    [],
);
const filteredCon = computed(() =>
  filterNodesByType(q.value, ibis_node_type_enum.con),
);
const filteredRef = computed(
  () =>
    q.value?.filter(
      (item) => item!.node_type === ibis_node_type_enum.reference,
    ) || [],
);
function getIcon(id: number) {
  const treeIcon = findNodeById(tree.value, id);
  return treeIcon?.icon;
}

// Watches
watch(nodeId, () => {
  if (nodeId.value) getIcon(nodeId.value);
});

// Functions
function updateNodeId(id: number) {
  nodeId.value = id;
  initialize();
}
function filterNodesByType(
  nodes: Partial<QTreeNode[]> | undefined,
  type: ibis_node_type_enum,
): QTreeNode[] {
  const result: QTreeNode[] = [];
  if (!nodes) return result;
  for (const node of nodes) {
    if (node!.node_type === type) {
      result.push(node!);
    }
    if (node!.children && node!.children.length > 0) {
      result.push(...filterNodesByType(node!.children, type));
    }
  }
  return result;
}
function findNodeById(
  nodes: Partial<QTreeNode[]> | undefined,
  id: number,
): QTreeNode | null {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node!.id === id) {
      return node as QTreeNode;
    }
    if (node!.children && node!.children.length > 0) {
      const found = findNodeById(node!.children, id);
      if (found) return found;
    }
  }
  return null;
}
async function initialize() {
  tree.value = conversationStore.getConversationTree;
  q.value = await conversationStore.getChildrenOf(nodeId.value);
}

// Lifecycle Hooks
onBeforeMount(async () => {
  if (typeof route.params.quest_id === 'string')
    questId.value = Number(route.params.quest_id);
  await waitUserLoaded();
  await conversationStore.ensureConversation(questId.value!);
  const rootNode = await conversationStore.getRootNode;
  nodeId.value = rootNode?.id;
  initialize();
  ready.value = true;
});
</script>

<style>
.q-item-image {
  min-width: 10px;
  max-width: 10px;
}

.scroll.relative-position.overflow-hidden.fit.q-touch {
  user-select: auto !important;
}
.node-card {
  width: 70%;
}
@media only screen and (max-width: 1300px) {
  .node-card {
    width: 70%;
  }
}
@media only screen and (max-width: 800px) {
  .node-card {
    width: 98%;
  }
}
.description {
  max-height: 50px;
  background-color: gray;
}
.node:hover {
  background-color: rgba(255, 255, 0, 0.801);
}
.content {
  background-color: lightgrey;
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10pt;
  width: 100%;
}
#node-description {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
}

.content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14pt;
  width: 100%;
}
.quest-description-col {
  width: 100%;
}
@media only screen and (max-width: 800px) {
  quest-description-col {
    width: 98%;
  }
}

/** from view.hbs */
/**
* Enable columns to scroll right and left

.columnscroller {
  border: 1px solid black;
  width: 100%;
  white-space: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  margin: 5px;
  border-radius: 3px;
}
*/

/**
* width is set to accomodate lots of columns.
* If they wrap when adding more columns, then
* width must increase.
* The formula seems to be column width * num colums + 100px 2500
*/

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  height: 80px; /* Fixed height for icon containers */
  width: 80px;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
