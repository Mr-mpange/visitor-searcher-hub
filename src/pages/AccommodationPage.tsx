import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { 
  Search, MapPin, Star, Heart, Bed, Users, Wifi, 
  Coffee, Car, Utensils, Filter, SlidersHorizontal, 
  ChevronDown, Grid, List 
} from "lucide-react";
import { cn } from "@/lib/utils";
import safariTentImg from "@/assets/accommodation-safari-tent.jpg";
import beachResortImg from "@/assets/accommodation-beach-resort.jpg";
import cityApartmentImg from "@/assets/accommodation-city-apartment.jpg";
import accommodationImg from "@/assets/accommodation-1.jpg";

// Mock data
const accommodations = [
  {
    id: 1,
    title: "Serengeti Safari Lodge",
    type: "Lodge",
    location: "Serengeti, Tanzania",
    price: 250,
    rating: 4.9,
    reviews: 127,
    image: safariTentImg,
    beds: 2,
    guests: 4,
    amenities: ["WiFi", "Pool", "Breakfast", "Spa"],
    featured: true,
  },
  {
    id: 2,
    title: "Maasai Mara Tented Camp",
    type: "Camp",
    location: "Maasai Mara, Kenya",
    price: 180,
    rating: 4.8,
    reviews: 94,
    image: safariTentImg,
    beds: 1,
    guests: 2,
    amenities: ["WiFi", "Game Drives", "Meals"],
    featured: false,
  },
  {
    id: 3,
    title: "Victoria Falls View Hotel",
    type: "Hotel",
    location: "Victoria Falls, Zimbabwe",
    price: 320,
    rating: 4.95,
    reviews: 203,
    image: accommodationImg,
    beds: 2,
    guests: 4,
    amenities: ["WiFi", "Spa", "Restaurant", "Pool"],
    featured: true,
  },
  {
    id: 4,
    title: "Cape Town Waterfront Villa",
    type: "Villa",
    location: "Cape Town, South Africa",
    price: 450,
    rating: 4.85,
    reviews: 156,
    image: beachResortImg,
    beds: 3,
    guests: 6,
    amenities: ["WiFi", "Pool", "Ocean View", "Kitchen"],
    featured: false,
  },
  {
    id: 5,
    title: "Zanzibar Beach Resort",
    type: "Resort",
    location: "Zanzibar, Tanzania",
    price: 380,
    rating: 4.7,
    reviews: 89,
    image: beachResortImg,
    beds: 2,
    guests: 4,
    amenities: ["WiFi", "Beach", "Spa", "Restaurant"],
    featured: true,
  },
  {
    id: 6,
    title: "Nairobi City Apartment",
    type: "Apartment",
    location: "Nairobi, Kenya",
    price: 95,
    rating: 4.6,
    reviews: 67,
    image: cityApartmentImg,
    beds: 1,
    guests: 2,
    amenities: ["WiFi", "Kitchen", "Parking"],
    featured: false,
  },
];

const types = ["All", "Lodge", "Hotel", "Villa", "Camp", "Resort", "Apartment"];
const priceRanges = ["Any", "$0 - $100", "$100 - $200", "$200 - $500", "$500+"];

const AccommodationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { isFavorite, toggleFavorite: toggleDbFavorite } = useFavorites();

  const filteredAccommodations = accommodations.filter((acc) => {
    const matchesSearch =
      acc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-hero text-primary-foreground py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Find Your Perfect Stay
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                From luxury lodges to cozy apartments, discover accommodations that make your African adventure unforgettable.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by location or property name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button
                  size="lg"
                  className="h-12 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Results */}
        <section className="py-8 lg:py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Filter Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
              {/* Type Filters */}
              <div className="flex gap-2 flex-wrap">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all",
                      selectedType === type
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card text-muted-foreground hover:bg-secondary border border-border"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* View Toggle & Count */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredAccommodations.length} properties found
                </span>
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "grid" ? "bg-card shadow-sm" : "hover:bg-card/50"
                    )}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      viewMode === "list" ? "bg-card shadow-sm" : "hover:bg-card/50"
                    )}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div
              className={cn(
                "grid gap-6",
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredAccommodations.map((acc, index) => (
                <Link
                  key={acc.id}
                  to={`/accommodation/${acc.id}`}
                  className={cn(
                    "group bg-card rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 animate-fade-in-up",
                    viewMode === "list" && "flex"
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "relative overflow-hidden",
                      viewMode === "grid" ? "h-52" : "h-48 w-72 flex-shrink-0"
                    )}
                  >
                    <img
                      src={acc.image}
                      alt={acc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Favorite Button */}
                    <FavoriteButton
                      serviceId={String(acc.id)}
                      serviceType="accommodation"
                      isFavorite={isFavorite(String(acc.id))}
                      onToggle={toggleDbFavorite}
                      className="absolute top-3 right-3"
                    />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-foreground">
                      {acc.type}
                    </div>

                    {acc.featured && (
                      <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("p-4", viewMode === "list" && "flex-1 flex flex-col justify-between")}>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        {acc.location}
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {acc.title}
                      </h3>

                      <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5" /> {acc.beds} beds
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {acc.guests} guests
                        </span>
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5" /> WiFi
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground text-sm">{acc.rating}</span>
                        <span className="text-muted-foreground text-sm">({acc.reviews})</span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-foreground">${acc.price}</span>
                        <span className="text-muted-foreground text-sm">/night</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredAccommodations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Search className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <Button onClick={() => { setSearchQuery(""); setSelectedType("All"); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AccommodationPage;
