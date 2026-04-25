import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import ScrollToTop from "@/components/ScrollToTop";
import SiteLayout from "@/components/site/SiteLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { CartProvider } from "@/hooks/useCart";

import HomePage from "@/pages/HomePage";
import CategoriesPage from "@/pages/CategoriesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import AuthPage from "@/pages/AuthPage";
import ShopPage from "@/pages/ShopPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminClients from "@/pages/admin/AdminClients";
import AdminPortfolio from "@/pages/admin/AdminPortfolio";
import AdminQuotations from "@/pages/admin/AdminQuotations";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminVendors from "@/pages/admin/AdminVendors";
import AdminTeam from "@/pages/admin/AdminTeam";
import AdminContent from "@/pages/admin/AdminContent";
import AdminAppointments from "@/pages/admin/AdminAppointments";
import AdminChat from "@/pages/admin/AdminChat";
import AdminClientPortal from "@/pages/admin/AdminClientPortal";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCustomerOrders from "@/pages/admin/AdminCustomerOrders";

import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CartProvider>
          <Routes>
            {/* Public site */}
            <Route element={<SiteLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/collections" element={<CategoriesPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoriesPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/shop/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:id" element={<OrderDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/auth" element={<AuthPage />} />

            {/* Admin panel */}
            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="customer-orders" element={<AdminCustomerOrders />} />
              <Route path="clients" element={<AdminClients />} />
              <Route path="portfolio" element={<AdminPortfolio />} />
              <Route path="quotations" element={<AdminQuotations />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="team" element={<AdminTeam />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="appointments" element={<AdminAppointments />} />
              <Route path="chat" element={<AdminChat />} />
              <Route path="client-portal" element={<AdminClientPortal />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
