import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import RegistrationFormComponent from '../../../components/registration-form.vue';
import { Quasar } from 'quasar';
import { createRouter, createMemoryHistory } from 'vue-router';

// Create the mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/signin', component: { template: '<div>Sign In</div>' } }],
});

describe('RegistrationFormComponent', () => {
  it('mounts properly', async () => {
    const wrapper = mount(RegistrationFormComponent, {
      global: {
        plugins: [Quasar, router],
      },
    });

    expect(wrapper.exists()).toBe(true);

    // Log the HTML to inspect the rendered output
    console.log(wrapper.html());
  });

  it('renders nested Quasar components correctly', async () => {
    const wrapper = mount(RegistrationFormComponent, {
      global: {
        plugins: [Quasar, router],
      },
    });

    // Ensure the component is fully rendered
    await wrapper.vm.$nextTick();

    expect(wrapper.find('input[name="email"]').exists()).toBe(true);
    expect(wrapper.find('input[name="name"]').exists()).toBe(true);
    expect(wrapper.find('input[name="handle"]').exists()).toBe(true);
    expect(wrapper.find('input[name="password"]').exists()).toBe(true);
  });
});
