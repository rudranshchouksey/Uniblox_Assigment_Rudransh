import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';

const router = Router();
const productController = new ProductController();

router.get('/', productController.getProducts);
router.post('/', validate(createProductSchema), productController.createProduct);
router.put('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
