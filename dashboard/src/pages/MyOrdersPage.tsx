
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import StorefrontHeader from '../components/StorefrontHeader';
import {
  getMyOrders,
  type CustomerOrder,
} from '../services/order.service';

import './MyOrdersPage.css';

const PAGE_SIZE = 10;

function formatMoney(value: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value));
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getStatusClass(status: string): string {
  return status.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

function MyOrdersPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await getMyOrders(currentPage, PAGE_SIZE);

      setOrders(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.total);
    } catch {
      setError(
        'We could not load your orders. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders(page);
  }, [page, loadOrders]);

  function toggleOrder(orderId: number) {
    setExpandedOrders((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  }

  return (
    <div className="my-orders-page">
      <StorefrontHeader />

      <main className="my-orders-container">
        <div className="my-orders-heading">
          <div>
            <p className="my-orders-eyebrow">YOUR ACCOUNT</p>
            <h1>My Orders</h1>
            <p className="my-orders-subtitle">
              View your purchases and track their status.
            </p>
          </div>

          <Link to="/shop" className="my-orders-shop-link">
            Continue shopping
          </Link>
        </div>

        {loading && (
          <div className="my-orders-message" role="status">
            Loading your orders...
          </div>
        )}

        {!loading && error && (
          <div className="my-orders-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadOrders(page)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <section className="my-orders-empty">
            <h2>No orders yet</h2>
            <p>Your purchases will appear here after checkout.</p>
            <Link to="/shop" className="my-orders-primary-link">
              Explore the shop
            </Link>
          </section>
        )}

        {!loading && !error && orders.length > 0 && (
          <>
            <p className="my-orders-count">
              {totalOrders} {totalOrders === 1 ? 'order' : 'orders'}
            </p>

            <div className="my-orders-list">
              {orders.map((order) => {
                const expanded = expandedOrders.includes(order.id);

                return (
                  <article
                    className="my-order-card"
                    key={order.id}
                  >
                    <div className="my-order-summary">
                      <div className="my-order-main">
                        <span className="my-order-label">
                          ORDER NUMBER
                        </span>
                        <strong className="my-order-number">
                          {order.orderNumber}
                        </strong>
                        <span className="my-order-date">
                          {formatDate(order.createAt)}
                        </span>
                      </div>

                      <div className="my-order-status-column">
                        <span className="my-order-label">
                          STATUS
                        </span>
                        <span
                          className={`my-order-status my-order-status--${getStatusClass(order.status)}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="my-order-total-column">
                        <span className="my-order-label">
                          TOTAL
                        </span>
                        <strong className="my-order-total">
                          {formatMoney(order.total)}
                        </strong>
                      </div>

                      <button
                        className="my-order-details-button"
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggleOrder(order.id)}
                      >
                        {expanded ? 'Hide details' : 'View details'}
                      </button>
                    </div>

                    {expanded && (
                      <div className="my-order-details">
                        <h3>Items ordered</h3>

                        <div className="my-order-items">
                          {order.items.map((item) => (
                            <div
                              className="my-order-item"
                              key={item.id}
                            >
                              <div className="my-order-item-info">
                                <strong>{item.productName}</strong>
                                <span>
                                  {formatMoney(item.unitPrice)} each
                                  {' · '}
                                  Qty: {item.quantity}
                                </span>
                              </div>

                              <strong>
                                {formatMoney(item.lineTotal)}
                              </strong>
                            </div>
                          ))}
                        </div>

                        <div className="my-order-breakdown">
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
                          <div className="my-order-grand-total">
                            <strong>Order total</strong>
                            <strong>{formatMoney(order.total)}</strong>
                          </div>
                        </div>

                        <p className="my-order-updated">
                          Last updated: {formatDate(order.updateAt)}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>

            {totalPages > 1 && (
              <nav
                className="my-orders-pagination"
                aria-label="Order history pages"
              >
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyOrdersPage;
