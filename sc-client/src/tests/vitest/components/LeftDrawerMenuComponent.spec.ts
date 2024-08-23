import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import SidebarMenu from '../../../components/drawer_menu.vue'; // Adjust the path as necessary

installQuasarPlugin();
vi.mock('@/path/to/config', () => ({
  ...vi.importActual('@/path/to/config'),
  server_url: 'https://mocked-server-url.com',
}));

describe('SidebarMenu Component', () => {

  it('renders Signin and Registration links when the user is not authenticated', async () => {
    const wrapper = mount(SidebarMenu, {
      global: {
        mocks: {
          checkIfAuthenticated: () => false,
          checkForPermission: () => false,

        },
      },
    });
    expect(await wrapper.find('a[href="/signin"]').exists()).toBe(true);
    const registerItem = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'Registration')
    .at(0);
    expect(registerItem.exists()).toBe(true);
    expect(await wrapper.find('a[href="/lobby"]').exists()).toBe(false);
    expect(await wrapper.find('a[href="/create_quest"]').exists()).toBe(false);
    expect(await wrapper.find('a[href="/create_guild"]').exists()).toBe(false);
    expect(await wrapper.find('a[href="/admin"]').exists()).toBe(false);
    expect(await wrapper.find('a[href="/logoff"]').exists()).toBe(false);
  });

  it('renders Dashboard, Create Quest, Create Guild, Administration links based on permissions when the user is authenticated', () => {
    const wrapper = mount(SidebarMenu, {
      global: {
        mocks: {
          checkIfAuthenticated: () => true,
          checkForPermission: (perm) => {
            return perm !== 'superadmin';
          },
        },
      },
    });
    expect(wrapper.find('a[to="signin"]').exists()).toBe(false);
    expect(wrapper.find('a[to="register"]').exists()).toBe(false);
    const dashboardItem = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'Dashboard')
    .at(0);
    expect(dashboardItem.exists()).toBe(true);
    const createQuest = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'Create Quest')
    .at(0);
    expect(createQuest.exists()).toBe(true);
    const createGuild = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'Create Guild')
    .at(0);
    expect(createGuild.exists()).toBe(true);
    expect(wrapper.find('a[to="admin"]').exists()).toBe(false);
    const logoff = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'logoff')
    .at(0);
    expect(logoff.exists()).toBe(true);
  });

  it('emits onLogout event when Logoff is clicked', async () => {
    const wrapper = mount(SidebarMenu, {
      global: {
        mocks: {
          checkIfAuthenticated: () => true,
        },
      },
    });
    const logoff = wrapper.findAll('.q-item')
    .filter(item => item.find('.q-item__section').text().trim() === 'logoff')
    .at(0);
    await logoff.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('onLogout');
  });
});
