import { registration_status_enum, permission_enum } from "../enums";
import {
  Member,
  Guild,
  Quest,
  QuestMembership,
  GuildMembership,
  Casting,
} from "../types";
import { MyVapi } from "./base";

export const BaseGetters = {
  hasPermission:
    (state) =>
    (
      permission: permission_enum,
      guildN: number | Guild,
      questN: number | Quest
    ) => {
      const member = MyVapi.store.getters["member/getUser"];
      if (!member) return false;
      if (member.permissions.indexOf(permission) >= 0) return true;
      if (member.permissions.indexOf("superadmin") >= 0) return true;
      let guild: Guild;
      let quest: Quest;
      if (guildN) {
        guild =
          typeof guildN == "number"
            ? MyVapi.store.getters["guilds/getGuildById"](guildN)
            : guildN;
        const membership = (guild.guild_membership || []).find(
          (m: GuildMembership) =>
            m.member_id == member.id &&
            m.status == registration_status_enum.confirmed
        );
        if (membership) {
          if (membership.permissions.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a guild permission
          if (membership.permissions.indexOf(permission_enum.guildAdmin) >= 0)
            return true;
        }
      }
      if (questN) {
        quest =
          typeof questN == "number"
            ? MyVapi.store.getters["quests/getQuestById"](questN)
            : questN;
        const membership = (quest.quest_membership || []).find(
          (m: QuestMembership) => m.member_id == member.id && m.confirmed
        );
        if (membership) {
          if (membership.permissions.indexOf(permission) >= 0) return true;
          // TODO: check that permission is a quest permission
          // if (membership.permissions.indexOf(permission_enum.questAdmin) >= 0) return true;
        }
      }
      if (guild && quest) {
        const casting = (quest.casting || []).find(
          (c: Casting) =>
            c.guild_id == guild.id &&
            c.quest_id == quest.id &&
            c.member_id == member.id
        );
        if (casting) {
          if (casting.permissions.indexOf(permission) >= 0) return true;
        }
      }
      return false;
    },
};

export type BaseGetterTypes = typeof BaseGetters;
