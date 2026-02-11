import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Heart, MapPin, Bed, Car, PartyPopper, Trash2, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];

interface FavoriteItem {
  id: string;
  service_type: ServiceType;
  service_id: string;
  created_at: string;
  title?: string;
  location?: string;
  image?: string;
  price?: number;
}

const serviceIcon = (type: ServiceType) => {
  switch (type) {
    case "accommodation": return <Bed className="w-5 h-5" />;
    case "ride": return <Car className="w-5 h-5" />;
    case "event_hall": return <PartyPopper className="w-5 h-5" />;
  }
};

const serviceLabel = (type: ServiceType) => {
  switch (type) {
    case "accommodation": return "Stay";
    case "ride": return "Ride";
    case "event_hall": return "Event Hall";
  }
};

const serviceLink = (type: ServiceType, id: string) => {
  switch (type) {
    case "accommodation": return `/accommodation/${id}`;
    case "ride": return `/rides/${id}`;
    case "event_hall": return `/events/${id}`;
  }
};

const FavoritesPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ServiceType>("all");

  useEffect(() => {
    if (user) fetchFavorites();
    if (!authLoading && !user) setLoading(false);
  }, [user, authLoading]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);

    const { data: favs } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!favs || favs.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const accIds = favs.filter(f => f.service_type === "accommodation").map(f => f.service_id);
    const rideIds = favs.filter(f => f.service_type === "ride").map(f => f.service_id);
    const eventIds = favs.filter(f => f.service_type === "event_hall").map(f => f.service_id);

    const [accRes, rideRes, eventRes] = await Promise.all([
      accIds.length ? supabase.from("accommodations").select("id, title, location, images, price_per_night").in("id", accIds) : { data: [] },
      rideIds.length ? supabase.from("rides").select("id, title, location, images, price_per_day").in("id", rideIds) : { data: [] },
      eventIds.length ? supabase.from("event_halls").select("id, title, location, images, price_per_hour").in("id", eventIds) : { data: [] },
    ]);

    const detailMap = new Map<string, { title: string; location: string; image?: string; price?: number }>();
    (accRes.data || []).forEach(a => detailMap.set(a.id, { title: a.title, location: a.location, image: a.images?.[0], price: a.price_per_night }));
    (rideRes.data || []).forEach(r => detailMap.set(r.id, { title: r.title, location: r.location, image: r.images?.[0], price: r.price_per_day }));
    (eventRes.data || []).forEach(e => detailMap.set(e.id, { title: e.title, location: e.location, image: e.images?.[0], price: e.price_per_hour }));

    setFavorites(favs.map(f => ({
      ...f,
      title: detailMap.get(f.service_id)?.title,
      location: detailMap.get(f.service_id)?.location,
      image: detailMap.get(f.service_id)?.image,
      price: detailMap.get(f.service_id)?.price,
    })));
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (!error) {
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast.success("Removed from favorites");
    }
  };

  const filtered = filter === "all" ? favorites : favorites.filter(f => f.service_type === filter);

  const filterOptions: { label: string; value: "all" | ServiceType }[] = [
    { label: "All", value: "all" },
    { label: "Stays", value: "accommodation" },
    { label: "Rides", value: "ride" },
    { label: "Events", value: "event_hall" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-8 h-8 text-destructive fill-destructive" />
              <h1 className="text-3xl font-display font-bold text-foreground">My Favorites</h1>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    filter === opt.value
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card text-muted-foreground hover:bg-secondary border border-border"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !user ? (
              <div className="text-center py-16 bg-card rounded-2xl">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Log in to see your saved favorites</p>
                <Button asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No favorites yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Tap the heart icon on any listing to save it here!
                </p>
                <Button asChild>
                  <Link to="/accommodation">Browse Listings</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((fav) => (
                  <div
                    key={fav.id}
                    className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    {/* Image */}
                    <Link to={serviceLink(fav.service_type, fav.service_id)}>
                      <div className="relative h-44 overflow-hidden bg-muted">
                        {fav.image ? (
                          <img src={fav.image} alt={fav.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {serviceIcon(fav.service_type)}
                          </div>
                        )}
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-foreground">
                          {serviceLabel(fav.service_type)}
                        </div>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <Link to={serviceLink(fav.service_type, fav.service_id)}>
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {fav.title || "Unknown Listing"}
                        </h3>
                        {fav.location && (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                            <MapPin className="w-3.5 h-3.5" /> {fav.location}
                          </div>
                        )}
                      </Link>

                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        {fav.price ? (
                          <span className="text-lg font-bold text-foreground">${fav.price}</span>
                        ) : (
                          <span />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeFavorite(fav.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FavoritesPage;
