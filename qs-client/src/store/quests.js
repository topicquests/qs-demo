import MyVapi from "./base"

const quests = new MyVapi({
  state: {
    currentQuest: null,
    quests: []
  },
})
  // Step 3
  .get({
    action: "getQuestById",
    queryParams: true,
    path: (id) => `/quests?id=eq.${id}`,
  })
  .get({
    action: "findQuests",
    property: "quests",
    path: '/quests',
    queryParams: true,
    beforeRequest: (state, actionParams) => {
      const userId = MyVapi.store.getters["member/getUserId"]
      if (userId) {
        actionParams.params = {
          select: '*,quest_membership(*),casting(*),game_play(*)',
          'guild_membership.member_id': `eq.${userId}`,
          'casting.member_id': `eq.${userId}`
        }
      } else {
        actionParams.params = {
          select: '*,game_play(*)',
        }
      }
    },
  })
  .call({
    action: 'registerAllMembers',
    path: 'register_all_members',
    queryParams: true,
    // TODO: modify castings appropriately. May need an appropriate mutation.
  })
  // Step 4
  .getStore({
    getters: {
      getQuestByStatus: (state) => (status) =>
        state.quests.filter(quest => quest.status == status),
      getQuests: (state) =>
        state.quests,
      getQuestById: (state) => (id) =>
        state.quests.find(quest => quest.id == id),
      getCurrentQuest: (state) =>
        state.quests.find(quest => quest.id == state.currentQuest),
      getMyQuests: (state) =>
        state.quests.filter(quest => quest.quest_membership && quest.quest_membership.length),
      getPlayingQuests: (state) =>
        state.quests.filter(quest => quest.casting && quest.casting.length),
      isQuestMember: (state) => (guild_id) =>
        state.quests.find(quest => quest.id == id)?.quest_membership.find(m => m.member_id == MyVapi.store.getters["member/getUserId"]),
    },
    actions: {
      setCurrentQuest: (context, quest_id) => {
        context.commit('SET_CURRENT_QUEST', quest_id);
      }
    },
    mutations: {
      SET_CURRENT_QUEST: (state, quest_id) => {
        state.currentQuest = quest_id;
      }
    },
  })

export default quests;
