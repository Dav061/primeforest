// src/App.js
import React, { useLayoutEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import Navbar from "./components/Navbar";
import MainPage from "./components/MainPage";
import CatalogPage from "./components/CatalogPage";
import CategoryList from "./components/CategoryList";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import OrderSuccess from "./components/OrderSuccess";
import Login from "./components/Login";
import Register from "./components/Register";
import AboutPage from "./components/AboutPage";
import Contacts from "./components/Contacts";
import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./components/Admin/AdminDashboard";
import Promotions from "./components/Promotions";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<MainPage />} />
        {/* Сначала более конкретные маршруты */}
        <Route path="/catalog/:slug" element={<CatalogPage />} />{" "}
        {/* ← ИСПРАВЛЕНО: было ProductDetail */}
        <Route path="/products/:slug" element={<ProductDetail />} />
        {/* Затем общие */}
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/products" element={<CatalogPage />} />
        <Route path="/categories" element={<CategoryList />} />
        {/* Остальные маршруты */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      {" "}
      {/* ← ВАЖНО: добавьте этот компонент */}
      <AuthProvider>
        <CartProvider>
          <Router>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
