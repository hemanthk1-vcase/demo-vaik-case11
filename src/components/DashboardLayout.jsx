import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}