import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import RightDrawer from '../../../components/right-drawer.vue'; // Adjust the path to your component
import ChannelList from '../../../components/ChannelListComponent.vue'; // Import the actual ChannelList component
import { describe, it, expect, vi } from 'vitest';
import { GuildData } from '../../../types';
import { Quasar } from 'quasar';
import {
  mockChannelsReadStatus,
  mockChannelStatusMap,
  mockChannel,
} from './mocks/StoreMocks';

// Mock getWSClient to return a mocked object with setDefaultGuild
vi.mock('src/wsclient', () => ({
  getWSClient: vi.fn(() => ({
    setDefaultGuild: vi.fn(),
  })),
}));

describe('RightDrawer', () => {
  it('passes props to ChannelList correctly', () => {
    const currentGuild: Partial<GuildData> = {
      id: 123,
    };

    const wrapper = mount(RightDrawer, {
      props: {
        currentGuild: currentGuild as GuildData,
      },
      global: {
        plugins: [
          Quasar,
          createTestingPinia({
            initialState: {
              readStatus: {
                fullFetch: true,
                readStatus: mockChannelStatusMap,
                channelsReadStatus: mockChannelsReadStatus,
              },
              guild: {
                currentGuild: 1,
              },
              channels: {
                channels: {
                  2: mockChannel,
                },
                channelData: {
                  2: {
                    2: mockChannel,
                  },
                },
                currentGuild: 1,
                currentChannel: 2,
              },
            },
          }),
        ],
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
