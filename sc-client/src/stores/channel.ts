import { defineStore } from 'pinia';
import type { AxiosResponse } from 'axios';
import { api } from '../boot/axios';
import {
  ConversationNode,
  conversationNodePatchKeys,
  QTreeNode,
} from '../types';
import { publication_state_enum, permission_enum } from '../enums';
import { makeTree, ConversationMap } from './conversation';
import { useMemberStore } from './member';
import { useQuestStore } from './quests';
import { useBaseStore, filterKeys } from './baseStore';
import { useGuildStore } from './guilds';

interface ChannelMap {
  [key: number]: ConversationMap;
}

export interface ChannelState {
  channels: ConversationMap;
  channelData: ChannelMap;
  currentGuild?: number;
  currentChannel?: number;
}

const baseState: ChannelState = {
  currentGuild: undefined,
  channels: {},
  channelData: {},
  currentChannel: undefined,
};
const clearBaseState: ChannelState = {
  currentGuild: undefined,
  channels: {},
  channelData: {},
  currentChannel: undefined,
};

export const useChannelStore = defineStore('channel', {
  state: () => baseState,

  getters: {
    getChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels),
    getGuildChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id == undefined,
      ),
    getGameChannels: (state: ChannelState): ConversationNode[] =>
      Object.values(state.channels).filter(
        (c: ConversationNode) => c.quest_id != undefined,
      ),
    getGameChannelsOfQuest:
      (state: ChannelState) =>
      (quest_id: number): ConversationNode[] =>
        Object.values(state.channels).filter(
          (c: ConversationNode) => c.quest_id == quest_id,
        ),
    getChannelById: (state: ChannelState) => (id: number) =>
      state.channelData[id],
    getChannelConversation: (state: ChannelState) => (channel_id: number) =>
      state.channelData[channel_id],
    getChannelConversationTree:
      (state: ChannelState) =>
      (channel_id: number): QTreeNode[] => {
        const channel = state.channelData[channel_id];
        if (channel) return makeTree(Object.values(channel));
        return [];
      },
    getChannelChildrenOf: (state: ChannelState) => (node_id: number) => {
      if (state.currentChannel) {
        return Object.values(state.channelData[state.currentChannel]).filter(
          (n) => n.parent_id == node_id,
        );
      }
    },
    getCurrentChannel: (state: ChannelState) => state.currentChannel,
    getChannelNode:
      (state: ChannelState) => (channel_id: number, node_id: number) =>
        state.channelData[channel_id]?.[node_id],
    canEdit:
      (state: ChannelState) => (channel_id?: number, node_id?: number) => {
        const memberStore = useMemberStore();
        const questStore = useQuestStore();
        const baseStore = useBaseStore();
        if (memberStore && memberStore.getUserId) {
          const userId = memberStore.getUserId;
          if (typeof channel_id === 'number' && typeof node_id === 'number') {
            const node = state.channelData[channel_id]?.[node_id];
            if (node && userId) {
              if (node.status == publication_state_enum.private_draft) {
                return node.creator_id == userId;
                // TODO: role_draft
              } else if (node.status == publication_state_enum.guild_draft) {
                const casting = questStore.castingInQuest(node.guild_id);
                return casting?.guild_id == node.guild_id;
              }
            } else if (node.status == publication_state_enum.proposed) {
              return baseStore.hasPermission(
                permission_enum.guildAdmin,
                node.guild_id,
                node.guild_id,
              );
            }
          }
        }
        return false;
      },
  },

  actions: {
    setCurrentChannel(channel_id: number) {
      this.currentChannel = channel_id;
    },
    async ensureChannels(guild_id: number) {
      if (guild_id != this.currentGuild) {
        await this.fetchChannels(guild_id);
      }
    },
    async ensureChannelConversation(channel_id: number, guild?: number) {
      const guildStore = useGuildStore();
      if (
        guild != guildStore.currentGuild ||
        this.channelData![channel_id] === undefined
      ) {
        await this.fetchChannelConversation(channel_id);
      }
    },
    resetChannel() {
      Object.assign(this, clearBaseState);
    },
    addToState(node: ConversationNode) {
      const channel_id = Number.parseInt(node.ancestry.split('.')[0]);
      if (!node.parent_id) {
        this.channels = { ...this.channels, [channel_id]: node };
      }
      if (node.parent_id && this.channelData[channel_id] == undefined) {
        console.log('Missing channel');
        return;
      }
      const channelData = { ...this.channelData[channel_id], [node.id]: node };
      this.channelData = {
        ...this.channelData,
        [channel_id]: channelData,
      };
      this.currentChannel = channel_id;
    },
    async fetchChannels(guild_id: number) {
      const params = {
        guild_id: `eq.${guild_id}`,
      };
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        '/conversation_node',
        { params },
      );
      if (res.status == 200) {
        const guildStore = useGuildStore();
        if (res.data.length > 0) {
          if (
            res.data[0].guild_id &&
            guildStore.currentGuild !== res.data[0].guild_id
          ) {
            guildStore.currentGuild = res.data[0].guild_id;
            this.channelData = {};
          }
          this.channels = Object.fromEntries(
            res.data.map((node: ConversationNode) => [node.id, node]),
          );
        }
      }
    },

    async fetchChannelConversation(
      node_id: number,
    ): Promise<ConversationNode[]> {
      const params = Object();
      params.node_id = node_id;
      const res: AxiosResponse<ConversationNode[]> = await api.get(
        'rpc/node_subtree',
        {
          params,
        },
      );
      if (res.status == 200) {
        const channel_id = params.node_id;
        const firstNode = res.data[0];
        if (this.currentGuild !== firstNode!.guild_id) {
          this.currentGuild = firstNode!.guild_id;
          this.channels = {};
        }
        const nodes: ConversationMap = Object.fromEntries(
          res.data.map((node: ConversationNode) => [node.id, node]),
        );
        const channel = nodes[channel_id];
        if (channel.meta != 'channel' || channel.parent_id != null)
          throw Error('not a channel');
        this.channelData = { ...this.channelData, [channel_id]: nodes };
        this.currentChannel = channel_id;
        return res.data;
      }
      return [];
    },
    async createChannelNode(node: Partial<ConversationNode>) {
      const res: AxiosResponse<ConversationNode[]> = await api.post(
        '/conversation_node',
        node,
      );
      if (res.status == 200) {
        const node = res.data[0];
        this.addToState(node);
      }
    },
    async updateChannelNode(data: Partial<ConversationNode>) {
      data = filterKeys(data, conversationNodePatchKeys);
      const res: AxiosResponse<ConversationNode[]> = await api.patch(
        '/conversation_node/${params.id}',
        {
          data,
        },
      );
      if (res.status == 200) {
        const node = res.data[0];
        this.addToState(node);
      }
    },
  },
});
