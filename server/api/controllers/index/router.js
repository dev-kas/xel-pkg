import * as express from 'express';
import controller, { Controller } from './controller.js';

export default express
  .Router()
  .post(
    '/classic',
    ...Controller.validate('classic'),
    Controller.validateRequest,
    (req, res) => controller.classic(req, res)
  );
