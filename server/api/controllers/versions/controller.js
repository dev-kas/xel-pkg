import { param, query, validationResult } from 'express-validator';
import VersionsService from '../../services/versions.service.js';

class Controller {
  static validate(method) {
    switch (method) {
      case 'getVersionsInPackage':
        return [
          query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
          query('offset').optional().isInt({ min: 0 }).toInt(),
          param('id').isInt().withMessage('Invalid package ID').toInt(),
        ];
      case 'byId':
        return [param('id').isInt().withMessage('Invalid version ID').toInt()];
    }
  }

  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  }

  async getVersionsInPackage(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      // Convert query parameters to the correct types
      const params = {
        limit: parseInt(limit, 10) || 20,
        offset: parseInt(offset, 10) || 0,
      };

      const result = await VersionsService.getByPackageId(
        req.params.id,
        params
      );
      res.json(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  byId(req, res) {
    VersionsService.getById(req.params.id)
      .then((r) => {
        if (r) res.json(r);
        else res.status(404).end();
      })
      .catch((error) => {
        console.error('Error fetching version by id:', error);
        res.status(error.status || 500).json({ error: error.message });
      });
  }
}

export { Controller };
export default new Controller();
