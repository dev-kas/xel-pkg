import l from '../../common/logger.js';
import db from './packages.db.service.js';

class PackagesService {
  /**
   * Get all packages with optional filtering and pagination
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of packages to return
   * @param {number} options.offset - Number of packages to skip
   * @param {string} options.query - Search query string
   * @param {string[]} options.tags - Filter by tags
   * @param {boolean} options.deprecated - Include deprecated packages
   * @returns {Promise<Object>} Object containing packages and total count
   */
  async getAll(options = {}) {
    l.info(`${this.constructor.name}.getAll()`, { options });
    try {
      const [packages, total] = await Promise.all([
        db.all(options),
        db.count({
          query: options.query || '',
          tags: options.tags || [],
          deprecated: options.deprecated || false,
        }),
      ]);

      return {
        packages,
        total,
        limit: options.limit || 20,
        offset: options.offset || 0,
      };
    } catch (error) {
      l.error('Error in PackagesService.getAll:', error);
      throw error;
    }
  }

  /**
   * Get a package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Package document
   */
  async getById(id) {
    l.info(`${this.constructor.name}.getById(${id})`);
    try {
      const pkg = await db.getById(id);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesService.getById(${id}):`, error);
      throw error;
    }
  }

  /**
   * Get a package by name
   * @param {string} name - Package name
   * @returns {Promise<Object>} Package document
   */
  async getByName(name) {
    l.info(`${this.constructor.name}.getByName(${name})`);
    try {
      const pkg = await db.getByName(name);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesService.getByName(${name}):`, error);
      throw error;
    }
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  async create(packageData) {
    l.info(`${this.constructor.name}.create()`, { name: packageData?.name });
    try {
      // Check if package with same name already exists
      const existingPkg = await db.getByName(packageData.name);
      if (existingPkg) {
        const error = new Error('Package with this name already exists');
        error.status = 409; // Conflict
        throw error;
      }

      return await db.create(packageData);
    } catch (error) {
      l.error('Error in PackagesService.create:', error);
      throw error;
    }
  }

  /**
   * Update a package
   * @param {string} id - Package ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated package
   */
  async update(id, updateData) {
    l.info(`${this.constructor.name}.update(${id})`);
    try {
      const pkg = await db.update(id, updateData);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesService.update(${id}):`, error);
      throw error;
    }
  }

  /**
   * Mark a package as deprecated
   * @param {string} id - Package ID
   * @param {string} reason - Reason for deprecation
   * @returns {Promise<Object>} Updated package
   */
  async deprecate(id, reason) {
    l.info(`${this.constructor.name}.deprecate(${id})`);
    try {
      const pkg = await db.deprecate(id, reason);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesService.deprecate(${id}):`, error);
      throw error;
    }
  }

  /**
   * Delete a package
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Deleted package
   */
  async delete(id) {
    l.info(`${this.constructor.name}.delete(${id})`);
    try {
      const pkg = await db.delete(id);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesDatabase.delete(${id}):`, error);
      throw error;
    }
  }

  /**
   * Increment download count for a package
   * @param {string} id - Package ID
   * @returns {Promise<Object>} Updated package
   */
  async incrementDownloads(id) {
    l.info(`${this.constructor.name}.incrementDownloads(${id})`);
    try {
      const pkg = await db.incrementDownloads(id);
      if (!pkg) {
        const error = new Error('Package not found');
        error.status = 404;
        throw error;
      }
      return pkg;
    } catch (error) {
      l.error(`Error in PackagesDatabase.incrementDownloads(${id}):`, error);
      throw error;
    }
  }
}

export default new PackagesService();
