// src/components/__tests__/NodeCard.spec.ts
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi  } from 'vitest';
import NodeFormComponent from 'src/components/node-form.vue';
import { mockNode, mockRole } from './mocks/StoreMocks';
import { ibis_node_type_type } from '../../../enums';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';

installQuasarPlugin();
function createWrapper(props= {}) {
  return mount(NodeFormComponent, {
    props: {
      nodeInput: mockNode,
      editing: true,
      ibisTypes: ['reference', 'comment'] as ibis_node_type_type[],
      allowChangeMeta: true,
      roles: [mockRole],
      ...props
    },
  })
}
describe('NodeForm component', () => {
  beforeEach(() => {
    global.document.execCommand = vi.fn();
  });
  it('renders the title and node type button', async () => {
    const wrapper = createWrapper()
    const qInput = wrapper.findComponent({ name: 'q-input' });
    expect(qInput.exists()).toBe(true);
    console.log(wrapper.html())
    const titleInput = wrapper.find('input[aria-label="Node title"]');
    expect((titleInput.element as HTMLInputElement).value).toBe('Test Node');
    const img = wrapper.find('.q-field__prepend img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/icons/ibis/issue.png');
  });
  it('displays URL in q-input when editable, or as a link when not editable', async () => {
    let wrapper = createWrapper({editing: true});
    console.log(wrapper.html());
    const editor = wrapper.findComponent({ name: 'QEditor' });
    expect(editor.exists()).toBe(true);
    expect(editor.props('modelValue')).toBe('Test node description');
    wrapper = createWrapper({editing: false});
    const scrollableDiv = wrapper.find('.scrollable-description');
    expect(scrollableDiv.exists()).toBe(true);
    const descriptionSpan = scrollableDiv.find('.node-card-details');
    expect(descriptionSpan.exists()).toBe(true);
    expect(descriptionSpan.html()).toContain('Test node description');
  })
  it('displays description in q-editor when editable or as html when not editable', () => {
    mockNode.url = 'http://node.example.com';
    const wrapper = createWrapper({editing: true});
    const url =wrapper.find('input[aria-label="URL"]' )
    expect((url.element as HTMLInputElement).value).toBe('http://node.example.com');
  })
  it('q-select for node type selection when in edit mode', () => {
    const wrapper = createWrapper({editing: true});
    const nodeType = wrapper.find('input[aria-label="Type"]')
    expect(nodeType.exists()).toBe(true)
  })
  it('q-select for node status when in edit mode', () => {
    const wrapper = createWrapper({editing: true});
    const nodeType = wrapper.find('input[aria-label="Status"]')
    expect(nodeType.exists()).toBe(true)
  })
  it('Conditionaly display meta checkbox if allowChangeMeta',() => {
    const wrapper = createWrapper({allowChangeMeta: false});
    console.log(wrapper.html())
    const meta = wrapper.find('.q-checkbox')
    expect(meta.exists()).toBe(false)
  })
});
