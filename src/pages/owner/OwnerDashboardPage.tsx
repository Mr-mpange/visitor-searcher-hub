import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building, Car, CalendarDays, ShoppingCart, 
  TrendingUp, DollarSign, Eye, Plus, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DashboardStats {
  totalAccommodations: number;
  totalRides: number;
  totalEventHalls: number;
  pendingBookings: number;
  totalRevenue: number;
  totalViews: number;
}

const OwnerDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAccommodations: 0,
    totalRides: 0,
    totalEventHalls: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalViews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProviderData();
    }
  }, [user]);

  const fetchProviderData = async () => {
    try {
      // Get provider profile
      const { data: providerData } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      setProvider(providerData);

      if (providerData) {
        // Fetch stats
        const [accResult, ridesResult, hallsResult, bookingsResult] = await Promise.all([
          supabase.from('accommodations').select('id', { count: 'exact' }).eq('provider_id', providerData.id),
          supabase.from('rides').select('id', { count: 'exact' }).eq('provider_id', providerData.id),
          supabase.from('event_halls').select('id', { count: 'exact' }).eq('provider_id', providerData.id),
          supabase.from('bookings').select('*').eq('provider_id', providerData.id),
        ]);

        const pendingBookings = bookingsResult.data?.filter(b => b.status === 'pending').length || 0;
        const totalRevenue = bookingsResult.data?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;

        setStats({
          totalAccommodations: accResult.count || 0,
          totalRides: ridesResult.count || 0,
          totalEventHalls: hallsResult.count || 0,
          pendingBookings,
          totalRevenue,
          totalViews: 1234, // Mock for now
        });

        setRecentBookings(bookingsResult.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: "Accommodations", 
      value: stats.totalAccommodations, 
      icon: Building, 
      color: "bg-blue-500",
      href: "/owner/accommodations" 
    },
    { 
      title: "Rides", 
      value: stats.totalRides, 
      icon: Car, 
      color: "bg-green-500",
      href: "/owner/rides" 
    },
    { 
      title: "Event Halls", 
      value: stats.totalEventHalls, 
      icon: CalendarDays, 
      color: "bg-purple-500",
      href: "/owner/events" 
    },
    { 
      title: "Pending Bookings", 
      value: stats.pendingBookings, 
      icon: ShoppingCart, 
      color: "bg-orange-500",
      href: "/owner/bookings" 
    },
  ];

  if (!provider && !loading) {
    return (
      <ProviderLayout>
        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
              <Building className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Complete Your Provider Profile
            </h1>
            <p className="text-muted-foreground mb-8">
              Set up your business profile to start listing your services and receiving bookings.
            </p>
            <Button asChild size="lg">
              <Link to="/owner/settings">
                Set Up Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {provider?.business_name || 'Provider'}</p>
          </div>
          <Button asChild>
            <Link to="/owner/listings/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Listing
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Revenue & Views */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Revenue</CardTitle>
              <DollarSign className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-success">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Total Views</CardTitle>
              <Eye className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="text-success">+8%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/owner/bookings">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">Booking #{booking.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service_type} • {new Date(booking.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${booking.total_amount}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' ? 'bg-success/10 text-success' :
                        booking.status === 'pending' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground">Add listings to start receiving bookings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default OwnerDashboardPage;
