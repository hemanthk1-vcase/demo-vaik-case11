import { Link } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, AlertOctagon, KeyRound } from 'lucide-react';

const EXPIRY_DAYS = 90;
const DAY_MS = 86400000;

export default function PasswordExpiryBanner() {
  const { user } = useCurrentUser();
  const last = user?.data?.password_last_changed;
  if (!last) return null;

  const daysSince = Math.floor((Date.now() - new Date(last).getTime()) / DAY_MS);
  const remaining = EXPIRY_DAYS - daysSince;
  if (remaining > 50 || remaining <= 0) return null;

  let level;
  if (remaining <= 1) level = 'critical';
  else if (remaining <= 45) level = 'warning';
  else level = 'info';

  const configs = {
    info: {
      icon: Info,
      classes: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
      title: 'Password expires soon',
      body: `Your password expires in about ${remaining} days. Consider updating it when convenient.`,
    },
    warning: {
      icon: AlertTriangle,
      classes: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
      title: 'Password expiring soon',
      body: `Your password expires in ${remaining} day${remaining === 1 ? '' : 's'}. Please update it soon to avoid losing access.`,
    },
    critical: {
      icon: AlertOctagon,
      classes: 'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
      title: 'Password expires today',
      body: `Your password expires in ${remaining} day${remaining === 1 ? '' : 's'}. Update it now to keep access to your account.`,
    },
  };

  const cfg = configs[level];
  const Icon = cfg.icon;

  return (
    <div className="px-4 sm:px-6 pt-4">
      <Alert className={cfg.classes}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{cfg.title}</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          <span>{cfg.body}</span>
          <Link
            to="/change-password"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background hover:opacity-90"
          >
            <KeyRound className="h-3.5 w-3.5" /> Change password
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}