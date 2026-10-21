
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

/**
 * Upload multiple images for a product.
 */
export async function uploadProductImages(
  productId: number,
  files: File[],
): Promise<ProductImage[]> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<ProductImage[]>(
    `/products/${productId}/images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

/**
 * Manually select the featured image.
 */
export async function setFeaturedProductImage(
  productId: number,
  imageId: number,
): Promise<ProductImage> {
  const response = await api.patch<ProductImage>(
    `/products/${productId}/images/${imageId}/featured`,
  );

  return response.data;
}

/**
 * Save the order of all product images.
 */
export async function reorderProductImages(
  productId: number,
  imageIds: number[],
): Promise<Product> {
  const response = await api.patch<Product>(
    `/products/${productId}/images/order`,
    { imageIds },
  );

  return response.data;
}

/**
 * Delete one product image.
 */
export async function deleteProductImage(
  productId: number,
  imageId: number,
): Promise<ProductImage> {
  const response = await api.delete<ProductImage>(
    `/products/${productId}/images/${imageId}`,
  );

  return response.data;
}

/**
 * Convert a relative upload path into a browser-accessible URL.
 */
export function getProductImageUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url, api.defaults.baseURL).toString();
}