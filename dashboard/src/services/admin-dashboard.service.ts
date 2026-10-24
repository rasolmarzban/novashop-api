
import api from './api';

export interface AdminDashboardStats {
  products: number;
  orders: number;
  customers: number;
  revenue: string;
}

export interface RecentAdminOrder {
  id: number;
  orderNumber: string;
  status: string;
  total: string;
  createAt: string;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  itemCount: number;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get<AdminDashboardStats>(
    '/admin/dashboard/stats',
  );

  return response.data;
}

export async function getRecentAdminOrders(
  limit = 5,
): Promise<RecentAdminOrder[]> {
  const response = await api.get<RecentAdminOrder[]>(
    '/admin/dashboard/recent-orders',
    {
      params: { limit },
    },
  );

  return response.data;
}
