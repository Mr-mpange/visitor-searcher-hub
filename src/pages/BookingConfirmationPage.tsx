import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, Clock, XCircle, Phone, Calendar, Users,
  MapPin, DollarSign, Home, ArrowRight, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const BookingConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get("status") || "pending";
  const serviceName = searchParams.get("serviceName") || "Your Service";
  const serviceType = searchParams.get("serviceType") || "accommodation";
  const totalAmount = searchParams.get("totalAmount") || "0";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const eventDate = searchParams.get("eventDate") || "";
  const guests = searchParams.get("guests") || "";
  const expectedGuests = searchParams.get("expectedGuests") || "";
  const checkoutUrl = searchParams.get("checkoutUrl") || "";
  const bookingId = searchParams.get("bookingId") || "";
  const callStatus = searchParams.get("callStatus") || "pending";
  const phone = searchParams.get("phone") || "";

  const [paymentStatus, setPaymentStatus] = useState(status);

  // If there's a checkout URL and status is pending, redirect to payment
  useEffect(() => {
    if (checkoutUrl && paymentStatus === "pending_payment") {
      // Open Snippe checkout in new tab
      window.open(checkoutUrl, '_blank');
    }
  }, [checkoutUrl, paymentStatus]);

  const statusConfig = {
    pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Booking Pending", desc: "Your booking has been submitted and is awaiting confirmation." },
    pending_payment: { icon: Loader2, color: "text-warning", bg: "bg-warning/10", label: "Awaiting Payment", desc: "Complete your payment to confirm the booking." },
    confirmed: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Booking Confirmed!", desc: "Your booking is confirmed. You'll receive a confirmation call shortly." },
    cancelled: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Booking Cancelled", desc: "This booking has been cancelled." },
    failed: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Payment Failed", desc: "Payment was unsuccessful. Please try again." },
  };

  const current = statusConfig[paymentStatus as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = current.icon;

  const dateLabel = serviceType === 'accommodation'
    ? `${checkIn} → ${checkOut}`
    : serviceType === 'ride'
      ? `${startDate} → ${endDate}`
      : eventDate;

  const guestLabel = serviceType === 'event_hall' ? expectedGuests : guests;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Status Hero */}
          <div className="text-center mb-8">
            <div className={cn("w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4", current.bg)}>
              <StatusIcon className={cn("w-10 h-10", current.color, paymentStatus === "pending_payment" && "animate-spin")} />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">{current.label}</h1>
            <p className="text-muted-foreground">{current.desc}</p>
          </div>

          {/* Payment CTA */}
          {paymentStatus === "pending_payment" && checkoutUrl && (
            <Card className="mb-6 border-warning/30 bg-warning/5">
              <CardContent className="p-6 text-center">
                <p className="text-foreground mb-4">Click below to complete your payment via Snippe's secure checkout.</p>
                <Button size="lg" onClick={() => window.open(checkoutUrl, '_blank')} className="gap-2">
                  Pay Now <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Booking Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Booking Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-foreground">{serviceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary" className="capitalize">{serviceType.replace('_', ' ')}</Badge>
              </div>
              {dateLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Dates
                  </span>
                  <span className="font-medium text-foreground">{dateLabel}</span>
                </div>
              )}
              {guestLabel && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="w-4 h-4" /> Guests
                  </span>
                  <span className="font-medium text-foreground">{guestLabel}</span>
                </div>
              )}
              <div className="border-t border-border pt-4 flex items-center justify-between">
                <span className="text-foreground font-semibold">Total Amount</span>
                <span className="text-xl font-bold text-primary flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {Number(totalAmount).toLocaleString()}
                </span>
              </div>
              {bookingId && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono text-muted-foreground">{bookingId.slice(0, 8)}...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice Call Status */}
          {phone && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  Confirmation Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground">Calling {phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {callStatus === "initiated" 
                        ? "Voice call has been initiated with your booking summary."
                        : callStatus === "skipped"
                          ? "Voice call was skipped (phone number not available)."
                          : "A confirmation call will be placed after payment."}
                    </p>
                  </div>
                  <Badge className={callStatus === "initiated" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                    {callStatus === "initiated" ? "Initiated" : callStatus === "skipped" ? "Skipped" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/')}>
              <Home className="w-4 h-4" /> Back to Home
            </Button>
            <Button className="flex-1 gap-2" onClick={() => navigate(`/${serviceType === 'event_hall' ? 'events' : serviceType === 'ride' ? 'rides' : 'accommodation'}`)}>
              Browse More <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;
