import { installQuasarPlugin } from "@quasar/quasar-app-extension-testing-unit-vitest";
import QuestCard from "../../../components/quest-card.vue";
import { describe, it, expect } from 'vitest';
import { mount } from "@vue/test-utils";
import { mockConversation, mockQuest } from "./mocks/StoreMocks";
import { createTestingPinia } from "@pinia/testing";
import { QTooltip } from "quasar";

installQuasarPlugin({
    components: {QTooltip},
});

function createWrapper(props = {}) {
    return  mount(QuestCard, {
        props: {
            currentQuest: mockQuest,
            showQuestInfo: false,
            creator: {},
            ...props
        },
        global: {
            plugins: [
                createTestingPinia({
                    initialState: {
                        quest: {
                            currentQuest: mockQuest.id,
                            quests: {1: mockQuest}
                        },
                        conversation: {
                            neighbourhood: {1: mockConversation}
                        }
                    }
                })

            ],
        }
    })
}

describe('Quest card component unit test', () => {
    it('show quest avatar', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })
        const avatar = wrapper.find(".q-avatar")
        expect(avatar.exists()).toBe(true)
    })
    it('display current quest name', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })
        const h3 = wrapper.find("h3")
        expect(h3.text()).toBe(mockQuest.name)
    })
    it('Display current quest description as a tooltip if it exist', async () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })
        const descriptionBtn = wrapper.find(".q-btn")
        await descriptionBtn.trigger('mouseenter')
        await new Promise(resolve => setTimeout(resolve, 50))
        expect(descriptionBtn.exists()).toBe(true)
        const tooltip = document.body.querySelector('.q-tooltip')
        expect(tooltip).not.toBeNull()
        expect(tooltip?.textContent).toBe('This is a test quest')
    })
    it('create link to game', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })
        const gameLink = wrapper.find("a.q-ml-sm.q-mt-md");
        expect(gameLink.exists()).toBe(true);
        expect(gameLink.text()).toBe('Game');
        expect(gameLink.attributes('href')).toBe('/quest/1');
    })
    it('Show guilds playing in current quest', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
    it('Display # of conversation moves', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
    it('show status of current quest', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
    it('Display current quest start date', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
    it('Display current quest end date', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
    it('Display current quest end date', () => {
        const wrapper = mount(QuestCard, {
            props: {
                currentQuest: mockQuest,
                showQuestInfo: false,
                creator: {}
            },
            global: {
                plugins: [
                    createTestingPinia({
                        initialState: {
                            quest: {
                                currentQuest: mockQuest.id,
                                quests: {1: mockQuest}
                            },
                            conversation: {
                                neighbourhood: {1: mockConversation}
                            }
                        }
                    })

                ],
            }
        })

    })
})
