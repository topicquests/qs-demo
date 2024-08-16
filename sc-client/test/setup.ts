import { beforeAll, vi } from 'vitest';
import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Quasar, QuasarPluginOptions } from 'quasar'; // Import types if needed
import { config } from '@vue/test-utils';

const routes = [
  {
    path: '/signin',
    name: 'signin',
    component: () => import('../src/pages/SignInPage.vue'),
  }
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

const app = createApp({});

app.use(Quasar, {} as QuasarPluginOptions);
app.use(router);

beforeAll(() => {
  config.global.plugins = [router];
  config.global.mocks = {
    $q: {
      dark: {
        isActive: false,
      },
    },
  };

  global.router = router;
  global.Quasar = Quasar;
});

// Mock Quasar components
vi.mock('quasar', () => ({
  Quasar: {
    use: vi.fn(),
  },
  QInput: {
    name: 'QInput',
    template: '<input />',
  },
  QIcon: {
    name: 'QIcon',
    template: '<i />',
  },
  QCardSection: {
    name: 'QCardSection',
    template: '<div><slot /> </div>',
  },
  QForm: {
    name: 'QForm',
    template: '<form><slot /></form>',
  },
  QBtn: {
    name: 'QBtn',
    template: '<button />',
  },
  QCardActions: {
    name: 'QCardActions',
    template: '<div><slot /> </div>',
  },
  QCard: {
    name: 'QCard',
    template: '<div />',
  },
}));
