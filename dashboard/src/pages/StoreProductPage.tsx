
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getProductImageUrl,
  type Product,
} from '../services/product.service';
import { getStorefrontProductBySlug } from '../services/storefront.service';
import { addToCart } from '../services/cart.service';
import './StoreProductPage.css';
import StorefrontHeader from '../components/StorefrontHeader';
import { notify } from '../stores/notification.store';

function formatPrice(price: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function getFeaturedImage(product: Product) {
  return (
    product.images.find((image) => image.isFeatured) ??
    product.images[0] ??
    null
  );
}

function StoreProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const productQuery = useQuery({
    queryKey: ['storefront', 'product', slug],
    queryFn: () => getStorefrontProductBySlug(slug!),
    enabled: Boolean(slug),
  });

  if (productQuery.isPending) {
    return (
      <main className="store-product-page">
        <p className="store-product-message">Loading product...</p>
      </main>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <main className="store-product-page">
        <section className="store-product-message">
          <h1>Product not found</h1>
          <p>This product may be unavailable or the link may be incorrect.</p>
          <Link className="store-back-link" to="/shop">
            Back to shop
          </Link>
        </section>
      </main>
    );
  }

  const product = productQuery.data;
  const featuredImage = getFeaturedImage(product);
  const selectedImage =
    product.images.find((image) => image.id === selectedImageId) ??
    featuredImage;

  const imageUrl = selectedImage
    ? getProductImageUrl(selectedImage.url)
    : null;

  const isInStock = product.stock > 0;
  const displayedPrice = product.salePrice || product.price;

 function handleAddToCart() {
  try {
    addToCart(product, quantity);
    notify.success(
      `${quantity} × ${product.name} added to your cart.`,
    );
  } catch (error) {
    notify.error(
      error instanceof Error
        ? error.message
        : 'Could not add the product to your cart.',
    );
  }
}

  return (
    <main className="store-product-page">
      <StorefrontHeader />

      <div className="store-product-container">
        <nav className="store-breadcrumb" aria-label="Breadcrumb">
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        <section className="store-product-details">
          <div className="store-product-gallery">
            <div className="store-product-main-image">
              {imageUrl ? (
                <img src={imageUrl} alt={selectedImage?.altText || product.name} />
              ) : (
                <div className="store-product-no-image">
                  No image available
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="store-product-thumbnails">
                {product.images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    className={`store-product-thumbnail ${
                      (selectedImage?.id ?? null) === image.id
                        ? 'is-selected'
                        : ''
                    }`}
                    onClick={() => setSelectedImageId(image.id)}
                    aria-label={`View image ${image.sortOrder + 1}`}
                    aria-pressed={(selectedImage?.id ?? null) === image.id}
                  >
                    <img
                      src={getProductImageUrl(image.url)}
                      alt={image.altText || `${product.name} image ${image.sortOrder + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="store-product-information">
            <p className="store-product-eyebrow">NOVASHOP COLLECTION</p>
            <h1>{product.name}</h1>

            <div className="store-product-pricing">
              <span className="store-product-current-price">
                {formatPrice(displayedPrice)}
              </span>

              {product.salePrice && (
                <span className="store-product-original-price">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <p
              className={
                isInStock
                  ? 'store-product-stock is-available'
                  : 'store-product-stock is-unavailable'
              }
            >
              {isInStock ? `${product.stock} available in stock` : 'Out of stock'}
            </p>

            <div className="store-product-description">
              <h2>Product description</h2>
              <p>{product.description || 'No description is available for this product.'}</p>
            </div>

            <div className="store-product-purchase">
              <label htmlFor="product-quantity">Quantity</label>

              <div className="store-product-quantity">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={!isInStock || quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  −
                </button>

                <span id="product-quantity" aria-live="polite">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!isInStock || quantity >= product.stock}
                  onClick={() =>
                    setQuantity((current) => Math.min(product.stock, current + 1))
                  }
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="store-add-to-cart"
                disabled={!isInStock}
                onClick={handleAddToCart}
              >
                {isInStock ? 'Add to cart' : 'Currently unavailable'}
              </button>

            </div>

            <Link to="/shop" className="store-continue-shopping">
              ← Continue shopping
            </Link>
          </div>
        </section>
      </div>

      <footer className="store-product-footer">
        © {new Date().getFullYear()} NovaShop. All rights reserved.
      </footer>
    </main>
  );
}

export default StoreProductPage;
