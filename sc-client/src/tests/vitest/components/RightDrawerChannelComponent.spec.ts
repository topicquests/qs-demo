import { mount } from '@vue/test-utils';
import RightDrawer from '../../../components/right-drawer.vue'; // Adjust the path to your component
import ChannelList from '../../../components/ChannelListComponent.vue'; // Import the actual ChannelList component
import { describe, it, expect } from 'vitest';
import { GuildData } from '../../../types';
import { Quasar } from 'quasar';

describe('RightDrawer', () => {
  it('passes props to ChannelList correctly', () => {
    const currentGuild: Partial<GuildData> = {
      id: 123,
    }

    const wrapper = mount(RightDrawer, {
      props: {
        currentGuild: currentGuild as GuildData,
      },
      global: {
        plugins: [Quasar],
        components: {
          'channel-list': ChannelList, // Use the actual ChannelList component
        },
      },
      $q: {
        dark: { isActive: false },
      },
    });

    // Find the ChannelList component instance
    const channelList = wrapper.findComponent(ChannelList);

    // Assert that the props are passed correctly
    expect(channelList.props().guild_id).toBe(123);
    expect(channelList.props().inPage).toBe(false);
    expect(channelList.props().title).toBe('Guild Channels');
  });
});
