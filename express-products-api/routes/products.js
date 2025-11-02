const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const loggerMiddleware = require('../middleware/logger');
const validateProductMiddleware = require('../middleware/validation');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError } = require('../utils/errors');

// Sample data (in a real app, this would be a database)
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 999.99,
    category: 'Electronics',
    inStock: true
  }
];

// Apply middleware to all routes
router.use(loggerMiddleware);
router.use(authMiddleware);

// GET /api/products - List all products with filtering/pagination
router.get('/', asyncHandler(async (req, res) => {
  let filteredProducts = [...products];
  
  // Filtering logic
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(
      p => p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  // Pagination logic
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
  
  res.json({
    success: true,
    count: filteredProducts.length,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(filteredProducts.length / limit)
    },
    data: paginatedProducts
  });
}));

// GET /api/products/search - Search products
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      success: false,
      error: 'Search query parameter "q" is required'
    });
  }
  
  const searchResults = products.filter(
    p => p.name.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    success: true,
    query: q,
    count: searchResults.length,
    data: searchResults
  });
}));

// GET /api/products/stats - Product statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    totalInStock: products.filter(p => p.inStock).length,
    categories: {}
  };
  
  products.forEach(product => {
    if (!stats.categories[product.category]) {
      stats.categories[product.category] = 0;
    }
    stats.categories[product.category]++;
  });
  
  res.json({
    success: true,
    data: stats
  });
}));

// GET /api/products/:id - Get specific product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  
  res.json({
    success: true,
    data: product
  });
}));

// POST /api/products - Create new product
router.post('/', validateProductMiddleware, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock = true } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    data: newProduct
  });
}));

// PUT /api/products/:id - Update product
router.put('/:id', validateProductMiddleware, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  const { name, description, price, category, inStock } = req.body;
  
  products[productIndex] = {
    ...products[productIndex],
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    ...(inStock !== undefined && { inStock: Boolean(inStock) })
  };
  
  res.json({
    success: true,
    data: products[productIndex]
  });
}));

// DELETE /api/products/:id - Delete product
router.delete('/:id', asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product not found');
  }
  
  products.splice(productIndex, 1);
  
  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
}));

module.exports = router;