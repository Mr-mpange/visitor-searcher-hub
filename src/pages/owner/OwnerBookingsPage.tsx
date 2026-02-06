import { useEffect, useState } from "react";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, Calendar, User, DollarSign, 
  CheckCircle, XCircle, Clock, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OwnerBookingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      setProvider(providerData);

      if (providerData) {
        let query = supabase
          .from('bookings')
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          query = query.eq('status', filter as "cancelled" | "completed" | "confirmed" | "pending");
        }

        const { data, error } = await query;
        if (error) throw error;
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: "pending" | "confirmed" | "cancelled" | "completed") => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Booking ${status}`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: "bg-warning/10 text-warning", icon: Clock },
      confirmed: { color: "bg-success/10 text-success", icon: CheckCircle },
      cancelled: { color: "bg-destructive/10 text-destructive", icon: XCircle },
      completed: { color: "bg-primary/10 text-primary", icon: CheckCircle },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    revenue: bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
  };

  return (
    <ProviderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bookings</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Confirmed</p>
              <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold text-foreground">${stats.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const statusConfig = getStatusBadge(booking.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Booking #{booking.id.slice(0, 8)}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.created_at).toLocaleDateString()}
                            </span>
                            <span className="capitalize">{booking.service_type.replace('_', ' ')}</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {booking.guests} guests
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-foreground flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {Number(booking.total_amount).toLocaleString()}
                          </p>
                          <Badge className={statusConfig.color}>
                            {booking.status}
                          </Badge>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">No bookings yet</p>
                <p className="text-muted-foreground">
                  Bookings will appear here when customers make reservations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
};

export default OwnerBookingsPage;
