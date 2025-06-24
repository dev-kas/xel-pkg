import l from '../../common/logger.js';
import db from './versions.db.service.js';
import Package from '../models/package.model.js';

class VersionsService {
  /**
   * Get all versions for a package
   * @param {string} packageId - Package ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of versions to return
   * @param {number} options.offset - Number of versions to skip
   * @returns {Promise<Object>} Object containing versions and pagination info
   */
  async getByPackageId(packageId, options = {}) {
    l.info(
      `${this.constructor.name}.getByPackageId(${packageId}, ${JSON.stringify(options)})`
    );
    try {
      const [versions, total] = await Promise.all([
        db.getByPackageId(packageId, options),
        db.countPackageVersions(packageId),
      ]);

      return {
        versions,
        total,
        limit: options.limit || 20,
        offset: options.offset || 0,
      };
    } catch (error) {
      l.error(
        `Error in VersionsService.getByPackageId(${packageId}, ${JSON.stringify(options)}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Get a version by ID
   * @param {string} id - Version ID
   * @returns {Promise<Object>} Version document
   */
  async getById(id) {
    l.info(`${this.constructor.name}.getById(${id})`);
    try {
      const version = await db.getById(id);
      if (!version) {
        const error = new Error('Version not found');
        error.status = 404;
        throw error;
      }
      return version;
    } catch (error) {
      l.error(`Error in VersionsService.getById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get a specific version of a package
   * @param {string} packageId - Package ID
   * @param {string} version - Version string (e.g., "1.0.0")
   * @returns {Promise<Object>} Version document
   */
  async getByVersion(packageId, version) {
    l.info(`${this.constructor.name}.getByVersion(${packageId}, ${version})`);
    try {
      const versionDoc = await db.getByVersion(packageId, version);
      if (!versionDoc) {
        const error = new Error(`Version ${version} not found`);
        error.status = 404;
        throw error;
      }
      return versionDoc;
    } catch (error) {
      l.error(
        `Error in VersionsService.getByVersion(${packageId}, ${version}):`,
        error
      );
      throw error;
    }
  }

  /**
   * Create a new version
   * @param {Object} versionData - Version data
   * @returns {Promise<Object>} Created version
   */
  async create(versionData) {
    l.info(`${this.constructor.name}.create()`, {
      package: versionData.package,
      version: versionData.version,
    });

    try {
      // Check if package exists
      const pkg = await Package.findById(versionData.package);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }

      // Check if version already exists
      const existingVersion = await db.getByVersion(
        versionData.package,
        versionData.version
      );
      if (existingVersion) {
        const error = new Error(
          `Version ${versionData.version} already exists for this package`
        );
        error.status = 409; // Conflict
        throw error;
      }

      // Create the version
      const version = await db.create(versionData);

      // Update package's latest version if this is the first version or newer than current latest
      const latest = await db.getLatest(versionData.package);
      if (!latest || this._isNewerVersion(version, latest)) {
        pkg.latest = version._id;
        await pkg.save();
      }

      return version;
    } catch (error) {
      l.error('Error in VersionsService.create:', error);
      throw error;
    }
  }

  /**
   * Update a version
   * @param {string} id - Version ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated version
   */
  async update(id, updateData) {
    l.info(`${this.constructor.name}.update(${id})`, { updateData });
    try {
      const version = await db.update(id, updateData);
      if (!version) {
        const error = new Error('Version not found');
        error.status = 404;
        throw error;
      }
      return version;
    } catch (error) {
      l.error(`Error in VersionsService.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a version
   * @param {string} id - Version ID
   * @returns {Promise<Object>} Deleted version
   */
  async delete(id) {
    l.info(`${this.constructor.name}.delete(${id})`);
    try {
      const version = await db.getById(id);
      if (!version) {
        const error = new Error('Version not found');
        error.status = 404;
        throw error;
      }

      // Don't allow deleting the only version of a package
      const versions = await db.getByPackageId(version.package);
      if (versions.length === 1) {
        const error = new Error('Cannot delete the only version of a package');
        error.status = 400;
        throw error;
      }

      const deleted = await db.delete(id);

      // If this was the latest version, update the package's latest version
      const pkg = await Package.findById(version.package);
      if (pkg.latest.toString() === id) {
        const latest = await db.getLatest(version.package);
        pkg.latest = latest ? latest._id : null;
        await pkg.save();
      }

      return deleted;
    } catch (error) {
      l.error(`Error in VersionsService.delete(${id}):`, error);
      throw error;
    }
  }

  /**
   * Increment download count for a version
   * @param {string} id - Version ID
   * @returns {Promise<Object>} Updated version
   */
  async incrementDownloads(id) {
    l.info(`${this.constructor.name}.incrementDownloads(${id})`);
    try {
      const version = await db.incrementDownloads(id);
      if (!version) {
        const error = new Error('Version not found');
        error.status = 404;
        throw error;
      }
      return version;
    } catch (error) {
      l.error(`Error in VersionsService.incrementDownloads(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get the latest version of a package
   * @param {string} packageId - Package ID
   * @returns {Promise<Object>} Latest version
   */
  async getLatest(packageId) {
    l.info(`${this.constructor.name}.getLatest(${packageId})`);
    try {
      const version = await db.getLatest(packageId);
      if (!version) {
        const error = new Error('No versions found for this package');
        error.status = 404;
        throw error;
      }
      return version;
    } catch (error) {
      l.error(`Error in VersionsService.getLatest(${packageId}):`, error);
      throw error;
    }
  }

  /**
   * Compare two versions to determine if version1 is newer than version2
   * @private
   * @param {Object} version1 - First version document
   * @param {Object} version2 - Second version document
   * @returns {boolean} True if version1 is newer than version2
   */
  _isNewerVersion(version1, version2) {
    if (version1.semver.major > version2.semver.major) return true;
    if (version1.semver.major < version2.semver.major) return false;

    if (version1.semver.minor > version2.semver.minor) return true;
    if (version1.semver.minor < version2.semver.minor) return false;

    return version1.semver.patch > version2.semver.patch;
  }
}

export default new VersionsService();
