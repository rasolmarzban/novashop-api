export default function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Welcome back to NovaShop administration.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">
            Products
          </span>

          <strong className="stat-value">
            0
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Orders
          </span>

          <strong className="stat-value">
            0
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Customers
          </span>

          <strong className="stat-value">
            0
          </strong>
        </div>

        <div className="stat-card">
          <span className="stat-label">
            Revenue
          </span>

          <strong className="stat-value">
            $0
          </strong>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Orders</h2>

        <div className="empty-state">
          No orders yet.
        </div>
      </div>
    </div>
  );
}