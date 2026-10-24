import api from './api';

export interface AdminOrderCustomer {
  id: number;
  name: string;
  email: string;
}

export interface AdminOrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  total: string;
  createAt: string;
  updateAt: string;
  customer: AdminOrderCustomer;
  itemCount: number;
}

export interface AdminOrderDetails extends Omit<AdminOrder, 'itemCount'> {
  items: AdminOrderItem[];
}

export interface AdminOrdersResponse {
  data: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getAdminOrders(
  page = 1,
  limit = 10,
): Promise<AdminOrdersResponse> {
  const response = await api.get<AdminOrdersResponse>(
    '/admin/orders',
    {
      params: { page, limit },
    },
  );

  return response.data;
}

export async function getAdminOrderById(
  id: number,
): Promise<AdminOrderDetails> {
  const response = await api.get<AdminOrderDetails>(
    `/admin/orders/${id}`,
  );

  return response.data;
}


export async function updateAdminOrderStatus(
  id: number,
  status: AdminOrderDetails['status'],
): Promise<{
  id: number;
  orderNumber: string;
  status: string;
  updateAt: string;
}> {
  const response = await api.patch<{
    id: number;
    orderNumber: string;
    status: string;
    updateAt: string;
  }>(`/admin/orders/${id}/status`, { status });

  return response.data;
}
