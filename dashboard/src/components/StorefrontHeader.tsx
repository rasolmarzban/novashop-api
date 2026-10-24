import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CART_UPDATED_EVENT, getCartItemCount } from '../services/cart.service';
import './StorefrontHeader.css';

function StorefrontHeader() {
  const [cartCount, setCartCount] = useState(getCartItemCount);

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCartItemCount());
    };

    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
    };
  }, []);

  return (
    <header className="storefront-header">
      <Link to="/shop" className="storefront-brand">
        NovaShop
      </Link>

      <nav className="storefront-navigation" aria-label="Main navigation">
        <Link to="/shop" className="storefront-nav-link">
          Shop
        </Link>

        <Link to="/account" className="storefront-nav-link">
          My Account
        </Link>

        <Link to="/cart" className="storefront-cart-link">
          <span>Cart</span>
          <span
            className="storefront-cart-count"
            aria-label={`${cartCount} items in cart`}
          >
            {cartCount}
          </span>
        </Link>
      </nav>
    </header>
  );
}

export default StorefrontHeader;
