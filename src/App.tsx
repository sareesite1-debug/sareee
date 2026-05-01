import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import SiteLayout from "@/components/site/SiteLayout";
import { CartProvider } from "@/hooks/useCart";

// Eagerly load only what renders on first paint
import HomePage from "@/pages/HomePage";

// Lazy-load everything else — they're never needed on the landing page
const CategoriesPage   = lazy(() => import("@/pages/CategoriesPage"));
const AboutPage        = lazy(() => import("@/pages/AboutPage"));
const ContactPage      = lazy(() => import("@/pages/ContactPage"));
const AuthPage         = lazy(() => import("@/pages/AuthPage"));
const ShopPage         = lazy(() => import("@/pages/ShopPage"));
const ProductDetailPage= lazy(() => import("@/pages/ProductDetailPage"));
const CartPage         = lazy(() => import("@/pages/CartPage"));
const CheckoutPage     = lazy(() => import("@/pages/CheckoutPage"));
const OrdersPage       = lazy(() => import("@/pages/OrdersPage"));
const OrderDetailPage  = lazy(() => import("@/pages/OrderDetailPage"));
const NotFound         = lazy(() => import("@/pages/NotFound"));

// Admin — fully lazy, never loaded for regular visitors
const AdminLayout          = lazy(() => import("@/components/admin/AdminLayout"));
const ProtectedRoute       = lazy(() => import("@/components/admin/ProtectedRoute"));
const AdminDashboard       = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminClients         = lazy(() => import("@/pages/admin/AdminClients"));
const AdminPortfolio       = lazy(() => import("@/pages/admin/AdminPortfolio"));
const AdminQuotations      = lazy(() => import("@/pages/admin/AdminQuotations"));
const AdminPayments        = lazy(() => import("@/pages/admin/AdminPayments"));
const AdminVendors         = lazy(() => import("@/pages/admin/AdminVendors"));
const AdminTeam            = lazy(() => import("@/pages/admin/AdminTeam"));
const AdminContent         = lazy(() => import("@/pages/admin/AdminContent"));
const AdminAppointments    = lazy(() => import("@/pages/admin/AdminAppointments"));
const AdminChat            = lazy(() => import("@/pages/admin/AdminChat"));
const AdminClientPortal    = lazy(() => import("@/pages/admin/AdminClientPortal"));
const AdminProducts        = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminCustomerOrders  = lazy(() => import("@/pages/admin/AdminCustomerOrders"));

const queryClient = new QueryClient();

// Minimal spinner shown while lazy chunks load
const PageLoader = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
    <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTopColor: "#6B0F1A", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public site */}
              <Route element={<SiteLayout />}>
                <Route path="/"                element={<HomePage />} />
                <Route path="/collections"     element={<CategoriesPage />} />
                <Route path="/categories"      element={<CategoriesPage />} />
                <Route path="/categories/:slug" element={<CategoriesPage />} />
                <Route path="/shop"            element={<ShopPage />} />
                <Route path="/shop/:slug"      element={<ProductDetailPage />} />
                <Route path="/cart"            element={<CartPage />} />
                <Route path="/checkout"        element={<CheckoutPage />} />
                <Route path="/orders"          element={<OrdersPage />} />
                <Route path="/orders/:id"      element={<OrderDetailPage />} />
                <Route path="/about"           element={<AboutPage />} />
                <Route path="/contact"         element={<ContactPage />} />
              </Route>

              <Route path="/auth" element={<AuthPage />} />

              {/* Admin panel — entire subtree lazy */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                      element={<AdminDashboard />} />
                <Route path="products"            element={<AdminProducts />} />
                <Route path="customer-orders"     element={<AdminCustomerOrders />} />
                <Route path="clients"             element={<AdminClients />} />
                <Route path="portfolio"           element={<AdminPortfolio />} />
                <Route path="quotations"          element={<AdminQuotations />} />
                <Route path="payments"            element={<AdminPayments />} />
                <Route path="vendors"             element={<AdminVendors />} />
                <Route path="team"                element={<AdminTeam />} />
                <Route path="content"             element={<AdminContent />} />
                <Route path="appointments"        element={<AdminAppointments />} />
                <Route path="chat"                element={<AdminChat />} />
                <Route path="client-portal"       element={<AdminClientPortal />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
