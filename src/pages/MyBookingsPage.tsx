import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, MapPin, Users, DollarSign, Clock,
  CheckCircle, XCircle, Loader2, Eye, Home, Car, PartyPopper
} from "lucide-react";
import { format } from "date-fns";

type Booking = {
  id: string;
  service_type: "accommodation" | "ride" | "event_hall";
  service_id: string;
  status: string | null;
  total_amount: number;
  guests: number | null;
  check_in: string | null;
  check_out: string | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  service_name?: string;
};

const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending" },
  confirmed: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Confirmed" },
  completed: { icon: CheckCircle, color: "text-primary", bg: "bg-primary/10", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Cancelled" },
};

const serviceIcons: Record<string, typeof Home> = {
  accommodation: Home,
  ride: Car,
  event_hall: PartyPopper,
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
        return;
      }

      // Fetch service names in parallel
      const enriched = await Promise.all(
        (data || []).map(async (b) => {
          const table = b.service_type === "accommodation" ? "accommodations"
            : b.service_type === "ride" ? "rides" : "event_halls";
          const { data: svc } = await supabase
            .from(table)
            .select("title")
            .eq("id", b.service_id)
            .maybeSingle();
          return { ...b, service_name: svc?.title || "Unknown Service" } as Booking;
        })
      );

      setBookings(enriched);
      setLoading(false);
    };

    fetchBookings();
  }, [user, authLoading, navigate]);

  const filterBookings = (tab: string) => {
    if (tab === "all") return bookings;
    return bookings.filter((b) => b.status === tab);
  };

  const getDateDisplay = (b: Booking) => {
    if (b.check_in && b.check_out) return `${b.check_in} → ${b.check_out}`;
    if (b.start_date && b.end_date) return `${b.start_date} → ${b.end_date}`;
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 lg:pt-24 pb-12 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground mb-8">Track all your reservations and payment statuses.</p>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            {["all", "pending", "confirmed", "completed", "cancelled"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filterBookings(tab).length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No {tab === "all" ? "" : tab} bookings found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filterBookings(tab).map((booking) => {
                      const status = statusConfig[booking.status || "pending"] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const ServiceIcon = serviceIcons[booking.service_type] || Home;
                      const dateDisplay = getDateDisplay(booking);

                      return (
                        <Card key={booking.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              {/* Service icon */}
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <ServiceIcon className="w-6 h-6 text-primary" />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground truncate">{booking.service_name}</h3>
                                  <Badge className={`${status.bg} ${status.color} border-0 shrink-0`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="capitalize">{booking.service_type.replace("_", " ")}</span>
                                  {dateDisplay && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5" /> {dateDisplay}
                                    </span>
                                  )}
                                  {booking.guests && (
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3.5 h-3.5" /> {booking.guests} guests
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Amount & actions */}
                              <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                                <span className="text-lg font-bold text-primary flex items-center">
                                  <DollarSign className="w-4 h-4" />
                                  {Number(booking.total_amount).toLocaleString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(booking.created_at), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
