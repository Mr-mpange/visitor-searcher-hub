import { Link, useLocation } from "react-router-dom";
import { 
  Home, Building, Car, CalendarDays, ShoppingCart, 
  Settings, LogOut, BarChart2, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/owner/dashboard" },
  { icon: Building, label: "Accommodations", href: "/owner/accommodations" },
  { icon: Car, label: "Rides", href: "/owner/rides" },
  { icon: CalendarDays, label: "Event Halls", href: "/owner/events" },
  { icon: ShoppingCart, label: "Bookings", href: "/owner/bookings" },
  { icon: BarChart2, label: "Analytics", href: "/owner/analytics" },
  { icon: Settings, label: "Settings", href: "/owner/settings" },
];

export function ProviderSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">SafariStay</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">Provider Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick Add */}
      <div className="p-4 border-t border-border">
        <Button className="w-full" asChild>
          <Link to="/owner/listings/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Listing
          </Link>
        </Button>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
