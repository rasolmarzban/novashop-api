
import api from './api';

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  createAt: string;
  orderCount: number;
}

export interface AdminCustomersResponse {
  data: AdminCustomer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCustomerOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  createAt: string;
  itemCount: number;
}

export async function getAdminCustomers(
  page = 1,
  limit = 10,
  search = '',
): Promise<AdminCustomersResponse> {
  const response = await api.get<AdminCustomersResponse>(
    '/admin/customers',
    {
      params: { page, limit, search },
    },
  );

  return response.data;
}

export async function getAdminCustomerById(
  id: number,
): Promise<AdminCustomer> {
  const response = await api.get<AdminCustomer>(
    `/admin/customers/${id}`,
  );

  return response.data;
}

export async function getAdminCustomerOrders(
  id: number,
): Promise<AdminCustomerOrder[]> {
  const response = await api.get<AdminCustomerOrder[]>(
    `/admin/customers/${id}/orders`,
  );

  return response.data;
}
