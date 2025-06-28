import { body, validationResult } from 'express-validator';
import indexPackage from '../../../package_indexing/index.js';

class Controller {
  static validate(method) {
    switch (method) {
      case 'classic':
        return [
          body('url').isURL().withMessage('Invalid URL'),
          body('email').isEmail().withMessage('Invalid email'),
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

  async classic(req, res) {
    try {
      const { url, email } = req.body;
      indexPackage(url, email);
      res.status(200).json({ message: 'Repository added to queue' });
    } catch (error) {
      console.error('Error adding repository queue:', error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

export { Controller };
export default new Controller();
