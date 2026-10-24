
import { useEffect, useState } from 'react';

import {
  getAdminOrders,
  type AdminOrder,
  type AdminOrdersResponse,
} from '../services/admin-orders.service';

import './DashboardPage.css';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const [result, setResult] =
    useState<AdminOrdersResponse | null>(null);

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadOrders() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminOrders(page, 10);

        if (isActive) {
          setResult(response);
        }
      } catch {
        if (isActive) {
          setError(
            'Could not load orders. Check your connection and admin access.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isActive = false;
    };
  }, [page, refreshKey]);

  const orders = result?.data ?? [];
  const pagination = result?.pagination;

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  function formatMoney(value: string) {
    return `$${Number(value).toFixed(2)}`;
  }

  function statusClass(status: string) {
    const normalized = status.toLowerCase();

    const allowedStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    return allowedStatuses.includes(normalized)
      ? `order-status order-status-${normalized}`
      : 'order-status';
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Orders</h1>
          <p>View and manage customer orders.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>All Orders</h2>
            <p>
              {pagination
                ? `${pagination.total} orders in total`
                : 'Orders from your store'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="dashboard-message">
            Loading orders...
          </div>
        ) : error ? (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="dashboard-message">
            No orders have been placed yet.
          </div>
        ) : (
          <>
            <div className="dashboard-table-wrapper">
              <table className="dashboard-orders-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order: AdminOrder) => (
                    <tr key={order.id}>
                      <td>
  <Link
    to={`/dashboard/orders/${order.id}`}
    className="order-number-link"
  >
    {order.orderNumber}
  </Link>
  <div className="dashboard-customer-email">
    ID #{order.id}
  </div>
</td>
                      <td>
                        <div className="dashboard-customer-name">
                          {order.customer.name}
                        </div>
                        <div className="dashboard-customer-email">
                          {order.customer.email}
                        </div>
                      </td>

                      <td>{order.itemCount}</td>

                      <td>{formatDate(order.createAt)}</td>

                      <td>
                        <span className={statusClass(order.status)}>
                          {order.status}
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

            <div className="orders-pagination">
              <span>
                Page {pagination?.page ?? page} of{' '}
                {pagination?.totalPages ?? 1}
              </span>

              <div className="orders-pagination-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    !pagination ||
                    page >= pagination.totalPages ||
                    isLoading
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
