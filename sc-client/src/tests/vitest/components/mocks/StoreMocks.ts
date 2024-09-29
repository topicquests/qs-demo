import { Casting, ConversationNode, GamePlay, GuildData, GuildMembership, Member, QuestData, Role } from "src/types";
import { registration_status_enum } from "src/enums";
export const mockCasting: Casting = {
  guild_id: 1,
  quest_id: 1,
  member_id: 1,
  permissions: [],
  status: "request",
  created_at: "",
  updated_at: ""
}
export const mockRole: Role = {
  id: 1,
  name: "Researcher",
  guild_id: null,
  max_pub_state: "guild_draft",
  permissions: null,
  role_draft_target_role_id:null,
  role_node_constraint:[{max_pub_state: 'proposed',
    node_type: 'reference',
    role_id:1,
    role_draft_target_role_id:null
  }]
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
export const mockGuild: GuildData = {
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
    mockCasting
  ],
  member_count: 0,
  member_request_count: 0,
  is_member: false,
  is_admin: false,
  last_node_published_at: "2024-09-16T08:38:43.907127-07:00",
  node_count: 0,
  ongoing_quests_count: 0,
  finished_quests_count: 0,
  recruiting_for_quest_count: 0
}
export const mockNode: ConversationNode= {
  id: 1,
  quest_id: 1,
  guild_id: null,
  creator_id: 1,
  ancestry: "1",
  node_type: "question",
  status: "proposed",
  created_at: "2024-08-02T09:25:27.964354-07:00",
  published_at: "",
  updated_at: "2024-08-02T09:25:27.964354-07:00",
  title: "Test Node",
  description: "Test node description",
  url: null,
  meta: "conversation",
  draft_for_role_id: null
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
    mockCasting
  ],
  casting_role: undefined,
  guild_member_available_role: [],
  password: undefined,
  created_at: undefined,
  updated_at: undefined,
  name: 'John Smith',
  confirmed: true,
  last_login: undefined,
  last_login_email_sent: undefined,
}

export const mockQuest: QuestData = {
  last_node_published_at: "2024-09-16T08:38:43.907127-07:00",
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
    mockCasting,
  ],
  game_play:[mockGamePlay],
}


