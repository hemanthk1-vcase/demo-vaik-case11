import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AccountStatusGate from '@/components/AccountStatusGate';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth, user } = useAuth();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  // Auth gate: only approved users reach the app. Pending and rejected users
  // (self-registration flow) are blocked here regardless of valid credentials.
  // Admins always bypass — they manage approvals and may predate the status field.
  // NOTE: User custom fields (approval_status, role_type) are stored at the top
  // level of the user object returned by auth.me(), NOT under user.data (which is
  // null). Reading user.data?.approval_status always returns undefined and would
  // let pending users straight through — so read the top level, with .data fallback.
  const approval = user?.approval_status ?? user?.data?.approval_status;
  const roleType = user?.role_type ?? user?.data?.role_type;
  const isAdmin = user?.role === 'admin' || roleType === 'admin';
  if (!isAdmin && approval === 'pending') {
    return <AccountStatusGate status="pending" />;
  }
  if (!isAdmin && approval === 'rejected') {
    return <AccountStatusGate status="rejected" />;
  }

  return <Outlet />;
}