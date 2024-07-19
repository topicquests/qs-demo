import { defineStore } from 'pinia';
import {
  registration_status_enum,
  permission_enum,
  ibis_node_type_enum,
} from '../enums';
import {
  Guild,
  Quest,
  QuestMembership,
  GuildMembership,
  Casting,
  CastingRole,
  KeyArray,
  Role,
} from '../types';
import { useMemberStore } from './member';
import { useMembersStore } from './members';
import { useGuildStore } from './guilds';
import { useQuestStore } from './quests';
import { useRoleStore } from './role';
import { useServerDataStore } from './serverData';
import { useReadStatusStore } from './readStatus';
import { useChannelStore } from './channel';

export function filterKeys<T>(data: Partial<T>, keys: KeyArray<T>): Partial<T> {
  return Object.fromEntries(
    keys.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]),
  ) as Partial<T>;
}

export const useBaseStore = defineStore('base', {
  state: () => ({}),
  actions: {
    reset() {
      useMemberStore().resetMember();
      useMembersStore().resetMembers();
      useQuestStore().resetQuests();
      useGuildStore().resetGuilds();
      useRoleStore().resetRole();
      useServerDataStore().resetServer();
      useReadStatusStore().resetReadStatus();
      useChannelStore().resetChannel();
    },
  },
  getters: {
    hasPermission:
      () =>
      (
        permission: permission_enum,
        guildN?: number | Guild,
        questN?: number | Quest,
        nodeType?: ibis_node_type_enum,
      ): boolean => {
        const memberStore = useMemberStore();
        const guildStore = useGuildStore();
        const member = memberStore.getUser;
        if (!member) return false;
        if (member.permissions.includes(permission) || member.permissions.includes('superadmin')) {
          return true;
        }
        
        let guild: Partial<Guild> | undefined = undefined;
        let quest: Partial<Quest> | undefined = undefined;
        
        if (guildN) {
          guild = typeof guildN === 'number' ? guildStore.getGuildById(guildN) : guildN;
          
          if (guild) {
            const membership = (guild.guild_membership || []).find(
              (m: GuildMembership) => m.member_id === member.id && m.status === registration_status_enum.confirmed,
            );
            
            if (membership?.permissions?.includes(permission) || membership?.permissions?.includes(permission_enum.guildAdmin)) {
              return true;
            }
          }
        }
        
        if (questN) {
          quest = typeof questN === 'number' ? useQuestStore().getQuestById(questN) : questN;
          
          if (quest) {
            const membership = (quest.quest_membership || []).find(
              (m: QuestMembership) => m.member_id === member.id && m.confirmed,
            );
            
            if (membership?.permissions?.includes(permission)) {
              return true;
            }
          }
        }
        
        if (guild && quest) {
          const casting = (member.casting || []).find(
            (c: Casting) => c.guild_id === guild.id && c.quest_id === quest.id,
          );
          
          if (casting?.permissions?.includes(permission)) {
            return true;
          }
          
          const roles = (member.casting_role || [])
            .filter(
              (cr: CastingRole) => cr.guild_id === guild.id && cr.quest_id === quest.id,
            )
            .map((cr: CastingRole) => useRoleStore().getRoleById(cr.role_id));
          
          for (const role of roles) {
            if (role?.permissions?.includes(permission)) {
              return true;
            }
            
            if (nodeType) {
              const rnc:Partial<Role> = (role?.role_node_constraint || []).find(
                (rnc) => rnc.node_type === nodeType,
              );
              
              if (rnc?.permissions?.includes(permission)) {
                return true;
              }
            }
          }
        }
        
        return false;
      },
  },
});

