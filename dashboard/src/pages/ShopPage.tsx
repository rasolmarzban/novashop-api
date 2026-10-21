
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  getProductImageUrl,
  type Product,
} from '../services/product.service';
import { getStorefrontProducts } from '../services/storefront.service';
import './ShopPage.css';
import StorefrontHeader from '../components/StorefrontHeader';

function formatPrice(price: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(price));
}

function getProductImage(product: Product): string | null {
  const image =
    product.images.find((item) => item.isFeatured) ??
    product.images[0];

  return image ? getProductImageUrl(image.url) : null;
}

function ShopPage() {
  const productsQuery = useQuery({
    queryKey: ['storefront', 'products'],
    queryFn: getStorefrontProducts,
  });

  if (productsQuery.isPending) {
    return (
      <main className="shop-page">
        <p className="shop-message">Loading products...</p>
      </main>
    );
  }

  if (productsQuery.isError) {
    return (
      <main className="shop-page">
        <section className="shop-message">
          <h2>We couldn't load the products.</h2>
          <p>Please check your connection and try again.</p>
          <button
            className="shop-retry-button"
            type="button"
            onClick={() => productsQuery.refetch()}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const products = productsQuery.data;

  return (
    <main className="shop-page">
      <StorefrontHeader />

      <section className="shop-hero">
        <p className="shop-eyebrow">WELCOME TO NOVASHOP</p>
        <h1>Find your next favorite.</h1>
        <p>
          Explore our collection of electronics and discover
          products made for your everyday life.
        </p>
      </section>

      <section className="shop-catalog" aria-labelledby="shop-title">
        <div className="shop-section-heading">
          <div>
            <h2 id="shop-title">Our products</h2>
            <p>
              {products.length}{' '}
              {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="shop-empty">
            <h3>No products available yet</h3>
            <p>Please check back later.</p>
          </div>
        ) : (
          <div className="shop-product-grid">
            {products.map((product) => {
              const imageUrl = getProductImage(product);

              return (
                <article className="shop-product-card" key={product.id}>
                  <Link
                    to={`/shop/${encodeURIComponent(product.slug)}`}
                    className="shop-product-image-link"
                    aria-label={`View ${product.name}`}
                  >
                    {imageUrl ? (
                      <img
                        className="shop-product-image"
                        src={imageUrl}
                        alt={
                          product.images.find((image) => image.isFeatured)
                            ?.altText || product.name
                        }
                        loading="lazy"
                      />
                    ) : (
                      <div className="shop-image-placeholder">
                        No image available
                      </div>
                    )}
                  </Link>

                  <div className="shop-product-info">
                    <h3 className="shop-product-name">
                      <Link
                        to={`/shop/${encodeURIComponent(product.slug)}`}
                      >
                        {product.name}
                      </Link>
                    </h3>

                    <p className="shop-product-price">
                      {product.salePrice
                        ? formatPrice(product.salePrice)
                        : formatPrice(product.price)}
                    </p>

                    <p
                      className={
                        product.stock > 0
                          ? 'shop-stock shop-stock-available'
                          : 'shop-stock shop-stock-unavailable'
                      }
                    >
                      {product.stock > 0 ? 'In stock' : 'Out of stock'}
                    </p>

                    <Link
                      to={`/shop/${encodeURIComponent(product.slug)}`}
                      className="shop-view-button"
                    >
                      View product
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="shop-footer">
        <p>© {new Date().getFullYear()} NovaShop. All rights reserved.</p>
      </footer>
    </main>
  );
}

export default ShopPage;
