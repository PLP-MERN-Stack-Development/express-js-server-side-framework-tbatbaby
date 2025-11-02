const { ValidationError } = require('../utils/errors');

const validateProductMiddleware = (req, res, next) => {
  const { name, description, price, category } = req.body;
  
  if (!name || !description || !price || !category) {
    throw new ValidationError('Missing required fields: name, description, price, category');
  }
  
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new ValidationError('Name must be a non-empty string');
  }
  
  if (typeof price !== 'number' || price <= 0) {
    throw new ValidationError('Price must be a positive number');
  }
  
  next();
};

module.exports = validateProductMiddleware;