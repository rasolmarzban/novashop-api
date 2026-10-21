
import api from './api';
import type { Product } from './product.service';

// Fetch active products for the public shop.
export async function getStorefrontProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products/storefront');
  return response.data;
}

// Fetch one active product by its slug.
export async function getStorefrontProductBySlug(
  slug: string,
): Promise<Product> {
  const response = await api.get<Product>(
    `/products/storefront/slug/${encodeURIComponent(slug)}`,
  );

  return response.data;
}
