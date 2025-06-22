import './common/env.js';
import Server from './common/server.js';
import routes from './routes.js';
import connectDB from './db.js';

connectDB();

export default new Server()
  .router(routes)
  .listen(process.env.PORT || 3000);
