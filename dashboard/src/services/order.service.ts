
import api from './api';

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CreatedOrder {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  total: string;
  createAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    unitPrice: string;
    quantity: number;
    lineTotal: string;
  }>;
}

export async function createOrder(
  request: CreateOrderRequest,
): Promise<CreatedOrder> {
  const response = await api.post<CreatedOrder>('/orders', request);
  return response.data;
}
