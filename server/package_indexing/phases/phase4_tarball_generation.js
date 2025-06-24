import l from '../../common/logger.js';
import path from 'path';
import fs from 'fs';
import * as hasha from 'hasha';
import { v4 as uuid } from 'uuid';

export default async function phase4(git, tags, id, octokit, owner) {
  l.info(`Phase 4: Generating tarballs...`);

  const tarballs = [];

  for (const tag of tags) {
    const tarballId = uuid().replace(/-/g, '');
    const tarballPath = path.join(
      process.env.TEMP_TARBALL_BASE_DIR || '/tmp',
      `${tarballId}.tar.gz`
    );

    await git.raw([
      'archive',
      tag,
      '.',
      '--format=tar.gz',
      `--output=${tarballPath}`,
    ]);

    const res = await octokit.rest.repos.createRelease({
      owner,
      repo: 'pkg-' + id,
      tag_name: tag,
      name: tag,
      body: 'Release for tag ' + tag,
      draft: false,
      prerelease: false,
    });

    const size = fs.statSync(tarballPath).size;

    const releaseAssetRes = await octokit.rest.repos.uploadReleaseAsset({
      owner,
      repo: 'pkg-' + id,
      release_id: res.data.id,
      name: 'tarball.tar.gz',
      data: fs.createReadStream(tarballPath),
      headers: {
        'content-type': 'application/gzip',
        'content-length': size,
      },
    });

    const hashAlgo = 'sha256';
    const hash = await hasha.hashFile(tarballPath, { algorithm: hashAlgo });

    fs.unlinkSync(tarballPath);

    tarballs.push({
      tag,
      url: releaseAssetRes.data.browser_download_url,
      hash,
      hashAlgo,
      size,
    });
  }

  return tarballs;
}
