<template>
    <q-page class="bg-secondary" v-if="ready">
      <div class="row justify-center">
        <q-card class="node-card q-mt-md q-pa-md">
          <div class="col-12 justify-center">
            <q-card class="q-mt-md q-pa-md">        
              <div class="row justify-end" style="width: 92%">
                <member-handle></member-handle>
              </div>
            <div class="row justify-center" style="width: 100%">
              <div class="col-10 justify-center">
                <scoreboard></scoreboard>
              </div>
            </div>
            <q-card>
              <div class="row justify-left">
               
                <div v-if="parent">
                  
              
                  <h5>
                    <q-icon :name="getIcon(parent!.id)" class="q-mr-sm" />
                    {{ parent?.title }}
                  </h5>
                </div>
              </div>  
              <div class="row justify-left">                                 
                           
                  <h5>
                    <q-icon :name="getIcon(node!.id)" style="width: 30px; height: 30px"/>           
                    {{node?.title }}
                  </h5>
                </div>
                  
              <div class="row justify-center">
                <div class="column; quest-description-col">
                  <q-card class="q-mb-md">
                    <div class="content-container">
                      <div
                        class="content"
                        v-html="node!.description"
                      ></div>
                    </div>
                  </q-card>
                </div>
              </div> 
              <div class="row justify-center items-center">   
                <div class="col-4 q-pa-sm" style="width: 100%">
                  <q-card class="q-ma-md">
                    <div class="row q-pb-lg q-pt-lg">
                        <q-card class="q-mr-md q-pl-sm q-ml-xl" style="width: 17%"> 
                          <!-- Header Nodes -->
                          <div class="row">                  
                              <q-img :src="issueIcon" alt="Issue Icon" class="icon" />                  
                          </div>
                          <div class="row">
                            <span>Question</span>
                          </div>                
                          <!-- Question Data -->
                          <div v-if="filteredQuestions.length">
                            <div v-for="question in filteredQuestions" :key="question!.id">
                              <span>{{ question!.title }}</span>
                            </div>
                          </div>              
                        </q-card>             
                        <q-card class="q-mr-md q-pl-sm" style="width: 17%"> 
                          <div class="row">      
                            <q-img :src="positionIcon" alt="Position Icon" class="icon" />
                          </div>   
                          <div class="row">
                            <span>Answer</span>
                          </div>
                          <div class="row">
                            <!-- Answer Data -->
                            <div v-if="filteredAnswers.length">
                              <div v-for="answer in filteredAnswers" :key="answer!.id">
                                <a href="#" @click.prevent="updateNodeId(answer!.id)">
                                  {{ answer!.title }}
                                </a>
    
                              </div>
                            </div>
                          </div>  
                        </q-card> 
                        <q-card class="q-mr-md q-pl-sm" style="width: 17%"> 
                          <!-- Header Nodes -->
                          <div class="row">                  
                              <q-img :src="proIcon" alt="Pro Icon" class="icon" />                  
                          </div>
                          <div class="row">
                            <span>Pro</span>
                          </div>                
                          <!-- Pro Data -->
                          <div v-if="filteredPro.length">
                            <div v-for="pro in filteredPro" :key="pro!.id">
                            {{ pro!.title }}
                            </div>
                          </div>            
                        </q-card>
                        <q-card class="q-mr-md q-pl-sm" style="width: 17%"> 
                          <!-- Header Nodes -->
                          <div class="row">                  
                              <q-img :src="conIcon" alt="Pro Icon" class="icon" />                  
                          </div>
                          <div class="row">
                            <span>Con</span>
                          </div>                
                          <!-- Con Data -->
                          <div v-if="filteredCon.length">
                            <div v-for="con in filteredCon" :key="con!.id">
                              <a href="#" @click.prevent="updateNodeId(con!.id)">
                                {{ con!.title }}
                              </a>
                            </div>
                          </div>           
                        </q-card>
                        <q-card class="q-mr-md q-pl-sm" style="width: 20%"> 
                          <!-- Header Nodes -->
                          <div class="row">                  
                              <q-img :src="refIcon" alt="Ref Icon" class="icon" />                  
                          </div>
                          <div class="row">
                            <span>Ref</span>
                          </div>                
                          <!-- Ref Data -->
                          <div v-if="filteredRef.length">
                            <div v-for="ref in filteredRef" :key="ref!.id">
                              {{ ref!.title }}
                            </div>
                          </div>            
                        </q-card>                   
                    </div>
                    </q-card>
                  </div> 
                </div>
              </q-card>
            </q-card> 
          </div>
        </q-card>
      </div>
    </q-page>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, toValue } from "vue";
