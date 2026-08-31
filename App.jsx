import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import RootEntry from '@/components/RootEntry';
import { isPublicPath } from '@/lib/domain';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/ThemeProvider';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Cases from '@/pages/Cases';
import CaseDetail from '@/pages/CaseDetail';
import Clients from '@/pages/Clients';
import ClientDetail from '@/pages/ClientDetail';
import Fees from '@/pages/Fees';
import Documents from '@/pages/Documents';
import CourtUpdates from '@/pages/CourtUpdates';
import Users from '@/pages/Users';
import Stories from '@/pages/Stories';
import FoundersNote from '@/pages/FoundersNote';
import FindALawyer from '@/pages/FindALawyer';
import LawyerManagement from '@/pages/LawyerManagement';
import Settings from '@/pages/Settings';
import AuditLog from '@/pages/AuditLog';
import Notifications from '@/pages/Notifications';
import Messages from '@/pages/Messages';
// Add page imports here
import TrustAccounting from '@/pages/TrustAccounting';
import ESignature from '@/pages/ESignature';
import IntakeForms from '@/pages/IntakeForms';
import Reports from '@/pages/Reports';
import DocumentTemplates from '@/pages/DocumentTemplates';
import EmailLog from '@/pages/EmailLog';
import ChangePassword from '@/pages/ChangePassword';
import Tasks from '@/pages/Tasks';
import TimeTracking from '@/pages/TimeTracking';
import PublicIntakeForm from '@/pages/PublicIntakeForm';
import MarketingLayout from '@/components/marketing/MarketingLayout';
import Features from '@/pages/marketing/Features';
import Pricing from '@/pages/marketing/Pricing';
import ForLawyers from '@/pages/marketing/ForLawyers';
import ForClients from '@/pages/marketing/ForClients';
import About from '@/pages/marketing/About';
import Demo from '@/pages/marketing/Demo';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors only on protected (non-public) routes.
  // Public/marketing routes render regardless of auth state.
  if (authError && !isPublicPath(location.pathname)) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route element={<MarketingLayout />}>
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/for-lawyers" element={<ForLawyers />} />
        <Route path="/for-clients" element={<ForClients />} />
        <Route path="/about" element={<About />} />
        <Route path="/demo" element={<Demo />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/court-updates" element={<CourtUpdates />} />
          <Route path="/users" element={<Users />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/founders-note" element={<FoundersNote />} />
          <Route path="/find-a-lawyer" element={<FindALawyer />} />
          <Route path="/lawyer-management" element={<LawyerManagement />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/document-templates" element={<DocumentTemplates />} />
          <Route path="/intake-forms" element={<IntakeForms />} />
          <Route path="/trust-accounting" element={<TrustAccounting />} />
          <Route path="/time-tracking" element={<TimeTracking />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/e-signature" element={<ESignature />} />
          <Route path="/email-log" element={<EmailLog />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>
      <Route path="/public/forms/:id" element={<PublicIntakeForm />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App