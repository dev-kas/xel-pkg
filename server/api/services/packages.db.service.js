import Package from '../models/package.model.js';
import logger from '../../common/logger.js';

class PackagesDatabase {
  constructor() {}

  /**
   * Get all packages with optional pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of packages to return
   * @param {number} options.offset - Number of packages to skip
   * @param {string} options.query - Search query string
   * @param {string[]} options.tags - Filter by tags
   * @param {boolean} options.deprecated - Include deprecated packages
   * @returns {Promise<Array>} Array of packages
   */
  async all({
    limit = 20,
    offset = 0,
    query = '',
    tags = [],
    deprecated = false,
  } = {}) {
    try {
      const conditions = {};

      const sortOptions = query
        ? { score: { $meta: 'textScore' }, updatedAt: -1 }
        : { updatedAt: -1 };

      if (query) {
        conditions.$text = { $search: query };
      }

      if (tags && tags.length > 0) {
        conditions.tags = { $all: tags };
      }

      if (!deprecated) {
        conditions.isDeprecated = false;
      }

      return await Package.find(conditions, {
        score: { $meta: 'textScore' },
      })
        .sort(sortOptions)
        .skip(offset)
        .limit(limit)
        .populate('latest')
        // .lean()
        .exec();
    } catch (error) {
      logger.error('Error fetching packages:', error);
      throw error;
    }
  }

  /**
   * Get a package by ID
   * @param {string} id - Package ID
   * @returns {Promise<Object|null>} Package document or null if not found
   */
  async getById(id) {
    try {
      return await Package.findOne({ id });
    } catch (error) {
      logger.error(`Error finding package by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get a package by name
   * @param {string} name - Package name (case-insensitive)
   * @returns {Promise<Object|null>} Package document or null if not found
   */
  async getByName(name) {
    try {
      return await Package.findOne({ name: name.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding package by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Create a new package
   * @param {Object} packageData - Package data
   * @returns {Promise<Object>} Created package
   */
  async create(packageData) {
    try {
      const pkg = new Package({
        ...packageData,
        name: packageData.name.toLowerCase(),
        tags: packageData.tags?.map((tag) => tag.toLowerCase()) || [],
      });

      return await pkg.save();
    } catch (error) {
      logger.error('Error creating package:', error);
      throw error;
    }
  }

  /**
   * Update a package
   * @param {string} id - Package ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} Updated package or null if not found
   */
  async update(id, updateData) {
    try {
      // Ensure name and tags are properly formatted
      if (updateData.name) {
        updateData.name = updateData.name.toLowerCase();
      }

      if (updateData.tags) {
        updateData.tags = updateData.tags.map((tag) => tag.toLowerCase());
      }

      return await Package.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } catch (error) {
      logger.error(`Error updating package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Mark a package as deprecated
   * @param {string} id - Package ID
   * @param {string} reason - Reason for deprecation
   * @returns {Promise<Object|null>} Updated package or null if not found
   */
  async deprecate(id, reason) {
    try {
      return await Package.findByIdAndUpdate(
        id,
        {
          isDeprecated: true,
          deprecatedReason: reason,
          updatedAt: Date.now(),
        },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error deprecating package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a package
   * @param {string} id - Package ID
   * @returns {Promise<Object|null>} Deleted package or null if not found
   */
  async delete(id) {
    try {
      return await Package.findByIdAndDelete(id);
    } catch (error) {
      logger.error(`Error deleting package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Increment download count for a package
   * @param {string} id - Package ID
   * @returns {Promise<Object|null>} Updated package or null if not found
   */
  async incrementDownloads(id) {
    try {
      return await Package.findByIdAndUpdate(
        id,
        { $inc: { downloads: 1 } },
        { new: true }
      );
    } catch (error) {
      logger.error(`Error incrementing downloads for package ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get total count of packages matching the query
   * @param {Object} filter - Filter conditions
   * @returns {Promise<number>} Total count
   */
  async count({ query = '', tags = [], deprecated = false } = {}) {
    try {
      const conditions = {};

      if (query) {
        conditions.$text = { $search: query };
      }

      if (tags && tags.length > 0) {
        conditions.tags = { $all: tags };
      }

      if (!deprecated) {
        conditions.isDeprecated = false;
      }

      return await Package.countDocuments(conditions);
    } catch (error) {
      logger.error('Error counting packages:', error);
      throw error;
    }
  }
}

export default new PackagesDatabase();
