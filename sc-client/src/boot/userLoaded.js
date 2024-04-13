import { boot } from 'quasar/wrappers';
import { useMemberStore } from 'stores/member';
import { useConversationStore } from 'stores/conversation';
import { useQuestStore } from 'stores/quests';
import { useGuildStore } from 'stores/guilds';
import { useChannelStore } from 'stores/channel';
// import { useRouter } from 'vue-router';

export default boot(async ({ app }) => {
  var userLoadedResolve = null;
  app.config.globalProperties.$userLoaded = new Promise((resolve) => {
    userLoadedResolve = resolve;
  });
  const memberStore = useMemberStore();
  const questsStore = useQuestStore();
  const guildsStore = useGuildStore();
  const conversationStore = useConversationStore();
  const channelStore = useChannelStore();
  const member = await memberStore.ensureLoginUser();
  userLoadedResolve(member);
  if (member) {
    const prevTokenExpiry = Number.parseInt(
      window.localStorage.getItem('tokenExpiry'),
    );
    const prevToken = window.localStorage.getItem('token');
    const interval = Math.max(0, prevTokenExpiry - Date.now() - 10000);
    window.setTimeout(function () {
      memberStore.renewToken({ data: { token: prevToken } });
    }, interval);
  }

  var lastUserId = null;

  memberStore.$subscribe((mutation, state) => {
    // reload quests an guilds
    if (state.member?.id !== lastUserId) {
      questsStore.resetQuests();
      guildsStore.resetGuilds();
      conversationStore.resetConversation();
      channelStore.resetChannel();
      lastUserId = state.member?.id;
    }
    const router = app.config.globalProperties.$router;
    if (state.member === null) {
      //router.push("/");
    } else {
      if (router.currentRoute.value.path === '/login') {
        router.push('/account');
      }
    }
  });
});
