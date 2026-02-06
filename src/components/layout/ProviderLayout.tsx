import { ReactNode } from "react";
import { ProviderSidebar } from "./ProviderSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProviderLayoutProps {
  children: ReactNode;
}

export function ProviderLayout({ children }: ProviderLayoutProps) {
  const { user, loading, isProvider } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/owner/login" replace />;
  }

  // Allow access even if not yet a provider (they might be setting up)
  return (
    <div className="min-h-screen bg-background flex">
      <ProviderSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
