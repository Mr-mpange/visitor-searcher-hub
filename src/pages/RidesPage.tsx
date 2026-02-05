import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Search, MapPin, Star, Heart, Users, Car, 
  Fuel, Settings, Filter, Grid, List, Calendar, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import ridesImg from "@/assets/rides-1.jpg";

// Mock data
const rides = [
  {
    id: 1,
    title: "Luxury Safari Land Cruiser",
    type: "Safari Vehicle",
    location: "Nairobi, Kenya",
    pricePerDay: 150,
    pricePerKm: 2,
    rating: 4.9,
    reviews: 87,
    image: ridesImg,
    seats: 8,
    features: ["4WD", "Pop-up Roof", "Cooler Box", "Guide"],
    available: true,
  },
  {
    id: 2,
    title: "Airport Transfer Sedan",
    type: "Airport Transfer",
    location: "Dar es Salaam, Tanzania",
    pricePerDay: 80,
    pricePerKm: 1.5,
    rating: 4.7,
    reviews: 156,
    image: ridesImg,
    seats: 4,
    features: ["AC", "WiFi", "Leather Seats"],
    available: true,
  },
  {
    id: 3,
    title: "Executive Minibus",
    type: "Group Transport",
    location: "Cape Town, South Africa",
    pricePerDay: 200,
    pricePerKm: 3,
    rating: 4.8,
    reviews: 64,
    image: ridesImg,
    seats: 15,
    features: ["AC", "WiFi", "PA System", "TV"],
    available: true,
  },
  {
    id: 4,
    title: "City Tour Tuk-Tuk",
    type: "City Tour",
    location: "Stone Town, Zanzibar",
    pricePerDay: 45,
    pricePerKm: 1,
    rating: 4.6,
    reviews: 123,
    image: ridesImg,
    seats: 3,
    features: ["Open Air", "Local Guide"],
    available: false,
  },
  {
    id: 5,
    title: "Premium Safari Jeep",
    type: "Safari Vehicle",
    location: "Serengeti, Tanzania",
    pricePerDay: 180,
    pricePerKm: 2.5,
    rating: 4.95,
    reviews: 201,
    image: ridesImg,
    seats: 6,
    features: ["4WD", "Camera Mounts", "Binoculars", "Guide"],
    available: true,
  },
  {
    id: 6,
    title: "Luxury Coach Bus",
    type: "Long Distance",
    location: "Kampala, Uganda",
    pricePerDay: 350,
    pricePerKm: 4,
    rating: 4.5,
    reviews: 42,
    image: ridesImg,
    seats: 45,
    features: ["AC", "WiFi", "Restroom", "Reclining Seats"],
    available: true,
  },
];

const types = ["All", "Safari Vehicle", "Airport Transfer", "Group Transport", "City Tour", "Long Distance"];

const RidesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      ride.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || ride.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-ocean text-primary-foreground py-16 lg:py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                Rides & Transport
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                From safari vehicles to airport transfers, find reliable transportation for every adventure.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Pick-up location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="relative sm:w-48">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Date"
                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <Button size="lg" className="h-12 bg-accent text-accent-foreground hover:bg-accent/90">
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
                  {filteredRides.length} vehicles found
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
              {filteredRides.map((ride, index) => (
                <Link
                  key={ride.id}
                  to={`/rides/${ride.id}`}
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
                      src={ride.image}
                      alt={ride.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(ride.id);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5 transition-colors",
                          favorites.includes(ride.id)
                            ? "fill-accent text-accent"
                            : "text-foreground"
                        )}
                      />
                    </button>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-foreground">
                      {ride.type}
                    </div>

                    {/* Availability */}
                    <div
                      className={cn(
                        "absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold",
                        ride.available
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {ride.available ? "Available" : "Booked"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={cn("p-4", viewMode === "list" && "flex-1 flex flex-col justify-between")}>
                    <div>
                      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        {ride.location}
                      </div>

                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {ride.title}
                      </h3>

                      <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {ride.seats} seats
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="w-3.5 h-3.5" /> 4WD
                        </span>
                        <span className="flex items-center gap-1">
                          <Settings className="w-3.5 h-3.5" /> Auto
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {ride.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground"
                          >
                            {feature}
                          </span>
                        ))}
                        {ride.features.length > 3 && (
                          <span className="px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground">
                            +{ride.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        <span className="font-semibold text-foreground text-sm">{ride.rating}</span>
                        <span className="text-muted-foreground text-sm">({ride.reviews})</span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-foreground">${ride.pricePerDay}</span>
                        <span className="text-muted-foreground text-sm">/day</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredRides.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
                  <Car className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No vehicles found</h3>
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

export default RidesPage;
