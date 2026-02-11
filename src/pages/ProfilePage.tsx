import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import {
  User, Calendar, Star, MapPin, Clock, Bed, Car, PartyPopper,
  LogOut, Mail, Phone, Heart, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];
type ServiceType = Database["public"]["Enums"]["service_type"];

interface Booking {
  id: string;
  service_type: ServiceType;
  service_id: string;
  status: BookingStatus | null;
  total_amount: number;
  check_in: string | null;
  check_out: string | null;
  start_date: string | null;
  end_date: string | null;
  guests: number | null;
  created_at: string;
  service_title?: string;
  service_location?: string;
}

interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  response?: string;
  response_at?: string;
  created_at: string;
  service_type: ServiceType;
  service_id: string;
  service_title?: string;
}

interface Favorite {
  id: string;
  service_type: ServiceType;
  service_id: string;
  created_at: string;
  service_title?: string;
  service_location?: string;
}

const serviceIcon = (type: ServiceType) => {
  switch (type) {
    case "accommodation": return <Bed className="w-4 h-4" />;
    case "ride": return <Car className="w-4 h-4" />;
    case "event_hall": return <PartyPopper className="w-4 h-4" />;
  }
};

const serviceLabel = (type: ServiceType) => {
  switch (type) {
    case "accommodation": return "Stay";
    case "ride": return "Ride";
    case "event_hall": return "Event";
  }
};

