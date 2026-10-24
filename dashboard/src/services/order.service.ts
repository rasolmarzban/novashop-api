
import api from './api';

export interface CreateOrderRequest {
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
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
  items: OrderItem[];
}

export interface CustomerOrder extends CreatedOrder {
  updateAt: string;
}

export interface OrderHistoryResponse {
  data: CustomerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function createOrder(
  request: CreateOrderRequest,
): Promise<CreatedOrder> {
  const response = await api.post<CreatedOrder>('/orders', request);
  return response.data;
}

export async function getMyOrders(
  page = 1,
  limit = 10,
): Promise<OrderHistoryResponse> {
  const response = await api.get<OrderHistoryResponse>('/orders/me', {
    params: { page, limit },
  });

  return response.data;
}
