import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import StorefrontHeader from '../components/StorefrontHeader';
import { getMyProfile } from '../services/customer.service';
import type { CustomerProfile } from '../services/customer.service';
import { useAuthStore } from '../stores/auth.store';
import './CustomerDashboardPage.css';

export default function CustomerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [profile, setProfile] = useState<CustomerProfile | null>(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile(user);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const result = await getMyProfile();

        if (!cancelled) {
          setProfile(result);
          setUser(result);
        }
      } catch {
        if (!cancelled) {
          setError('We could not load your account. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, setUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <>
        <StorefrontHeader />
        <main className="container">
          <p>Loading your account...</p>
        </main>
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <StorefrontHeader />
        <main className="container">
          <p role="alert">{error || 'Unable to load your account.'}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </main>
      </>
    );
  }

  if (profile.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <StorefrontHeader />

      <main className="container customer-dashboard">
        <section className="customer-dashboard__welcome">
          <p>YOUR ACCOUNT</p>
          <h1>Welcome back, {profile.name}!</h1>
          <p>Manage your orders and account information.</p>
        </section>

        <section className="customer-dashboard__grid">
          <Link to="/my-orders" className="customer-dashboard__card">
            <h2>My Orders</h2>
            <p>View your orders, order statuses, and purchase history.</p>
            <span>View orders →</span>
          </Link>

          <Link to="/account/profile" className="customer-dashboard__card">
            <h2>My Profile</h2>
            <p>View and manage your personal account information.</p>
            <span>View profile →</span>
          </Link>

          <Link to="/shop" className="customer-dashboard__card">
            <h2>Continue Shopping</h2>
            <p>Explore products and find something you like.</p>
            <span>Browse products →</span>
          </Link>
        </section>
      </main>
    </>
  );
}
