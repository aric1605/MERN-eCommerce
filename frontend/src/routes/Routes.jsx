import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Loader from '../components/Loader';
import PrivateRoute from '../components/PrivateRoute';
import AdminRoute from '../components/AdminRoute';

const HomePage = lazy(() => import('../pages/HomePage'));
const ProductPage = lazy(() => import('../pages/ProductPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ShippingPage = lazy(() => import('../pages/ShippingPage'));
const PaymentPage = lazy(() => import('../pages/PaymentPage'));
const PlaceOrderPage = lazy(() => import('../pages/PlaceOrderPage'));
const OrderDetailsPage = lazy(() => import('../pages/OrderDetailsPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const ResetPasswordRequestPage = lazy(() => import('../pages/ResetPasswordRequestPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));

const AdminDashboard = lazy(() => import('../AdminDashboard'));
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const OrderListPage = lazy(() => import('../pages/admin/OrderListPage'));
const ProductListPage = lazy(() => import('../pages/admin/ProductListPage'));
const UserListPage = lazy(() => import('../pages/admin/UserListPage'));
const ProductFormPage = lazy(() => import('../pages/admin/ProductFormPage'));
const UpdateUserFormPage = lazy(() => import('../pages/admin/UpdateUserFormPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfilePage'));
const AdminListPage = lazy(() => import('../pages/admin/AdminListPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

const withSuspense = Component => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        path: '/',
        element: withSuspense(HomePage)
      },
      {
        path: '/product/:id',
        element: withSuspense(ProductPage)
      },
      {
        path: '/cart',
        element: withSuspense(CartPage)
      },
      {
        path: '/reset-password',
        element: withSuspense(ResetPasswordRequestPage)
      },
      {
        path: '/reset-password/:id/:token',
        element: withSuspense(ResetPasswordPage)
      },
      {
        path: '/login',
        element: withSuspense(LoginPage)
      },
      {
        path: '/register',
        element: withSuspense(RegisterPage)
      },
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          {
            path: '/shipping',
            element: withSuspense(ShippingPage)
          },
          {
            path: '/payment',
            element: withSuspense(PaymentPage)
          },
          {
            path: '/place-order',
            element: withSuspense(PlaceOrderPage)
          },
          {
            path: '/order/:id',
            element: withSuspense(OrderDetailsPage)
          },
          {
            path: '/profile',
            element: withSuspense(ProfilePage)
          }
        ]
      }
    ]
  },
  {
    path: '/admin/login',
    element: withSuspense(AdminLoginPage)
  },
  {
    path: '',
    element: withSuspense(AdminDashboard),
    children: [
      {
        path: '',
        element: <AdminRoute />,
        children: [
          {
            path: '/admin/dashboard',
            element: withSuspense(Dashboard)
          },
          {
            path: '/admin/order-list',
            element: withSuspense(OrderListPage)
          },
          {
            path: '/admin/product-list',
            element: withSuspense(ProductListPage)
          },
          {
            path: '/admin/user-list',
            element: withSuspense(UserListPage)
          },
          {
            path: '/admin/product/create',
            element: withSuspense(ProductFormPage)
          },
          {
            path: '/admin/profile',
            element: withSuspense(AdminProfilePage)
          },
          {
            path: '/admin/admin-list',
            element: withSuspense(AdminListPage)
          },
          {
            path: '/admin/order/:id',
            element: withSuspense(OrderDetailsPage)
          },
          {
            path: '/admin/user/update/:id',
            element: withSuspense(UpdateUserFormPage)
          },
          {
            path: '/admin/product/update/:id',
            element: withSuspense(ProductFormPage)
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: withSuspense(NotFoundPage)
  }
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
