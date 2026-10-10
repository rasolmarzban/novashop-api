import { useState } from 'react';
import type { FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { notify } from '../stores/notification.store';

import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const tokens = await login({
        email: email.trim(),
        password,
      });

      setTokens(tokens);
      notify.success('Welcome back! You are now logged in.');

      navigate('/dashboard', { replace: true });
    } catch (error) {
      let message = 'Unable to log in. Please try again.';

      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        if (typeof apiMessage === 'string') {
          message = apiMessage;
        } else if (Array.isArray(apiMessage)) {
          message = apiMessage.join('. ');
        } else if (!error.response) {
          message = 'Cannot connect to the server. Check your connection.';
        }
      }

      setError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <aside className="auth-brand-panel">
        <div className="auth-brand">
          Nova<span>Shop</span>
        </div>

        <div className="auth-brand-content">
          <h2>Your store. Your control.</h2>
          <p>
            Manage your products, keep track of your inventory,
            and organize your store from one simple dashboard.
          </p>
        </div>

        <div className="auth-brand-footer">
          NovaShop Management Platform
        </div>
      </aside>

      <section className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-heading">
            <h1>Welcome back</h1>
            <p>Enter your account details to sign in to NovaShop.</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>

              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </section>
    </main>
  );
}