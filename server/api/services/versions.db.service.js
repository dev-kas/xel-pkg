import Version from '../models/version.model.js';
import logger from '../../common/logger.js';
import packagesService from './packages.service.js';

class VersionsDatabase {
  constructor() {}

  /**
   * Get all versions for a package with optional pagination
   * @param {string} packageId - Package ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of versions to return
   * @param {number} options.offset - Number of versions to skip
   * @returns {Promise<Array>} Array of versions
   */
  async getByPackageId(packageId, { limit = 20, offset = 0 } = {}) {
    try {
      const pkg = await packagesService.getById(packageId);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return await Version.find({ package: pkg._id })
        .sort({ 'semver.major': -1, 'semver.minor': -1, 'semver.patch': -1 })
        .skip(offset)
        .limit(limit)
        .populate('package', 'name');
    } catch (error) {
      logger.error(`Error fetching versions for package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Count the number of versions for a package
   * @param {string} packageId - Package ID
   * @returns {Promise<number>} Number of versions
   */
  async countPackageVersions(packageId) {
    try {
      const pkg = await packagesService.getById(packageId);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return await Version.countDocuments({ package: pkg._id });
    } catch (error) {
      logger.error(`Error counting versions for package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Get a version by ID
   * @param {string} id - Version ID
   * @returns {Promise<Object|null>} Version document or null if not found
   */
  async getById(id) {
    try {
      return await Version.findOne({id}).populate('package', 'name');
    } catch (error) {
      logger.error(`Error finding version by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific version of a package
   * @param {string} packageId - Package ID
   * @param {string} version - Version string (e.g., "1.0.0")
   * @returns {Promise<Object|null>} Version document or null if not found
   */
  async getByVersion(packageId, version) {
    try {
      const pkg = await packagesService.getById(packageId);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return await Version.findOne({ 
        package: pkg._id, 
        version: version 
      }).populate('package', 'name');
    } catch (error) {
      logger.error(`Error finding version ${version} for package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new version
   * @param {Object} versionData - Version data
   * @returns {Promise<Object>} Created version
   */
  async create(versionData) {
    try {
      const version = new Version({
        ...versionData,
        semver: {
          major: versionData.semver.major,
          minor: versionData.semver.minor,
          patch: versionData.semver.patch,
        },
        xel: versionData.xel || { major: 0, minor: 0, patch: 0 },
        virtlang: versionData.virtlang || { major: 0, minor: 0, patch: 0 },
        deps: versionData.deps || [],
      });

      const savedVersion = await version.save();
      return savedVersion.populate('package', 'name');
    } catch (error) {
      logger.error('Error creating version:', error);
      throw error;
    }
  }

  /**
   * Update a version
   * @param {string} id - Version ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} Updated version or null if not found
   */
  async update(id, updateData) {
    try {
      // Handle semver updates if provided
      if (updateData.semver) {
        updateData.semver = {
          major: updateData.semver.major,
          minor: updateData.semver.minor,
          patch: updateData.semver.patch,
        };
      }

      return await Version.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).populate('package', 'name');
    } catch (error) {
      logger.error(`Error updating version ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a version
   * @param {string} id - Version ID
   * @returns {Promise<Object|null>} Deleted version or null if not found
   */
  async delete(id) {
    try {
      return await Version.findOneAndDelete({ id }).populate('package', 'name');
    } catch (error) {
      logger.error(`Error deleting version ${id}:`, error);
      throw error;
    }
  }

  /**
   * Increment download count for a version
   * @param {string} id - Version ID
   * @returns {Promise<Object|null>} Updated version or null if not found
   */
  async incrementDownloads(id) {
    try {
      return await Version.findOneAndUpdate(
        { id },
        { $inc: { downloads: 1 } },
        { new: true }
      ).populate('package', 'name');
    } catch (error) {
      logger.error(`Error incrementing downloads for version ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest version of a package
   * @param {string} packageId - Package ID
   * @returns {Promise<Object|null>} Latest version or null if not found
   */
  async getLatest(packageId) {
    try {
      return await Version.findOne({ package: packageId })
        .sort({ 'semver.major': -1, 'semver.minor': -1, 'semver.patch': -1 })
        .limit(1)
        .populate('package', 'name');
    } catch (error) {
      logger.error(`Error getting latest version for package ${packageId}:`, error);
      throw error;
    }
  }
}

export default new VersionsDatabase();
