import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import RightDrawer from '../../../components/right-drawer.vue'; // Adjust the import path as needed
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { GuildData, QuestData } from '../../../types'; // Adjust the import path as needed

installQuasarPlugin();

describe('RightDrawer', () => {
  it('renders Guild Channels with partial props', () => {
    const guildData: Partial<GuildData> = {
      id: 123,
      member_count: 10,
    };

    const questData: Partial<QuestData> = {
      id: 45,
    };

    const wrapper = mount(RightDrawer, {
      props: {
        currentGuild: guildData as GuildData,
        currentQuest: questData as QuestData,
      },
    });
    console.log(wrapper.html());
    // Assertions
    expect(wrapper.findComponent({ name: 'channel-list' }).exists()).toBe(true);
  });
});
