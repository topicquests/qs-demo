import assert from 'assert';
import { axiosUtil, delete_members } from './utils';
import { adminInfo, quidamInfo } from './fixtures';
import { decode } from 'libqp';

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

describe('authentication', function () {
  // eslint-disable-next-line prefer-const
  let memberId: number | null = null, adminToken, token;
  const mailhog_auth = { 'Authorization': 'Basic dGVzdDp0ZXN0' }  // test:test
  before(async function () {
    adminToken = await axiosUtil.call('get_token', {
      mail: adminInfo.email, pass: adminInfo.password
    });
  });
  after(async function () { 
    if (memberId)
      await delete_members({ 'quidam': memberId }, adminToken);
  });
  it('authenticates admin and creates accessToken', async function() {
    const member = await axiosUtil.get(
      'members',
      { email: adminInfo.email },
      adminToken
    );
    assert.equal(member.length, 1);
    assert.ok(member, 'Obtained user using adminToken');
  });
  it('creates a new user without confirmation', async function () {
    await axiosUtil.call('create_member', quidamInfo);
    const quidamData = await axiosUtil.get(
      'members',
      { email: quidamInfo.email! },
      adminToken
    );
    assert.equal(quidamData.length, 1);
    assert(quidamData[0].confirmed == false);
    memberId = quidamData[0].id;
  });
  it('cannot login yet', async function () {
    await assert.rejects(async () => {
      await axiosUtil.call('get_token', {
        mail: quidamInfo.email, pass: quidamInfo.password
      });
    }, /invalid confirmed/);
  });
  it('obtains a confirmation email', async function () {
    // wait for MailHog
    await delay(500);
    const axios = axiosUtil.axios;
    try {
      const messageSearch = await axios.get('http://localhost:8025/api/v2/search', {
        params: {
          kind: 'to',
          query: quidamInfo.email
        },
        headers: mailhog_auth
      });
      assert.notEqual(messageSearch.data.total, 0);
      const email = messageSearch.data.items[0]
      const textParts = email.MIME.Parts.filter(x => (((x.Headers || {})['Content-Type'] || [''])[0].indexOf('text/plain') >= 0))
      assert.equal(textParts.length, 1)
      let text: string = textParts[0].Body
      if (textParts[0].Headers['Content-Transfer-Encoding'] == 'quoted-printable')
        text = decode(text).toString()
      const token_search = /token=(.*)/.exec(text)
      assert(token_search)
      token = token_search[1]
    } catch (error) {
      console.error(error)
    }
  });
  it('uses the token to set confirmation', async function () {
    await axiosUtil.call('renew_token', {token});
    const quidamData = await axiosUtil.get(
      'members',
      { email: quidamInfo.email! },
      adminToken
    );
    assert.equal(quidamData.length, 1);
    assert(quidamData[0].confirmed);
  });
  it.skip('cannot login with old confirm token', async function () {
    await assert.rejects(async () => {
      await axiosUtil.call('renew_token', { token });
    }, /invalid old_token/);
  });
  it('ask for a reset password', async function () {
    // TODO: ask for a password reset. We should get an email with token.
  });
  it('ask for a second reset password', async function () {
    // TODO: ask for a second password reset immediately. Should fail.
  });
  it('login with email token', async function () {
    // TODO: login using the token obtained from first password reset as parameter
    // obtain a normal (header) token back.
  });
  it('change password', async function () {
    // TODO: change password. try logging in with new password
  });
  it('cannot login with old email token', async function () {
    // TODO: try to login using the old token obtained from password reset
    // expect fail
  });
});
