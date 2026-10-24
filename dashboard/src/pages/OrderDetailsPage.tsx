import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  getAdminOrderById,
  updateAdminOrderStatus,
  type AdminOrderDetails,
} from '../services/admin-orders.service';

import './DashboardPage.css';
import './OrderDetailsPage.css';



export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadOrder() {
      const orderId = Number(id);

      if (!id || !Number.isInteger(orderId) || orderId <= 0) {
        setError('Invalid order ID.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminOrderById(orderId);

        if (isActive) {
          setOrder(response);
          setSelectedStatus(response.status);
          setStatusMessage('');
          setStatusError('');
        }
      } catch {
        if (isActive) {
          setError(
            'Could not load this order. Check your admin access and try again.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isActive = false;
    };
  }, [id, refreshKey]);

  function formatMoney(value: string) {
    return `$${Number(value).toFixed(2)}`;
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
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

  async function handleStatusUpdate() {
  const orderId = Number(id);

  if (!order || !Number.isInteger(orderId) || orderId <= 0) {
    setStatusError('Invalid order ID.');
    return;
  }

  if (selectedStatus === order.status) {
    setStatusMessage('The order already has this status.');
    setStatusError('');
    return;
  }

  setIsSavingStatus(true);
  setStatusMessage('');
  setStatusError('');

  try {
    const updatedOrder = await updateAdminOrderStatus(
      orderId,
      selectedStatus,
    );

    setOrder((currentOrder) =>
      currentOrder
        ? {
            ...currentOrder,
            status: updatedOrder.status,
            updateAt: updatedOrder.updateAt,
          }
        : currentOrder,
    );

    setSelectedStatus(updatedOrder.status);
    setStatusMessage('Order status updated successfully.');
  } catch {
    setStatusError(
      'Could not update the order status. Please try again.',
    );
  } finally {
    setIsSavingStatus(false);
  }
}

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <Link to="/dashboard/orders" className="order-details-back">
            ← Back to orders
          </Link>
          <h1>Order Details</h1>
          <p>Review customer information and order totals.</p>
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
          Loading order details...
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
      ) : order ? (
        <>
          <div className="order-details-summary">
            <div className="dashboard-section">
              <span className="order-details-label">Order number</span>
              <h2>{order.orderNumber}</h2>
              <span className="order-details-muted">ID #{order.id}</span>
            </div>

            <div className="dashboard-section">
              <span className="order-details-label">Status</span>
              <div>
                <span className={statusClass(order.status)}>
                  {order.status}
                </span>
              </div>
              <span className="order-details-muted">
                Placed {formatDate(order.createAt)}
              </span>
            </div>
          </div>


<div className="dashboard-section">
  <div className="dashboard-section-header">
    <div>
      <h2>Manage Order Status</h2>
      <p>Update the current status of this order.</p>
    </div>
  </div>

  <div className="order-status-editor">
    <label htmlFor="order-status-select">
      Order status
    </label>

    <select
      id="order-status-select"
      value={selectedStatus}
      onChange={(event) => {
        setSelectedStatus(event.target.value);
        setStatusMessage('');
        setStatusError('');
      }}
      disabled={isSavingStatus}
    >
      <option value="PENDING">Pending</option>
      <option value="PROCESSING">Processing</option>
      <option value="SHIPPED">Shipped</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>

    <button
      type="button"
      className="primary-button"
      onClick={() => void handleStatusUpdate()}
      disabled={
        isSavingStatus ||
        !selectedStatus ||
        selectedStatus === order.status
      }
    >
      {isSavingStatus ? 'Saving...' : 'Save Status'}
    </button>
  </div>

  {statusMessage && (
  <div className="toast-notification toast-success" role="status">
    <span className="toast-icon" aria-hidden="true">✓</span>
    <span>{statusMessage}</span>
    <button
      type="button"
      className="toast-close"
      aria-label="Dismiss notification"
      onClick={() => setStatusMessage('')}
    >
      ×
    </button>
  </div>
)}

  {statusError && (
    <p className="order-status-error" role="alert">
      {statusError}
    </p>
  )}
</div>


          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Customer</h2>
                <p>Customer information for this order</p>
              </div>
            </div>

            <div className="order-details-customer">
              <div>
                <span className="order-details-label">Name</span>
                <strong>{order.customer.name}</strong>
              </div>
              <div>
                <span className="order-details-label">Email</span>
                <span>{order.customer.email}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Order Items</h2>
                <p>{order.items.length} line items</p>
              </div>
            </div>

            {order.items.length === 0 ? (
              <div className="dashboard-message">
                This order has no items.
              </div>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-orders-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Product ID</th>
                      <th>Unit Price</th>
                      <th>Quantity</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.productName}</strong>
                        </td>
                        <td>{item.productId}</td>
                        <td>{formatMoney(item.unitPrice)}</td>
                        <td>{item.quantity}</td>
                        <td>
                          <strong>{formatMoney(item.lineTotal)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Payment Summary</h2>
                <p>Breakdown of the order total</p>
              </div>
            </div>

            <div className="order-details-totals">
              <div>
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              <div>
                <span>Shipping</span>
                <span>{formatMoney(order.shippingCost)}</span>
              </div>
              <div>
                <span>Tax</span>
                <span>{formatMoney(order.taxAmount)}</span>
              </div>
              <div className="order-details-grand-total">
                <strong>Total</strong>
                <strong>{formatMoney(order.total)}</strong>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}