import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import RegistrationFormComponent from '../../../components/registration-form.vue';

describe('RegistrationFormComponent', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RegistrationFormComponent);
  });
  // Assert that email input exists
  it('validate email q-input exists', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    console.log('EmailInput ', emailInput);
    expect(emailInput.exists()).toBe(true);
  });

  // Assert that formdata.email is updated correctly
  it('updates form data when input value changes', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('tomhanks@email.com');
    await emailInput.trigger('input');
    const formData = wrapper.vm.getFormData();
    expect(formData.email).toBe('tomhanks@email.com');
  });

  // Assert that the emailError is set correctly
  it('validates email correctly', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');
    expect(wrapper.text()).toContain('Invalid email format');
    await emailInput.setValue('valid@email.com');
    await emailInput.trigger('blur');
    expect(wrapper.text()).not.toContain('Invalid email format');
  });

  // Assert that the event is emitted with the correct form data
  it('emits the doRegister event with form data', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('tomhanks@email.com');
    const nameInput = wrapper.find('input[name="name"]');
    await nameInput.setValue('Tom Hanks');
    const handleInput = wrapper.find('input[name="handle"]');
    await handleInput.setValue('tomhanks');
    const passwordInput = wrapper.find('input[name="password"]');
    await passwordInput.setValue('password123');
    const registerButton = wrapper.find('button[name="registerButton"]');
    await registerButton.trigger('click');
    expect(wrapper.emitted().doRegister).toBeTruthy();
    expect(wrapper.emitted().doRegister[0][0]).toEqual({
      email: 'tomhanks@email.com',
      name: 'Tom Hanks',
      handle: 'tomhanks',
      password: 'password123',
    });
  });
});
