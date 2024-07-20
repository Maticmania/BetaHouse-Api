import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductByIdOrRef, updateProduct } from '../controllers/product.js';

const router = express.Router();

router.post('/create', createProduct);
router.get('/', getAllProducts);
router.get('/:id?', getProductByIdOrRef); // Combining both id and propertyRef into one route
router.get('/propertyref/:propertyRef?', getProductByIdOrRef); // Using a different route to handle propertyRef
router.put('/update/:id', updateProduct);
router.delete('/delete/:id', deleteProduct); // Route for deleting product

export default router;
