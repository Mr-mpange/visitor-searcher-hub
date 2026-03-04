import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Calendar, Users, DollarSign, Clock,
  CheckCircle, XCircle, Loader2, Home, Car, PartyPopper,
  FileText, Hash
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
  updated_at: string;
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
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) return;
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

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [user, authLoading, navigate]);

  const handleCancel = async (bookingId: string) => {
    setCancelling(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" as const })
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error", description: "Failed to cancel booking.", variant: "destructive" });
    } else {
      toast({ title: "Booking Cancelled", description: "Your booking has been cancelled successfully." });
      setSelectedBooking(null);
      await fetchBookings();
    }
    setCancelling(false);
  };

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
                        <Card
                          key={booking.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <CardContent className="p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <ServiceIcon className="w-6 h-6 text-primary" />
                              </div>

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

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedBooking && (() => {
            const status = statusConfig[selectedBooking.status || "pending"] || statusConfig.pending;
            const StatusIcon = status.icon;
            const ServiceIcon = serviceIcons[selectedBooking.service_type] || Home;
            const dateDisplay = getDateDisplay(selectedBooking);
            const isPending = selectedBooking.status === "pending";

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ServiceIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="truncate">{selectedBooking.service_name}</span>
                  </DialogTitle>
                  <DialogDescription>
                    <Badge className={`${status.bg} ${status.color} border-0 mt-2`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <DetailRow icon={<Hash className="w-4 h-4" />} label="Booking ID" value={selectedBooking.id.slice(0, 8) + "..."} />
                    <DetailRow
                      icon={<Calendar className="w-4 h-4" />}
                      label="Service Type"
                      value={selectedBooking.service_type.replace("_", " ")}
                      capitalize
                    />
                  </div>

                  <Separator />

                  {dateDisplay && (
                    <DetailRow icon={<Calendar className="w-4 h-4" />} label="Dates" value={dateDisplay} />
                  )}
                  {selectedBooking.guests && (
                    <DetailRow icon={<Users className="w-4 h-4" />} label="Guests" value={`${selectedBooking.guests}`} />
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                    <span className="text-2xl font-bold text-primary flex items-center">
                      <DollarSign className="w-5 h-5" />
                      {Number(selectedBooking.total_amount).toLocaleString()}
                    </span>
                  </div>

                  {selectedBooking.notes && (
                    <>
                      <Separator />
                      <DetailRow icon={<FileText className="w-4 h-4" />} label="Notes" value={selectedBooking.notes} />
                    </>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created: {format(new Date(selectedBooking.created_at), "PPP 'at' p")}</span>
                    <span>Updated: {format(new Date(selectedBooking.updated_at), "PPP 'at' p")}</span>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  {isPending && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={cancelling}>
                          {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Cancel Booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. Your booking for "{selectedBooking.service_name}" will be cancelled.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleCancel(selectedBooking.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>Close</Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DetailRow = ({ icon, label, value, capitalize }: { icon: React.ReactNode; label: string; value: string; capitalize?: boolean }) => (
  <div className="flex items-start gap-3">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  </div>
);

export default MyBookingsPage;
