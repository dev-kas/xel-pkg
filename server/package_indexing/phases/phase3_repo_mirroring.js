import l from '../../common/logger.js';
import { Octokit } from 'octokit';

export default async function phase3(git, id, original_repo_url) {
  l.info(`Phase 3: Mirroring repository...`);

  const octokit = new Octokit({
    userAgent: `${process.env.APP_ID || 'xel-pkg'}`,
    auth: process.env.GITHUB_TOKEN,
  });

  const res = await octokit.rest.repos.createForAuthenticatedUser({
    name: `pkg-${id}`,
    auto_init: false,
    description: `Mirrored repository for ${original_repo_url}`,
  });

  const remotes = await git.getRemotes(true);
  const originExists = remotes.some((remote) => remote.name === 'origin');

  if (originExists) {
    await git.removeRemote('origin');
  }

  const authenticatedUrl = res.data.clone_url.replace(
    'https://',
    `https://${process.env.GITHUB_TOKEN}@`
  );
  await git.addRemote('origin', authenticatedUrl);

  await git.push(['--force', '--mirror', 'origin']);

  return { authenticatedUrl, octokit, res };
}
