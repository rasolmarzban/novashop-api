import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductTrashPage from './pages/ProductTrashPage';
import OrdersPage from './pages/OrdersPage';
import ProtectedRoute from './routes/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import ShopPage from './pages/ShopPage';
import StoreProductPage from './pages/StoreProductPage';
import CartPage from './pages/CartPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import UsersPage from './pages/UsersPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />

      <Routes>
        {/* Public authentication routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public storefront routes */}
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<StoreProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route
          path="/order-success/:orderNumber"
          element={<OrderSuccessPage />}
        />
        <Route path="/my-orders" element={<MyOrdersPage />} />

        {/* Customer account routes */}
        <Route path="/account" element={<CustomerDashboardPage />} />
        <Route path="/account/profile" element={<CustomerProfilePage />} />

        {/* Protected admin routes share the same layout and sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/products" element={<ProductsPage />} />
            <Route
              path="/dashboard/products/trash"
              element={<ProductTrashPage />}
            />
            <Route path="/dashboard/orders" element={<OrdersPage />} />
            <Route
              path="/dashboard/orders/:id"
              element={<OrderDetailsPage />}
            />
            <Route path="/dashboard/users" element={<UsersPage />} />
            <Route
              path="/dashboard/users/:id"
              element={<CustomerDetailsPage />}
            />
          </Route>
        </Route>

        {/* Show a 404 page for unknown routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
