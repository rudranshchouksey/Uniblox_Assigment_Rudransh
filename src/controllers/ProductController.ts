import { Request, Response } from 'express';
import { productRepository } from '../store';

export class ProductController {
  public getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await productRepository.findAll();
      res.status(200).json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch products' });
    }
  };
}
