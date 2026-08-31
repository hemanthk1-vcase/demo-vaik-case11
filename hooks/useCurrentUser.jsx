import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedUser = null;

export function clearCachedUser() {
  cachedUser = null;
}

export function useCurrentUser() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    let active = true;
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
      return;
    }
    base44.auth.me()
      .then((u) => { if (active) { cachedUser = u; setUser(u); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const roleType = user?.role_type || user?.data?.role_type;
  // "Solo" is stored as built-in role 'admin' (so the platform grants full
  // admin privileges incl. user management) with role_type 'solo' as the
  // display marker — so it takes precedence over the built-in role.
  const role = roleType === 'solo'
    ? 'solo'
    : (['client', 'lawyer', 'senior_lawyer', 'admin'].includes(user?.role) ? user.role : (roleType || 'client'));
  return {
    user,
    role,
    loading,
    isAdmin: role === 'admin' || role === 'solo',
    isLawyer: role === 'lawyer',
    isSenior: role === 'senior_lawyer',
    isSolo: role === 'solo',
    isStaff: role === 'lawyer' || role === 'senior_lawyer' || role === 'admin' || role === 'solo',
    isClient: role === 'client',
    canSeeFinancials: role === 'admin' || role === 'senior_lawyer' || role === 'solo'
  };
}