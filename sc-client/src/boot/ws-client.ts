import { boot } from 'quasar/wrappers';
import { initWSClient } from '../wsclient';

declare const ws_url: string;

export default boot(async ({ app }) => {
  initWSClient(ws_url);
});
