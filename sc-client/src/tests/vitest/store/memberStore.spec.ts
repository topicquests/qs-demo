import AxiosMockAdapter from 'axios-mock-adapter';
import { sign } from 'jws';
import { describe, it, expect, afterEach } from 'vitest';
import { api, TOKEN_EXPIRATION } from '../../../boot/axios';
import { useMemberStore } from '../../../stores/member';
import { PublicMember } from '../../../types';

const memberStore = useMemberStore();

const mockAxios = new AxiosMockAdapter(api);

describe('Member memberStore', () => {
  afterEach(() => mockAxios.reset());
  const mail = 'test@example.com';
  const token = sign({
    header: { alg: 'HS256' },
    payload: { role: 'database_1' },
    secret: 'secret',
  });

  it('gets a token', async () => {
    // using the component, which should make a server response
    const pass = 'password';
    mockAxios
      .onPost('/rpc/get_token', {
        mail,
        pass,
      })
      .reply(200, token);
    mockAxios.onGet('/members').reply(200, { id: 1 });
    const result = await memberStore.signin(mail, 'password');
    expect(mockAxios.history.post.length).toBe(1);
    expect(mockAxios.history.post[0].url).toBe('/rpc/get_token');
    expect(result).toEqual(token);
    expect(memberStore.$state.token).toEqual(token);
    const expiry = new Date(memberStore.$state.tokenExpiry);
    const interval = expiry.getTime() - Date.now();
    expect(interval).toBeGreaterThan(0);
    expect(interval).toBeLessThanOrEqual(TOKEN_EXPIRATION);
  });

  it('fetches the login user', async () => {
    const member: PublicMember = {
      id: 1,
      email: mail,
      handle: 'my alias',
      slug: 'my_alias',
      permissions: [],
    };
    mockAxios
      .onGet('/members', {
        params: {
          id: 'eq.1',
          select:
            '*,quest_membership!member_id(*),guild_membership!member_id(*),casting!member_id(*),casting_role!member_id(*),guild_member_available_role!member_id(*)',
        },
      })
      .reply(200, [member]);

    await memberStore.fetchLoginUser();
    expect(mockAxios.history.get.length).toBeGreaterThan(0);
    // TODO: what is the second get about? it should be mocked as well
    // console.log(mockAxios.history.get);
    expect(memberStore.$state.member).toBeDefined();
  });
  it('resets correctly', async () => {
    await memberStore.resetMember();
    expect(memberStore.$state.token).toBeUndefined();
  });
});
