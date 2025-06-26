import './common/env.js';
import indexPackage from './package_indexing/index.js';
import connectDB from './db.js';

import Server from './common/server.js';
import routes from './routes.js';

async function main() {
  await connectDB();
  indexPackage('https://github.com/dev-kas/xel-rockets', 'anything@inbox.test');

  new Server().router(routes).listen(process.env.PORT || 3000);
}

main();
// .catch((err) => {
//   console.error('Error:', err);
//   process.exit(1);
// });
