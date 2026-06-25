import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import { asyncHandler } from '../utils/asyncHandler';

export class CartController {
  constructor(private cartService: CartService) {}

  public getCart = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const cart = await this.cartService.getCart(customerId);
    res.status(200).json({ status: 'success', data: cart });
  });

  public addItem = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, productId, quantity } = req.body;
    const cart = await this.cartService.addItem(customerId, productId, quantity);
    res.status(200).json({ status: 'success', data: cart });
  });

  public updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { customerId, quantity } = req.body;
    const cart = await this.cartService.updateItemQuantity(customerId, productId, quantity);
    res.status(200).json({ status: 'success', data: cart });
  });

  public removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { customerId } = req.body;
    const cart = await this.cartService.removeItem(customerId, productId);
    res.status(200).json({ status: 'success', data: cart });
  });
}
