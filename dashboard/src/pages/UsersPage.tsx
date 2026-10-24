
import { useEffect, useState } from 'react';

import {
  getAdminCustomers,
  type AdminCustomer,
  type AdminCustomersResponse,
} from '../services/admin-customers.service';

import './DashboardPage.css';
import './UsersPage.css';
import { Link } from 'react-router-dom';

export default function UsersPage() {
  const [result, setResult] =
    useState<AdminCustomersResponse | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadCustomers() {
      setIsLoading(true);
      setError('');

      try {
        const response = await getAdminCustomers(page, 10, search);

        if (isActive) {
          setResult(response);
        }
      } catch {
        if (isActive) {
          setError(
            'Could not load customers. Check your connection and admin access.',
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCustomers();

    return () => {
      isActive = false;
    };
  }, [page, search, refreshKey]);

  const customers = result?.data ?? [];
  const pagination = result?.pagination;

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
  }

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h1>Customers</h1>
          <p>View and search your store customers.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() => setRefreshKey((current) => current + 1)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>All Customers</h2>
            <p>
              {pagination
                ? `${pagination.total} customers in total`
                : 'Customers registered in your store'}
            </p>
          </div>
        </div>

        <form className="customers-search" onSubmit={handleSearch}>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search customers by name or email"
          />

          <button
            type="submit"
            className="primary-button"
            disabled={isLoading}
          >
            Search
          </button>

          {search && (
            <button
              type="button"
              className="secondary-button"
              disabled={isLoading}
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setPage(1);
              }}
            >
              Clear
            </button>
          )}
        </form>

        {isLoading ? (
          <div className="dashboard-message">
            Loading customers...
          </div>
        ) : error ? (
          <div className="dashboard-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="dashboard-message">
            No customers found.
          </div>
        ) : (
          <>
            <div className="dashboard-table-wrapper">
              <table className="dashboard-orders-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Orders</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer: AdminCustomer) => (
                    <tr key={customer.id}>
                      <td>
                        <Link
  to={`/dashboard/users/${customer.id}`}
  className="customer-order-link"
>
  {customer.name}
</Link>
                        <div className="dashboard-customer-email">
                          ID #{customer.id}
                        </div>
                      </td>
                      <td>{customer.email}</td>
                      <td>{customer.orderCount}</td>
                      <td>{formatDate(customer.createAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="orders-pagination">
              <span>
                Page {pagination?.page ?? page} of{' '}
                {pagination?.totalPages ?? 1}
              </span>

              <div className="orders-pagination-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  disabled={
                    !pagination ||
                    page >= pagination.totalPages ||
                    isLoading
                  }
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
