import { mount } from '@vue/test-utils';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import ActiveQuestComponent from '../../../components/active-quests.vue';
import { useMemberStore } from '../../../stores/member';
import { useGuildStore } from '../../../stores/guilds';
import { useQuestStore } from 'src/stores/quests';

installQuasarPlugin();



describe('ActiveQuestComponent.vue', () => {
  let wrapper: any;
  const memberStore = useMemberStore();
  const guildStore = useGuildStore();
  const questStore = useQuestStore();

  memberStore.$patch({
    member: {
      casting: [{ quest_id: 1, guild_id: 2 }],
    },
  });


  beforeEach(() => {
    wrapper = mount(ActiveQuestComponent, {
      global: {
        stubs: {
          'member-game-registration': true,
        },
      },
      props: {
        isMember: true,
        activeQuests: [
          { id: 1, name: 'Quest 1' },
          { id: 2, name: 'Quest 2' },
        ],
        questId: 1,
        guildId: 1,
      },
    });
  });

  it('renders quests if activeQuests is not empty', () => {
    expect(wrapper.findAll('q-radio').length).toBe(2);
  });

  it('shows the "Play" button if the user is a member but not registered in the guild', async () => {
    memberStore.guildPerQuest = { 1: undefined };
    await wrapper.setProps({
      activeQuests: [{ id: 1, name: 'Quest 1' }],
    });
    const playButton = wrapper.find('q-btn[label="Play"]');
    expect(playButton.exists()).toBe(true);
  });

  it('shows the "Go To Quest" button if the user is registered in the current guild', async () => {
    memberStore.guildPerQuest = { 1: 1 };
    guildStore.currentGuild = 1;
    await wrapper.setProps({
      activeQuests: [{ id: 1, name: 'Quest 1' }],
    });
    const goToQuestButton = wrapper.find('q-btn[label="Go To Quest"]');
    expect(goToQuestButton.exists()).toBe(true);
  });

  it('navigates to the guild page if the user is registered in a different guild', async () => {
    memberStore.guildPerQuest = { 1: 2 };
    await wrapper.setProps({
      activeQuests: [{ id: 1, name: 'Quest 1' }],
    });
    const routerLink = wrapper.find('router-link');
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.attributes('to')).toEqual(
      JSON.stringify({ name: 'guild', params: { guild_id: 2 } })
    );
  });

  it('shows a message if no active quests are available', async () => {
    await wrapper.setProps({
      activeQuests: [],
    });
    const noQuestsMessage = wrapper.find('h2');
    expect(noQuestsMessage.exists()).toBe(true);
    expect(noQuestsMessage.text()).toBe('You are not registered to any quests');
  });
});
