import { defineStore } from 'pinia';
import { AxiosResponse } from 'axios';
import { useMemberStore } from './member';
import { useMembersStore } from './members';
import { useGuildStore } from './guilds';
import { useRoleStore } from './role';
import { useConversationStore } from './conversation';
import { api } from '../boot/axios';

import {
  QuestData,
  Quest,
  Casting,
  QuestMembership,
  GamePlay,
  CastingRole,
  Role,
  PublicMember,
  questPatchKeys,
  GuildData,
} from '../types';
import {
  quest_status_enum,
  ibis_node_type_type,
  publication_state_enum,
  publication_state_type,
  publication_state_list,
} from '../enums';
import { getWSClient } from '../wsclient';
import { filterKeys } from './baseStore';

interface QuestMap {
  [key: number]: QuestData;
}
export interface QuestsState {
  quests: QuestMap;
  fullQuests: { [key: number]: boolean };
  fullFetch: boolean;
  currentQuest?: number;
}

const baseState: QuestsState = {
  currentQuest: undefined,
  fullFetch: false,
  quests: {},
  fullQuests: {},
};
const clearBaseState: QuestsState = {
  currentQuest: undefined,
  fullFetch: false,
  quests: {},
  fullQuests: {},
};

export const useQuestStore = defineStore('quest', {
  state: () => baseState,
  getters: {
    getCurrentQuest: (state: QuestsState): QuestData | undefined => {
      if (state.currentQuest) {
        return state.quests[state.currentQuest];
      }
      return undefined;
    },
    getQuests: (state: QuestsState): QuestData[] => {
      return Object.values(state.quests);
    },
    getQuestById: (state: QuestsState) => (id: number) => state.quests[id],
    getMyQuests: (state: QuestsState) => {
      const member_id = useMemberStore().getUserId;
      return Object.values(state.quests).filter((quest: QuestData) =>
        quest?.quest_membership?.find(
          (m: QuestMembership) => m.member_id == member_id && m.confirmed,
        ),
      );
    },
    getActiveQuests: (state: QuestsState): QuestData[] =>
      Object.values(state.quests).filter(
        (quest) =>
          ['ongoing', 'paused', 'registration'].indexOf(quest.status) >= 0,
      ),
    getPlayingQuests: (state: QuestsState) => {
      const member_id = useMemberStore().getUserId;
      return Object.values(state.quests).filter((quest: QuestData) =>
        quest.casting?.find((c: Casting) => c.member_id == member_id),
      );
    },
    getPlayers: (state: QuestsState) => (quest_id: number) =>
      state.quests[quest_id]?.casting?.map((c: Casting) =>
        useMembersStore().getMemberById(c.member_id!),
      ),
    getPlayersInGuild:
      (state: QuestsState) => (quest_id: number, guild_id: number) =>
        state.quests[quest_id]?.casting
          ?.filter((c: Casting) => c.guild_id == guild_id)
          .map((c: Casting) => useMembersStore().getMemberById(c.member_id!)),
    isQuestMember: (state: QuestsState) => (quest_id: number) => {
      const member_id = useMemberStore().getUserId;
      return state.quests[quest_id]?.quest_membership?.find(
        (m: QuestMembership) => m.member_id == member_id && m.confirmed,
      );
    },
    getCurrentGamePlay: (state: QuestsState): GamePlay | undefined => {
      if (state.currentQuest) {
        const quest = state.quests[state.currentQuest];
        const currentGuild: Partial<GuildData> =
          useGuildStore().getCurrentGuild!;
        if (currentGuild) {
          return quest?.game_play?.find(
            (gp: GamePlay) => gp.guild_id == currentGuild.id,
          );
        }
      }
    },
    getCastingRoles:
      () =>
      (member_id: number): Role[] | undefined => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        if (castingRoles) {
          const roles = castingRoles.map((pr) =>
            useRoleStore().getRoleById(pr.role_id),
          );
          return roles;
        }
        return undefined;
      },
    getCastingRolesForQuest:
      () =>
      (member_id: number, quest_id: number): Role[] | undefined => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        if (castingRoles) {
          const playerRoles = castingRoles.filter(
            (role) => role.quest_id == quest_id,
          );

          const roles = playerRoles.map((pr) =>
            useRoleStore().getRoleById(pr.role_id),
          );

          return roles;
        }
        return undefined;
      },
    getPlayersOfCurrentQuestGuild: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest!];
      const membersStore = useMembersStore();
      const currentGuildId = useGuildStore().currentGuild;
      if (!currentGuildId) return [];
      if (quest.casting) {
        return (quest.casting || [])
          .filter(
            (c: Casting) =>
              c.guild_id == currentGuildId && c.member_id !== undefined,
          )
          .map((c: Casting) => membersStore.members[c.member_id!])
          .filter((member: PublicMember) => member);
      }
    },

    isPlayingQuestInGuild:
      (state: QuestsState) =>
      (quest_id?: number, guild_id?: number, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id!]?.casting?.find(
          (c: Casting) => c.member_id == member_id && c.guild_id == guild_id,
        );
      },
    isPlayingQuestAsGuildId:
      (state: QuestsState) => (quest_id?: number, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        const casting = state.quests[quest_id!]?.casting?.find(
          (c: Casting) => c.member_id == member_id,
        );
        return casting?.guild_id;
      },
    castingInQuest:
      (state: QuestsState) =>
      (quest_id?: number | null, member_id?: number) => {
        member_id = member_id || useMemberStore().getUserId;
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id!]?.casting?.find(
          (c: Casting) => c.member_id == member_id,
        );
      },
    getCastingRolesById:
      () =>
      (member_id: number, quest_id: number): CastingRole[] | undefined => {
        const castingRoles = useMembersStore().getPlayersRoles(member_id);
        const playerRoles = castingRoles?.filter(
          (role) => role.quest_id == quest_id,
        );
        return playerRoles;
      },
    getMembersOfCurrentQuest: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest!];
      const membersStore = useMembersStore();
      return quest?.quest_membership
        ?.map((qm: QuestMembership) => membersStore.members[qm.member_id])
        .filter((member: PublicMember) => member);
    },
    isGuildPlayingQuest:
      (state: QuestsState) => (quest_id?: number, guild_id?: number) => {
        quest_id = quest_id || state.currentQuest;
        return state.quests[quest_id!]?.casting?.find(
          (c: Casting) => c.guild_id == guild_id,
        );
      },
    getPlayersOfCurrentQuest: (state: QuestsState) => {
      const quest = state.quests[state.currentQuest!];
      const membersStore = useMembersStore();
      if (quest.casting)
        return quest?.casting
          .map((c: Casting) => membersStore.members[c.member_id!])
          .filter((member: PublicMember) => member);
    },
    getGamePlayForGuild:
      (state: QuestsState) =>
      (guild_id: number): GamePlay | undefined => {
        if (state.currentQuest) {
          const quest = state.quests[state.currentQuest];
          return quest?.game_play?.find(
            (gp: GamePlay) => gp.guild_id == guild_id,
          );
        }
      },
    getQuestsByStatus:
      (state: QuestsState) =>
      (status: quest_status_enum | string): QuestData[] =>
        Object.values(state.quests).filter(
          (quest: QuestData) => quest.status == status,
        ),
    getMaxPubStateForNodeType:
      () =>
      (
        quest_id: number,
        node_type: ibis_node_type_type,
      ): publication_state_type => {
        const roleCastings: CastingRole[] | undefined =
          useMemberStore().castingRolesForQuest(quest_id);
        if (roleCastings) {
          const roles: Role[] = roleCastings.map((rc) =>
            useRoleStore().getRoleById(rc.role_id),
          );
          if (roles) {
            let maxPubStates = roles.map((role) => role.max_pub_state);
            maxPubStates = maxPubStates.concat(
              roles.map((role) =>
                role.role_node_constraint
                  ? role.role_node_constraint.find(
                      (x) => x.node_type == node_type,
                    )?.max_pub_state
                  : undefined,
              ),
            );
            maxPubStates = maxPubStates.filter((x) => x != undefined);
            if (maxPubStates.length > 0) {
              // maximum for all roles
              maxPubStates.sort(
                (a, b) =>
                  publication_state_list.indexOf(b!) -
                  publication_state_list.indexOf(a!),
              );
            }
          }
        }
        // no constraint
        return publication_state_enum.submitted;
      },
  },
  actions: {
    async createQuest(data: Partial<QuestData>) {
      const res: Partial<QuestData> = await this.createQuestBase(data);
      // Refetch to get memberships.
      // TODO: maybe add representation to creation instead?
      await this.fetchQuestById(res.id);
      // TODO: Get the membership from the quest
      await useMemberStore().fetchLoginUser();
      await useConversationStore().resetConversation();
      return res;
    },
    async ensureAllQuests(): Promise<QuestData[] | undefined> {
      if (Object.keys(this.quests).length === 0 || !this.fullFetch) {
        const quest: QuestData[] | undefined = await this.fetchQuests();
        if (quest!.length > 0) return quest;
      } else return undefined;
    },
    async ensureQuest({
      quest_id,
      full = true,
    }: {
      quest_id: number;
      full?: boolean;
    }) {
      if (
        this.getQuestById(quest_id) === undefined ||
        (full && !this.fullQuests![quest_id])
      ) {
        await this.fetchQuestById(quest_id, full);
      }
    },
    async ensureCurrentQuest(quest_id: number, full = true) {
      await this.ensureQuest({ quest_id, full });
      await this.setCurrentQuest(quest_id);
    },
    setCurrentQuest(quest_id: number | boolean) {
      if (typeof quest_id === 'number') {
        this.currentQuest = quest_id;
      }
      getWSClient().setDefaultQuest(quest_id);
    },
    resetQuests() {
      Object.assign(this, clearBaseState);
    },

    //axios calls
    async fetchQuests(): Promise<QuestData[] | undefined> {
      return await this.fetchQuestById(undefined, false);
    },
    async fetchQuestById(
      id: number | number[] | undefined,
      full?: boolean,
    ): Promise<QuestData[]> {
      const params = Object();
      if (id !== undefined) {
        if (Array.isArray(id)) {
          params.id = `in.(${id.join(',')})`;
        } else {
          params.id = `eq.${id}`;
        }
      }
      const userId = useMemberStore().getUserId;
      if (userId || full) {
        params.select =
          '*,quest_membership!quest_id(*),casting!quest_id(*),game_play!quest_id(*)';
        if (!full) {
          Object.assign(params, {
            'quest_membership.member_id': `eq.${userId}`,
            'casting.member_id': `eq.${userId}`,
          });
        }
      } else {
        params.select = '*,game_play!quest_id(*)';
      }
      const res: AxiosResponse<QuestData[]> = await api.get('/quests_data', {
        params,
      });
      if (res.status == 200) {
        const quests = Object.fromEntries(
          res.data.map((guild: QuestData) => [guild.id, guild]),
        );
        if (!full) {
          for (const quest of Object.values<QuestData>(this.quests)) {
            if (!this.fullQuests[quest.id]) {
              continue;
            }
            if (quest.casting) {
              quests[quest.id].casting = quest.casting;
            }
            if (quest.quest_membership) {
              quests[quest.id].quest_membership = quest.quest_membership;
            }
          }
        } else {
          this.fullQuests = {
            ...this.fullQuests,
            ...Object.fromEntries(
              res.data.map((quest: QuestData) => [quest.id, true]),
            ),
          };
        }
        this.quests = {
          ...this.quests,
          ...quests,
        };
        this.fullFetch = id === undefined;
        return res.data;
      }
      return [];
    },
    async addCasting(casting: Partial<Casting>) {
      const memberStore = useMemberStore();
      const res: AxiosResponse<Casting[]> = await api.post('/casting', casting);
      if (res.status == 201) {
        const casting = res.data[0];
        let quest = this.quests[casting.quest_id];
        if (quest) {
          const castings = quest.casting || [] || undefined;
          castings.push(casting);
          quest = { ...quest, casting: castings };
          this.quests = { ...this.quests, [quest.id]: quest };
        }
        if ((casting.member_id = memberStore.getUserId) && memberStore.member) {
          const castings = (memberStore.member.casting || []).filter(
            (c: Casting) => c.quest_id != casting.quest_id,
          );
          castings.push(casting);
          memberStore.member.casting = castings;
        }
      }
    },
    async addCastingRole(castingRole: Partial<CastingRole>) {
      const memberStore = useMemberStore();
      const membersStore = useMembersStore();
      const res: AxiosResponse<CastingRole[]> = await api.post(
        '/casting_role',
        castingRole,
      );
      if (res.status == 201) {
        const castingRole = res.data[0];
        if ((castingRole.member_id = memberStore.getUserId)) {
          if (memberStore.member) {
            if (memberStore.member.casting_role) {
              const castingRoles: CastingRole[] =
                memberStore.member.casting_role.filter(
                  (cr: CastingRole) => cr.role_id != castingRole.role_id,
                ) || [];
              castingRoles.push(castingRole);
              memberStore.member.casting_role = castingRoles;
            }
          }
        }
        const member_id = castingRole.member_id;
        if (memberStore.member && member_id !== undefined) {
          let member = membersStore.members[member_id];

          if (member) {
            const casting_role =
              member.casting_role?.filter(
                (cr: CastingRole) => cr.role_id != castingRole.role_id,
              ) || [];
            casting_role.push(castingRole);
            member = { ...member, casting_role };
            membersStore.members = {
              ...membersStore.members,
              [member_id]: member,
            };
          }
        }
      }
    },

    async deleteCastingRole(
      member_id: number,
      guild_id: number | undefined,
      role_id: number,
      quest_id: number | undefined,
    ) {
      const params = {
        member_id: `eq.${member_id}`,
        guild_id: `eq.${guild_id}`,
        role_id: `eq.${role_id}`,
        quest_id: `eq.${quest_id}`,
      };
      const res: AxiosResponse<CastingRole[]> = await api.delete(
        '/casting_role',
        { params },
      );
      if (res.status == 200) {
        const memberStore = useMemberStore();
        const membersStore = useMembersStore();
        if (memberStore.getUserId == member_id) {
          memberStore.removeCastingRole(res.data[0]);
        }
        membersStore.removeCastingRole(res.data[0]);
      }
    },
    async updateCasting(data: Casting) {
      const memberStore = useMemberStore();
      const params = Object();
      params.id = data.member_id;
      const res: AxiosResponse<Casting[]> = await api.patch('/casting', params);
      if (res.status == 200) {
        const casting = res.data[0];
        const quest = this.quests[casting.quest_id];
        if (quest) {
          const castings =
            quest.casting?.filter(
              (gp: Casting) => gp.quest_id !== casting.quest_id,
            ) || [];
          castings.push(casting);
          quest.casting = castings;
        }
        if ((casting.member_id = memberStore.getUserId)) {
          if (memberStore.member) {
            const castings =
              memberStore.member.casting!.filter(
                (c: Casting) => c.quest_id != casting.quest_id,
              ) || [];
            castings.push(casting);
            memberStore.member.casting = castings;
          }
        }
      }
    },
    async createQuestBase(
      data: Partial<QuestData>,
    ): Promise<Partial<QuestData>> {
      const res: AxiosResponse<QuestData[]> = await api.post('/quests', data);
      if (res.status == 201) {
        const questData: QuestData = Object.assign(res.data[0], {
          last_node_published_at: null,
          node_count: 0,
          confirmed_guild_count: 0,
          interested_guild_count: 0,
          player_count: 0,
          is_playing: false,
          my_confirmed_guild_count: 0,
          my_recruiting_guild_count: 0,
          is_quest_member: true,
        });
        this.quests = { ...this.quests, [questData.id]: questData };
      }
      return res.data[0];
    },
    async updateQuest(data: Partial<Quest>) {
      const params = Object();
      params.id = data.id;
      data = filterKeys(data, questPatchKeys);
      const res: AxiosResponse<QuestData[]> = await api.patch(
        `/quests?id=eq.${params.id}`,
        data,
      );
      if (res.status == 200) {
        const quest = res.data[0];
        // Update the QuestData with the Quest object;
        // assume other fields were not affected.
        const questData: QuestData = Object.assign(
          {},
          this.quests[quest.id],
          quest,
        );
        this.quests = { ...this.quests, [quest.id]: questData };
        this.fullQuests = { ...this.fullQuests!, [quest.id]: true };
      }
    },
    async addQuestMembership(params: Partial<QuestMembership>) {
      const memberStore = useMemberStore();
      const res: AxiosResponse<QuestMembership[]> = await api.post(
        '/quest_membership',
        params,
      );
      if (res.status == 200) {
        const membership = res.data[0];
        const quest = this.quests[membership.quest_id];
        if (quest) {
          const memberships = quest.quest_membership || [];
          memberships.push(membership);
          quest.quest_membership = memberships;
        }
        if (memberStore.member) {
          const memberships =
            memberStore.member.quest_membership!.filter(
              (m: QuestMembership) => m.quest_id != membership.quest_id,
            ) || [];
          memberships.push(membership);
          memberStore.member.quest_membership = memberships;
        }
      }
    },
    async updateQuestMembership(data: Partial<QuestMembership>) {
      const memberStore = useMemberStore();
      const params = Object();
      params.id = data.member_id;
      const res: AxiosResponse<QuestMembership[]> = await api.patch(
        '/quest_membership',
        params,
      );
      if (res.status == 200) {
        const membership = res.data[0];
        const quest = this.quests[membership.quest_id];
        if (quest) {
          const memberships =
            quest.quest_membership?.filter(
              (gp: QuestMembership) => gp.quest_id !== membership.quest_id,
            ) || [];
          memberships.push(membership);
          quest.quest_membership = memberships;
        }
        if (memberStore.member) {
          const memberships =
            memberStore.member.quest_membership!.filter(
              (m: QuestMembership) => m.quest_id != membership.quest_id,
            ) || [];
          memberships.push(membership);
          memberStore.member.quest_membership = memberships;
        }
      }
    },
    async addGamePlay(params: Partial<GamePlay>) {
      const guildStore = useGuildStore();
      const res: AxiosResponse<Partial<GamePlay[]>> = await api.post(
        '/game_play',
        params,
      );
      if (res.status == 201) {
        const game_play: GamePlay | undefined = res.data[0];
        let quest = this.quests[game_play!.quest_id!];
        if (quest) {
          const game_plays = quest.game_play || [] || undefined;
          game_plays.push(game_play!);
          quest = { ...quest, game_play: game_plays };
          this.quests = { ...this.quests, [quest.id]: quest };
        }
        const guild_id = game_play!.guild_id;
        const guild = guildStore.guilds[guild_id!];
        // Assuming it is definitely not there
        if (guild) {
          const game_plays =
            guild.game_play?.filter(
              (gp: GamePlay) => gp.quest_id !== game_play!.quest_id,
            ) || [];
          game_plays.push(game_play!);
          guild.game_play = game_plays;
        }
      }
    },
    async updateGamePlay(data: { id: number }) {
      const guildStore = useGuildStore();
      const params = Object();
      params.id = data.id;
      const res: AxiosResponse<GamePlay[]> = await api.patch(
        '/game_play',
        params,
      );
      if (res.status == 200) {
        const game_play: GamePlay = res.data[0];
        const quest = this.quests[game_play.quest_id!];
        if (quest) {
          const game_plays: GamePlay[] | undefined = quest.game_play?.filter(
            (gp: GamePlay) => gp.quest_id !== game_play.quest_id,
          );
          game_plays!.push(game_play);
          quest.game_play = game_plays;
        }
        const guild_id = game_play.guild_id;
        const guild = guildStore.guilds[guild_id!];
        if (guild) {
          const game_plays =
            guild.game_play?.filter(
              (gp: GamePlay) => gp.quest_id !== game_play.quest_id,
            ) || [];
          game_plays.push(game_play);
          guild.game_play = game_plays;
        }
      }
    },
    async endTurn(data: { quest_id: number }) {
      await api.post('/rpc/end_turn', data);
    },
  },
});
