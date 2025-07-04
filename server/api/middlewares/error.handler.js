// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  const errors = err.errors || [{ message: err.message }];
  res.status(err.status || 500).json({ errors });
}
