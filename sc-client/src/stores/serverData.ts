import { AxiosResponse } from 'axios';
import { Member, ServerData } from 'src/types';
import { defineStore } from 'pinia';
import { api } from '../boot/axios';

export interface ServerDataState {
  serverData?: ServerData;
}
const baseState: ServerDataState = {
  serverData: undefined,
};
const clearBaseState: ServerDataState = {
  serverData: undefined,
};
export const useServerDataStore = defineStore('serverData', {
  state: () => baseState,

  getters: {
    getServerData: (state: ServerDataState) => state.serverData,
  },

  actions: {
    async ensureServerData() {
      if (!this.serverData) {
        await this.fetchServerData();
        return this.serverData;
      }
    },
    async resetServerData() {
      if (this.serverData) {
        await this.fetchServerData();
        return this.serverData;
      }
    },
    resetServer() {
      Object.assign(this, clearBaseState);
    },
    async fetchServerData(): Promise<ServerData> {
      const res: AxiosResponse<ServerData[]> = await api.get('/server_data');
      if (res.status == 200) {
        this.serverData = res.data[0];
      }
      return res.data[0];
    },
    async updateServerData(
      serverData: ServerData,
    ): Promise<Partial<ServerData>> {
      const res: AxiosResponse<ServerData[]> = await api.patch(
        '/server_data',
        serverData,
      );
      if (res.status == 200) {
        this.serverData = Object.assign({}, this.serverData, res.data[0]);
      }
      return res.data[0];
    },
    async resetDefaultSingle() {
      const res: AxiosResponse<ServerData[]> = await api.get('/server_data');
      if (res.status == 200) {
        this.fetchServerData();
      }
    },
    async resetDefaultAll(): Promise<void> {
      const res: AxiosResponse<Member[]> = await api.post(
        '/rpc/reset_all_default_data',
      );
      if (res.status == 200) {
        this.fetchServerData();
      }
    },
  },
});
