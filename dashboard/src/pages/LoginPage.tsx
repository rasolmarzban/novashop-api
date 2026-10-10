import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import { login } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();

  const setTokens = useAuthStore((state) => state.setTokens);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const tokens = await login({
        email,
        password,
      });

      setTokens(tokens);

      navigate('/dashboard');
    } catch (error) {
      console.error('LOGIN ERROR:', error);

      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Response:', error.response?.data);

        setError(
          error.response?.data?.message ||
            `Request failed with status ${error.response?.status}`,
        );
      } else {
        setError('Unexpected error. Check the browser console.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>NovaShop Admin</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}