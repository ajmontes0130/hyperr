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

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Layout from '@/components/Layout';
import Marketplace from '@/pages/Marketplace';
import ListingDetail from '@/pages/ListingDetail';
import CreateListing from '@/pages/CreateListing';
import MyListings from '@/pages/MyListings';
import MyTrades from '@/pages/MyTrades';
import Profile from '@/pages/Profile';
import CreatorDirectory from '@/pages/CreatorDirectory';
import CreatorProfilePage from '@/pages/CreatorProfilePage';
import CreatorProfileEdit from '@/pages/CreatorProfileEdit';
import MyCashOffers from '@/pages/MyCashOffers';
import Explore from '@/pages/Explore';
import SavedCreators from '@/pages/SavedCreators';
import Messages from '@/pages/Messages';
import ProposalTemplates from '@/pages/ProposalTemplates';
import Onboarding from '@/pages/Onboarding';
import Landing from '@/pages/Landing';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{ minHeight: "100vh" }}
    >
    <Routes location={location}>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Marketplace />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/my-trades" element={<MyTrades />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/creators" element={<CreatorDirectory />} />
          <Route path="/creator/:id" element={<CreatorProfilePage />} />
          <Route path="/creator-profile" element={<CreatorProfileEdit />} />
          <Route path="/cash-offers" element={<MyCashOffers />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved-creators" element={<SavedCreators />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/proposal-templates" element={<ProposalTemplates />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
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
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App