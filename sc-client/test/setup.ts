import { beforeAll } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Quasar, QuasarPluginOptions } from 'quasar'; // Import types if needed
import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

// Define routes
const routes = [
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../src/pages/SignInPage.vue'),
  },
  {
    path: '/register',
    component: { template: '<div>Register</div>' },
  },
  {
    path: '/confirmPassword',
    component: { template: '<div>Confirm Password</div>' },
  },
  {
    path: '/guild/:guild_id/channel',
    name: 'guild_channel_list',
    component: () => import('../src/pages/GuildChannelList.vue'),
  },
  {
    path: '/guild/:guild_id/quest/:quest_id/channel',
    name: 'game_channel_list',
    component: () => import('../src/pages/GameChannelList.vue'),
  },
  {
    path: '/guild/:guild_id',
    name: 'guild',
    component: () => import('../src/pages/GuildPage.vue'),
  },
];

// Create router instance
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Create and set Pinia store
const pinia = createPinia();
setActivePinia(pinia);

// Define global environment variables
global.server_url = process.env.SERVER_URL || 'http://localhost:3000';

// Create Vue app instance
const app = createApp({});

// Install Quasar and router
app.use(Quasar, {} as QuasarPluginOptions);
app.use(router);
app.use(pinia);

// Set up global configuration for tests
beforeAll(() => {
  config.global.plugins = [router, pinia];
  global.router = router;

});


