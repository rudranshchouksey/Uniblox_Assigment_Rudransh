import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/CartService';

export class CartController {
  constructor(private cartService: CartService) {}

  public getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const cart = await this.cartService.getCart(customerId);
      res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  };

  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId, productId, quantity } = req.body;
      const cart = await this.cartService.addItem(customerId, productId, quantity);
      res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  };

  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { customerId, quantity } = req.body;
      const cart = await this.cartService.updateItemQuantity(customerId, productId, quantity);
      res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  };

  public removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const { customerId } = req.body;
      const cart = await this.cartService.removeItem(customerId, productId);
      res.status(200).json({ status: 'success', data: cart });
    } catch (error) {
      next(error);
    }
  };
}
