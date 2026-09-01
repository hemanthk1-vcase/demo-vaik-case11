import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import Sidebar from "@/components/Sidebar";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const OWNER_EMAIL = "hemanthk1@gmail.com";

export default function DashboardLayout() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const allowed = user.email?.toLowerCase() === OWNER_EMAIL || user.role === "admin";
  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Access restricted</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          This app is private and can only be accessed by the account owner.
        </p>
        <Button variant="outline" onClick={() => base44.auth.logout()}>Sign out</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}