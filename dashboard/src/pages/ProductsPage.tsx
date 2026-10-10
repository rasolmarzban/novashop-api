import { useState } from 'react';

import {
  useCreateProduct,
  useProducts,
} from '../services/product.queries';

import './ProductsPage.css';

export default function ProductsPage() {
  const {
    data: products,
    isLoading,
    isError,
    error,
    refetch,
  } = useProducts();

  const createProductMutation = useCreateProduct();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);

  function resetForm() {
    setName('');
    setSlug('');
    setDescription('');
    setPrice('');
    setStock('');
    setIsActive(true);
  }

  function closeCreateForm() {
    if (createProductMutation.isPending) {
      return;
    }

    resetForm();
    setIsCreateOpen(false);
  }

  async function handleCreateProduct(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    await createProductMutation.mutateAsync({
      name,
      slug,
      description: description || undefined,
      price: Number(price),
      stock: Number(stock),
      isActive,
    });

    resetForm();
    setIsCreateOpen(false);
  }

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          Loading products...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="products-page">
        <div className="products-empty">
          <h3>Failed to load products</h3>

          <p>
            {error instanceof Error
              ? error.message
              : 'Unknown error'}
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">

      {/* Page header */}
      <div className="products-page-header">

        <div className="products-page-title">
          <h1>Products</h1>

          <p>
            Manage your store products.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setIsCreateOpen(true)}
        >
          + Add Product
        </button>

      </div>

      {/* Create product form */}
      {isCreateOpen && (
        <div className="product-form-card">

          <h2>Add Product</h2>

          <form
            className="product-form"
            onSubmit={handleCreateProduct}
          >

            {/* Name */}
            <div className="product-form-field">
              <label htmlFor="product-name">
                Name
              </label>

              <input
                id="product-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="MacBook Pro 14"
                required
              />
            </div>

            {/* Slug */}
            <div className="product-form-field">
              <label htmlFor="product-slug">
                Slug
              </label>

              <input
                id="product-slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(event.target.value)
                }
                placeholder="macbook-pro-14"
                required
              />
            </div>

            {/* Description */}
            <div className="product-form-field full-width">
              <label htmlFor="product-description">
                Description
              </label>

              <textarea
                id="product-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Product description..."
              />
            </div>

            {/* Price */}
            <div className="product-form-field">
              <label htmlFor="product-price">
                Price
              </label>

              <input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                placeholder="1999.99"
                required
              />
            </div>

            {/* Stock */}
            <div className="product-form-field">
              <label htmlFor="product-stock">
                Stock
              </label>

              <input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                placeholder="10"
                required
              />
            </div>

            {/* Active */}
            <div className="product-checkbox">
              <input
                id="product-active"
                type="checkbox"
                checked={isActive}
                onChange={(event) =>
                  setIsActive(event.target.checked)
                }
              />

              <label htmlFor="product-active">
                Active product
              </label>
            </div>

            {/* Actions */}
            <div className="product-form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={closeCreateForm}
                disabled={createProductMutation.isPending}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending
                  ? 'Creating...'
                  : 'Create Product'}
              </button>

            </div>

            {/* API error */}
            {createProductMutation.isError && (
              <div className="product-error">
                {createProductMutation.error instanceof Error
                  ? createProductMutation.error.message
                  : 'Failed to create product'}
              </div>
            )}

          </form>

        </div>
      )}

      {/* Product table */}
      {products && products.length === 0 ? (
        <div className="products-table-card">
          <div className="products-empty">

            <h3>No products yet</h3>

            <p>
              Create your first product to get started.
            </p>

          </div>
        </div>
      ) : (
        <div className="products-table-card">

          <table className="products-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {products?.map((product) => (
                <tr key={product.id}>

                  <td>
                    <span className="product-name">
                      {product.name}
                    </span>
                  </td>

                  <td>
                    <span className="product-slug">
                      {product.slug}
                    </span>
                  </td>

                  <td>
                    ${product.price}
                  </td>

                  <td>
                    {product.stock}
                  </td>

                  <td>
                    <span
                      className={
                        product.isActive
                          ? 'product-status active'
                          : 'product-status inactive'
                      }
                    >
                      {product.isActive
                        ? 'Active'
                        : 'Inactive'}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}