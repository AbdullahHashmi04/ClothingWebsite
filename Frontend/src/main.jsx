import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './Style/index.css'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Auth0Provider } from '@auth0/auth0-react';
const AuthCallback = lazy(() => import('./Components/AuthCallBack/AuthCallback.jsx'));
import { CartProvider } from "./Components/Context/CartContext.jsx"
import App from "./Components/App.jsx"
import AdminLayout from "./Components/Admin/Layout.jsx"
import UserLayout from "./Components/User/UserDashboard/Layout.jsx"
import AdminRoute from "./Components/Admin/AdminRoute/AdminRoute.jsx"

const SignUp = lazy(() => import("./Components/Validations/Signup/SignUp.jsx"))
const Home = lazy(() => import("./Components/Home/Home.jsx"))
const Login = lazy(() => import("./Components/Validations/Login/Login.jsx"))
const Catalog = lazy(() => import("./Components/ProductDetails/Catalog.jsx"))
const Cart = lazy(() => import("./Components/Cart/Cart.jsx"))
const About = lazy(() => import("./Components/About/About.jsx"))
const OrderForm = lazy(() => import("./Components/OrderForm/OrderForm.jsx"))
const AdminDashboard = lazy(() => import("./Components/Admin/Dashboard.jsx"))
const AdminProducts = lazy(() => import("./Components/Admin/Products.jsx"))
const AdminOrders = lazy(() => import("./Components/Admin/Orders.jsx"))
const AdminCustomers = lazy(() => import("./Components/Admin/Customers.jsx"))
const AdminDiscounts = lazy(() => import("./Components/Admin/Discounts.jsx"))
const Vto = lazy(() => import("./Components/Ai/VirtualTryOn/vto.jsx"))
const Trending = lazy(() => import("./Components/Ai/TrendingFeature/trending.jsx"))
const UserProfile = lazy(() => import("./Components/User/UserDashboard/Profile.jsx"))
const UserOrders = lazy(() => import("./Components/User/UserDashboard/Orders.jsx"))
const UserReturns = lazy(() => import("./Components/User/UserDashboard/Returns.jsx"))
const UserWishlist = lazy(() => import("./Components/User/UserDashboard/Wishlist.jsx"))
const UserAddresses = lazy(() => import("./Components/User/UserDashboard/Addresses.jsx"))
const Feedback = lazy(() => import("./Components/User/UserDashboard/Feedback.jsx"))
const AdminFeedback = lazy(() => import("./Components/Admin/Feedback.jsx"))
const AdminComplaints = lazy(() => import("./Components/Admin/Complaints.jsx"))
const GlassesTryOn = lazy(() => import("./Components/Ai/GlassesTryOn/GlassesTryOn.jsx"))
const WearCast = lazy(() => import("./Components/Ai/Recommendation/Wearcast.jsx"))


const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0d0d0d',
    gap: '1.2rem',
  }}>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse-text {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
      .page-loader-ring {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top-color: #a855f7;
        border-right-color: #ec4899;
        animation: spin 0.85s linear infinite;
        box-shadow: 0 0 18px rgba(168, 85, 247, 0.45);
      }
      .page-loader-text {
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        background: linear-gradient(90deg, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: pulse-text 1.6s ease-in-out infinite;
      }
    `}</style>
    <div className="page-loader-ring" />
    <span className="page-loader-text">Loading…</span>
  </div>
);


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><Home /></Suspense> },
      { path: "signup", element: <Suspense fallback={<PageLoader />}><SignUp /></Suspense> },
      { path: "about", element: <Suspense fallback={<PageLoader />}><About /></Suspense> },
      { path: "login", element: <Suspense fallback={<PageLoader />}><Login /></Suspense> },
      { path: "catalog", element: <Suspense fallback={<PageLoader />}><Catalog /></Suspense> },
      { path: "mycart", element: <Suspense fallback={<PageLoader />}><Cart /></Suspense> },
      { path: "orderform", element: <Suspense fallback={<PageLoader />}><OrderForm /></Suspense> },
      { path: "vto", element: <Suspense fallback={<PageLoader />}><Vto /></Suspense> },
      { path: "trending", element: <Suspense fallback={<PageLoader />}><Trending /></Suspense> },
      { path: "auth/callback", element: <AuthCallback /> },
      { path: "feedback", element: <Suspense fallback={<PageLoader />}><Feedback /></Suspense> },
      { path: "glasses", element: <Suspense fallback={<PageLoader />}><GlassesTryOn /></Suspense> },
      { path: "wearcast", element: <Suspense fallback={<PageLoader />}><WearCast /></Suspense> }
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense> },
          { path: "products", element: <Suspense fallback={<PageLoader />}><AdminProducts /></Suspense> },
          { path: "orders", element: <Suspense fallback={<PageLoader />}><AdminOrders /></Suspense> },
          { path: "customers", element: <Suspense fallback={<PageLoader />}><AdminCustomers /></Suspense> },
          { path: "discounts", element: <Suspense fallback={<PageLoader />}><AdminDiscounts /></Suspense> },
          { path: "feedback", element: <Suspense fallback={<PageLoader />}><AdminFeedback /></Suspense> },
          { path: "complaints", element: <Suspense fallback={<PageLoader />}><AdminComplaints /></Suspense> }
        ],
      }]
  },
  {
    path: "/userDashboard",
    element: <UserLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><UserProfile /></Suspense> },
      { path: "orders", element: <Suspense fallback={<PageLoader />}><UserOrders /></Suspense> },
      { path: "returns", element: <Suspense fallback={<PageLoader />}><UserReturns /></Suspense> },
      { path: "wishlist", element: <Suspense fallback={<PageLoader />}><UserWishlist /></Suspense> },
      { path: "addresses", element: <Suspense fallback={<PageLoader />}><UserAddresses /></Suspense> },
    ],
  }]);


createRoot(document.getElementById('root')).render(
  <Auth0Provider>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </Auth0Provider>
)