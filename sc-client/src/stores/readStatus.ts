import { ConversationNode, ReadStatusData } from '../types';
import { defineStore } from 'pinia';
import { readStatusService } from '../services/readStatusService.js';
import { useMemberStore } from './member';
import { useConversationStore } from './conversation';
import { useChannelStore } from './channel';
import { useGuildStore } from './guilds';
import { useQuestStore } from './quests';
export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}
interface ChannelsReadEntry {
  quest_id: number;
  read: number;
  unread: number;
}

export interface ChannelsReadMap {
  [key: number]: ChannelsReadEntry;
}
export interface guildUnreadChannelRow {
  root_id: number;
  quest_id: number | null;
  read_status: boolean;
  count: number;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus?: ReadStatusMap;
  channelsReadStatus: ChannelsReadMap;
}
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
  channelsReadStatus: undefined,
};
const clearBaseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
  channelsReadStatus: undefined,
};
export const useReadStatusStore = defineStore('readStatus', {
  state: () => baseState,
  getters: {
    hasUnreadChannels: (state: ReadStatusState) => {
      if (!state.channelsReadStatus) return false;
      return Object.values(state.channelsReadStatus).some(
        (entry) => entry.unread > 0,
      );
    },
    getNodeReadStatus:
      (state: ReadStatusState) =>
      (node_id: number): boolean => {
        const memberStore = useMemberStore();
        const memberId = memberStore.getUserId;
        if (state.readStatus) {
          const read: ReadStatusData[] = Object.values(state.readStatus).filter(
            (isRead: ReadStatusData) => isRead.node_id == node_id && memberId,
          );
          if (read.length > 0) {
            return state.readStatus[node_id].status;
          } else return true;
        }
      },
    getUnreadStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if (state.readStatus && state.readStatus[node_id]) {
        const unreadStatusCount: number =
          state.readStatus[node_id].node_count -
          state.readStatus[node_id].read_count;
        return unreadStatusCount;
      }
      return 0;
    },
    getNodeStatusCount: (state: ReadStatusState) => (node_id: number) => {
      if (state.readStatus) {
        return state.readStatus[node_id].node_count;
      }
    },
  },
  actions: {
    async updateReadStatus(
      nodeId: number,
      newStatus: boolean,
      override = false,
    ) {
      try {
        const response = await readStatusService.createOrUpdateReadStatus({
          nodeid: nodeId,
          new_status: newStatus,
          override: override,
        });
        const memberStore = useMemberStore();
        const memberId = memberStore.getUserId;
        const channelStore = useChannelStore();
        const { new_node_id, new_member_id, status_new } = response;
        if (this.readStatus) {
          const existingReadStatus = Object.values(this.readStatus).find(
            (read: ReadStatusData) =>
              read.node_id === new_node_id && read.member_id === memberId,
          );
          if (existingReadStatus) {
            this.readStatus[new_node_id].status = status_new;
          } else {
            this.readStatus = {
              ...this.readStatus,
              [new_node_id]: {
                node_id: new_node_id,
                member_id: new_member_id,
                seconds_shown: 0,
                status: status_new,
                node_count: 0,
                read_count: 0,
              },
            };
          }
        }
        const rootId = channelStore.getChannelOfNode(nodeId);
        if (this.channelsReadStatus && this.channelsReadStatus[rootId]) {
          const channelData = this.channelsReadStatus[rootId];
          if (status_new) {
            channelData.read += 1;
            channelData.unread -= 1;
          } else {
            channelData.read -= 1;
            channelData.unread += 1;
          }
          this.channelsReadStatus = {
            ...this.channelsReadStatus,
            [rootId]: channelData,
          };
        }
      } catch (error) {
        console.error('Failed to update read status:', error);
      }
    },
    async ensureAllQuestsReadStatus() {
      const conversationStore = useConversationStore();
      if (conversationStore.conversationRoot) {
        const cn: ConversationNode = conversationStore.conversationRoot;
        const rootid: number = cn.id;
        await readStatusService.fetchReadStatus({ rootid });
      }
    },
    async ensureGuildUnreadChannels() {
      try {
        const memberStore = useMemberStore();
        const guildStore = useGuildStore();
        const questStore = useQuestStore();
        const member_id = memberStore.getUserId;
        const guild_id = guildStore.getCurrentGuild.id;
        const quest_id = questStore.getCurrentQuest?.id ?? null;
        if (!member_id || !guild_id) {
          console.warn(
            'Missing member_id or guild_id. Cannot fetch unread channels.',
          );
          return;
        }
        const unreadChannels: guildUnreadChannelRow[] =
          await readStatusService.fetchGuildUnreadChannels({
            member_id,
            guild_id,
            quest_id,
          });
        if (unreadChannels) {
          const root_map: ChannelsReadMap = {};
          for (const x of unreadChannels) {
            if (root_map[x.root_id] == undefined)
              root_map[x.root_id] = {
                quest_id: x.quest_id,
                read: 0,
                unread: 0,
              };
            if (x.read_status) root_map[x.root_id].read = x.count;
            else root_map[x.root_id].unread = x.count;
          }
          this.channelsReadStatus = root_map;
        } else {
          console.warn('No unread channels were returned.');
        }
      } catch (error) {
        console.error('Error ensuring guild unread channels:', error);
      }
    },
    async ensureAllChannelReadStatus() {
      const channelStore = useChannelStore();
      if (channelStore.getCurrentChannel) {
        const rootid = channelStore.getCurrentChannel;
        const res = await readStatusService.fetchReadStatus({ rootid });
        this['readStatus'] = Object.fromEntries(res.map((x) => [x.node_id, x]));
        if (
          this.channelsReadStatus !== undefined &&
          !!this.channelsReadStatus[rootid]
        ) {
          const channelData: ChannelsReadEntry =
            this.channelsReadStatus[rootid];
          channelData.read = this.readStatus[rootid].read_count;
          channelData.unread =
            this.readStatus[rootid].node_count - channelData.read;
          this.channelsReadStatus = {
            ...this.channelsReadStatus,
            [rootid]: channelData,
          };
        }
      }
    },
    resetReadStatus() {
      Object.assign(this, clearBaseState);
    },
  },
});
