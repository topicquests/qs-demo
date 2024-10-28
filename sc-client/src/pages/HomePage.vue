<template>
  <div>
    <q-page>
      <div class="container q-pa-md">
        <div class="row justify-center text-center">
          <h1 class="text-h1 q-pt-lg q-pr-sm q-pl-sm">SenseCraft</h1>
          <h3 class="text-h3 q-pt-lg q-pb-lg">
            Where teams co-construct structured conversation
          </h3>
        </div>
        <q-card class="justify-center" style="width: 100%">
          <img
            src="../statics/earthrise2.png"
            style="width: 100%; height: auto"
          />
        </q-card>
        <div class="row gradient justify-center" style="width: 100%">
          <q-card class="q-mt-lg q-mb-xl" style="width: 100%">
            <div class="row q-gutter-md no-wrap" style="align-items: flex-start;">
              <!-- Column 1: Description Text -->
              <div class="col-12 col-md-4">
                <div class="description-text q-pt-md q-pb-md">
                  SenseCraft is an RPG where teams co-create structured dialogues. Quest creators ask deep questions through quests, and guild members take on roles to build a shared conversation tree. In SenseCraft, players collaborate to shape meaningful conversations. Quests enable high-level inquiries, while guild members assume roles to enrich the shared dialogue tree. Experience SenseCraft, an RPG fostering collaborative discussions. Compete against other guilds in related quests. Quests prompt profound questions, with guild members playing specific roles in shaping the conversation tree. Join SenseCraft for role-playing and structured conversations.
                </div>
              </div>

              <!-- Column 2: Video -->
              <div class="col-12 col-md-4">
                <div
                  id="Container"
                  style="
                    padding-bottom: 56.25%;
                    position: relative;
                    display: block;
                    width: 100%;
                  "
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/WPF64UXFER0"
                    frameborder="0"
                    allowfullscreen
                    style="position: absolute; top: 0; left: 0"
                  ></iframe>
                </div>
              </div>

              <!-- Column 3: Quest List -->
              <div class="col-12 col-md-3">
                <div class="q-pa-md">
                  <h4 class="text-h5 text-center">Available Quests</h4>
                  <ul>
                    <li
                      v-for="quest in getFilteredQuests"
                      :key="quest.id"
                      class="q-mt-md q-pb-xs"
                    >
                      <q-card class=" quest-card q-pa-md">
                        <div class="quest-description">{{ quest.name }}</div>
                      </q-card>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </q-page>
  </div>
</template>



<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useQuestStore } from 'src/stores/quests';
import { QuestData } from 'src/types';
import { quest_status_type } from 'src/enums';

const questStore = useQuestStore();

const questStatus = ref<quest_status_type | string>('ongoing');

const getFilteredQuests = computed((): QuestData[] => { 
    return questStore.getQuestsByStatus(questStatus.value);
});

onBeforeMount(async () => {
  questStore.ensureAllQuests();
});
</script>

<style lang="scss" scoped>
.quest-card {
  max-height: 200px; /* Adjust based on desired max height */
  overflow: hidden;  /* Hide overflow if content is too long */
}

.quest-description {
  overflow: hidden;      /* Prevents overflow */
  text-overflow: ellipsis; /* Adds "..." if text is too long */
  white-space: normal;   /* Ensures text wraps to the next line */
  word-break: break-word; /* Breaks long words if needed */
  max-height: 150px;     /* Adjust max height if needed */
  line-height: 1.4;      /* Adjust line height for readability */
}
.description-text {
  font-size: 1.1rem; /* Adjust the size as needed */
  font-weight: 400;  /* Normal weight, you can adjust */
  color: #333;       /* Dark color for readability */
  line-height: 1.6;  /* Spacing for better readability */
}
.h1 {
  font:
    italic 20px Arial,
    sans-serif;
}
.wrapper {
  display: flex;
}
.signin-card {
  align-items: flex-end;
  padding-left: 2em;
  padding-top: 2em;
}
.earth-image {
  align-items: center;
}
.youtube {
  justify-content: center;
  width: 50%;
  height: 50%;
}
.gradient {
  background: rgb(2, 0, 36);
  background: linear-gradient(
    90deg,
    rgba(0, 212, 255, 1) 35%,

    rgba(9, 9, 121, 1) 100%
  );
  height: 100%;
}

video.youtube {
  width: 90%;
  height: auto;
}
#scoreboard {
  width: 900px;
  border: 1px solid blue;
}
@media only screen and (max-width: 600px) {
  h1 {
    font:
      italic 46px Arial,
      sans-serif;
  }
}
</style>
