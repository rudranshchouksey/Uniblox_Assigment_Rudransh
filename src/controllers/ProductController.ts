import { Request, Response } from 'express';
import { productRepository } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../utils/asyncHandler';

export class ProductController {
  public getProducts = asyncHandler(async (req: Request, res: Response) => {
    const products = await productRepository.findAll();
    res.status(200).json({ success: true, data: products });
  });

  public createProduct = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    
    const newProduct = {
      id: uuidv4(),
      ...data
    };
    
    const product = await productRepository.create(newProduct);
    res.status(201).json({ success: true, data: product });
  });

  public updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const updates = req.body;
    
    const product = await productRepository.update(id, updates);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, data: product });
  });

  public deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    
    const success = await productRepository.delete(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  });
}
