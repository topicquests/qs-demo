<template>
  <q-page class="bg-secondary" v-if="ready">
    <div class="row justify-center items-center">
        <div class="q-pb-lg text-center">
          <h4>
            {{ currentQuest?.name }}
          </h4>
        </div>
    </div>    
    <div class="row justify-center items-center">  
          <q-card class="" style="max-width: 60%;">
            <div class="content-container">
              <div
                class="content"
                v-html="currentQuest?.description"
              ></div>
            </div>
          </q-card>
    </div> 
    <div class="row justify-center items-center">   
        <div class="col-4 q-pa-sm" style="width: 1000px">
          <q-card class="q-ma-md">
    <div class="columnscroller">
      <div class="columncontainer q-ma-md">
        <!-- Header Nodes -->
        <div class="column headerNode">
          <div class="icon-container">
            <q-img :src="issueIcon" alt="Issue Icon" class="icon" />
            <span>Question</span>
          </div>
          <a v-if="isAuthenticated" title="Respond" :href="'/conversation/newquestion/' + currentQuest?.id" class="respond-link">
            <q-img :src="respondIcon" alt="Respond" class="icon" />
          </a>
        </div>
        <div class="column headerNode">
          <div class="icon-container">
            <q-img :src="positionIcon" alt="Position Icon" class="icon" />
            <span>Answer</span>
          </div>
          <a v-if="isAuthenticated" :href="'/conversation/newanswer/' + currentQuest?.id" class="respond-link">
            <q-img :src="respondIcon" alt="Respond" class="icon" />
          </a>
        </div>
        <div class="column headerNode">
          <div class="icon-container">
            <q-img :src="proIcon" alt="Pro Icon" class="icon" />
            <span>Pro</span>
          </div>
          <a v-if="isAuthenticated" :href="'/conversation/newpro/' + currentQuest?.id" class="respond-link">
            <q-img :src="respondIcon" alt="Respond" class="icon" />
          </a>
        </div>
        <div class="column headerNode">
          <div class="icon-container">
            <q-img :src="conIcon" alt="Con Icon" class="icon" />
            <span>Con</span>
          </div>
          <a v-if="isAuthenticated" :href="'/conversation/newcon/' + currentQuest?.id" class="respond-link">
            <q-img :src="respondIcon" alt="Respond" class="icon" />
          </a>
        </div>
        <div class="column headerNode">
          <div class="icon-container">
            <q-img :src="refIcon" alt="Ref Icon" class="icon" />
            <span>Refs</span>
          </div>
          <a v-if="isAuthenticated" :href="'/conversation/newref/' + currentQuest?.id" class="respond-link">
            <q-img :src="respondIcon" alt="Respond" class="icon" />
          </a>
        </div>
        <!-- End Header Nodes -->

        <!-- Data Columns -->
        <div class="datacontainer">
          <!-- Question Data -->
          <div v-if="filteredQuestions.length">
            <div class="datacolumn node" v-for="question in filteredQuestions" :key="question.id">
              <router-link :to="{ name: 'node', params: { id: question.id, context: '' } }">{{ question.label }}</router-link>
            </div>
          </div>
          <!-- Answer Data -->
          <div v-if="filteredAnswers.length">
            <div class="datacolumn node" v-for="answer in filteredAnswers" :key="answer.id">
              <router-link :to="{ name: 'node', params: { id: answer.id, context: '' } }">{{ answer.label }}</router-link>
            </div>
          </div>
          <!-- Pro Data -->
          <div v-if="filteredPro.length">
            <div class="datacolumn node" v-for="pro in filteredPro" :key="pro.id">
              <router-link :to="{ name: 'node', params: { id: pro.id, context: '' } }">{{ pro.label }}</router-link>
            </div>
          </div>
          <!-- Con Data -->
          <div v-if="filteredCon.length">
            <div class="datacolumn node" v-for="con in filteredCon" :key="con.id">
              <router-link :to="{ name: 'node', params: { id: con.id, context: '' } }">{{ con.label }}</router-link>
            </div>
          </div>
          <!-- Ref Data -->
          <div v-if="filteredRef.length">
            <div class="datacolumn node" v-for="ref in filteredRef" :key="ref.id">
              <router-link :to="{ name: 'node', params: { id: ref.id, context: '' } }">{{ ref.label }}</router-link>
            </div>
          </div>
        </div>
        <!-- End Data Columns -->
      </div>
    </div>
  </q-card>
        </div>
      
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, toValue } from "vue";
import { useRoute } from "vue-router";
import { waitUserLoaded } from '../app-access';
import { useMemberStore } from "src/stores/member";
import { useQuestStore } from "src/stores/quests";
import { useGuildStore } from 'src/stores/guilds';
import { useConversationStore } from "src/stores/conversation";
import { QTreeNode } from 'src/types';
import { ibis_node_type_enum } from 'src/enums';
import issueIcon from 'src/statics/images/ibis/issue_sm.png';
import positionIcon from 'src/statics/images/ibis/position_sm.png'
import proIcon from 'src/statics/images/ibis/plus_sm.png';
import conIcon from 'src/statics/images/ibis/minus_sm.png';
import refIcon from 'src/statics/images/ibis/reference_sm.png';
import respondIcon from 'src/statics/images/respond_sm.png';

