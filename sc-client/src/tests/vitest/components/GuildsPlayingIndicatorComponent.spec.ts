import { afterEach, describe, it, expect, beforeEach  } from 'vitest'
import GuildsPlayingIndicatorCOmponent from '../../../components/guilds-playing-indicator.vue'
import { mount } from '@vue/test-utils'
import { mockGamePlay, mockGuild1,  mockQuest } from './mocks/StoreMocks'
import { createTestingPinia } from '@pinia/testing'

const initialMockGuild = JSON.parse(JSON.stringify(mockGuild1));
const initialMockQuest = JSON.parse(JSON.stringify(mockQuest));

function createWrapper(props = {} ) {
  return mount(GuildsPlayingIndicatorCOmponent, {
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            guild: {
              currentGuild: mockGuild1.id
            },
            quest: {
              currentQuest: mockQuest.id,
              quests: {1: mockQuest}
            }
          }
        })
      ]
    },
    props: {
      guild: mockGuild1,
      quest: mockQuest,
      playing: false,
      ...props,
    },
  })
}

describe('GuildsPlayingIndicatorCOmponent', () => {
  beforeEach(() => {
    mockGamePlay.game_status='confirmed'
    mockQuest.game_play.push(mockGamePlay)
  })
  afterEach(() => {
    Object.assign(mockGuild1, JSON.parse(JSON.stringify(initialMockGuild)));
    Object.assign(mockQuest, JSON.parse(JSON.stringify(initialMockQuest)));
  })
  it('Show Playing if member of guild is playing quest Test 1', () => {
    mockQuest.game_play.push(mockGamePlay)
    const wrapper = createWrapper({playing: true})
    expect(wrapper.text()).toContain("Playing")
  })
  it('Show Play in Quest if member of guild and not playing Test 2', () => {
    mockGuild1.is_member=true;
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("Play in this Quest")
  })
  it('Show Join this Guild (They are playing) if not member, quest is not playing, guild open for applications and game_status confirmed Test 3a', () => {
    mockGuild1.open_for_applications=true;
    const wrapper = createWrapper({playing: false});
    expect(wrapper.text()).toContain("They are playing")
  })
  it('Show Join this Guild (They may play) if not a member, quest is not playing, guild open for applications and game play status not confirmed 3b', () => {
    mockGuild1.open_for_applications=true;
    mockGamePlay.game_status= "interested"
    mockQuest.game_play.push(mockGamePlay)
    const wrapper = createWrapper({playing: false});
    expect(wrapper.text()).toContain("They may play")
  })
  it('Show Opponent if quest is not playing, guild open for applications and game play status confirmes Test 4', () => {
    mockGamePlay.game_status= "confirmed"
    mockQuest.game_play.push(mockGamePlay)
    const wrapper = createWrapper({playing: false});
    expect(wrapper.text()).toContain("Opponent")
  })
  it('Show Potential Opponent if quest is not playing, guild open for applications and game play status confirmes Test 5', () => {
    mockGamePlay.game_status= "interested"
    mockQuest.game_play.push(mockGamePlay)
    const wrapper = createWrapper({playing: false});
    expect(wrapper.text()).toContain("Opponent")
  })
})
