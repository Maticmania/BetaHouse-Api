import express from 'express';
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductByIdOrRef,
  search,
  updateProduct
} from '../controllers/product.js';
import { upload } from '../helpers/multer.js';

const router = express.Router();

// Create a new product with image upload
router.post('/create', upload.array('images', 10), createProduct);

// Get all products with optional pagination and sorting
router.get('/all', getAllProducts);

// Get a product by ID or property reference
router.get('/id/:id?', getProductByIdOrRef);
router.get('/propertyref/:propertyRef?', getProductByIdOrRef);

// Search products based on query parameters
router.get('/search', search);

// Update a product by ID with optional image upload
router.put('/update/:id', upload.array('images', 10), updateProduct);

// Delete a product by ID
router.delete('/delete/:id', deleteProduct);

export default router;