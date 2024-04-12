import { getCurrentInstance } from 'vue';
export function useCurrentApp() {
  return getCurrentInstance()?.appContext.app;
}

export async function waitUserLoaded() {
  return await useCurrentApp()?.config.globalProperties.$userLoaded;
}
