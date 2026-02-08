import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  MapPin, Star, Heart, Users, Car, Settings, Fuel, 
  Check, ChevronLeft, ChevronRight, Share2, Phone, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";

// Static images for mock data
import safariVehicleImg from "@/assets/rides-safari-vehicle.jpg";
import airportTransferImg from "@/assets/rides-airport-transfer.jpg";
import tourVanImg from "@/assets/rides-tour-van.jpg";

// Mock data
const mockRides: Record<string, any> = {
  "1": {
    id: "1",
    title: "Luxury Safari Land Cruiser",
    type: "Safari Vehicle",
    location: "Nairobi, Kenya",
    city: "Nairobi",
    price_per_day: 150,
    price_per_km: 2,
    rating: 4.9,
    reviews_count: 87,
    images: [safariVehicleImg, tourVanImg],
    seats: 8,
    features: ["4WD", "Pop-up Roof", "Cooler Box", "Professional Guide", "GPS Navigation", "First Aid Kit"],
    description: "Experience the African wilderness in our premium Land Cruiser. Perfect for game drives with a pop-up roof for unobstructed wildlife viewing. Includes experienced safari guide.",
    provider: {
      business_name: "Safari Adventures Kenya",
      business_phone: "+254 722 123 456",
      business_email: "info@safariadventures.co.ke"
    }
  },
  "2": {
    id: "2",
    title: "Airport Transfer Sedan",
    type: "Airport Transfer",
    location: "Dar es Salaam, Tanzania",
    city: "Dar es Salaam",
    price_per_day: 80,
    price_per_km: 1.5,
    rating: 4.7,
    reviews_count: 156,
    images: [airportTransferImg, safariVehicleImg],
    seats: 4,
    features: ["AC", "WiFi", "Leather Seats", "Professional Driver", "Meet & Greet"],
    description: "Comfortable airport transfers in a premium sedan. Professional drivers, meet and greet service at the airport, and complimentary WiFi.",
    provider: {
      business_name: "Dar City Transfers",
      business_phone: "+255 752 456 789",
      business_email: "bookings@darcitytransfers.co.tz"
    }
  },
  "3": {
    id: "3",
    title: "Executive Minibus",
    type: "Group Transport",
    location: "Cape Town, South Africa",
    city: "Cape Town",
    price_per_day: 200,
    price_per_km: 3,
    rating: 4.8,
    reviews_count: 64,
    images: [tourVanImg, airportTransferImg],
    seats: 15,
    features: ["AC", "WiFi", "PA System", "TV", "Reclining Seats", "Luggage Storage"],
    description: "Perfect for group travel, conferences, and tours. Our executive minibus offers comfort and style for up to 15 passengers with modern amenities.",
    provider: {
      business_name: "Cape Tours & Transport",
      business_phone: "+27 21 987 6543",
      business_email: "groups@capetours.co.za"
    }
  },
  "4": {
    id: "4",
    title: "City Tour Tuk-Tuk",
    type: "City Tour",
    location: "Stone Town, Zanzibar",
    city: "Stone Town",
    price_per_day: 45,
    price_per_km: 1,
    rating: 4.6,
    reviews_count: 123,
    images: [tourVanImg],
    seats: 3,
    features: ["Open Air", "Local Guide", "Photo Stops", "Flexible Itinerary"],
    description: "Explore the winding streets of Stone Town in a traditional tuk-tuk. Our local guides know every hidden gem and secret spot.",
    provider: {
      business_name: "Zanzibar Tuk Tours",
      business_phone: "+255 777 333 222",
      business_email: "tours@zanzibartuktours.com"
    }
  },
  "5": {
    id: "5",
    title: "Premium Safari Jeep",
    type: "Safari Vehicle",
    location: "Serengeti, Tanzania",
    city: "Serengeti",
    price_per_day: 180,
    price_per_km: 2.5,
    rating: 4.95,
    reviews_count: 201,
    images: [safariVehicleImg, tourVanImg, airportTransferImg],
    seats: 6,
    features: ["4WD", "Camera Mounts", "Binoculars", "Expert Guide", "Cold Drinks", "Charging Ports"],
    description: "Our premium safari jeeps are equipped for the serious wildlife enthusiast. Camera mounts, professional binoculars, and experienced guides included.",
    provider: {
      business_name: "Serengeti Safari Co",
      business_phone: "+255 689 123 456",
      business_email: "safaris@serengetisafarico.com"
    }
  },
  "6": {
    id: "6",
    title: "Luxury Coach Bus",
    type: "Long Distance",
    location: "Kampala, Uganda",
    city: "Kampala",
    price_per_day: 350,
    price_per_km: 4,
    rating: 4.5,
    reviews_count: 42,
    images: [airportTransferImg, tourVanImg],
    seats: 45,
    features: ["AC", "WiFi", "Restroom", "Reclining Seats", "Entertainment System", "Hostess Service"],
    description: "Long-distance travel in ultimate comfort. Our luxury coaches feature reclining seats, onboard restrooms, and entertainment systems.",
    provider: {
      business_name: "Uganda Express Coaches",
      business_phone: "+256 700 123 456",
      business_email: "bookings@ugandaexpress.co.ug"
    }
  }
};

const RideDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            providers (
              business_name,
              business_phone,
              business_email
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (data) {
          setRide({
            ...data,
            provider: data.providers
          });
        } else if (id && mockRides[id]) {
          setRide(mockRides[id]);
        } else {
          navigate('/rides');
        }
      } catch (error) {
        console.error('Error fetching ride:', error);
        if (id && mockRides[id]) {
          setRide(mockRides[id]);
        } else {
          navigate('/rides');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to make a booking",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Select Dates",
        description: "Please select rental dates",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const days = differenceInDays(dateRange.to, dateRange.from) || 1;
      const totalAmount = days * ride.price_per_day;

      if (mockRides[id!]) {
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            type: 'ride',
            serviceName: ride.title,
            customerPhone: phone,
            providerPhone: ride.provider?.business_phone,
            startDate: format(dateRange.from, 'PPP'),
            endDate: format(dateRange.to, 'PPP'),
            pickupLocation,
            dropoffLocation,
            totalAmount,
          }
        });

        toast({
          title: "Booking Confirmed!",
          description: `Your ${ride.title} has been booked for ${days} day(s).`,
        });
        navigate('/');
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        provider_id: ride.provider_id,
        service_type: 'ride',
        service_id: ride.id,
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd'),
        total_amount: totalAmount,
        notes: `Pickup: ${pickupLocation}, Dropoff: ${dropoffLocation}. ${notes}`,
        status: 'pending'
      });

      if (error) throw error;

      await supabase.functions.invoke('send-booking-notification', {
        body: {
          type: 'ride',
          serviceName: ride.title,
          customerPhone: phone,
          providerPhone: ride.provider?.business_phone,
          startDate: format(dateRange.from, 'PPP'),
          endDate: format(dateRange.to, 'PPP'),
          pickupLocation,
          dropoffLocation,
          totalAmount,
        }
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your ${ride.title} has been booked for ${days} day(s).`,
      });
      navigate('/');
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to complete booking",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ride) return null;

  const days = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) || 1
    : 0;
  const totalPrice = days * ride.price_per_day;

  const images = ride.images?.length > 0 ? ride.images : [safariVehicleImg];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to vehicles
          </Button>

          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <div className="aspect-[16/9] lg:aspect-[21/9]">
              <img src={images[currentImageIndex]} alt={ride.title} className="w-full h-full object-cover" />
            </div>
            
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex ? "bg-primary-foreground w-6" : "bg-primary-foreground/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card"
              >
                <Heart className={cn("w-5 h-5", isFavorite ? "fill-accent text-accent" : "text-foreground")} />
              </button>
              <button className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{ride.type}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-semibold">{ride.rating}</span>
                    <span className="text-muted-foreground">({ride.reviews_count} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {ride.title}
                </h1>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{ride.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>{ride.seats} Seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  <span>4WD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>Automatic</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">About this vehicle</h2>
                <p className="text-muted-foreground leading-relaxed">{ride.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Features</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ride.features?.map((feature: string) => (
                    <div key={feature} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {ride.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Provided by {ride.provider.business_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ride.provider.business_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{ride.provider.business_phone}</span>
                      </div>
                    )}
                    {ride.provider.business_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{ride.provider.business_email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">${ride.price_per_day}</span>
                    <span className="text-muted-foreground">/day</span>
                  </div>
                  <p className="text-sm text-muted-foreground">+ ${ride.price_per_km}/km</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select Dates</Label>
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      disabled={{ before: new Date() }}
                      className="rounded-md border"
                    />
                  </div>

                  {dateRange?.from && dateRange?.to && (
                    <div className="text-sm text-muted-foreground">
                      {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                      <span className="mx-1">·</span>
                      {days} day{days > 1 ? 's' : ''}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="pickup">Pickup Location</Label>
                    <Input
                      id="pickup"
                      placeholder="Enter pickup address..."
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dropoff">Dropoff Location</Label>
                    <Input
                      id="dropoff"
                      placeholder="Enter dropoff address..."
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (for SMS confirmation)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {days > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">${ride.price_per_day} × {days} day{days > 1 ? 's' : ''}</span>
                        <span>${totalPrice}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    disabled={!dateRange?.from || !dateRange?.to || isBooking}
                    className="w-full"
                    size="lg"
                  >
                    {isBooking ? "Booking..." : "Book Now"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Mileage charges apply after pickup
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RideDetailPage;
