import { useMemberStore } from 'src/stores/member';
import { api } from '../boot/axios';
import { AxiosResponse } from 'axios';
import { Guild, GuildData } from 'src/types';

export const guildService = {
  async fetchGuildsById(
    id: number | number[] | undefined,
    full: boolean = true,
  ): Promise<GuildData[]> {
    try {
      const userId = useMemberStore().getUserId;
      const params = Object();
      if (id !== undefined) {
        if (Array.isArray(id)) {
          params.id = `in.(${id.join(',')})`;
        } else {
          params.id = `eq.${id}`;
        }
      }
      if (userId !== undefined) {
        params.select =
          '*,guild_membership!guild_id(*),casting!guild_id(*),game_play!guild_id(*)';
        if (!full) {
          Object.assign(params, {
            'guild_membership.member_id': `eq.${userId}`,
            'casting.member_id': `eq.${userId}`,
          });
        }
      } else {
        params.select = '*,game_play!guild_id(*)';
      }
      const res: AxiosResponse<GuildData[]> = await api.get('/guilds_data', {
        params,
      });
      if (res.status == 200) {
        return res.data;
      } else {
        console.error(
          'Failed to fetch guild by id. Server responded with: ',
          res.status,
        );
        return [];
      }
    } catch (error) {
      console.error('Error fetching guild by id', error);
    }
  },
  async createGuildBase(data: Partial<Guild>): Promise<GuildData[]> {
    try {
      const res: AxiosResponse<GuildData[]> = await api.post('/guilds', data);
      if (res.status == 201) {
        return res.data;
      } else {
        console.error(
          'Failed to create guild. Server responded with; ',
          res.status,
        );
        return [];
      }
    } catch (error) {
      console.error('Error creating guild', error);
      return [];
    }
  },
};
