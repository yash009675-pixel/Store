import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import {
  CustomCursor,
  Grain,
  PageTransition,
  ScrollProgress,
} from './components/layout/Chrome';
import { BagDrawer } from './components/commerce/BagDrawer';
import { CatalogProvider } from './context/CatalogProvider';
import { StoreProvider } from './context/StoreProvider';
import { ToastProvider } from './context/ToastProvider';
import { useReducedMotion, useViewportHeight } from './hooks/useMotionPrefs';
import { Skeleton } from './components/ui/Skeleton';

import Home from './pages/Home';
import NotFound from './pages/NotFound';

/* Route-level code splitting keeps the first paint light (§75). */
const Shop = lazy(() => import('./pages/Shop'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const Bag = lazy(() => import('./pages/Bag'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const About = lazy(() => import('./pages/About'));
const Support = lazy(() => import('./pages/Support'));
const Legal = lazy(() => import('./pages/Legal'));
const Admin = lazy(() => import('./pages/Admin'));

import {
  AccountSupportPanel,
  MembershipPanel,
  NotificationsPanel,
  OrdersPanel,
  ProfilePanel,
  WalletPanel,
  WishlistPanel,
} from './pages/account/panels';

/** Minimal, non-blocking fallback while a route chunk arrives. */
function RouteFallback() {
  return (
    <div className="shell-wide pt-[calc(var(--header-h)+4rem)]" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-28 rounded" />
      <Skeleton className="mt-5 h-14 w-2/3 rounded" />
      <Skeleton className="mt-10 h-72 w-full rounded-xl" />
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  // The 404 keeps the chrome, but we don't want the footer under a hero-less
  // error page to feel like a dead end — it stays, for navigation.
  void location;
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BagDrawer />
    </>
  );
}

export default function App() {
  useViewportHeight();
  useReducedMotion();

  return (
    <ToastProvider>
      <CatalogProvider>
        <StoreProvider>
          <ScrollProgress />
          <Grain />
          <CustomCursor />

          <Shell>
            <PageTransition>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/product/:slug" element={<Product />} />
                  <Route path="/bag" element={<Bag />} />
                  <Route path="/checkout" element={<Checkout />} />

                  <Route path="/account" element={<Account />}>
                    <Route index element={<ProfilePanel />} />
                    <Route path="orders" element={<OrdersPanel />} />
                    <Route path="wishlist" element={<WishlistPanel />} />
                    <Route path="wallet" element={<WalletPanel />} />
                    <Route path="notifications" element={<NotificationsPanel />} />
                    <Route path="membership" element={<MembershipPanel />} />
                    <Route path="support" element={<AccountSupportPanel />} />
                  </Route>

                  <Route path="/about" element={<About />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/legal/:slug" element={<Legal />} />
                  <Route path="/admin" element={<Admin />} />

                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </Shell>
        </StoreProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}
