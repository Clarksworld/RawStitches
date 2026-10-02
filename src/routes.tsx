import { createBrowserRouter } from 'react-router';
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import OrderTracking from './pages/OrderTracking';
import Account from './pages/Account';
import CustomerAccess from './pages/CustomerAccess';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AddProduct from './admin/AddProduct';
import AdminInventory from './admin/AdminInventory';
import AdminOrders from './admin/AdminOrders';
import AdminOrderDetail from './admin/AdminOrderDetail';
import AdminCustomers from './admin/AdminCustomers';
import AdminPayments from './admin/AdminPayments';
import AdminDiscounts from './admin/AdminDiscounts';
import AdminCatalog from './admin/AdminCatalog';
import AdminReviews from './admin/AdminReviews';
import AdminDelivery from './admin/AdminDelivery';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminContent from './admin/AdminContent';
import AdminSettings from './admin/AdminSettings';

export const router = createBrowserRouter([
  // ─── Customer store ─────────────────────────────────────────────
  {
    path: '/',
    Component: CustomerLayout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'shop/:slug', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'confirmation/:orderNumber', Component: Confirmation },
      { path: 'track/:orderNumber', Component: OrderTracking },
      { path: 'account', Component: Account },
      { path: 'sign-in', Component: CustomerAccess },
      { path: 'create-account', Component: CustomerAccess },
      { path: 'account-access', Component: CustomerAccess },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: '*', Component: NotFound },
    ],
  },

  // ─── Admin login (standalone, no layout) ────────────────────────
  { path: '/admin', Component: AdminLogin },

  // ─── Admin panel (authenticated layout) ─────────────────────────
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { path: 'dashboard', Component: AdminDashboard },
      { path: 'products', Component: AdminProducts },
      { path: 'products/new', Component: AddProduct },
      { path: 'products/:id/edit', Component: AddProduct },
      { path: 'inventory', Component: AdminInventory },
      { path: 'orders', Component: AdminOrders },
      { path: 'orders/:id', Component: AdminOrderDetail },
      { path: 'customers', Component: AdminCustomers },
      { path: 'payments', Component: AdminPayments },
      { path: 'discounts', Component: AdminDiscounts },
      { path: 'catalog', Component: AdminCatalog },
      { path: 'reviews', Component: AdminReviews },
      { path: 'delivery', Component: AdminDelivery },
      { path: 'analytics', Component: AdminAnalytics },
      { path: 'content', Component: AdminContent },
      { path: 'settings', Component: AdminSettings },
    ],
  },
]);
