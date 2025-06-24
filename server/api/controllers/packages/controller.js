import { param, query, validationResult } from 'express-validator';
import PackagesService from '../../services/packages.service.js';

class Controller {
  static validate(method) {
    switch (method) {
      case 'search':
        return [
          query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
          query('offset').optional().isInt({ min: 0 }).toInt(),
          query('query').optional().isString().trim().toLowerCase(),
          query('tags')
            .optional()
            .isString()
            .customSanitizer((v) =>
              v ? v.split(',').map((t) => t.trim()) : []
            )
            .custom((tags) => {
              if (Array.isArray(tags)) return true;
              return typeof tags === 'string';
            })
            .withMessage('Tags must be a comma-separated string'),
          query('deprecated').optional().isBoolean().toBoolean(),
        ];
      case 'getById':
        return [param('id').isInt().withMessage('Invalid package ID').toInt()];
      case 'getByName':
        return [
          param('name')
            .isString()
            .withMessage('Invalid package name')
            .trim()
            .toLowerCase(),
        ];
    }
  }

  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }

  async search(req, res) {
    try {
      const {
        limit = 20,
        offset = 0,
        query = '',
        tags = [],
        deprecated = false,
      } = req.query;

      // Ensure tags is an array (in case it comes as a string from query)
      const tagsArray = Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

      // Convert query parameters to the correct types
      const params = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
        query: query || '',
        tags: tagsArray,
        deprecated: deprecated === 'true' || deprecated === true,
      };

      const result = await PackagesService.getAll(params);
      res.json(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  byName(req, res) {
    PackagesService.getByName(req.params.name)
      .then((r) => {
        if (r) res.json(r);
        else res.status(404).end();
      })
      .catch((error) => {
        console.error('Error fetching package by name:', error);
        res.status(error.status || 500).json({ error: error.message });
      });
  }

  byId(req, res) {
    PackagesService.getById(req.params.id)
      .then((r) => {
        if (r) res.json(r);
        else res.status(404).end();
      })
      .catch((error) => {
        console.error('Error fetching package by id:', error);
        res.status(error.status || 500).json({ error: error.message });
      });
  }
}

export { Controller };
export default new Controller();
