import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RegistrationFormComponent from '../../../components/registration-form.vue';

installQuasarPlugin();

describe('RegistrationFormComponent', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(RegistrationFormComponent);
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
    const validateEmailSpy = vi.spyOn(wrapper.vm, 'validateEmail');
    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.exists()).toBe(true)
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');
    await wrapper.vm.$nextTick();
    console.log(wrapper.html())
    expect(wrapper.find('span').text()).toBe('Invalid email format');
    expect(validateEmailSpy).toHaveBeenCalled();
    expect(wrapper.vm.emailError).toBe('Invalid email format');

  });

  // Assert that the event is emitted with the correct form data
  it('emits the doRegister event with form data', async () => {
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('tomhanks@email.com');
    const nameInput = await wrapper.find('input[name="name"]');
    await nameInput.setValue('Tom Hanks');
    const handleInput = await wrapper.find('input[name="handle"]');
    await handleInput.setValue('tomhanks');
    const passwordInput = await wrapper.find('input[name="password"]');
    await passwordInput.setValue('password123');
    const registerButton = await wrapper.find('button[name="registerButton"]');
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
