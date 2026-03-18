import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Style/index.css'
import App from './Components/App.jsx'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import SignUp from './Components/Validations/Signup/SignUp.jsx';
import Home from "./Components/Home/Home.jsx"
import Login from "./Components/Validations/Login/Login.jsx"
import Catalog from "./Components/ProductDetails/Catalog.jsx"
import { CartProvider } from './Components/Context/CartContext.jsx';
import Cart from './Components/Cart/Cart.jsx';
import About from './Components/About/About.jsx';
import OrderForm from './Components/OrderForm/OrderForm.jsx';
import AdminLayout from './Components/Admin/Layout.jsx';
import AdminDashboard from './Components/Admin/Dashboard.jsx';
import AdminProducts from './Components/Admin/Products.jsx';
import AdminOrders from './Components/Admin/Orders.jsx';
import AdminCustomers from './Components/Admin/Customers.jsx';
import AdminDiscounts from './Components/Admin/Discounts.jsx';
import Vto from './Components/Ai/VirtualTryOn/vto.jsx';
import Trending from './Components/Ai/TrendingFeature/trending.jsx';
import UserLayout from './Components/User/UserDashboard/Layout.jsx'
import UserProfile from './Components/User/UserDashboard/Profile.jsx'
import UserOrders from './Components/User/UserDashboard/Orders.jsx'
import UserReturns from './Components/User/UserDashboard/Returns.jsx'
import UserWishlist from './Components/User/UserDashboard/Wishlist.jsx'
import UserAddresses from './Components/User/UserDashboard/Addresses.jsx'
import { Auth0Provider } from '@auth0/auth0-react';
import AuthCallback from './Components/AuthCallBack/AuthCallback.jsx';
import Feedback from './Components/User/UserDashboard/Feedback.jsx';
import AdminFeedback from './Components/Admin/Feedback.jsx';
import AdminRoute from './Components/Admin/AdminRoute/AdminRoute.jsx';
import AdminComplaints from './Components/Admin/Complaints.jsx';
import GlassesTryOn from './Components/Ai/GlassesTryOn/GlassesTryOn.jsx';
import WearCast from './Components/Ai/Recommendation/Wearcast.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "signup", element: <SignUp /> },
      { path: "about", element: <About /> },
      { path: "login", element: <Login /> },
      { path: "catalog", element: <Catalog /> },
      { path: "mycart", element: <Cart /> },
      { path: "orderform", element: <OrderForm /> },
      { path: "vto", element: <Vto /> },
      { path: "trending", element: <Trending /> },
      { path: "auth/callback", element: <AuthCallback /> },
      { path: "feedback", element: <Feedback /> },
      { path: "glasses", element: <GlassesTryOn /> },
      { path: "wearcast", element: <WearCast /> }
    ],
  },
  {
    path: "/admin",
    element: <AdminRoute />,
    children: [
      { 
        element: <AdminLayout />, 
        children: [
      { index: true, element: <AdminDashboard /> },
      { path: "products", element: <AdminProducts /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "customers", element: <AdminCustomers /> },
      { path: "discounts", element: <AdminDiscounts /> },
      { path: "feedback", element: <AdminFeedback /> },
      { path: "complaints", element: <AdminComplaints /> }
    ],
  }]},
  {
    path: "/userDashboard",
    element: <UserLayout />,
    children: [
      { index: true, element: <UserProfile /> },
      { path: "orders", element: <UserOrders /> },
      { path: "returns", element: <UserReturns /> },
      { path: "wishlist", element: <UserWishlist /> },
      { path: "addresses", element: <UserAddresses /> },
    ],
  }]);


createRoot(document.getElementById('root')).render(
  <Auth0Provider>
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  </Auth0Provider>
)