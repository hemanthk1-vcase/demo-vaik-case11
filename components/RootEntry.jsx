import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { isAppDomain } from "@/lib/domain";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Landing from "@/pages/marketing/Landing";

export default function RootEntry() {
  const { isAuthenticated } = useAuth();

  if (isAppDomain()) {
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
  }

  return (
    <MarketingLayout>
      <Landing />
    </MarketingLayout>
  );
}