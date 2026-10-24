import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main
      style={{
        maxWidth: '600px',
        margin: '100px auto',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <p style={{ color: '#2563eb', fontWeight: 700 }}>ERROR 404</p>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or is unavailable.</p>
      <Link to="/shop">Return to shop</Link>
    </main>
  );
}

export default NotFoundPage;
