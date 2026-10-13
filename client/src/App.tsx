import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventProvider } from './components/tracking/EventProvider';
import { TaskBanner } from './components/tracking/TaskBanner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { ProductPage } from './pages/ProductPage';
import { ComparePage } from './pages/ComparePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { SessionDetailPage } from './pages/admin/SessionDetailPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <EventProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          {/* Study Task Banner */}
          <TaskBanner />

          {/* Sticky Header */}
          <Header />

          {/* Main View Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/admin" element={<DashboardPage />} />
              <Route path="/admin/sessions/:id" element={<SessionDetailPage />} />
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
