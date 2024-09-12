import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GuildsTableComponent from '../../../components/guilds-table.vue';
import { createTestingPinia } from '@pinia/testing';
import { useGuildStore } from '../../../stores/guilds';
import { mockGuild1, mockGuild2, mockGuildMembership, mockQuest, mockMember } from './mocks/StoreMocks';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();

function createWrapper(props = {}) {
  return mount(GuildsTableComponent, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            guild: {
              currentGuild: mockGuild1.id,
              guilds: {1:mockGuild1, 2:mockGuild2}
            },
            quest: {
              currentQuest: mockQuest.id,
              quests: {1: mockQuest}
            },
            member: {
              member: mockMember,
            },
          },
        }),
      ],
      stubs: {
        'guilds-membership-indicator': true,
      },
    },
    props: {
      title: 'Guild Table Test',
      guilds: [mockGuild1, mockGuild2],
      quest: mockQuest,
      showPlayers: true,
      selectable: true,
      extra_columns: [],
      ...props,
    },

  });
}

describe('GuildsTableComponent', () => {
  beforeEach(() => {
    mockGuild1.guild_membership = [mockGuildMembership];
    mockGuild2.guild_membership = [mockGuildMembership]
  });

  it('renders the guilds table with the correct number of guild rows', () => {
    const wrapper = createWrapper();
    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(2); // Two rows rendered for two guilds
  });

  it('renders guild names correctly', () => {
    const wrapper = createWrapper();
    const firstRowName = wrapper.find('tbody tr:first-child td:nth-child(1)');
    expect(firstRowName.text()).toContain('Test Guild 1');
  });

  it('shows the "Admin" link for guilds with admin permissions', () => {
    const wrapper = createWrapper();
    const adminLink = wrapper.find('tbody tr:first-child .admin-link');
    expect(adminLink.exists()).toBe(true); // Admin link should exist for guild with ID 1
  });

  it('does not show the "Admin" link for guilds without admin permissions', () => {
    const wrapper = createWrapper();
    const secondRowAdminLink = wrapper.find('tbody tr:nth-child(2) .admin-link');
    expect(secondRowAdminLink.exists()).toBe(false); // No admin link for guild with ID 2
  });

  it('handles selection change correctly', async () => {
    const wrapper = createWrapper();
    const guildStore = useGuildStore();

    // Mock the store method
    guildStore.setCurrentGuild = vi.fn();

    const firstRow = wrapper.find('tbody tr:first-child');
    await firstRow.trigger('click');
    expect(guildStore.setCurrentGuild).toHaveBeenCalledWith(mockGuild1.id);
  });

  it('displays the correct last move timestamp', () => {
    const wrapper = createWrapper();
    const lastMove = wrapper.find('tbody tr:first-child td:last-child span');
    // Assuming your mock data reflects '8 months ago'
    expect(lastMove.text()).toBe('8 months ago');
  });
});
