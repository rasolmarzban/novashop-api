import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';

import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* Protected admin area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            {/* Products */}
            <Route
              path="/dashboard/products"
              element={<ProductsPage />}
            />

          </Route>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;