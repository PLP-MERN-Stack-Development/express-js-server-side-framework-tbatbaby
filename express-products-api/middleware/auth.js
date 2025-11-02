const { AuthenticationError } = require('../utils/errors');

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    throw new AuthenticationError('API key required. Please provide x-api-key in headers');
  }
  
  next();
};

module.exports = authMiddleware;