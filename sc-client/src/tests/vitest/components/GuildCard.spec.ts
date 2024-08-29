import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import {  QBtn } from 'quasar';
import GuildCardComponent from '../../../components/guild-card.vue';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { useGuildStore } from 'src/stores/guilds';

// Install Quasar with the necessary components
installQuasarPlugin({
  components: {  QBtn,  },
});
vi.mock('src/stores/guilds', () => ({
  useGuildStore: () => ({
    currentGuild: { id: 1, name: 'Test Guild', public: true, open_for_applications: true },
    updateGuild: vi.fn().mockResolvedValue(undefined),
  }),
}));

const mockGuildStore = {
  currentGuild: { id: 1, name: 'Test Guild', public: true, open_for_applications: true },
  updateGuild: vi.fn().mockResolvedValue(undefined),
};
function createWrapper(props = {}) {
  return mount(GuildCardComponent, {
    props: {
      currentGuild: mockGuildStore.currentGuild,
      showDescription: true,
      guild: mockGuildStore.currentGuild,
      ...props,
    },
    global: {
      stubs: {
        QBtn: true,
      },
    },
  });
}
describe('GuildCardComponent', () => {
  const guildStore = useGuildStore();
  beforeEach(() => {
    global.document.execCommand = vi.fn();
  });
  it('if guild name exist displays', () => {
    const wrapper = createWrapper();
    const guildName = wrapper.find("input[type=text]");
    expect(guildName.exists()).toBe(true);
    const inputElement = guildName.element as HTMLInputElement;
    expect(inputElement.value).toBe('Test Guild');
  })
  it('show guild description if showDescription is true', () => {
    const wrapper = createWrapper();
    console.log(wrapper.html())
    const description = wrapper.findComponent('.q-editor')
    expect(description.exists()).toBe(true)
  })

it('does not show guild description if showDescription is false', () => {
  const wrapper = createWrapper({showDescription:false});
  console.log(wrapper.html())
  const description = wrapper.findComponent('.q-editor')
  expect(description.exists()).toBe(false)
})
it('calls updateGuild on submit', async () => {
  const wrapper = createWrapper()

  console.log(wrapper.html());

  await wrapper.find('q-btn-stub[label="Submit"]').trigger('click');
  expect(wrapper.emitted().doSubmit)
  const updateGuildSpy = vi.spyOn(guildStore, 'updateGuild');
  await wrapper.vm.doSubmit()
  await wrapper.vm.$nextTick()
  await flushPromises();
  expect(updateGuildSpy).toHaveBeenCalledWith({
    id: mockGuildStore.currentGuild.id,
    name: mockGuildStore.currentGuild.name,
    public: mockGuildStore.currentGuild.public,
    open_for_applications: mockGuildStore.currentGuild.open_for_applications,
  });
});
});
