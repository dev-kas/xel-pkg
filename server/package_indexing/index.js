import l from '../common/logger.js';
import Processor, { queue } from './processors/submission_processor.js';

export default function IndexPackage(repo, notifyEmail) {
  const processor = new Processor(repo, notifyEmail);
  l.info(`New package for indexing: ${repo} (triggered by ${notifyEmail})`);

  const job = queue.add(async () => {
    await processor.process();
  });

  return job;
}
