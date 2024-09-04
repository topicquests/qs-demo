import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import GuildDescriptionComponent from '../../../components/guild-description.vue'; // Replace with your component path
import { createTestingPinia } from '@pinia/testing';
import { useGuildStore } from '../../../stores/guilds';
import { mockGuild, mockGuildMembership, mockMember} from './mocks/StoreMocks';
import {  GuildData, PublicMember } from '../../../types';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { useMemberStore } from 'src/stores/member';

installQuasarPlugin();
describe('GuildDescriptionComponent', () => {
  let guildStore;
  let memberStore;
  it('renders correctly when currentGuild is set', async () => {
    guildStore = useGuildStore()
    guildStore.$patch({
      currentGuild: 1,
      guilds: {1:{
        id: 1,
        name: 'Test Guild',
        description: 'This is a test guild',
      }
    }
    })
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
      initialState: {
        guild: {
          fullFetch: false,
          fullGuilds: {},
          guilds: {1: mockGuild} ,
        },
        member: {
          member: mockMember,
        },
      },
    });
    await wrapper.vm.$nextTick();
    console.log(wrapper.html())
    expect(wrapper.find('h1').text()).toContain('Test Guild');
    expect(wrapper.find('.content').html()).toContain('This is a test guild');
  });
  it('renders join to guild button', async () => {
    guildStore = useGuildStore();
    memberStore = useMemberStore();
    const updatedMembership = [{ ...mockGuildMembership, guild_id: 1 }];
    memberStore.$patch({
      member: {
        id: 1,
        handle: 'TestUser',
      }
    })
    guildStore.$patch({
      currentGuild: 1,
      guilds: {1:
        {
          id: 1,
          name: 'Test Guild',
          description: 'This is a test guild',
          open_for_applications: true,
          guild_membership: updatedMembership,
        }
      }
    });
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({}),
        ],
      },
      initialState: {
        guild: {
          fullFetch: false,
          fullGuilds: {},
          guilds: {1: mockGuild} ,
        },
        member: {
          member: mockMember,
        },
      },
    });
    await wrapper.vm.$nextTick();
    console.log(wrapper.html());
    const joinBtn = wrapper.findComponent({ name: 'QBtn' });
    expect(joinBtn.exists()).toBe(true);
    expect(joinBtn.text()).toBe('Join Guild');
  });

  it('does not render join button when not open for applications', async () => {
    guildStore = useGuildStore();
    guildStore.$patch({
      currentGuild: 1,
      guilds: {1:
        {
          id: 1,
          name: 'Test Guild',
          description: 'This is a test guild',
          open_for_applications: false,
        }
      }
    });
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({}),
        ],
      },
      initialState: {
        guild: {
          fullFetch: false,
          fullGuilds: {},
          guilds: {1: mockGuild} ,
        },
        member: {
          member: mockMember,
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('guild closed');
  });

  it('renders login/register message when no member and open for applications', async () => {
    guildStore = useGuildStore();
    guildStore.$patch({
      currentGuild: 1,
      guilds: {1:
        {
          id: 1,
          name: 'Test Guild',
          description: 'This is a test guild',
          open_for_applications: true,
        }
      }
    });
    const wrapper = mount(GuildDescriptionComponent, {
      global: {
        plugins: [
          createTestingPinia({}),
        ],
      },
      initialState: {
        guild: {
          fullFetch: false,
          fullGuilds: {},
          guilds: {1: mockGuild} ,
        },
        member: {
          member: undefined,
        },
      },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('span').text()).toBe('login or register to join');
  });
});
