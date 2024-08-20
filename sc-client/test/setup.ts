import { beforeAll } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Quasar, QuasarPluginOptions } from 'quasar'; // Import types if needed
import { config } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

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
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const pinia = createPinia();
setActivePinia(pinia);


const app = createApp({});

app.use(Quasar, {} as QuasarPluginOptions);
app.use(router);

beforeAll(() => {
  config.global.plugins = [router, pinia];
  global.server_url = process.env.SERVER_URL || 'http://localhost:3000';
  global.router = router;
})
