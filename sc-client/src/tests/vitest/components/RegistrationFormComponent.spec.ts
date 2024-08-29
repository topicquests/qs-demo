import { mount } from '@vue/test-utils';
import { describe, it, expect} from 'vitest';
import { Quasar } from 'quasar';
import RegistrationComponent from '../../../components/registration-form.vue';

describe('RegistrationComponent', () => {
  it('calls validateEmail on blur event and sets emailError correctly', async () => {
    const wrapper = mount(RegistrationComponent,{
      global: {
        plugins: [Quasar],
      },
      $q: {
        dark: { isActive: false },
      },
    });

    console.log(wrapper.html());
    const emailInput = wrapper.find("input[name = 'email']");
    expect(emailInput.exists()).toBe(true);
    await emailInput.setValue('invalid-email');
    await emailInput.trigger('blur');
    const emailErrorSpan = wrapper.find('.text-red');
    expect(emailErrorSpan.text()).toBe('Invalid email format');
  });
});
