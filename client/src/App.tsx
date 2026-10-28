import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventProvider } from './components/tracking/EventProvider';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CompareTray } from './components/product/CompareTray';
import { AuthPromptModal } from './components/auth/AuthPromptModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { AdminRouteGuard } from './components/auth/AdminRouteGuard';
import { useAuthStore } from './store/authStore';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ProductPage } from './pages/ProductPage';
import { ComparePage } from './pages/ComparePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SessionDetailPage } from './pages/admin/SessionDetailPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';

export const App: React.FC = () => {
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <EventProvider>
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          {/* Authentication Requirement Modal */}
          <AuthPromptModal />

          {/* Global Toast Micro-interaction Notification Container */}
          <ToastContainer />

          {/* Sticky Header */}
          <Header />

          <CompareTray />

          <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/admin"
                element={
                  <AdminRouteGuard>
                    <DashboardPage />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <AdminRouteGuard>
                    <AnalyticsPage />
                  </AdminRouteGuard>
                }
              />
              <Route
                path="/admin/sessions/:id"
                element={
                  <AdminRouteGuard>
                    <SessionDetailPage />
                  </AdminRouteGuard>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </EventProvider>
    </BrowserRouter>
  );
};

export default App;
