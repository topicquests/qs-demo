import { boot } from 'quasar/wrappers';
import { useMemberStore } from 'stores/member';

export default boot(async ({ app }) => {
  var userLoadedResolve = null;
  app.config.globalProperties.$userLoaded = new Promise((resolve) => {
    userLoadedResolve = resolve;
  });
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
      memberStore.renewToken({ data: { token: prevToken } });
    }, interval);
  }
});
