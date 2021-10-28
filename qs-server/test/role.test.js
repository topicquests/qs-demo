const assert = require('assert');
const { axiosUtil } = require('./utils');

describe('\'guilds\' service', () => {

  describe('guild creation', () => {
    const quidamInfo = {
      email: 'quidam@example.com',
      handle: 'quidam',
      name: 'Quidam',
      password: 'supersecret'
    };
    const superadmin = {
      email: 'superadmin@example.com',
      handle: 'superadmin',
      name: 'Super Admin',
      password: 'supersecret',
      permissions: ['superadmin']
    };
    const leaderInfo = {
      email: 'guild_leader@example.com',
      handle: 'guild_leader',
      name: 'Guild Leader',
      password: 'supersecret',
      permissions: ['createGuild']
    };
    const guildPlayer = {
      email: 'guild_player@example.com',
      handle: 'guild_player',
      name: 'Guild Player',
      password: 'supersecret',
    };
    const publicGuildInfo = {
      name: 'My great guild',
      handle: 'pubguild',
      public: true,
      open_for_applications: true,
      application_needs_approval: false,
    };
    const sponsorInfo = {
      email: 'sponsor@example.com',
      handle: 'sponsor',
      name: 'Quest Sponsor',
      password: 'supersecret',
      permissions: ['createQuest']
    };
    const publicQuestInfo = {
      name: 'My great quest',
      handle: 'pubquest',
      status: 'registration',
      public: true,
      start: new Date(),
      end: new Date(Date.now() + 100000000000),
    };

    var adminToken, quidamId, superadminId, leaderId, playerId, sponsorId,
      publicGuildId, publicQuestId, sponsorToken, superadminToken, leaderToken,
      quidamToken, playerToken, sysRoleId, guildRoleId;

    before(async () => {
      adminToken = await axiosUtil.call('get_token', {
        mail: 'admin@example.com', pass: 'admin'
      });
      superadminId = await axiosUtil.call('create_member', superadmin);
      leaderId = await axiosUtil.call('create_member', leaderInfo);
      playerId = await axiosUtil.call('create_member', guildPlayer);
      sponsorId = await axiosUtil.call('create_member', sponsorInfo);
      quidamId = await axiosUtil.call('create_member', quidamInfo);
      quidamToken = await axiosUtil.call('get_token', {
        mail: 'quidam@example.com', pass: 'supersecret'
      }, null, false);
      superadminToken = await axiosUtil.call('get_token', {
        mail: 'superadmin@example.com', pass: 'supersecret'
      }, null, false);
      leaderToken = await axiosUtil.call('get_token', {
        mail: 'guild_leader@example.com', pass: 'supersecret'
      }, null, false);
      playerToken = await axiosUtil.call('get_token', {
        mail: 'guild_player@example.com', pass: 'supersecret'
      }, null, false);
      sponsorToken = await axiosUtil.call('get_token', {
        mail: 'sponsor@example.com', pass: 'supersecret'
      }, null, false);
    });

    after(async () => {
      if (process.env.NOREVERT)
        return;
      if (publicGuildId)
        await axiosUtil.delete('guilds', {id: publicGuildId}, adminToken);
      if (publicQuestId)
        await axiosUtil.delete('quests', {id: publicQuestId}, adminToken);
      if (quidamId)
        await axiosUtil.delete('members', {id: quidamId}, adminToken);
      if (superadminId)
        await axiosUtil.delete('members', {id: superadminId}, adminToken);
      if (leaderId)
        await axiosUtil.delete('members', {id: leaderId}, adminToken);
      if (playerId)
        await axiosUtil.delete('members', {id: playerId}, adminToken);
      if (sponsorId)
        await axiosUtil.delete('members', {id: sponsorId}, adminToken);
    });

    describe('guild creation by authorized user', () => {
      const game_play_id = {};
      it('creates public quest', async () => {
        const publicQuestModel = await axiosUtil.create('quests', publicQuestInfo, sponsorToken);
        publicQuestId = publicQuestModel.id;
        game_play_id.quest_id = publicQuestId;
        const quests = await axiosUtil.get('quests', {}, leaderToken);
        assert.equal(quests.length, 1);
      });
      it('creates public guild', async () => {
        const publicGuildModel = await axiosUtil.create('guilds', publicGuildInfo, leaderToken);
        publicGuildId = publicGuildModel.id;
        game_play_id.guild_id = publicGuildId;
        const guilds = await axiosUtil.get('guilds', {}, leaderToken);
        assert.equal(guilds.length, 1);
      });
      it('guild leader can register guild to quest', async () => {
        const register = await axiosUtil.create('game_play', game_play_id, leaderToken);
        assert.ok(register);
        const game_play = await axiosUtil.get('game_play', game_play_id, leaderToken);
        assert.equal(game_play.length, 1);
        assert.equal(game_play[0].status, 'confirmed');
      });
      it('guild leader can then self-register to quest', async () => {
        const register = await axiosUtil.create('casting', {
          member_id: leaderId,
          ...game_play_id
        }, leaderToken);
        assert.ok(register);
      });
      it('quidam can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: quidamId,
          guild_id: publicGuildId,
        }, quidamToken);
        console.log(register);
        assert.ok(register);
      });
      it('player can register to guild', async () => {
        const register = await axiosUtil.create('guild_membership', {
          member_id: playerId,
          guild_id: publicGuildId,
        }, playerToken);
        console.log(register);
        assert.ok(register);
      });
      it('guild leader can call global registration', async () => {
        await axiosUtil.call('register_all_members', {
          guildid: publicGuildId,
          questid: publicQuestId,
        }, leaderToken);
      });
      // TODO: Should we prevent others from calling this function?
      it('global registration registered quidam', async () => {
        const registers = await axiosUtil.get('casting', game_play_id, leaderToken);
        assert.equal(registers.length, 3);
        const quidam_r = registers.find(r => r.member_id == quidamId);
        console.log(registers);
        assert.ok(quidam_r);
      });
      //Role tests
      //GuildAdm create new role
      it('guild admin create new role', async () => {
        var newRole = {
          guild_id: publicGuildId,
          name: 'test_role'
        };
        const guildRole = await axiosUtil.create('role', newRole, leaderToken);
        guildRoleId = guildRole.id;
        console.log(guildRole);
      });
      //Superadmin create new role
      it('superadmin create new role', async () => {
        const sysRole = await axiosUtil.create('role', {
          name: 'super_role'}, superadminToken);
        sysRoleId = sysRole.id;
        console.log(sysRole);
      });
      //player cannot create new role
      it('player cannot create new role', async () => {
        await assert.rejects( async() => {
          await axiosUtil.create('role', {
            name: 'player_role',}, playerToken);
        }, 'GeneralError');
      });
      //guildadmin cannot create new role without guildId
      it('guildadmin cannot create new role without guildId', async () => {
        await assert.rejects(async() => {
          await axiosUtil.create('role', {
            name: 'guild_role',}, leaderToken);
        }, 'GeneralError');
      });
      //Player attempts to select casting role before guild admin creates
      it('Cannot select casting role before guildadmin allows', async() => {
        await assert.rejects( async() => {
          await axiosUtil.create('casting_role', {
            member_id: playerId,
            quest_id: publicQuestId,
            guild_id: publicGuildId,
            role_id: sysRoleId}, playerToken);
        }, 'GeneralError');
      });
      //GuildAdmin select sys roles for player
      it('guildadmin select sys roles for player', async () => {
        const sysRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          role_id: sysRoleId,
          guild_id: publicGuildId},
        leaderToken);
        console.log(sysRole);
        assert.ok(sysRole);
      });
      //GuildAdmin select roles for player
      it('guildadmin select guild roles for player', async () => {
        const guildRole = await axiosUtil.create('guild_member_available_role', {
          member_id: playerId,
          guild_id: publicGuildId,
          role_id: guildRoleId},
        leaderToken);
        console.log(guildRole);
      });
      //Player selects casting role after guild admin creates
      it('Player select casting role', async() => {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: sysRoleId}, playerToken);
      });
      //Player selects second casting role after guild admin creates
      it('Player select casting role', async() => {
        await axiosUtil.create('casting_role', {
          member_id: playerId,
          quest_id: publicQuestId,
          guild_id: publicGuildId,
          role_id: guildRoleId}, playerToken);
      });
    });
  });
});