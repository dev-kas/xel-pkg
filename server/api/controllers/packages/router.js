import * as express from 'express';
import controller, { Controller } from './controller.js';

export default express
  .Router()
  .get(
    '/',
    ...Controller.validate('search'),
    Controller.validateRequest,
    (req, res) => controller.search(req, res)
  )
  .get('/name/:name', ...Controller.validate('getByName'), Controller.validateRequest, (req, res) => controller.byName(req, res))
  .get('/id/:id', ...Controller.validate('getById'), Controller.validateRequest, (req, res) => controller.byId(req, res));
