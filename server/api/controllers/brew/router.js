import * as express from 'express';
import controller from './controller.js';

export default express
  .Router()
  .get('/', (req, res) => controller.brew(req, res));
