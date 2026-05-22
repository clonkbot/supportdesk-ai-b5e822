import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Dashboard } from "./components/Dashboard";
import { AuthScreen } from "./components/AuthScreen";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center leather-bg">
        <div className="metal-panel p-8 flex flex-col items-center gap-4">
          <div className="loading-dial">
            <div className="dial-spinner"></div>
          </div>
          <p className="text-amber-100 font-serif text-lg">Initializing SupportDesk AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}
