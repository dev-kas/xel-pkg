import Tarball from '../models/tarball.model.js';
import logger from '../../common/logger.js';

class TarballsDatabase {
  constructor() {}

  /**
   * Get tarballs by package ID with pagination
   * @param {number} packageId - The ID of the package
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of tarballs to return
   * @param {number} options.offset - Number of tarballs to skip
   * @returns {Promise<Array>} Array of tarballs
   */
  async getByPackageId(packageId, { limit = 20, offset = 0 } = {}) {
    try {
      return await Tarball.find({ package: packageId })
        .sort({ publishedAt: -1 })
        .skip(offset)
        .limit(limit)
        // .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching tarballs for package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Count tarballs by package ID
   * @param {number} packageId - The ID of the package
   * @returns {Promise<number>} Total count of tarballs
   */
  async countByPackageId(packageId) {
    try {
      return await Tarball.countDocuments({ package: packageId });
    } catch (error) {
      logger.error(`Error counting tarballs for package ${packageId}:`, error);
      throw error;
    }
  }

  /**
   * Get tarballs by version ID with pagination
   * @param {number} versionId - The ID of the version
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of tarballs to return
   * @param {number} options.offset - Number of tarballs to skip
   * @returns {Promise<Array>} Array of tarballs
   */
  async getByVersionId(versionId, { limit = 20, offset = 0 } = {}) {
    try {
      return await Tarball.find({ version: versionId })
        .sort({ publishedAt: -1 })
        .skip(offset)
        .limit(limit)
        // .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching tarballs for version ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Count tarballs by version ID
   * @param {number} versionId - The ID of the version
   * @returns {Promise<number>} Total count of tarballs
   */
  async countByVersionId(versionId) {
    try {
      return await Tarball.countDocuments({ version: versionId });
    } catch (error) {
      logger.error(`Error counting tarballs for version ${versionId}:`, error);
      throw error;
    }
  }

  /**
   * Get a tarball by ID
   * @param {number} id - Tarball ID
   * @returns {Promise<Object|null>} Tarball document or null if not found
   */
  async getById(id) {
    try {
      return await Tarball.findOne({ id }).exec();
    } catch (error) {
      logger.error(`Error finding tarball with id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new tarball
   * @param {Object} tarballData - Tarball data
   * @returns {Promise<Object>} Created tarball
   */
  async create(tarballData) {
    try {
      const tarball = new Tarball({
        ...tarballData,
        // Ensure package and version are numbers
        package: Number(tarballData.package),
        version: Number(tarballData.version),
        // Ensure size_bytes is a number
        size_bytes: Number(tarballData.size_bytes) || 0,
      });

      const savedTarball = await tarball.save();
      return savedTarball.toObject();
    } catch (error) {
      logger.error('Error creating tarball:', error);
      throw error;
    }
  }

  /**
   * Delete a tarball by ID
   * @param {number} id - Tarball ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    try {
      const result = await Tarball.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error(`Error deleting tarball with id ${id}:`, error);
      throw error;
    }
  }
}

export default new TarballsDatabase();
