import { Casting, GamePlay, GuildData, GuildMembership, Member, QuestData } from "src/types";
import { registration_status_enum } from "src/enums";
export const mockCasting1: Casting = {
  guild_id: 1,
  quest_id: 1,
  permissions: [],
  status: "request",
  created_at: "",
  updated_at: ""
}
export const mockCasting2: Casting = {
  guild_id: 1,
  quest_id: 1,
  permissions: [],
  status: "request",
  created_at: "",
  updated_at: ""
}
export const mockGuildMembership: GuildMembership = {
  guild_id: 1,
  member_id: 1,
  permissions: undefined,
  status: registration_status_enum.confirmed,
  created_at: undefined,
  updated_at: undefined,
}
export const mockGamePlay: GamePlay = {
  quest_id: 1,
  guild_id: 1,
  status: "request",
  game_status: "confirmed",
  created_at: "",
  updated_at: ""
}
export const mockGuild1: GuildData = {
  id: 1,
  handle: 'TestGuild',
  slug: undefined,
  name: 'Test Guild',
  description: 'This is a test guild',
  creator: undefined,
  public: true,
  open_for_applications: false,
  created_at: undefined,
  updated_at: undefined,
  application_needs_approval: undefined,
  default_role_id: undefined,
  guild_membership: [],
  game_play: [mockGamePlay],
  casting: [
    mockCasting1
  ],
  member_count: 0,
  member_request_count: 0,
  is_member: false,
  is_admin: false,
  last_node_published_at: "",
  node_count: 0,
  ongoing_quests_count: 0,
  finished_quests_count: 0,
  recruiting_for_quest_count: 0
}
export const mockGuild2: GuildData = {
  id: 2,
  name: 'Test Guild 2',
  description: 'Another test guild description',
  member_count: 8,
  casting: [
    mockCasting2
  ],
  open_for_applications: false,
  last_node_published_at: '2023-02-01T12:00:00Z',
  ongoing_quests_count: 3,
  finished_quests_count: 6,
  member_request_count: 0,
  is_member: false,
  is_admin: false,
  node_count: 0,
  recruiting_for_quest_count: 0,
  handle: "TestGuild2",
  slug: "",
  creator: 0,
  public: true,
  created_at: "",
  updated_at: "",
  application_needs_approval: false,
  default_role_id: 0,
  game_play: [mockGamePlay]
}
export const mockMember: Member = {
  id: 1,
  email: 'johnsmith@email.com',
  handle: 'JohnSmith',
  slug: undefined,
  permissions: [],
  guild_membership: undefined,
  quest_membership: undefined,
  casting: [
    mockCasting1, mockCasting1
  ],
  casting_role: undefined,
  guild_member_available_role: undefined,
  password: undefined,
  created_at: undefined,
  updated_at: undefined,
  name: 'John Smith',
  confirmed: true,
  last_login: undefined,
  last_login_email_sent: undefined,
}

export const mockQuest: QuestData = {
  last_node_published_at: "",
  node_count: 0,
  confirmed_guild_count: 0,
  interested_guild_count: 0,
  player_count: 0,
  is_playing: false,
  my_confirmed_guild_count: 0,
  my_recruiting_guild_count: 0,
  is_quest_member: false,
  id: 1,
  handle: "TestQuest",
  slug: "",
  name: "Test Quest",
  creator: 0,
  public: true,
  turn_based: false,
  status: "ongoing",
  start: "",
  end: "",
  created_at: "",
  updated_at: "",
  quest_membership: [],
  casting:[
    mockCasting1,
    mockCasting2],
  game_play:[mockGamePlay],
}