// Stores
const memberStore = useMemberStore();
const questStore = useQuestStore();
const guildStore = useGuildStore();
const conversationStore = useConversationStore();

// Route
const route = useRoute();

// Reactive Variables
const q = ref<QTreeNode[] | undefined>(undefined);
const ready = ref(false);

// Computed Properties
const currentQuest = computed(() => questStore.getCurrentQuest ?? null);
const isAuthenticated = computed(() => memberStore.member !== null);
const currentNode = computed(() => conversationStore.getConversationTree)
const filteredQuestions = computed(() => q.value?.filter(item => item.node_type === ibis_node_type_enum.question) || []);
const filteredAnswers = computed(() => q.value?.filter(item => item.node_type === ibis_node_type_enum.answer) || []);
const filteredPro = computed(() => q.value?.filter(item => item.node_type === ibis_node_type_enum.pro) || []);
const filteredCon = computed(() => q.value?.filter(item => item.node_type === ibis_node_type_enum.con) || []);
const filteredRef = computed(() => q.value?.filter(item => item.node_type === ibis_node_type_enum.reference) || []); 
// Functions
async function initialize(id: number | null = null) {
  const nodeId = id || Number(route.params.id);
  if (typeof nodeId === 'number') {
    console.info("Initialize", "ensuring data for", nodeId);
    // Assuming fetch or store method to get the data
    if (q.value) {
      getImage();
    } else {
      console.error("Failed to load data for node", nodeId);
    }
  }
}
function getImage() {
  if (q.value && q.value[0]) {
    const type = q.value[0].node_type;
    const result = "icons/ibis/issue.png";
    console.log("ICON", type, result);
    // Handle the image logic based on type
  }
}

// Lifecycle Hooks
onMounted(() => {
  initialize(null);
});

onBeforeMount(async () => {
  if (typeof route.params.quest_id === 'string') {
    const questId = Number(route.params.quest_id);

    await waitUserLoaded();
    await Promise.all([
      questStore.setCurrentQuest(questId),
      questStore.ensureQuest({ quest_id: questId }),
      guildStore.ensureAllGuilds(),
      conversationStore.ensureConversation(questId)
    ]);
    ready.value = true;
  }
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

.headerimage {
  float: left;
  vertical-align: middle;
  margin-right: 4px;
}

.node {
  margin-top: 4px;
  float: top;
  border: 1px solid black;
  border-radius: 3px;
  min-height: 40px;
  overflow-wrap: inherit;
  font-family: pragmatica-web, sans-serif;
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: pre-wrap; /* css-3 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  white-space: -webkit-pre-wrap; /* Newer versions of Chrome/Safari*/
  white-space: normal;
}

.node:hover {
  background-color: rgba(255, 255, 0, 0.801);
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
.headerimage {
  vertical-align: middle;
  margin-right: 4px;
}

.headernode {
  float: top;
  border: 1px solid black;
  border-radius: 3px;
  font-family: pragmatica-web, sans-serif;
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap; /* Opera 4-6 */
  white-space: -o-pre-wrap; /* Opera 7 */
  white-space: pre-wrap; /* css-3 */
  word-wrap: break-word; /* Internet Explorer 5.5+ */
  white-space: normal;
}
.column {
  height: 134px;
  float: left;
  white-space: normal;
  width: 260px;
  border: 0px solid black;
  border-radius: 3px;
  margin-left: 1px;
  margin-right: 1px;
  font-family: pragmatica-web, sans-serif;
}
.content-container {
  padding: 1em;
  margin-bottom: 1em;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12pt;
  width: 100%;
  box-shadow: 0 60px 20px 0 rgb(151, 146, 146);

  border: 50px solid #ccc;
  max-height: 300px; /*
Set the maximum height you desire */
  overflow-y: auto;
}
.columnscroller {
  overflow-x: hidden;
  overflow-y: auto;
  height: 400px; /* Adjust as needed */
}

.columncontainer {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
}

.column {
  margin: 10px;
  flex: 1 1 200px; /* Adjust width as needed */
}

.headerNode {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

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

.datacontainer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.datacolumn {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>