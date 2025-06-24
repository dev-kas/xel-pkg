import { v4 as uuid } from 'uuid';
import l from '../../common/logger.js';
import path from 'path';
import simpleGit from 'simple-git';
import semver from 'semver';
import fs from 'fs';
import cleanup from '../utils/cleanup.js';

/**
 * Phase 1 of the package indexing process: Validates the repository
 * by cloning it and checking its `xel.json` manifest file for correctness.
 *
 * @param {string} repo - The URL of the repository
 * @returns {Promise<Object>} - An object with the following properties:
 *   - `git`: The git instance
 *   - `id`: A unique identifier for the package
 *   - `repoClonePath`: The path to the cloned repository
 *   - `tags`: An array of tags for the repository
 */
export default async function phase1(repo) {
  l.info(`Phase 1: Validating repository...`);
  const id = uuid().replace(/-/g, '');

  const repoClonePath = path.join(
    process.env.TEMP_CLONE_BASE_DIR || '/tmp',
    `index-${id}`
  );

  if (fs.existsSync(repoClonePath)) {
    await cleanup(repoClonePath);
  }

  fs.mkdirSync(repoClonePath, { recursive: true });

  const git = simpleGit(repoClonePath);

  await git.clone(repo, repoClonePath);

  let tags = await (async () => {
    try {
      const result = await git.tags();
      return result.all;
    } catch (err) {
      l.error(`Error getting tags for repository ${repo}:`, err);
      return [];
    }
  })();

  tags = tags.filter(semver.valid).sort(semver.compare);

  return {
    git,
    id,
    repoClonePath,
    tags,
  };
}
