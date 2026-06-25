import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import { asyncHandler } from '../utils/asyncHandler';

export class CartController {
  constructor(private cartService: CartService) {}

  public getCart = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.params.customerId as string;
    const cart = await this.cartService.getCart(customerId);
    res.status(200).json({ status: 'success', data: cart });
  });

  public addItem = asyncHandler(async (req: Request, res: Response) => {
    const { customerId, productId, quantity } = req.body;
    const cart = await this.cartService.addItem(customerId as string, productId as string, quantity);
    res.status(200).json({ status: 'success', data: cart });
  });

  public updateItem = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const { customerId, quantity } = req.body;
    const cart = await this.cartService.updateItemQuantity(customerId as string, productId, quantity);
    res.status(200).json({ status: 'success', data: cart });
  });

  public removeItem = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.productId as string;
    const { customerId } = req.body;
    const cart = await this.cartService.removeItem(customerId as string, productId);
    res.status(200).json({ status: 'success', data: cart });
  });
}
