import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import StorefrontHeader from '../components/StorefrontHeader';
import {
  getMyProfile,
  updateMyProfile,
  type CustomerProfile,
} from '../services/customer.service';
import { useAuthStore } from '../stores/auth.store';
import './CustomerProfilePage.css';

export default function CustomerProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [profile, setProfile] = useState<CustomerProfile | null>(user);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [loading, setLoading] = useState(!user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setProfile(user);
      setName(user.name);
      setEmail(user.email);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const result = await getMyProfile();

        if (!cancelled) {
          setProfile(result);
          setName(result.name);
          setEmail(result.email);
          setUser(result);
        }
      } catch {
        if (!cancelled) {
          setError('Unable to load your profile. Please try again.');
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
          <p>Loading your profile...</p>
        </main>
      </>
    );
  }

  if (profile?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setSaving(true);

    try {
      const updated = await updateMyProfile({
        name: name.trim(),
        email: email.trim(),
      });

      setProfile(updated);
      setName(updated.name);
      setEmail(updated.email);
      setUser(updated);
      setSuccess('Your profile has been updated.');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
          ? err.response.data.message
          : 'Unable to update your profile. Please try again.';

      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return (
      <>
        <StorefrontHeader />
        <main className="container">
          <p role="alert">{error || 'Unable to load your profile.'}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </main>
      </>
    );
  }

  return (
    <>
      <StorefrontHeader />

      <main className="container customer-profile">
        <p>
          <Link to="/account">My Account</Link> / Profile
        </p>

        <h1>My Profile</h1>
        <p>Update your personal account information.</p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={2}
              required
            />
          </div>

          <div>
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {error && <p role="alert">{error}</p>}
          {success && <p role="status">{success}</p>}

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <p>
          <Link to="/account">Back to my account</Link>
        </p>
      </main>
    </>
  );
}
