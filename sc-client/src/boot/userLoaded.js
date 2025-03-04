import { boot } from 'quasar/wrappers';
import { useMemberStore } from '../stores/member';
import { useConversationStore } from '../stores/conversation';
import { useQuestStore } from '../stores/quests';
import { useGuildStore } from '../stores/guilds';
import { useChannelStore } from '../stores/channel';
import { trackStores } from '../stores/baseStore';
// import { useRouter } from 'vue-router';

export default boot(async ({ app }) => {
  var userLoadedResolve = null;
  app.config.globalProperties.$userLoaded = new Promise((resolve) => {
    userLoadedResolve = resolve;
  });
  // Uncomment for a lot of store debugging info
  // trackStores();
  const memberStore = useMemberStore();
  const member = await memberStore.ensureLoginUser();
  userLoadedResolve(member);
  if (member) {
    const prevTokenExpiry = Number.parseInt(
      window.localStorage.getItem('tokenExpiry'),
    );
    const prevToken = window.localStorage.getItem('token');
    const interval = Math.max(0, prevTokenExpiry - Date.now() - 10000);
    window.setTimeout(function () {
      memberStore.renewToken(prevToken);
    }, interval);
  }

  memberStore.$subscribe((mutation, state) => {
    const member_id = state.member?.id;
    resetIfMemberChanged(member_id);
    const router = app.config.globalProperties.$router;
    if (!member_id && router.currentRoute.value.path === '/login') {
      router.push('/account');
    }
  });
});

var lastUserId = undefined;

export function resetIfMemberChanged(member_id) {
  // reload quests an guilds
  if (member_id !== lastUserId) {
    const questsStore = useQuestStore();
    const guildsStore = useGuildStore();
    const conversationStore = useConversationStore();
    const channelStore = useChannelStore();
    questsStore.resetQuests();
    guildsStore.resetGuilds();
    conversationStore.resetConversation();
    channelStore.resetChannel();
    lastUserId = member_id;
  }
}
