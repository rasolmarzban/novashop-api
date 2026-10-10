
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
  getTrashProducts,
  permanentlyDeleteProduct,
  restoreProduct,
  updateProduct,
  type CreateProductRequest,
  type UpdateProductRequest,
} from './product.service';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: () => [...productKeys.lists()] as const,
  trash: () => [...productKeys.all, 'trash'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};

export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: getProducts,
  });
}

export function useTrashProducts() {
  return useQuery({
    queryKey: productKeys.trash(),
    queryFn: getTrashProducts,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => createProduct(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}

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

    onSuccess: async (product) => {
      queryClient.setQueryData(productKeys.detail(product.id), product);

      await queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),

    onSuccess: async (_product, id) => {
      queryClient.removeQueries({
        queryKey: productKeys.detail(id),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: productKeys.trash(),
        }),
      ]);
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restoreProduct(id),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: productKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: productKeys.trash(),
        }),
      ]);
    },
  });
}

export function usePermanentlyDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => permanentlyDeleteProduct(id),

    onSuccess: async (_product, id) => {
      queryClient.removeQueries({
        queryKey: productKeys.detail(id),
      });

      await queryClient.invalidateQueries({
        queryKey: productKeys.trash(),
      });
    },
  });
}
