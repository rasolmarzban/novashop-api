import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductTrashPage from './pages/ProductTrashPage';
import ProtectedRoute from './routes/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import ShopPage from './pages/ShopPage';
import StoreProductPage from './pages/StoreProductPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Public storefront */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<StoreProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />

        {/* Protected admin area */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/dashboard/products"
              element={<ProductsPage />}
            />

            <Route
              path="/dashboard/products/trash"
              element={<ProductTrashPage />}
            />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;