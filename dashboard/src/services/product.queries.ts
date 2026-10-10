import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  type CreateProductRequest,
  type UpdateProductRequest,
} from './product.service';

/**
 * Centralized query keys for Products.
 */
export const productKeys = {
  all: ['products'] as const,

  lists: () => [...productKeys.all, 'list'] as const,

  list: () => [...productKeys.lists()] as const,

  details: () => [...productKeys.all, 'detail'] as const,

  detail: (id: number) =>
    [...productKeys.details(), id] as const,
};

/**
 * Fetch all products.
 */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: getProducts,
  });
}

/**
 * Fetch one product.
 */
export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
}

/**
 * Create product.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) =>
      createProduct(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}

/**
 * Update product.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateProductRequest;
    }) => updateProduct(id, data),

    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct,
      );
    },
  });
}

/**
 * Delete product.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      deleteProduct(id),

    onSuccess: (_deletedProduct, deletedId) => {
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });

      queryClient.removeQueries({
        queryKey: productKeys.detail(deletedId),
      });
    },
  });
}