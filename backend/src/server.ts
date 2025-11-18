/**
 * Start script that loads app from ./index in a way that is robust to CommonJS/ESM default export differences.
 */
import * as indexModule from './index';

const app = (indexModule as any).default ?? (indexModule as any).app ?? indexModule;
const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  // simple ASCII-only log to avoid any encoding issues
  // eslint-disable-next-line no-console
  console.log('Backend running on port ' + port);
});

export default app;
