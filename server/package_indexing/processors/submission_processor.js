import l from '../../common/logger.js';
import PQueue from 'p-queue';
import phase1 from '../phases/phase1_repo_validation.js';
import phase2 from '../phases/phase2_version_discovery.js';
import phase3 from '../phases/phase3_repo_mirroring.js';
import phase4 from '../phases/phase4_tarball_generation.js';
import semver from 'semver';
import cleanup from '../utils/cleanup.js';
import Tarball from '../../api/models/tarball.model.js';
import Package from '../../api/models/package.model.js';
import Version from '../../api/models/version.model.js';

export const queue = new PQueue({
  concurrency: Number(process.env.PACKAGE_INDEXING_CONCURRENCY) || 5,
});

queue.on('active', () => {
  l.info(
    `Processing submission. Queue size: ${queue.size} | Pending: ${queue.pending}`
  );
});

queue.on('idle', () => {
  l.info(`All submissions processed.`);
});

queue.on('add', () => {
  l.info(
    `New submission added to queue. Queue size: ${queue.size} | Pending: ${queue.pending}`
  );
});

queue.on('next', () => {
  l.info(
    `Submission processed. Queue size: ${queue.size} | Pending: ${queue.pending}`
  );
});

queue.on('error', (error) => {
  l.error(`Submission processing error: ${error}`);
});

export default class Processor {
  constructor(repo, notifyEmail) {
    this.repo = repo;
    this.notifyEmail = notifyEmail;
  }

  async process() {
    let repoClonePath = null;
    try {
      const { id, git, repoClonePath: rcp, tags } = await phase1(this.repo);
      repoClonePath = rcp;

      const data = await phase2(git, tags, repoClonePath);

      const { octokit, res: repo_creation_res } = await phase3(
        git,
        id,
        this.repo
      );

      const tarballs = await phase4(
        git,
        tags,
        id,
        octokit,
        repo_creation_res.data.owner.login
      );

      const pkg = new Package({
        name: data.packageName,
        latest: -1,
        description: data.packageDescription.slice(0, 255),
        author: data.packageAuthor,
        repo_name: `pkg-${id}`,
        url: this.repo,
        mirror: repo_creation_res.data.html_url,
        tags: data.packageTags,
        isDeprecated: data.isDeprecated,
        deprecatedReason: data.deprecatedReason,
      });

      const oldPkg = await Package.findOne({ name: data.packageName });
      if (oldPkg && oldPkg.url !== this.repo) {
        throw new Error('Package already exists');
      }

      await pkg.save();

      const vers = (
        await Promise.allSettled(
          data.manifests.map(async (manifest) => {
            const xel = new semver.Range(manifest.xel);
            const engine = new semver.Range(manifest.engine);
            console.log('pkg', pkg);
            return Version.create({
              package: pkg.id,
              version: semver.clean(manifest.version),
              semver: {
                major: semver.major(manifest.version),
                minor: semver.minor(manifest.version),
                patch: semver.patch(manifest.version),
              },
              xel: xel.range,
              engine: engine.range,
              tarball:
                tarballs.find(
                  (tarball) =>
                    semver.clean(tarball.tag) === semver.clean(manifest.version)
                )?.id || -1,
              license: manifest.license,
              dist_mode: semver.prerelease(manifest.version)
                ? 'pre-release'
                : 'release',
            });
          })
        )
      ).map((v) => {
        if (v.status === 'fulfilled') {
          return v.value;
        } else {
          throw v.reason;
        }
      });

      pkg.latest = vers[0]?.id || -1;
      if (oldPkg) {
        oldPkg.latest = pkg.latest;
        oldPkg.description = pkg.description;
        oldPkg.author = pkg.author;
        oldPkg.mirror = pkg.mirror;
        oldPkg.tags = pkg.tags;
        oldPkg.isDeprecated = pkg.isDeprecated;
        oldPkg.deprecatedReason = pkg.deprecatedReason;
        await oldPkg.save();
      } else {
        await pkg.save();
      }

      const tarballDocuments = tarballs.map((tarball, i) => {
        return Tarball.create({
          package: pkg.id,
          version: vers[i]?.id || -1,
          url: tarball.url,
          size_bytes: tarball.size,
          integrity: {
            algorithm: tarball.hashAlgo,
            hash: tarball.hash,
          },
        });
      });

      (await Promise.allSettled(tarballDocuments)).forEach((result, i) => {
        if (result.status === 'fulfilled') {
          l.info(`Tarball ${i + 1} saved successfully.`);
        } else {
          l.error(`Tarball ${i + 1} saving failed: ${result.reason}`);
        }
      });
    } catch (error) {
      l.error(`Submission processing error: ${error}`);
    } finally {
      if (repoClonePath) {
        await cleanup(repoClonePath);
      }
    }
  }
}
