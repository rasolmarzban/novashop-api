import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StorefrontHeader from '../components/StorefrontHeader';
import { notify } from '../stores/notification.store';
import {
  CART_UPDATED_EVENT,
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from '../services/cart.service';
import { createOrder } from '../services/order.service';
import './CartPage.css';

function formatPrice(price: string | number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function CartPage() {
  const [items, setItems] = useState<CartItem[]>(getCartItems);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
const navigate = useNavigate();

async function handleCheckout() {
  if (isCheckingOut) {
    return;
  }

  const currentItems = getCartItems();

  if (currentItems.length === 0) {
    notify.info('Your cart is empty.');
    setItems([]);
    return;
  }

  setIsCheckingOut(true);

  try {
    const order = await createOrder({
      items: currentItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    // Clear the cart only after the API confirms order creation.
    clearCart();

    notify.success(`Order ${order.orderNumber} created successfully.`);

    navigate(`/order-success/${encodeURIComponent(order.orderNumber)}`);
  } catch (error) {
    const message =
      typeof error === 'object' &&
      error !== null &&
      'response' in error
        ? (() => {
            const response = (
              error as {
                response?: {
                  data?: { message?: string | string[] };
                };
              }
            ).response?.data?.message;

            return Array.isArray(response)
              ? response.join(', ')
              : response;
          })()
        : undefined;

    notify.error(
      message ||
        (error instanceof Error
          ? error.message
          : 'Could not place your order. Please try again.'),
    );
  } finally {
    setIsCheckingOut(false);
  }
}

  useEffect(() => {
    const refreshItems = () => {
      setItems(getCartItems());
    };

    window.addEventListener(CART_UPDATED_EVENT, refreshItems);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, refreshItems);
    };
  }, []);

  const subtotal = items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  function handleQuantityChange(item: CartItem, quantity: number) {
    try {
      updateCartQuantity(item.productId, quantity);
      notify.success('Cart quantity updated.');
    } catch (error) {
      notify.error(
        error instanceof Error ? error.message : 'Could not update the cart.',
      );
    }
  }

  function handleRemove(item: CartItem) {
    try {
      removeFromCart(item.productId);
      notify.success(`${item.name} removed from your cart.`);
    } catch {
      notify.error('Could not remove this product from your cart.');
    }
  }

  return (
    <main className="cart-page">
      <StorefrontHeader />

      <div className="cart-container">
        <div className="cart-page-heading">
          <div>
            <p className="cart-eyebrow">YOUR NOVASHOP ORDER</p>
            <h1>Shopping cart</h1>
            <p>Review your items before proceeding to checkout.</p>
          </div>

          <Link to="/shop" className="cart-continue-link">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <section className="cart-empty-state">
            <div className="cart-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1" fill="currentColor" />
                <circle cx="18" cy="20" r="1" fill="currentColor" />
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p>Explore our products and add something you like.</p>
            <Link to="/shop" className="cart-primary-button">
              Browse products
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-panel" aria-label="Cart items">
              {items.map((item) => (
                <article className="cart-item" key={item.productId}>
                  <Link
                    to={`/shop/${encodeURIComponent(item.slug)}`}
                    className="cart-item-image-link"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    ) : (
                      <span className="cart-item-no-image">No image</span>
                    )}
                  </Link>

                  <div className="cart-item-details">
                    <h2>
                      <Link to={`/shop/${encodeURIComponent(item.slug)}`}>
                        {item.name}
                      </Link>
                    </h2>

                    <p className="cart-item-unit-price">
                      {formatPrice(item.price)} each
                    </p>

                    <p className="cart-item-stock">
                      {item.stock > 0 ? 'In stock' : 'Currently unavailable'}
                    </p>

                    <div className="cart-item-actions">
                      <div className="cart-quantity-control">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          disabled={item.quantity >= item.stock}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => handleRemove(item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="cart-item-total">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </article>
              ))}
            </section>

            <aside className="cart-summary">
              <h2>Order summary</h2>

              <div className="cart-summary-row">
                <span>Items ({items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="cart-summary-total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <button
  type="button"
  className="cart-checkout-button"
  onClick={handleCheckout}
  disabled={isCheckingOut || items.length === 0}
>
  {isCheckingOut ? 'Placing order...' : 'Place order'}
</button>

              <p className="cart-summary-note">
                Shipping, taxes, and final prices will be confirmed during checkout.
              </p>
            </aside>
          </div>
        )}
      </div>

      <footer className="cart-footer">
        © {new Date().getFullYear()} NovaShop. All rights reserved.
      </footer>
    </main>
  );
}

export default CartPage;
