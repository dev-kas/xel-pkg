import l from '../../common/logger.js';
import { promises as fs } from 'fs';

export default async function cleanup(repoClonePath) {
  l.info(`Cleanup temporary files...`);

  await fs.rm(repoClonePath, { recursive: true, force: true });

  return;
}
