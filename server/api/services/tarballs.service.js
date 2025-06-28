import l from '../../common/logger.js';
import TarballsDbService from './tarballs.db.service.js';

class TarballsService {
  /**
   * Get tarballs by package ID with pagination
   * @param {number} packageId - The ID of the package
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of tarballs to return
   * @param {number} options.offset - Number of tarballs to skip
   * @returns {Promise<Object>} Object containing tarballs and pagination info
   */
  async getByPackageId(packageId, { limit = 20, offset = 0 } = {}) {
    l.info(`${this.constructor.name}.getByPackageId(${packageId})`, {
      limit,
      offset,
    });
    try {
      const [tarballs, total] = await Promise.all([
        TarballsDbService.getByPackageId(packageId, { limit, offset }),
        TarballsDbService.countByPackageId(packageId),
      ]);

      return {
        tarballs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      l.error(`Error in TarballsService.getByPackageId(${packageId}):`, error);
      throw error;
    }
  }

  /**
   * Get tarballs by version ID with pagination
   * @param {number} versionId - The ID of the version
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of tarballs to return
   * @param {number} options.offset - Number of tarballs to skip
   * @returns {Promise<Object>} Object containing tarballs and pagination info
   */
  async getByVersionId(versionId, { limit = 20, offset = 0 } = {}) {
    l.info(`${this.constructor.name}.getByVersionId(${versionId})`, {
      limit,
      offset,
    });
    try {
      const [tarballs, total] = await Promise.all([
        TarballsDbService.getByVersionId(versionId, { limit, offset }),
        TarballsDbService.countByVersionId(versionId),
      ]);

      return {
        tarballs,
        total,
        limit,
        offset,
      };
    } catch (error) {
      l.error(`Error in TarballsService.getByVersionId(${versionId}):`, error);
      throw error;
    }
  }

  /**
   * Get a tarball by ID
   * @param {number} id - Tarball ID
   * @returns {Promise<Object>} Tarball document
   */
  async getById(id) {
    l.info(`${this.constructor.name}.getById(${id})`);
    try {
      const tarball = await TarballsDbService.getById(id);
      if (!tarball) {
        const error = new Error('Tarball not found');
        error.status = 404;
        throw error;
      }
      return tarball;
    } catch (error) {
      l.error(`Error in TarballsService.getById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Create a new tarball
   * @param {Object} tarballData - Tarball data
   * @returns {Promise<Object>} Created tarball
   */
  async create(tarballData) {
    l.info(`${this.constructor.name}.create()`, {
      filename: tarballData?.filename,
    });
    try {
      // Add any business logic/validation here before creating
      return await TarballsDbService.create(tarballData);
    } catch (error) {
      l.error('Error in TarballsService.create:', error);
      throw error;
    }
  }

  /**
   * Delete a tarball by ID
   * @param {number} id - Tarball ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(id) {
    l.info(`${this.constructor.name}.delete(${id})`);
    try {
      const deleted = await TarballsDbService.delete(id);
      if (!deleted) {
        const error = new Error('Tarball not found');
        error.status = 404;
        throw error;
      }
      return true;
    } catch (error) {
      l.error(`Error in TarballsService.delete(${id}):`, error);
      throw error;
    }
  }
}

export default new TarballsService();
