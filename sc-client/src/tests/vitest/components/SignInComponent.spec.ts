import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import SignInComponent from '../../../components/signin-card.vue';

installQuasarPlugin();

describe('SignInComponent', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(SignInComponent);
  });
  //Test that form exist
  it('validate form exist', async () => {
    const form = wrapper.findComponent({ name: 'QForm' });
    expect(form.exists()).toBe(true);
  });

  // Test that email input exists
  it('validate email q-input exists', async () => {
    const emailInput = await wrapper.find('input[type="email"]');
    expect(emailInput.exists()).toBe(true);
  });

  // Test that password input exists
  it('validate password q-input exists', async () => {
    const passwordInput = await wrapper.find('input[type="password"]');
    expect(passwordInput.exists()).toBe(true);
  });

  // Test form data update
  it('updates form data when input value changes', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = await wrapper.find('input[type="password"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    const formData = {
      email: wrapper.vm.mail,
      password: wrapper.vm.pass,
    };

    expect(formData.email).toBe('test@example.com');
    expect(formData.password).toBe('password123');
  });
  it('check for email icon', async () => {
    const iconElement = wrapper.find('i.q-icon');

    // Check that the <i> element exists
    expect(iconElement.exists()).toBe(true);
  })

  // Test password visibility toggle
  it('toggles password visibility', async () => {
    const passwordInput = wrapper.find('input[type="password"]');
    console.log(wrapper.html())
    await passwordInput.setValue('password')
    // Find the div with specific classes
    const appendDiv = wrapper.find('div.q-field__append.q-field__marginal');
    expect(appendDiv.exists()).toBe(true);
    const iconElement = appendDiv.find('i.q-icon');
    expect(iconElement.exists()).toBe(true);
    expect(iconElement.text()).toBe('visibility_off');

    await iconElement.trigger('click');
    expect(passwordInput.attributes('type')).toBe('text');
    await iconElement.trigger('click');
    expect(passwordInput.attributes('type')).toBe('password');
  });

  // Test that doLogin event is emitted with correct data
  it('emits doLogin event with email and password', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');
    const loginButton = wrapper.find('button[name="loginBtn"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await loginButton.trigger('click');

    expect(wrapper.emitted().doLogin).toBeTruthy();
    expect(wrapper.emitted().doLogin[0]).toEqual([
      'test@example.com',
      'password123',
    ]);
  });
});