const statusColor = (status: BookingStatus | null) => {
  switch (status) {
    case "confirmed": return "bg-success/10 text-success";
    case "completed": return "bg-primary/10 text-primary";
    case "cancelled": return "bg-destructive/10 text-destructive";
    default: return "bg-warning/10 text-warning-foreground";
  }
};

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string; email?: string; phone?: string; avatar_url?: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [profileRes, bookingsRes, reviewsRes, favRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("bookings").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (bookingsRes.data) setBookings(await enrichBookings(bookingsRes.data));
      if (reviewsRes.data) setReviews(await enrichReviews(reviewsRes.data));
      if (favRes.data) setFavorites(await enrichFavorites(favRes.data));
    } catch (err) {
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const enrichBookings = async (raw: any[]): Promise<Booking[]> => {
    const accIds = raw.filter(b => b.service_type === "accommodation").map(b => b.service_id);
    const rideIds = raw.filter(b => b.service_type === "ride").map(b => b.service_id);
    const eventIds = raw.filter(b => b.service_type === "event_hall").map(b => b.service_id);

    const [accRes, rideRes, eventRes] = await Promise.all([
      accIds.length ? supabase.from("accommodations").select("id, title, location").in("id", accIds) : { data: [] },
      rideIds.length ? supabase.from("rides").select("id, title, location").in("id", rideIds) : { data: [] },
      eventIds.length ? supabase.from("event_halls").select("id, title, location").in("id", eventIds) : { data: [] },
    ]);

    const serviceMap = new Map<string, { title: string; location: string }>();
    [...(accRes.data || []), ...(rideRes.data || []), ...(eventRes.data || [])].forEach(s => {
      serviceMap.set(s.id, { title: s.title, location: s.location });
    });

    return raw.map(b => ({
      ...b,
      service_title: serviceMap.get(b.service_id)?.title || "Unknown Service",
      service_location: serviceMap.get(b.service_id)?.location || "",
    }));
  };

  const enrichReviews = async (raw: any[]): Promise<Review[]> => {
    const accIds = raw.filter(r => r.service_type === "accommodation").map(r => r.service_id);
    const rideIds = raw.filter(r => r.service_type === "ride").map(r => r.service_id);
    const eventIds = raw.filter(r => r.service_type === "event_hall").map(r => r.service_id);

    const [accRes, rideRes, eventRes] = await Promise.all([
      accIds.length ? supabase.from("accommodations").select("id, title").in("id", accIds) : { data: [] },
      rideIds.length ? supabase.from("rides").select("id, title").in("id", rideIds) : { data: [] },
      eventIds.length ? supabase.from("event_halls").select("id, title").in("id", eventIds) : { data: [] },
    ]);

    const titleMap = new Map<string, string>();
    [...(accRes.data || []), ...(rideRes.data || []), ...(eventRes.data || [])].forEach(s => {
      titleMap.set(s.id, s.title);
    });

    return raw.map(r => ({ ...r, service_title: titleMap.get(r.service_id) || "Unknown Service" }));
  };

  const enrichFavorites = async (raw: any[]): Promise<Favorite[]> => {
    const accIds = raw.filter(f => f.service_type === "accommodation").map(f => f.service_id);
    const rideIds = raw.filter(f => f.service_type === "ride").map(f => f.service_id);
    const eventIds = raw.filter(f => f.service_type === "event_hall").map(f => f.service_id);

    const [accRes, rideRes, eventRes] = await Promise.all([
      accIds.length ? supabase.from("accommodations").select("id, title, location").in("id", accIds) : { data: [] },
      rideIds.length ? supabase.from("rides").select("id, title, location").in("id", rideIds) : { data: [] },
      eventIds.length ? supabase.from("event_halls").select("id, title, location").in("id", eventIds) : { data: [] },
    ]);

    const serviceMap = new Map<string, { title: string; location: string }>();
    [...(accRes.data || []), ...(rideRes.data || []), ...(eventRes.data || [])].forEach(s => {
      serviceMap.set(s.id, { title: s.title, location: s.location });
    });

    return raw.map(f => ({
      ...f,
      service_title: serviceMap.get(f.service_id)?.title || "Unknown Service",
      service_location: serviceMap.get(f.service_id)?.location || "",
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-muted rounded-2xl" />
              <div className="h-64 bg-muted rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl p-6 shadow-md mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {profile?.full_name || "User"}
                  </h1>
                  <div className="flex flex-col gap-1 mt-1">
                    {profile?.email && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> {profile.email}
                      </span>
                    )}
                    {profile?.phone && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" /> {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    {user && profile && (
                      <ProfileEditForm
                        userId={user.id}
                        profile={profile}
                        onSaved={() => {
                          setEditOpen(false);
                          fetchData();
                        }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="bookings" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Bookings ({bookings.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                <Star className="w-4 h-4 mr-2" />
                Reviews ({reviews.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="flex-1">
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Browse our listings and book your next adventure!</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
                          {serviceIcon(booking.service_type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-sm">{booking.service_title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {booking.service_location}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(booking.created_at).toLocaleDateString()}
                            </span>
                            {booking.check_in && (
                              <span>
                                {new Date(booking.check_in).toLocaleDateString()} → {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : ""}
                              </span>
                            )}
                            {booking.guests && <span>{booking.guests} guests</span>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColor(booking.status))}>
                          {booking.status || "pending"}
                        </span>
                        <p className="text-sm font-bold text-foreground mt-2">${booking.total_amount}</p>
                        <span className="text-xs text-muted-foreground">{serviceLabel(booking.service_type)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Complete a booking to leave a review!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-xl p-4 shadow-sm border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      {serviceIcon(review.service_type)}
                      <span className="text-sm font-medium text-foreground">{review.service_title}</span>
                      <span className="text-xs text-muted-foreground">• {serviceLabel(review.service_type)}</span>
                    </div>
                    <ReviewCard review={review} />
                  </div>
                ))
              )}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-4">
              {favorites.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-2xl">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No favorites yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap the heart icon on any listing to save it here!</p>
                </div>
              ) : (
                favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      const path = fav.service_type === "accommodation" ? "/accommodation" : fav.service_type === "ride" ? "/rides" : "/events";
                      navigate(`${path}/${fav.service_id}`);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {serviceIcon(fav.service_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{fav.service_title}</h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {fav.service_location}
                        </div>
                      </div>
                      <Heart className="w-5 h-5 fill-destructive text-destructive" />
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
