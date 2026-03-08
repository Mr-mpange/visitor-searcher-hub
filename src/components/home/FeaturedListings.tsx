import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart, ArrowRight, Bed, Users, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import safariTentImg from "@/assets/accommodation-safari-tent.jpg";
import beachResortImg from "@/assets/accommodation-beach-resort.jpg";
import cityApartmentImg from "@/assets/accommodation-city-apartment.jpg";
import accommodationImg from "@/assets/accommodation-1.jpg";

// Mock data for featured listings
const featuredListings = [
  {
    id: 1,
    title: "Serengeti Safari Lodge",
    type: "accommodation",
    location: "Serengeti, Tanzania",
    price: 250,
    currency: "USD",
    rating: 4.9,
    reviews: 127,
    image: safariTentImg,
    amenities: ["WiFi", "Pool", "Breakfast"],
    beds: 2,
    guests: 4,
    featured: true,
  },
  {
    id: 2,
    title: "Maasai Mara Tented Camp",
    type: "accommodation",
    location: "Maasai Mara, Kenya",
    price: 180,
    currency: "USD",
    rating: 4.8,
    reviews: 94,
    image: accommodationImg,
    amenities: ["WiFi", "Game Drives", "Meals"],
    beds: 1,
    guests: 2,
    featured: true,
  },
  {
    id: 3,
    title: "Victoria Falls View Hotel",
    type: "accommodation",
    location: "Victoria Falls, Zimbabwe",
    price: 320,
    currency: "USD",
    rating: 4.95,
    reviews: 203,
    image: beachResortImg,
    amenities: ["WiFi", "Spa", "Restaurant"],
    beds: 2,
    guests: 4,
    featured: true,
  },
  {
    id: 4,
    title: "Cape Town Waterfront Villa",
    type: "accommodation",
    location: "Cape Town, South Africa",
    price: 450,
    currency: "USD",
    rating: 4.85,
    reviews: 156,
    image: cityApartmentImg,
    amenities: ["WiFi", "Pool", "Ocean View"],
    beds: 3,
    guests: 6,
    featured: true,
  },
];

const filterKeys = ["filter_all", "filter_lodges", "filter_hotels", "filter_villas", "filter_camps"];

export const FeaturedListings = () => {
  const [activeFilter, setActiveFilter] = useState("filter_all");
  const [favorites, setFavorites] = useState<number[]>([]);
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 lg:py-28 bg-muted/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              {t("featured_stays")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t("featured_stays_desc")}
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.map((listing, index) => (
            <article
              key={listing.id}
              className="group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(listing.id);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <Heart
                    className={cn(
                      "w-5 h-5 transition-colors",
                      favorites.includes(listing.id)
                        ? "fill-accent text-accent"
                        : "text-foreground"
                    )}
                  />
                </button>

                {/* Featured Badge */}
                {listing.featured && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                    Featured
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Location */}
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {listing.location}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                  {listing.title}
                </h3>

                {/* Amenities */}
                <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3.5 h-3.5" /> {listing.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {listing.guests}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" /> WiFi
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-semibold text-foreground text-sm">{listing.rating}</span>
                    <span className="text-muted-foreground text-sm">({listing.reviews})</span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-foreground">${listing.price}</span>
                    <span className="text-muted-foreground text-sm">/night</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/accommodation">
              View All Stays <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
