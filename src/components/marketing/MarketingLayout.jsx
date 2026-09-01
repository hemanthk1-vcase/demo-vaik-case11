import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/marketing/Navbar";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}