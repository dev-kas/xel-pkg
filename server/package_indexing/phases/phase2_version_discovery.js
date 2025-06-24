import l from '../../common/logger.js';
import path from 'path';
import fs from 'fs';
import semver from 'semver';
import cleanVersionString from '../utils/cleanVersionString.js';

/**
 * Phase 2 of the package indexing process: Discovers versions from the
 * repository by checking out each tag and validating its `xel.json` manifest.
 *
 * @param {Object} git - The git instance
 * @param {Array<string>} tags - An array of tags for the repository
 * @param {string} repoClonePath - The path to the cloned repository
 * @returns {Promise<Object>} - An object with the following properties:
 *   - `packageName`: The name of the package
 *   - `packageDescription`: The description of the package
 *   - `packageAuthor`: The author of the package
 *   - `packageTags`: An array of tags for the package
 *   - `manifests`: An array of manifest objects for each version
 * @throws Will throw an error if the manifest is invalid or required files
 * are missing.
 */
export default async function phase2(git, tags, repoClonePath) {
  l.info(`Phase 2: Discovering versions...`);

  let packageName = null;
  let packageDescription = null;
  let packageAuthor = null;
  let packageTags = [];
  let manifests = [];
  let isDeprecated = false;
  let deprecatedReason = '';

  for (const idx in tags) {
    const tag = tags[idx];

    await git.checkout(tag);

    const manifestPath = path.join(repoClonePath, 'xel.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const name = manifest.name;

    if (!name) {
      throw new Error('Package name is required');
    }

    const name_regex = /^[a-z0-9_]+$/;
    if (!name_regex.test(name)) {
      throw new Error(
        'Package name must contain only lowercase letters, numbers, and underscores'
      );
    }

    let version = manifest.version;
    if (!version) {
      throw new Error('Version is required');
    }

    if (!semver.valid(version)) {
      throw new Error('Invalid version');
    }

    version = semver.clean(version);

    if (version !== semver.clean(tag)) {
      throw new Error('Version does not match tag');
    }

    let xel = manifest.xel || '*';

    if (!(semver.valid(xel) || semver.validRange(xel))) {
      throw new Error('Invalid Xel version requirement');
    }

    xel = cleanVersionString(xel);

    let engine = manifest.engine || '*';

    if (!(semver.valid(engine) || semver.validRange(engine))) {
      throw new Error('Invalid engine version requirement');
    }

    engine = cleanVersionString(engine);

    const mainfile = manifest.main;
    if (!mainfile) {
      throw new Error('Main file is required');
    }

    if (!fs.existsSync(path.join(repoClonePath, mainfile))) {
      throw new Error(`File '${mainfile}' does not exist`);
    }

    if (!packageName) {
      packageName = name;
    } else if (packageName !== name) {
      throw new Error(
        'Package name cannot change throughout the package history'
      );
    }

    manifests.push({
      ...manifest,
      version,
      xel,
      engine,
      main: mainfile,
    });
  }

  packageDescription = manifests[0].description || '';
  packageAuthor = manifests[0].author || '';
  packageTags = manifests[0].tags || [];
  isDeprecated = Object.keys(manifests[0]).includes('deprecated');
  deprecatedReason = manifests[0].deprecated || '';

  return {
    packageName,
    packageDescription,
    packageAuthor,
    packageTags,
    isDeprecated,
    deprecatedReason,
    manifests,
  };
}
