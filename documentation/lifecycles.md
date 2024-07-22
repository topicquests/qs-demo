# Lifecycles

## Quests

Column `public.quests.status` of type `public.quest_status`. The progression is linear, except we can go from paused back to ongoing.

* `draft`: The quest starts in draft, while the quest owners define the initial question. Visible only to quest owner and editors.
* `registration`: The quest is visible, so guilds can register to it, but nobody can play yet.
* `ongoing`: Play is happening
* `paused`: Play is paused, eg. if we want to have a scoring period between rounds.
* `scoring`: Play is ended, final scoring session.
* `finished`: Play is over.

## Guild Membership

Column `public.guild_membership.status` of type `public.registration_status`.

* `request`: The member asked to join the guild, pending approval by the guild admins (only if `guilds.application_needs_approval`)
* `invitation`: The guild invited the member to join, pending approval by the member
* `confirmed`: (default) The member is part of the guild, both are approved.

## GamePlay

Note: Guilds themselves don't have a lifecycle, but their engagement with a specific quest (aka GamePlay) does.
Column `public.game_play.status` of type `public.registration_status` AND Column `public.game_play.play_status`, of type `public.game_play_status`

### registration_status

* `request`: The guild asked to play the quest, pending approval by the quest owners3. Note that right now, `request` is not used, as quests always accept guilds.
* `invitation`: The quest invited the guild to play the quest, pending approval by the guild. (Mostly useful for private quests)
* `confirmed`: (default) The guild will play the quest, both are approved.


### play_status

* `interested`: (default) The guild (admins) decided they may want to play the game, and are trying to build a team from available guild members.
* `cancelled`: The guild decided not to play the game (They could not gather a team)
* `confirmed`: The team is complete, the guild has decided to join the game. More people can still join the game.
* `team_full`: The team is full, no more players can join the game.

## Conversation Nodes

Column `public.conversation_node.status` of type `public.publication_state`. No node may have a status greater than its parent.

* `obsolete`: The node was abandoned. (Linear status seems to preclude this?)
* `private_draft`: (default) The node is in draft, only visible to creator.
* `role_draft`: The node is visible to any guild member with the role given by `draft_for_role_id`. Allows handover.
* `guild_draft`: The node is visible to anybody in the guild.
* `proposed`: The players think the node is good enough to be submitted, pending approval by the game leader.
* `submitted`: The game leader thinks the node is good enough to be submitted to the game. (requires `publishGameMove` permission.)
* `published`: The node is published, visible to all. A published node cannot be unpublished. The transition from `submitted` to `published` can come at end of turn (if `quests.turn_based`; use the `public.end_turn` function) or be automatic otherwise.

Note that transitioning between publication nodes is subjected to a maximum status according to the role permissions in that game. Role permissions can apply to all nodes or to specific node types.

Channel nodes are not subject to role restrictions.

## Game turns

There are currently two modes for quests: real-time and turn-based.
In real-time games, sumbmitted conversation nodes are instantenously published, i.e. become visible to other guilds who can play against them.
In turn-based mode, all guilds submit their conversation nodes during the turn, but they stay submitted (hidden) until the end of turn. At end of turn, all guild's moves become simultaneously published (visible), and the guilds can start a new turn playing against the other guild's moves.
We do not currently have a system where each guild plays in turn (and I am not sure this is of value.)
We do not yet have a system where there would be limitations on the number and types of moves that a guild can make in a turn. That could definitely be interesting, forcing guilds to be strategic. We could also use this as a game dynamic (eg restrict criticism to one guild each term.)
We need a dynamic that requires each guild to score the other guild's moves, and this could happen at the end of each turn (in a distinct phase before the next turn starts); or at the end of the whole quest in a real-time game. This is high on the priority list.
