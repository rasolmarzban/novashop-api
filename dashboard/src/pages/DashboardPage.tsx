
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getAdminDashboardStats,
  getRecentAdminOrders,
  type AdminDashboardStats,
  type RecentAdminOrder,
} from '../services/admin-dashboard.service';

import './DashboardPage.css';

const initialStats: AdminDashboardStats = {
  products: 0,
  orders: 0,
  customers: 0,
  revenue: '0.00',
};

function formatMoney(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getStatusClass(status: string): string {
  return `order-status order-status-${status.toLowerCase()}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentAdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const [statsResult, ordersResult] = await Promise.all([
          getAdminDashboardStats(),
          getRecentAdminOrders(5),
        ]);

        if (!cancelled) {
          setStats(statsResult);
          setRecentOrders(ordersResult);
        }
      } catch {
        if (!cancelled) {
          setError(
            'Could not load dashboard data. Please try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayedStats = stats ?? initialStats;

  return (
    <div className="dashboard-page">
      <div className="page-header dashboard-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back to NovaShop administration.</p>
        </div>

        <Link to="/dashboard/orders" className="dashboard-view-all">
          Manage orders
        </Link>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Products</span>
          <strong className="stat-value">
            {loading ? '—' : displayedStats.products}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Orders</span>
          <strong className="stat-value">
            {loading ? '—' : displayedStats.orders}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Customers</span>
          <strong className="stat-value">
            {loading ? '—' : displayedStats.customers}
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">Revenue</span>
          <strong className="stat-value">
            {loading ? '—' : formatMoney(displayedStats.revenue)}
          </strong>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest customer purchases</p>
          </div>

          <Link to="/dashboard/orders" className="dashboard-view-all">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-message" role="status">
            Loading dashboard data…
          </div>
        ) : error ? (
          <div className="dashboard-message">
            Recent orders are unavailable.
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="dashboard-message">
            No orders yet.
          </div>
        ) : (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                    </td>
                    <td>
                      <div className="dashboard-customer-name">
                        {order.customer.name}
                      </div>
                      <div className="dashboard-customer-email">
                        {order.customer.email}
                      </div>
                    </td>
                    <td>{formatDate(order.createAt)}</td>
                    <td>{order.itemCount}</td>
                    <td>
                      <span className={getStatusClass(order.status)}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <strong>{formatMoney(order.total)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
