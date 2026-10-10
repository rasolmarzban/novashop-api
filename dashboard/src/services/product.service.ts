import api from './api';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  stock: number;
  isActive: boolean;
  createAt: string;
  updateAt: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

/**
 * Fetch all products.
 */
export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products');

  return response.data;
}

/**
 * Fetch a single product.
 */
export async function getProduct(
  id: number,
): Promise<Product> {
  const response = await api.get<Product>(
    `/products/${id}`,
  );

  return response.data;
}

/**
 * Create a new product.
 */
export async function createProduct(
  data: CreateProductRequest,
): Promise<Product> {
  const response = await api.post<Product>(
    '/products',
    data,
  );

  return response.data;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
): Promise<Product> {
  const response = await api.patch<Product>(
    `/products/${id}`,
    data,
  );

  return response.data;
}

/**
 * Delete a product.
 */
export async function deleteProduct(
  id: number,
): Promise<Product> {
  const response = await api.delete<Product>(
    `/products/${id}`,
  );

  return response.data;
}