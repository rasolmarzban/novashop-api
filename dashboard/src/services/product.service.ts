
import api from './api';

export interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  sortOrder: number;
  isFeatured: boolean;
  productId: number;
  createAt: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  salePrice: string | null;
  stock: number;
  isActive: boolean;
  deletedAt: string | null;
  images: ProductImage[];
  createAt: string;
  updateAt: string;
}

export interface CreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  isActive?: boolean;
}

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products');
  return response.data;
}

export async function getTrashProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>('/products/trash');
  return response.data;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
}

export async function createProduct(
  data: CreateProductRequest,
): Promise<Product> {
  const response = await api.post<Product>('/products', data);
  return response.data;
}

export async function updateProduct(
  id: number,
  data: UpdateProductRequest,
): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}`, data);
  return response.data;
}

export async function deleteProduct(id: number): Promise<Product> {
  const response = await api.delete<Product>(`/products/${id}`);
  return response.data;
}

export async function restoreProduct(id: number): Promise<Product> {
  const response = await api.patch<Product>(`/products/${id}/restore`);
  return response.data;
}

export async function permanentlyDeleteProduct(
  id: number,
): Promise<Product> {
  const response = await api.delete<Product>(`/products/${id}/permanent`);
  return response.data;
}
