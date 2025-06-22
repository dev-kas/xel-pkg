import packagesRouter from './api/controllers/packages/router.js';
import versionsRouter from './api/controllers/versions/router.js';

export default function routes(app) {
  app.use('/api/v1/packages', packagesRouter);
  app.use('/api/v1/versions', versionsRouter);
}
