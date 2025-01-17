import { api } from '../boot/axios';
import { AxiosResponse } from 'axios';
import { ReadStatusData } from '../types';
import { guildUnreadChannelRow } from '../stores/readStatus.js';

export const readStatusService = {
  async fetchReadStatus(params: { rootid: number }): Promise<ReadStatusData[]> {
    try {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        'rpc/unread_status_list',
        params,
      );
      if (res.status === 200) {
        return res.data;
      }
      throw new Error(`Unexpected response status: ${res.status}`);
    } catch (error) {
      console.error('Error fetching read status:', error);
      throw error;
    }
  },
  async fetchGuildUnreadChannels(params: {
    member_id: number;
    guild_id: number;
    quest_id: number;
  }): Promise<guildUnreadChannelRow[]> {
    try {
      const res: AxiosResponse<guildUnreadChannelRow[]> = await api.post(
        'rpc/guild_unread_channels',
        params,
      );
      if (res.status === 200) {
        return res.data;
      } else {
        console.error(
          'Failed to fetch guild unread channels. Server responded with:',
          res.status,
        );
        return [];
      }
    } catch (error) {
      console.error('Error fetching guild unread channels:', error);
      return [];
    }
  },
  async createReadStatus(
    data: Partial<ReadStatusData>,
  ): Promise<ReadStatusData> {
    try {
      const res: AxiosResponse<ReadStatusData[]> = await api.post(
        '/read_status',
        { data },
      );
      if (res.status === 201) {
        return res.data[0];
      }
      throw new Error(`Unexpected response status: ${res.status}`);
    } catch (error) {
      console.error('Error creating read status:', error);
      throw error;
    }
  },
  async updateReadStatus(
    data: Partial<ReadStatusData>,
  ): Promise<ReadStatusData> {
    try {
      const res: AxiosResponse<ReadStatusData[]> = await api.patch(
        `/read_status/${data.node_id}`,
        data,
      );
      if (res.status === 200) {
        return res.data[0];
      }
      throw new Error(`Unexpected response status: ${res.status}`);
    } catch (error) {
      console.error('Error updating read status:', error);
      throw error;
    }
  },
  async createOrUpdateReadStatus(data: {
    nodeid: number;
    new_status: boolean;
    override: boolean;
  }): Promise<{
    new_node_id: number;
    new_member_id: number;
    status_new: boolean;
  }> {
    try {
      const res: AxiosResponse<{
        new_node_id: number;
        new_member_id: number;
        status_new: boolean;
      }> = await api.post('rpc/node_set_read_status', data);
      if (res.status === 200 || res.status === 201) {
        return res.data;
      }
      throw new Error(`Unexpected response status: ${res.status}`);
    } catch (error) {
      console.error('Error creating or updating read status:', error);
      throw error;
    }
  },
};
