
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  getAdminCustomerById,
  getAdminCustomerOrders,
  type AdminCustomer,
  type AdminCustomerOrder,
} from '../services/admin-customers.service';

import './DashboardPage.css';
import './CustomerDetailsPage.css';

export default function CustomerDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<AdminCustomer | null>(null);
  const [orders, setOrders] = useState<AdminCustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCustomer() {
      const customerId = Number(id);

      if (!id || !Number.isInteger(customerId) || customerId <= 0) {
        setError('Invalid customer ID.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [customerResult, ordersResult] = await Promise.all([
          getAdminCustomerById(customerId),
          getAdminCustomerOrders(customerId),
        ]);

        if (isActive) {
          setCustomer(customerResult);
          setOrders(ordersResult);
        }
      } catch {
        if (isActive) {
          setError(
            'Could not load this customer. Check your admin access and try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomer();

    return () => {
      isActive = false;
    };
  }, [id, refreshKey]);

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
          <Link to="/dashboard/users" className="customer-details-back">
            ← Back to customers
          </Link>
          <h1>Customer Details</h1>
          <p>Review customer information and order history.</p>
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

      {isLoading ? (
        <div className="dashboard-section dashboard-message">
          Loading customer details...
        </div>
      ) : error ? (
        <div className="dashboard-section dashboard-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
          >
            Try again
          </button>
        </div>
      ) : customer ? (
        <>
          <div className="customer-details-summary">
            <div className="dashboard-section">
              <span className="customer-details-label">Customer</span>
              <h2>{customer.name}</h2>
              <span className="customer-details-muted">
                ID #{customer.id}
              </span>
            </div>

            <div className="dashboard-section">
              <span className="customer-details-label">Total Orders</span>
              <h2>{customer.orderCount}</h2>
              <span className="customer-details-muted">
                Orders placed by this customer
              </span>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Customer Information</h2>
                <p>Account and registration details.</p>
              </div>
            </div>

            <div className="customer-details-information">
              <div>
                <span className="customer-details-label">Full Name</span>
                <strong>{customer.name}</strong>
              </div>

              <div>
                <span className="customer-details-label">Email Address</span>
                <span>{customer.email}</span>
              </div>

              <div>
                <span className="customer-details-label">Customer ID</span>
                <span>#{customer.id}</span>
              </div>

              <div>
                <span className="customer-details-label">Registered</span>
                <span>{formatDate(customer.createAt)}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Order History</h2>
                <p>
                  {orders.length}{' '}
                  {orders.length === 1 ? 'order' : 'orders'} found.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="dashboard-message">
                This customer has not placed any orders yet.
              </div>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-orders-table">
                  <thead>
                    <tr>
                      <th>Order Number</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong>{order.orderNumber}</strong>
                        </td>
                        <td>{formatDate(order.createAt)}</td>
                        <td>{order.itemCount}</td>
                        <td>
                          <span className={statusClass(order.status)}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <strong>{formatMoney(order.total)}</strong>
                        </td>
                        <td>
                          <Link
                            to={`/dashboard/orders/${order.id}`}
                            className="customer-order-link"
                          >
                            View Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
