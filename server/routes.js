import packagesRouter from './api/controllers/packages/router.js';
import versionsRouter from './api/controllers/versions/router.js';
import indexRouter from './api/controllers/index/router.js';
import tarballsRouter from './api/controllers/tarballs/router.js';
import brewRouter from './api/controllers/brew/router.js';

export default function routes(app) {
  app.use('/api/v1/packages', packagesRouter);
  app.use('/api/v1/versions', versionsRouter);
  app.use('/api/v1/tarballs', tarballsRouter);
  app.use('/api/v1/index', indexRouter);
  app.use('/api/v1/brew', brewRouter);
}
