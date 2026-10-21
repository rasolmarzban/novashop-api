
import { Link, useParams } from 'react-router-dom';
import StorefrontHeader from '../components/StorefrontHeader';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  return (
    <>
      <StorefrontHeader />

      <main className="order-success-page">
        <div className="order-success-card">
          <div className="order-success-icon" aria-hidden="true">
            ✓
          </div>

          <h1>Order placed successfully!</h1>

          <p>
            Thank you for your purchase. Your order has been created.
          </p>

          {orderNumber && (
            <p className="order-success-number">
              Order number: <strong>{orderNumber}</strong>
            </p>
          )}

          <div className="order-success-actions">
            <Link to="/shop" className="order-success-primary">
              Continue shopping
            </Link>

            <Link to="/cart" className="order-success-secondary">
              Back to cart
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
