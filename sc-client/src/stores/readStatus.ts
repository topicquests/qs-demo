import { ConversationNode, ReadStatusData } from '../types';
import { defineStore } from 'pinia';
import { useMemberStore } from './member';
import { useConversationStore } from './conversation';
import { useChannelStore } from './channel';
import { api } from '../boot/axios';
import { AxiosResponse } from 'axios';

export interface ReadStatusMap {
  [key: number]: ReadStatusData;
}
export interface ReadStatusState {
  fullFetch: false;
  readStatus?: ReadStatusMap;
}
const baseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
};
const clearBaseState: ReadStatusState = {
  fullFetch: false,
  readStatus: {},
};

export const useReadStatusStore = defineStore('readStatus', {
  state: () => baseState,
  getters: {
    getReadStatus: (state: ReadStatusState): ReadStatusMap | undefined => {
      return state.readStatus;
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
    async ensureReadStatusByGuild() {
      const channelStore = useChannelStore();
      const channels = channelStore.getChannels;
      const readStatus = await this.fetchAllReadStatus();
      const guildReadStaus = readStatus.filter(
        (c) => channels.some((r) => c.node_id == r.id))
        this.readStatus = guildReadStaus;
    },
    async ensureAllQuestsReadStatus() {
      const conversationStore = useConversationStore();
      if (conversationStore.conversationRoot) {
        const cn: ConversationNode = conversationStore.conversationRoot;

        const rootid: number = cn.id;
        await this.fetchReadStatus({ rootid });
      }
    },

    async ensureReadStatusOfGuild() {
      const channelStore = useChannelStore();
      if(channelStore.getCurrentGuild) {
        await this.fetchReadStatus()
      }

    },
    async ensureAllChannelReadStatus() {
      const channelStore = useChannelStore();
      if (channelStore.getCurrentChannel) {
        const rootid = channelStore.getCurrentChannel;
        await this.fetchReadStatus({ rootid });
      }
    },
    resetReadStatus() {
      Object.assign(this, clearBaseState);
    },
    // Axios Calls
    async creatReadStatus(data: Partial<ReadStatusData>) {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        '/read_status',
        {
          data,
        },
      );
      if (res.status == 201) {
        const readStatusData: ReadStatusData = Object.assign(res.data[0], {
          node_id: null,
        });
        this.readStatus = {
          ...this.readStatus,
          [readStatusData.node_id]: readStatusData,
        };
      }
    },
    async updateReadStatus(data: Partial<ReadStatusData>) {
      const res: AxiosResponse<ReadStatusData[]> = await api.patch(
        `/read_status/${data.node_id}`,
        data,
      );
      if (res.status == 200) {
        const readStatus = res.data[0];
        if (this.readStatus) {
          const readStatusData: ReadStatusData = Object.assign(
            this.readStatus[readStatus.node_id],
            readStatus,
          );
          this.readStatus = {
            ...this.readStatus,
            [readStatus.node_id]: readStatusData,
          };
        }
      }
    },
    async fetchReadStatus(params: { rootid: number }) {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        'rpc/unread_status_list',
        params,
      );
      if (res.status == 200) {
        this['readStatus'] = Object.fromEntries(
          res.data.map((x) => [x.node_id, x]),
        );
      }
    },
    async fetchAllReadStatus() {
      const res: AxiosResponse<ReadStatusData[]> = await api.get(
        '/read_status');
        if (res.status == 200) {
          return res.data;
        }
    },

    async CreateOrUpdateReadStatus(data: {
      nodeid: number;
      new_status: boolean;
      override: boolean;
    }) {
      const res: AxiosResponse<{
        new_node_id: number;
        new_member_id: number;
        status_new: boolean;
      }> = await api.post('rpc/node_set_read_status', data);
      if (res.status == 200 || res.status == 201) {
        const memberStore = useMemberStore();
        const memberId = memberStore.getUserId;
        const node_id = res.data.new_node_id;
        const newReadStatus: ReadStatusData = {
          node_id,
          member_id: res.data.new_member_id,
          seconds_shown: 0,
          status: res.data.status_new,
          node_count: 0,
          read_count: 0,
        };
        if (this.readStatus) {
          const read = Object.values(this.readStatus).filter(
            (isRead: ReadStatusData) => isRead.node_id == node_id && memberId,
          );

          if (read.length > 0 && this.readStatus) {
            this.readStatus[node_id].status = res.data.status_new;
          } else {
            this.readStatus = {
              ...this.readStatus,
              [node_id]: newReadStatus,
            };
          }
        }
      }
    },
  },
});
