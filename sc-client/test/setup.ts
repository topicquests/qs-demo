import { beforeAll, vi } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { Quasar } from 'quasar';
import { config } from '@vue/test-utils';

// Define mock routes
const routes = [
  { path: '/signin', component: { template: '<div>Sign In</div>' } },
  // Add other mock routes as needed
];

// Create the mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// Global setup before tests run
beforeAll(() => {
  global.router = router;
  global.Quasar = Quasar;
  global.$q = {
    dark: {
      isActive: false, // Mock dark mode
    },
  };
});

// Mock Quasar components
vi.mock('quasar', () => ({
  Quasar: {
    use: vi.fn(),
  },
  QInput: {
    name: 'QInput',
    template: '<input />', // Simplified mock
  },
  QIcon: {
    name: 'QIcon',
    template: '<i />', // Simplified mock
  },
  QCardSection: {
    name: 'QCardSection',
    template: '<div><slot /> </div>', // Simplified mock
  },
  QForm: {
    name: 'QForm',
    template: '<form><slot /></form>', // Simplified mock
  },
  QBtn: {
    name: 'QBtn',
    template: '<button />', // Simplified mock
  },
  QCardActions: {
    name: 'QCardActions',
    template: '<div><slot /> </div>', // Simplified mock
  },
  QCard: {
    name: 'QCardActions',
    template: '<div />', // Simplified mock
  },
}));

config.global.plugins = [Quasar];
config.global.mocks = {
  $q: global.$q,
};
