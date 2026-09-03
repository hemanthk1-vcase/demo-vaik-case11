import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PageNotFound from './lib/PageNotFound';
import Vakilcase from './pages/Vakilcase';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import SectionPlaceholder from './pages/SectionPlaceholder';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Fees from './pages/Fees';
import LawyerManagement from './pages/LawyerManagement';
import Presentation from './pages/Presentation';
import PresentationUS from './pages/PresentationUS';
import MarketingLayout from './components/marketing/MarketingLayout';
import Landing from './pages/marketing/Landing';
import Features from './pages/marketing/Features';
import ForLawyers from './pages/marketing/ForLawyers';
import ForClients from './pages/marketing/ForClients';
import Pricing from './pages/marketing/Pricing';
import About from './pages/marketing/About';
import ClientPortal from './pages/ClientPortal';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import RegisteredUsers from './pages/RegisteredUsers';
import IntakeForms from './pages/IntakeForms';
import AiAssistant from './pages/AiAssistant';
import PublicIntakeForm from './pages/PublicIntakeForm';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
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
      {/* Marketing site (public) */}
      <Route element={<MarketingLayout />}>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/for-lawyers" element={<ForLawyers />} />
        <Route path="/for-clients" element={<ForClients />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Route>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* Public intake forms (no login required) */}
      <Route path="/intake/:formId" element={<PublicIntakeForm />} />
      {/* Client portal (client-facing) */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/client-portal" element={<ClientPortal />} />
      </Route>
      {/* App pages (with sidebar) */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registered-users" element={<RegisteredUsers />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/ai-assistant" element={<AiAssistant />} />
        <Route path="/lawyer-management" element={<LawyerManagement />} />
        <Route path="/documents" element={<SectionPlaceholder />} />
        <Route path="/document-templates" element={<SectionPlaceholder />} />
        <Route path="/messages" element={<SectionPlaceholder />} />
        <Route path="/intake-forms" element={<IntakeForms />} />
        <Route path="/invoices" element={<Fees />} />
        <Route path="/trust-accounting" element={<SectionPlaceholder />} />
        <Route path="/time-tracking" element={<SectionPlaceholder />} />
        <Route path="/tasks" element={<SectionPlaceholder />} />
        <Route path="/e-signature" element={<SectionPlaceholder />} />
        <Route path="/email-log" element={<SectionPlaceholder />} />
      </Route>
      <Route path="/presentation" element={<Presentation />} />
      <Route path="/us-presentation" element={<PresentationUS />} />
      <Route path="/vakilcase" element={<Vakilcase />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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