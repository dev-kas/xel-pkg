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
    ...Controller.validate('getTarballsInPackage'),
    Controller.validateRequest,
    (req, res) => controller.getTarballsInPackage(req, res)
  )
  .get(
    '/ver/:id',
    ...Controller.validate('getTarballsInVersion'),
    Controller.validateRequest,
    (req, res) => controller.getTarballsInVersion(req, res)
  );
