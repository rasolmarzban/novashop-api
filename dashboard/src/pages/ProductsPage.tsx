import { useState } from 'react';

import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from '../services/product.queries';

import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '../services/product.service';

import './ProductsPage.css';

import ConfirmModal from '../components/ConfirmModal';
import { notify } from '../stores/notification.store';

interface ProductFormState {
  name: string;
  slug: string;
  description: string;
  price: string;
  salePrice: string;
  stock: string;
  isActive: boolean;
}

const emptyForm: ProductFormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  salePrice: '',
  stock: '0',
  isActive: true,
};

export default function ProductsPage() {
  const productsQuery = useProducts();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [form, setForm] = useState<ProductFormState>({
    ...emptyForm,
  });

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const products = productsQuery.data ?? [];

  const isSaving =
    createMutation.isPending || updateMutation.isPending;

  function updateField<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setForm({ ...emptyForm });
    setEditingProduct(null);
    setFormError('');
    setIsFormOpen(true);
  }

  function closeForm() {
    setForm({ ...emptyForm });
    setEditingProduct(null);
    setFormError('');
    setIsFormOpen(false);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description ?? '',
      price: String(product.price),
      salePrice:
        product.salePrice === null
          ? ''
          : String(product.salePrice),
      stock: String(product.stock),
      isActive: product.isActive,
    });

    setFormError('');
    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError('');

    const price = Number(form.price);
    const stock = Number(form.stock);

    const salePrice =
      form.salePrice.trim() === ''
        ? null
        : Number(form.salePrice);

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setFormError(
        'Enter a valid price and a non-negative whole-number stock quantity.',
      );
      return;
    }

    if (
      salePrice !== null &&
      (!Number.isFinite(salePrice) ||
        salePrice < 0 ||
        salePrice >= price)
    ) {
      setFormError(
        'Sale price must be lower than the regular price.',
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      price,
      salePrice,
      stock,
      isActive: form.isActive,
    };

    try {
  const wasEditing = Boolean(editingProduct);

  if (editingProduct) {
    const updatePayload: UpdateProductRequest = payload;

    await updateMutation.mutateAsync({
      id: editingProduct.id,
      data: updatePayload,
    });
  } else {
    const createPayload: CreateProductRequest = payload;

    await createMutation.mutateAsync(createPayload);
  }

  closeForm();

  notify.success(
    wasEditing
      ? 'Product updated successfully.'
      : 'Product created successfully.',
  );
} catch {
  const message =
    'Could not save the product. Check your input and try again.';

  setFormError(message);
  notify.error(message);
}
  }

  function handleMoveToTrash(product: Product) {
  setPendingDelete(product);
}

  const [pendingDelete, setPendingDelete] =
   useState<Product | null>(null);

async function confirmMoveToTrash() {
  if (!pendingDelete) return;

  const product = pendingDelete;

  try {
    await deleteMutation.mutateAsync(product.id);

    if (editingProduct?.id === product.id) {
      closeForm();
    }

    notify.success(`"${product.name}" moved to Trash.`);
  } catch {
    notify.error(`Could not move "${product.name}" to Trash.`);
  } finally {
    setPendingDelete(null);
  }
}

  return (
    <section className="products-page">
      {/* Page heading and create button */}
      <div className="products-page-header">
        <div>
          <h1 className="products-page-title">Products</h1>
          <p>Manage your product catalog and pricing.</p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            className="primary-button"
            onClick={openCreateForm}
          >
            + Add Product
          </button>
        )}
      </div>

      {/* Show the form only when creating or editing */}
      {isFormOpen && (
        <div className="product-form-card">
          <div className="product-form-header">
            <h2>
              {editingProduct
                ? `Edit Product #${editingProduct.id}`
                : 'Add New Product'}
            </h2>

            <button
              type="button"
              className="product-close-button"
              onClick={closeForm}
              disabled={isSaving}
              aria-label="Close product form"
            >
              ✕
            </button>
          </div>

          <form
            className="product-form"
            onSubmit={handleSubmit}
          >
            <div className="product-form-field">
              <label htmlFor="product-name">
                Product name
              </label>
              <input
                id="product-name"
                value={form.name}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
                minLength={2}
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-slug">Slug</label>
              <input
                id="product-slug"
                value={form.slug}
                onChange={(event) =>
                  updateField('slug', event.target.value)
                }
                minLength={2}
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-description">
                Full description
              </label>
              <textarea
                id="product-description"
                value={form.description}
                onChange={(event) =>
                  updateField('description', event.target.value)
                }
                rows={5}
                placeholder="Describe your product..."
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-price">
                Regular price
              </label>
              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) =>
                  updateField('price', event.target.value)
                }
                required
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-sale-price">
                Sale price (optional)
              </label>
              <input
                id="product-sale-price"
                type="number"
                min="0"
                step="0.01"
                value={form.salePrice}
                onChange={(event) =>
                  updateField('salePrice', event.target.value)
                }
                placeholder="Leave empty for no sale"
              />
            </div>

            <div className="product-form-field">
              <label htmlFor="product-stock">
                Stock quantity
              </label>
              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) =>
                  updateField('stock', event.target.value)
                }
                required
              />
            </div>

            <label className="product-checkbox">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField('isActive', event.target.checked)
                }
              />
              Product is active
            </label>

            {formError && (
              <p className="product-error" role="alert">
                {formError}
              </p>
            )}

            <div className="product-form-actions">
              <button
                type="submit"
                className="primary-button"
                disabled={isSaving}
              >
                {isSaving
                  ? 'Saving...'
                  : editingProduct
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={closeForm}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products table */}
      <div className="products-table-card">
        <h2>All Products</h2>

        {productsQuery.isLoading ? (
          <p className="products-loading">
            Loading products...
          </p>
        ) : productsQuery.isError ? (
          <div>
            <p className="product-error">
              Could not load products.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() => productsQuery.refetch()}
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <p className="products-empty">
            No products yet. Click Add Product to create your first product.
          </p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="product-name">
                      {product.name}
                    </div>
                    <div className="product-slug">
                      {product.slug}
                    </div>
                  </td>

                  <td>
                    {product.salePrice !== null ? (
                      <div className="product-prices">
                        <span className="product-original-price">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <strong className="product-sale-price">
                          ${Number(product.salePrice).toFixed(2)}
                        </strong>
                      </div>
                    ) : (
                      <span>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    )}
                  </td>

                  <td>{product.stock}</td>

                  <td>
                    <span
                      className={
                        product.isActive
                          ? 'product-status active'
                          : 'product-status inactive'
                      }
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td>
                    <div className="product-row-actions">
                      <button
                        type="button"
                        className="product-edit-button"
                        onClick={() => handleEdit(product)}
                        disabled={deleteMutation.isPending}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="product-trash-button"
                        onClick={() => handleMoveToTrash(product)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending
                          ? 'Moving...'
                          : 'Move to Trash'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ConfirmModal
  open={pendingDelete !== null}
  title="Move product to Trash?"
  message={
    <>
      Are you sure you want to move{' '}
      <strong>{pendingDelete?.name}</strong> to Trash?
      You can restore it later.
    </>
  }
  confirmText="Move to Trash"
  loading={deleteMutation.isPending}
  onCancel={() => setPendingDelete(null)}
  onConfirm={confirmMoveToTrash}
/>
    </section>
  );
}
