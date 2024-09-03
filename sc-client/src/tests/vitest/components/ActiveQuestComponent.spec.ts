import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { createTestingPinia } from '@pinia/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import ActiveQuestComponent from '../../../components/active-quests.vue';
import { useMemberStore } from 'src/stores/member';
import { useGuildStore } from 'src/stores/guilds';

installQuasarPlugin();

function createWrapper(props = {}) {
  return mount(ActiveQuestComponent, {
    global: {
      stubs: {
        'member-game-registration': true,
      },
    },
    plugins: [
      createTestingPinia({
        initialState: {
          member: {
            guildPerQuest: {
              1: 1, // Quest 1 registered for current guild
              3: 3, // Quest 3 registered for another guild
            },
          },
        },
      }),
    ],
    props: {
      isMember: true,
      activeQuests: [
        { id: 1, name: 'Quest 1' },
        { id: 2, name: 'Quest 2' },
        { id: 3, name: 'Quest 3' },
      ],
      questId: 1,
      guildId: 1,
      quest: {
        id: 1,
      },
      ...props,
    },
  });
}

describe('ActiveQuestComponent.vue', () => {
  let memberStore;

  beforeEach(() => {
    memberStore = useMemberStore();
    memberStore.$patch({
      member: {
        casting: [{ quest_id: 1, guild_id: 1 }, { quest_id: 2, guild_id: 2 }],
      },
    });
  });

  it('renders quests if activeQuests is not empty', () => {
    const wrapper=createWrapper();
    expect(wrapper.findAll('.q-radio').length).toBeGreaterThanOrEqual(3);
  });

  it('verifies there are three quests registered to guild', () => {
    const wrapper=createWrapper();
    const quests = wrapper.findAll('.q-radio');
    expect(quests.length).toBeGreaterThanOrEqual(3);
  });

  it('Quest 1 Member can register to play', () => {
    const guildStore = useGuildStore();
    guildStore.currentGuild = 1;
    const wrapper=createWrapper();
    console.log(guildStore.currentGuild)
    const radioButtons = wrapper.findAll('.q-radio');
    const quest1Button = radioButtons.at(0);
    expect(quest1Button.exists()).toBe(true);
    expect(quest1Button.text()).toContain('Go To Quest');
  });

  it('Quest 2 player is playing in a different guild', () => {
    const wrapper=createWrapper({ quest: { id: 2 } });
    const buttons = wrapper.findAll('.q-radio');
    const quest2Button = buttons.at(1);
    expect(quest2Button.exists()).toBe(true);
    expect(quest2Button.text()).toContain('Quest 2 Playing');
  });

  it('Quest 3 is registered in a different guild', () => {
    const wrapper=createWrapper({ quest: { id: 3 } });
    const buttons = wrapper.findAll('.q-radio');
    const quest3Button = buttons.at(2);
    expect(quest3Button.exists()).toBe(true);
    expect(quest3Button.text()).toContain('Quest 3Play');
  });

  it('shows a message if no active quests are available', async () => {
    const wrapper = createWrapper()
    await wrapper.setProps({
      activeQuests: [],
    });
    const noQuestsMessage = wrapper.find('h2');
    expect(noQuestsMessage.exists()).toBe(true);
    expect(noQuestsMessage.text()).toBe('You are not registered to any quests');
  });
});
