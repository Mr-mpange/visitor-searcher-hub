import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Building, Car, CalendarDays, ShoppingCart, 
  DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalAccommodations: number;
  totalRides: number;
  totalEventHalls: number;
  totalBookings: number;
  pendingApprovals: number;
  totalRevenue: number;
}

const COLORS = ['#0D6B5E', '#F97316', '#3B82F6', '#8B5CF6', '#EC4899'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalAccommodations: 0,
    totalRides: 0,
    totalEventHalls: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 32000 },
  ];

  const bookingsByType = [
    { name: 'Accommodations', value: 45 },
    { name: 'Rides', value: 30 },
    { name: 'Event Halls', value: 25 },
  ];

  const bookingsByStatus = [
    { status: 'Pending', count: 45 },
    { status: 'Confirmed', count: 120 },
    { status: 'Completed', count: 89 },
    { status: 'Cancelled', count: 15 },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        usersResult,
        providersResult,
        accResult,
        ridesResult,
        hallsResult,
        bookingsResult,
        pendingAccResult,
        pendingRidesResult,
        pendingHallsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('providers').select('id', { count: 'exact' }),
        supabase.from('accommodations').select('id', { count: 'exact' }),
        supabase.from('rides').select('id', { count: 'exact' }),
        supabase.from('event_halls').select('id', { count: 'exact' }),
        supabase.from('bookings').select('total_amount'),
        supabase.from('accommodations').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
        supabase.from('rides').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
        supabase.from('event_halls').select('id', { count: 'exact' }).eq('status', 'pending_approval'),
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, b) => sum + Number(b.total_amount || 0), 0) || 0;
      const pendingApprovals = (pendingAccResult.count || 0) + (pendingRidesResult.count || 0) + (pendingHallsResult.count || 0);

      setStats({
        totalUsers: usersResult.count || 0,
        totalProviders: providersResult.count || 0,
        totalAccommodations: accResult.count || 0,
        totalRides: ridesResult.count || 0,
        totalEventHalls: hallsResult.count || 0,
        totalBookings: bookingsResult.data?.length || 0,
        pendingApprovals,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, change: "+12%", up: true },
    { title: "Providers", value: stats.totalProviders, icon: Building, change: "+8%", up: true },
    { title: "Total Bookings", value: stats.totalBookings, icon: ShoppingCart, change: "+23%", up: true },
    { title: "Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+18%", up: true },
  ];

  const listingCards = [
    { title: "Accommodations", value: stats.totalAccommodations, icon: Building, color: "bg-blue-500" },
    { title: "Rides", value: stats.totalRides, icon: Car, color: "bg-green-500" },
    { title: "Event Halls", value: stats.totalEventHalls, icon: CalendarDays, color: "bg-purple-500" },
    { title: "Pending Approvals", value: stats.pendingApprovals, icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <div className={`flex items-center text-sm mt-1 ${stat.up ? 'text-success' : 'text-destructive'}`}>
                      {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Listings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {listingCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bookings by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={bookingsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookingsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {bookingsByType.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-sm text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
