import { useState } from 'react';

import {
  usePermanentlyDeleteProduct,
  useRestoreProduct,
  useTrashProducts,
} from '../services/product.queries';

import ConfirmModal from '../components/ConfirmModal';
import { notify } from '../stores/notification.store';
import type { Product } from '../services/product.service';

import './ProductTrashPage.css';

export default function ProductTrashPage() {
  const trashQuery = useTrashProducts();
  const restoreMutation = useRestoreProduct();
  const deleteMutation = usePermanentlyDeleteProduct();

  const [pendingDelete, setPendingDelete] =
    useState<Product | null>(null);

  const products = trashQuery.data ?? [];

  async function handleRestore(product: Product) {
    try {
      await restoreMutation.mutateAsync(product.id);
      notify.success(`"${product.name}" restored successfully.`);
    } catch {
      notify.error(`Could not restore "${product.name}".`);
    }
  }

  async function confirmPermanentDelete() {
    if (!pendingDelete) return;

    const product = pendingDelete;

    try {
      await deleteMutation.mutateAsync(product.id);
      notify.success(`"${product.name}" permanently deleted.`);
    } catch {
      notify.error(`Could not permanently delete "${product.name}".`);
    } finally {
      setPendingDelete(null);
    }
  }

  if (trashQuery.isLoading) {
    return <div className="trash-page">Loading Trash...</div>;
  }

  if (trashQuery.isError) {
    return (
      <div className="trash-page">
        <h1>Trash</h1>
        <p className="trash-error">
          Could not load deleted products. Check your connection
          and admin access.
        </p>
        <button
          type="button"
          onClick={() => trashQuery.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="trash-page">
      <div className="trash-header">
        <div>
          <h1>Trash</h1>
          <p>Restore products or permanently delete them.</p>
        </div>

        <span className="trash-count">
          {products.length} items
        </span>
      </div>

      {products.length === 0 ? (
        <div className="trash-empty">
          <h2>Trash is empty</h2>
          <p>Products you move to Trash will appear here.</p>
        </div>
      ) : (
        <div className="trash-table-card">
          <table className="trash-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <small>{product.slug}</small>
                  </td>

                  <td>${Number(product.price).toFixed(2)}</td>

                  <td>
                    {product.deletedAt
                      ? new Date(
                          product.deletedAt,
                        ).toLocaleDateString()
                      : '—'}
                  </td>

                  <td>
                    <div className="trash-actions">
                      <button
                        type="button"
                        className="trash-restore"
                        disabled={
                          restoreMutation.isPending ||
                          deleteMutation.isPending
                        }
                        onClick={() => handleRestore(product)}
                      >
                        Restore
                      </button>

                      <button
                        type="button"
                        className="trash-delete"
                        disabled={
                          restoreMutation.isPending ||
                          deleteMutation.isPending
                        }
                        onClick={() => setPendingDelete(product)}
                      >
                        Delete permanently
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete permanently?"
        message={
          <>
            <strong>{pendingDelete?.name}</strong> will be
            permanently deleted. This action cannot be undone.
          </>
        }
        confirmText="Delete permanently"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmPermanentDelete}
      />
    </section>
  );
}