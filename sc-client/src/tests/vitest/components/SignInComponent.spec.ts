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
    const emailInput = wrapper.find('input[type="email"]');
    console.log('EmailInput ', emailInput);
    expect(emailInput.exists()).toBe(true);
  });

  // Test that password input exists
  it('validate password q-input exists', () => {
    const passwordInput = wrapper.find('input[type="password"]');
    expect(passwordInput.exists()).toBe(true);
  });

  // Test form data update
  it('updates form data when input value changes', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    const passwordInput = wrapper.find('input[type="password"]');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    const formData = {
      email: wrapper.vm.mail,
      password: wrapper.vm.pass,
    };

    expect(formData.email).toBe('test@example.com');
    expect(formData.password).toBe('password123');
  });

  // Test password visibility toggle
  it('toggles password visibility', async () => {
    const passwordInput = wrapper.find('input[type="password"]');
    const visibilityIcon = wrapper.find('q-icon[name="visibility"]');

    await visibilityIcon.trigger('click');
    expect(passwordInput.attributes('type')).toBe('text');

    await visibilityIcon.trigger('click');
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
