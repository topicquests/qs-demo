import { defineStore } from 'pinia';
import { AxiosResponse } from 'axios';
import { Member, CastingRole, memberPatchKeys } from '../types';
import { getWSClient } from '../wsclient';
import { useBaseStore, filterKeys } from './baseStore';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { api, token_store, TOKEN_EXPIRATION } from '../boot/axios';
import { useMembersStore } from './members';

export interface MemberState {
  member?: Partial<Member>;
  token?: string;
  tokenExpiry?: number;
  isAuthenticated: boolean;
}

const TOKEN_RENEWAL = (TOKEN_EXPIRATION * 9) / 10;

type decodedToken = {
  role: string;
  exp: number;
};

const baseState: MemberState = {
  member: undefined,
  isAuthenticated: false,
  token: undefined,
  tokenExpiry: undefined,
};
const clearBaseState: MemberState = {
  member: undefined,
  isAuthenticated: false,
  token: undefined,
  tokenExpiry: undefined,
};

export const useMemberStore = defineStore('member', {
  state: () => baseState,
  getters: {
    getUser: (state: MemberState) => state.member,
    getUserId: (state: MemberState) => state.member?.id,
    getMembersAvailableRoles: (state: MemberState) =>
      state.member?.guild_member_available_role,
    tokenIsValid: () => token_store.tokenIsValid(),
    getUserById: (state: MemberState) => (id: number) =>
      state.member?.id == id ? state.member : null,
    getCastingRoles: (state: MemberState) => state.member?.casting_role,
    castingPerQuest: (state: MemberState) =>
      Object.fromEntries(
        (state.member?.casting || []).map((c) => [c.quest_id, c]),
      ),
    guildPerQuest: (state: MemberState) =>
      Object.fromEntries(
        (state.member?.casting || []).map((c) => [c.quest_id, c.guild_id]),
      ),
    castingRolesForQuest: (state: MemberState) => (questId: number) => {
      if (state.member?.casting_role) {
        return state.member.casting_role.filter(
          (role) => role.quest_id == questId,
        );
      }
    },
    castingRolesPerQuest: (state: MemberState) => {
      const castingRolesPerQuest: { [id: number]: CastingRole[] } = {};
      state.member?.casting_role?.forEach((cr) => {
        if (!castingRolesPerQuest[cr.quest_id]) {
          castingRolesPerQuest[cr.quest_id] = [];
        }
        castingRolesPerQuest[cr.quest_id].push(cr);
      });
      return castingRolesPerQuest;
    },
  },
  actions: {
    async logout() {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('tokenExpiry');
      // legacy
      window.localStorage.removeItem('email');
      getWSClient().logout();
      useBaseStore().reset();
    },
    async signin(mail: string, pass: string): Promise<string | undefined> {
      const res: AxiosResponse<string> = await api.post('/rpc/get_token', {
        mail,
        pass,
      });
      if (res.status == 200) {
        this.token = res.data;
        this.tokenExpiry = Date.now() + TOKEN_EXPIRATION;
        this.isAuthenticated = true;
        const storage = window.localStorage;
        storage.setItem('token', this.token);
        storage.setItem('tokenExpiry', this.tokenExpiry.toString());
        token_store.setToken(this.token, this.tokenExpiry);
        window.setTimeout(() => {
          this.renewToken();
        }, TOKEN_RENEWAL);
        await this.fetchLoginUser();
        return res.data;
      }
    },
    async registerUser(data: Partial<Member>): Promise<Partial<Member>> {
      return await this.registerUserCrypted(data);
    },

    async ensureLoginUser(): Promise<Member | undefined> {
      // TODO: the case where the member is pending
      if (!this.member) {
        const expiry =
          this.tokenExpiry || window.localStorage.getItem('tokenExpiry');
        if (typeof expiry === 'string') {
          if (expiry && Date.now() < Number.parseInt(expiry)) {
            await this.fetchLoginUser();
            if (!this.tokenExpiry) {
              // add a commit for expiry?
            }
          }
        }
      }
      return this.member;
    },
    resetMember() {
      token_store.clearToken();
      this.isAuthenticated = false;
      Object.assign(this, clearBaseState);
    },

    //Axios calls
    async fetchLoginUser(): Promise<Member | undefined> {
      const token = token_store.getToken();
      if (!token) {
        return undefined;
      }
      const token_payload = jwtDecode<decodedToken>(token); //jwtDecode(token);
      const parts: string[] = token_payload.role.split('_');
      const role = parts[parts.length - 1];
      const res: AxiosResponse<Member[]> = await api.get('/members', {
        params: {
          id: `eq.${role}`,
          select:
            '*,quest_membership!member_id(*),guild_membership!member_id(*),casting!member_id(*),casting_role!member_id(*),guild_member_available_role!member_id(*)',
        },
      });
      if (res.status == 200) {
        this.member = res.data[0];
        this.isAuthenticated = true;
        this.token = token;
      } else {
        this.resetMember();
        console.error(res.status);
        console.error(res.data);
      }
      return this.member;
    },
    async renewToken(token: string) {
      //const token = token_store.getToken();
      const res: AxiosResponse<string> = await api.post('/rpc/renew_token', {
        token,
      });
      if (res.status == 200) {
        if (res.data) {
          token_store.setToken(res.data);
          window.setTimeout(() => {
            this.renewToken(token);
          }, TOKEN_RENEWAL);
        } else {
          Object.assign(this, baseState);
          token_store.clearToken();
          console.log('Renewal failed.');
        }
      } else {
        Object.assign(this, baseState);
        token_store.clearToken();
        console.error(res.data);
      }
    },
    async sendConfirmEmail(email: string) {
      await api.get('/rpc/send_login_email', {
        params: { email },
        headers: { Authorization: null },
      });
    },
    async registerUserCrypted(data: Partial<Member>): Promise<Partial<Member>> {
      const membersStore = useMembersStore();
      const res: AxiosResponse<Member> = await api.post(
        '/rpc/create_member',
        data,
      );
      if (res.status == 200) {
        await membersStore.ensureMemberById(res.data.id, false);
      }
      return res.data;
    },
    async updateUser(data: Partial<Member>): Promise<Member> {
      data = filterKeys(data, memberPatchKeys);
      const params = {
        id: `eq.${data.id}`,
      };
      const res: AxiosResponse<Member[]> = await api.patch('/members', data, {
        params,
      });
      this.member = Object.assign({}, this.member, res.data[0]);
      return this.member;
    },

    removeCastingRole(castingRole: CastingRole) {
      if (
        this.member &&
        this.member.casting_role !== undefined &&
        this.member.casting_role.length > 0 &&
        this.member.id == castingRole.member_id
      ) {
        const { casting_role } = this.member;
        const pos = casting_role.findIndex(
          (a: CastingRole) =>
            a.role_id == castingRole.role_id &&
            a.member_id == castingRole.member_id &&
            a.guild_id == castingRole.guild_id,
        );
        if (pos >= 0) {
          casting_role.splice(pos, 1);
          this.member = { ...this.member, casting_role };
        }
      }
    },
  },
});
