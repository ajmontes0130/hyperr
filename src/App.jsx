import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from "framer-motion";
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import ConsentBanner from '@/components/ConsentBanner';

const ROUTE_TITLES = {
  '/landing': 'hyperr — Trade products for promotion.',
  '/marketplace': 'Marketplace — Browse trade listings | hyperr',
  '/creators': 'Creator Directory — Find verified creators | hyperr',
  '/support': 'Support | hyperr',
  '/login': 'Log In | hyperr',
  '/register': 'Sign Up | hyperr',
  '/forgot-password': 'Reset Password | hyperr',
  '/reset-password': 'Reset Password | hyperr',
  '/onboarding': 'Welcome | hyperr',
  '/dashboard': 'Dashboard | hyperr',
  '/create-listing': 'Create Listing | hyperr',
  '/my-listings': 'My Listings | hyperr',
  '/my-trades': 'My Trades | hyperr',
  '/profile': 'Profile | hyperr',
  '/creator-profile': 'Edit Creator Profile | hyperr',
  '/cash-offers': 'Cash Offers | hyperr',
  '/explore': 'Explore Creators | hyperr',
  '/saved-creators': 'Saved Creators | hyperr',
  '/messages': 'Messages | hyperr',
  '/proposal-templates': 'Proposal Templates | hyperr',
  '/terms': 'Terms of Service | hyperr',
  '/privacy': 'Privacy Policy | hyperr',
  '/cookie-policy': 'Cookie Policy | hyperr',
  '/contact': 'Contact Us | hyperr',
};

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import { lazy, Suspense, useEffect } from 'react';
import BrandedLoader from '@/components/BrandedLoader';
import Layout from '@/components/Layout';
import Onboarding from '@/pages/Onboarding';

// All pages are code-split per route to reduce initial bundle size.
const Landing = lazy(() => import('@/pages/Landing'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const ListingDetail = lazy(() => import('@/pages/ListingDetail'));
const CreateListing = lazy(() => import('@/pages/CreateListing'));
const MyListings = lazy(() => import('@/pages/MyListings'));
const MyTrades = lazy(() => import('@/pages/MyTrades'));
const Profile = lazy(() => import('@/pages/Profile'));
const CreatorDirectory = lazy(() => import('@/pages/CreatorDirectory'));
const CreatorProfilePage = lazy(() => import('@/pages/CreatorProfilePage'));
const CreatorProfileEdit = lazy(() => import('@/pages/CreatorProfileEdit'));
const MyCashOffers = lazy(() => import('@/pages/MyCashOffers'));
const Explore = lazy(() => import('@/pages/Explore'));
const SavedCreators = lazy(() => import('@/pages/SavedCreators'));
const Messages = lazy(() => import('@/pages/Messages'));
const ProposalTemplates = lazy(() => import('@/pages/ProposalTemplates'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const Contact = lazy(() => import('@/pages/Contact'));
const Support = lazy(() => import('@/pages/Support'));

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();
  const location = useLocation();

  // Centralized tab title — fires on every route change and auth-state change.
  // Page-level useSEO hooks override with data-specific titles once dynamic content loads.
  useEffect(() => {
    const path = location.pathname;
    let title = null;

    if (path === '/') {
      title = isAuthenticated ? 'Dashboard | hyperr' : 'hyperr — Trade products for promotion.';
    } else if (path.startsWith('/creator/')) {
      title = 'Creator Profile | hyperr';
    } else if (path.startsWith('/listing/')) {
      title = 'Trade Listing | hyperr';
    } else {
      title = ROUTE_TITLES[path] || null;
    }

    if (title) document.title = title;
  }, [location.pathname, isAuthenticated]);

  // Public routes — bypass auth loading and redirect entirely
  const publicPaths = ['/', '/landing', '/marketplace', '/creators', '/support'];
  const isPublicRoute = publicPaths.includes(location.pathname) ||
    location.pathname.startsWith('/creator/') ||
    location.pathname.startsWith('/listing/');

  if (!isPublicRoute && (isLoadingPublicSettings || isLoadingAuth)) {
    return <BrandedLoader />;
  }

  if (!isPublicRoute && authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <AnimatePresence mode="wait">
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ minHeight: "100vh" }}
    >
    <Suspense fallback={<BrandedLoader />}>
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/landing" element={<Landing />} />

      {/* Public browseable routes — no login required to view */}
      <Route element={<Layout />}>
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/creators" element={<CreatorDirectory />} />
        <Route path="/creator/:id" element={<CreatorProfilePage />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/support" element={<Support />} />
      </Route>

      {/* Root: Landing for visitors, Dashboard for authed */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Landing />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-trades" element={<MyTrades />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/creator-profile" element={<CreatorProfileEdit />} />
          <Route path="/cash-offers" element={<MyCashOffers />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved-creators" element={<SavedCreators />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/proposal-templates" element={<ProposalTemplates />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
    </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
          <ConsentBanner />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App