import { useRoute } from "vue-router";
import { waitUserLoaded } from '../app-access';
import { useMemberStore } from "src/stores/member";
import { useQuestStore } from "src/stores/quests";
import { useConversationStore } from "src/stores/conversation";
import { QTreeNode } from 'src/types';
import { ibis_node_type_enum } from 'src/enums';
import issueIcon from 'src/statics/images/ibis/issue_sm.png';
import positionIcon from 'src/statics/images/ibis/position_sm.png'
import proIcon from 'src/statics/images/ibis/plus_sm.png';
import conIcon from 'src/statics/images/ibis/minus_sm.png';
import refIcon from 'src/statics/images/ibis/reference_sm.png';
import scoreboard from '../components/score-board.vue';
import memberHandle from '../components/member-handle.vue';

// Stores
const memberStore = useMemberStore();
const questStore = useQuestStore();
const conversationStore = useConversationStore();

// Route
const route = useRoute();

// Reactive Variables
const q = ref<Partial<QTreeNode[]> | undefined>(undefined);
const tree = ref<Partial<QTreeNode[]> | undefined>(undefined);
const nodeId = ref();
const questId = ref<number | undefined>();
const ready = ref(false);

// Computed Properties
const currentQuest = computed(() => questStore.getCurrentQuest ?? null);
const node = computed(() => conversationStore.getConversationNodeById(nodeId.value))
const parent = computed(() => 
  conversationStore.getConversationNodeById(node.value!.parent_id!) || null)
const filteredQuestions = computed(() => q.value?.filter(item => item!.node_type === ibis_node_type_enum.question) || []);
const filteredAnswers = computed(() => filterNodesByType(q.value, ibis_node_type_enum.answer));
const filteredPro = computed(() => q.value?.filter(item => item!.node_type === ibis_node_type_enum.pro) || []);
const filteredCon = computed(() => filterNodesByType(q.value, ibis_node_type_enum.con));
const filteredRef = computed(() => q.value?.filter(item => item!.node_type === ibis_node_type_enum.reference) || []); 
const getIcon = computed(() => (id: number) => {
  const treeIcon = findNodeById(tree.value, id)
  return treeIcon?.icon
})
// Functions
function updateNodeId(id:number) {
  nodeId.value = id;
  initialize()
}
function filterNodesByType(nodes: Partial<QTreeNode[]> | undefined, type: ibis_node_type_enum): QTreeNode[] {
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
function findNodeById(nodes: Partial<QTreeNode[]> | undefined, id: number): QTreeNode | null {
  if (!nodes) return null; // Return null if nodes are undefined
  for (const node of nodes) {
    if (node!.id === id) {
      return node as QTreeNode; // Return the node if the ID matches
    }
    if (node!.children && node!.children.length > 0) {
      const found = findNodeById(node!.children, id);
      if (found) return found; // Return the found node from recursion
    }
  }
  return null; // Return null if the node with the ID is not found
}
async function initialize() { 
  tree.value = conversationStore.getConversationTree;
  q.value = await conversationStore.getChildrenOf(nodeId.value)
  console.info("Initialize", "ensuring data for", nodeId);
}

// Lifecycle Hooks
onBeforeMount(async () => {
  if (typeof route.params.quest_id === 'string') 
    questId.value = Number(route.params.quest_id);
  await waitUserLoaded(); 
  await conversationStore.ensureConversation(questId.value!)
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
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
#node-description {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
}
.content {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);
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