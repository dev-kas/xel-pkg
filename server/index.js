import './common/env.js';
import connectDB from './db.js';

import Server from './common/server.js';
import routes from './routes.js';

async function main() {
  await connectDB();

  new Server().router(routes).listen(process.env.PORT || 3000);
}

main();
