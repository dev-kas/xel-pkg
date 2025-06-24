import * as express from 'express';
import controller, { Controller } from './controller.js';

export default express
  .Router()
  .get(
    '/:id',
    ...Controller.validate('byId'),
    Controller.validateRequest,
    (req, res) => controller.byId(req, res)
  )
  .get(
    '/pkg/:id',
    ...Controller.validate('getVersionsInPackage'),
    Controller.validateRequest,
    (req, res) => controller.getVersionsInPackage(req, res)
  );
