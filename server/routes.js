import packagesRouter from './api/controllers/packages/router.js';

export default function routes(app) {
  app.use('/api/v1/packages', packagesRouter);
}
