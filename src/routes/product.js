import express from 'express';
import { createProduct, deleteProduct, getAllProducts, getProductByIdOrRef, updateProduct } from '../controllers/product.js';
import { upload } from '../helpers/multer.js';

const router = express.Router();

router.post('/create',upload.array('images', 10), createProduct);
router.get('/', getAllProducts);
router.get('/:id?', getProductByIdOrRef); // Combining both id and propertyRef into one route
router.get('/propertyref/:propertyRef?', getProductByIdOrRef); // Using a different route to handle propertyRef
router.put('/update/:id', upload.array('images', 10), updateProduct);
router.delete('/delete/:id', deleteProduct); // Route for deleting product

export default router;
