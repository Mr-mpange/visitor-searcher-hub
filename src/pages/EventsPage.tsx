import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { 
  Search, MapPin, Star, Heart, Users, PartyPopper,
  Mic, Wifi, Car, UtensilsCrossed, Grid, List, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import weddingHallImg from "@/assets/event-wedding-hall.jpg";
import conferenceRoomImg from "@/assets/event-conference-room.jpg";
import gardenVenueImg from "@/assets/event-garden-venue.jpg";

// Mock data
const eventHalls = [
  {
    id: 1,
    title: "Savanna Grand Ballroom",
    type: "Ballroom",
    location: "Nairobi, Kenya",
    pricePerDay: 2500,
    pricePerHour: 350,
    rating: 4.9,
    reviews: 78,
    image: weddingHallImg,
    capacity: 500,
    amenities: ["Catering", "PA System", "Parking", "WiFi"],
    available: true,
  },
  {
    id: 2,
    title: "Safari Lodge Conference Center",
    type: "Conference",
    location: "Arusha, Tanzania",
    pricePerDay: 1800,
    pricePerHour: 250,
    rating: 4.8,
    reviews: 92,
    image: conferenceRoomImg,
    capacity: 200,
    amenities: ["Projector", "WiFi", "Catering", "Breakout Rooms"],
    available: true,
  },
  {
    id: 3,
    title: "Oceanview Wedding Venue",
    type: "Wedding",
    location: "Zanzibar, Tanzania",
    pricePerDay: 4500,
    pricePerHour: 600,
    rating: 4.95,
    reviews: 156,
    image: weddingHallImg,
    capacity: 300,
    amenities: ["Beach Access", "Catering", "Decor", "Bridal Suite"],
    available: false,
  },
  {
    id: 4,
    title: "Kigali Executive Boardroom",
    type: "Boardroom",
    location: "Kigali, Rwanda",
    pricePerDay: 800,
    pricePerHour: 120,
    rating: 4.7,
    reviews: 64,
    image: conferenceRoomImg,
    capacity: 25,
    amenities: ["Video Conference", "WiFi", "Coffee", "Whiteboard"],
    available: true,
  },
  {
    id: 5,
    title: "Garden Party Pavilion",
    type: "Outdoor",
    location: "Cape Town, South Africa",
    pricePerDay: 3200,
    pricePerHour: 450,
    rating: 4.85,
    reviews: 89,
    image: gardenVenueImg,
    capacity: 400,
    amenities: ["Garden", "Tenting", "Catering", "Parking"],
    available: true,
  },
  {
    id: 6,
    title: "Kampala Convention Hall",
    type: "Convention",
    location: "Kampala, Uganda",
    pricePerDay: 5000,
    pricePerHour: 700,
    rating: 4.6,
    reviews: 45,
    image: weddingHallImg,
    capacity: 1000,
    amenities: ["Stage", "PA System", "Catering", "VIP Lounge"],
    available: true,
  },
];

const types = ["All", "Ballroom", "Conference", "Wedding", "Boardroom", "Outdoor", "Convention"];

const EventsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { isFavorite, toggleFavorite: toggleDbFavorite } = useFavorites();

  const filteredHalls = eventHalls.filter((hall) => {
    const matchesSearch =
      hall.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hall.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || hall.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-sunset text-foreground py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Event Halls & Venues
              </h1>
              <p className="text-lg text-foreground/80 mb-8">
                From intimate boardrooms to grand ballrooms, find the perfect venue for your next event.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by location or venue name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="relative sm:w-48">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="number"
                    placeholder="Guests"
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button size="lg" className="h-12">
                  <Search className="w-5 h-5" />
                  Search
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

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredHalls.length} venues found
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
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              )}
            >
              {filteredHalls.map((hall, index) => (
                <Link
                  key={hall.id}
                  to={`/events/${hall.id}`}
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
                      src={hall.image}
                      alt={hall.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Favorite Button */}
                    <FavoriteButton
                      serviceId={String(hall.id)}
                      serviceType="event_hall"
                      isFavorite={isFavorite(String(hall.id))}
                      onToggle={toggleDbFavorite}
                      className="absolute top-3 right-3"
                    />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-foreground">
                      {hall.type}
                    </div>

                    {/* Capacity */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Up to {hall.capacity} guests
                    </div>
                  </div>

                  {/* Content */}
                  <div className={cn("p-4", viewMode === "list" && "flex-1 flex flex-col justify-between")}>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        {hall.location}
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {hall.title}
                      </h3>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {hall.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground"
                          >
                            {amenity}
                          </span>
                        ))}
                        {hall.amenities.length > 3 && (
                          <span className="px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground">
                            +{hall.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground text-sm">{hall.rating}</span>
                        <span className="text-muted-foreground text-sm">({hall.reviews})</span>
                      </div>
                      <div className="text-right">
                        <div>
                          <span className="text-lg font-bold text-foreground">${hall.pricePerHour}</span>
                          <span className="text-muted-foreground text-sm">/hr</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${hall.pricePerDay}/day
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredHalls.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <PartyPopper className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No venues found</h3>
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

export default EventsPage;
