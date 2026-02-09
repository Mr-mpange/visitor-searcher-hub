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
  MapPin, Star, Heart, Bed, Users, Wifi, Coffee, Car, 
  Utensils, Check, ChevronLeft, ChevronRight, Share2, 
  Calendar as CalendarIcon, Phone, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import type { DateRange } from "react-day-picker";

// Static images for mock data
import safariTentImg from "@/assets/accommodation-safari-tent.jpg";
import beachResortImg from "@/assets/accommodation-beach-resort.jpg";
import cityApartmentImg from "@/assets/accommodation-city-apartment.jpg";
import accommodationImg from "@/assets/accommodation-1.jpg";

// Mock data - In production, this would come from database
const mockAccommodations: Record<string, any> = {
  "1": {
    id: "1",
    title: "Serengeti Safari Lodge",
    type: "Lodge",
    location: "Serengeti, Tanzania",
    city: "Serengeti",
    price_per_night: 250,
    rating: 4.9,
    reviews_count: 127,
    images: [safariTentImg, beachResortImg, accommodationImg],
    beds: 2,
    max_guests: 4,
    amenities: ["WiFi", "Pool", "Breakfast", "Spa", "Restaurant", "Room Service", "Air Conditioning", "Safari Tours"],
    description: "Experience the magic of the African savanna at our exclusive safari lodge. Wake up to breathtaking views of the Serengeti plains and enjoy world-class hospitality in the heart of Tanzania's most famous wildlife destination.",
    provider: {
      business_name: "Serengeti Hospitality Ltd",
      business_phone: "+255 123 456 789",
      business_email: "info@serengetilodge.com"
    }
  },
  "2": {
    id: "2",
    title: "Maasai Mara Tented Camp",
    type: "Camp",
    location: "Maasai Mara, Kenya",
    city: "Maasai Mara",
    price_per_night: 180,
    rating: 4.8,
    reviews_count: 94,
    images: [safariTentImg, accommodationImg],
    beds: 1,
    max_guests: 2,
    amenities: ["WiFi", "Game Drives", "Meals Included", "Campfire", "Bush Walks"],
    description: "Immerse yourself in the authentic safari experience at our luxury tented camp. Located in the heart of Maasai Mara, witness the great migration and enjoy personalized game drives.",
    provider: {
      business_name: "Mara Safari Camps",
      business_phone: "+254 712 345 678",
      business_email: "bookings@maracamps.com"
    }
  },
  "3": {
    id: "3",
    title: "Victoria Falls View Hotel",
    type: "Hotel",
    location: "Victoria Falls, Zimbabwe",
    city: "Victoria Falls",
    price_per_night: 320,
    rating: 4.95,
    reviews_count: 203,
    images: [accommodationImg, beachResortImg, safariTentImg],
    beds: 2,
    max_guests: 4,
    amenities: ["WiFi", "Spa", "Restaurant", "Pool", "Falls View", "Helicopter Tours", "Gym"],
    description: "Stay at our prestigious hotel with stunning views of Victoria Falls. Experience the thunder of the falls from your private balcony and indulge in luxury amenities.",
    provider: {
      business_name: "Victoria Falls Hotels Group",
      business_phone: "+263 13 456 789",
      business_email: "reservations@vicfallshotels.com"
    }
  },
  "4": {
    id: "4",
    title: "Cape Town Waterfront Villa",
    type: "Villa",
    location: "Cape Town, South Africa",
    city: "Cape Town",
    price_per_night: 450,
    rating: 4.85,
    reviews_count: 156,
    images: [beachResortImg, cityApartmentImg, accommodationImg],
    beds: 3,
    max_guests: 6,
    amenities: ["WiFi", "Pool", "Ocean View", "Kitchen", "Private Chef", "Wine Cellar", "Concierge"],
    description: "Experience luxury living at our exclusive waterfront villa. With panoramic ocean views, private pool, and direct access to Cape Town's famous V&A Waterfront.",
    provider: {
      business_name: "Cape Luxury Rentals",
      business_phone: "+27 21 123 4567",
      business_email: "villas@capeluxury.co.za"
    }
  },
  "5": {
    id: "5",
    title: "Zanzibar Beach Resort",
    type: "Resort",
    location: "Zanzibar, Tanzania",
    city: "Zanzibar",
    price_per_night: 380,
    rating: 4.7,
    reviews_count: 89,
    images: [beachResortImg, safariTentImg, accommodationImg],
    beds: 2,
    max_guests: 4,
    amenities: ["WiFi", "Beach Access", "Spa", "Restaurant", "Water Sports", "Diving Center"],
    description: "Escape to paradise at our beachfront resort. Pristine white sand beaches, crystal-clear waters, and authentic Swahili hospitality await you.",
    provider: {
      business_name: "Zanzibar Beach Resorts",
      business_phone: "+255 24 567 890",
      business_email: "info@zanzibarresorts.com"
    }
  },
  "6": {
    id: "6",
    title: "Nairobi City Apartment",
    type: "Apartment",
    location: "Nairobi, Kenya",
    city: "Nairobi",
    price_per_night: 95,
    rating: 4.6,
    reviews_count: 67,
    images: [cityApartmentImg, accommodationImg],
    beds: 1,
    max_guests: 2,
    amenities: ["WiFi", "Kitchen", "Parking", "Security", "Gym Access"],
    description: "Modern city apartment in Nairobi's vibrant Westlands area. Perfect for business travelers or those exploring Kenya's capital city.",
    provider: {
      business_name: "Nairobi Stays",
      business_phone: "+254 20 123 456",
      business_email: "apartments@nairobistays.co.ke"
    }
  }
};

const getAmenityIcon = (amenity: string) => {
  const icons: Record<string, React.ReactNode> = {
    "WiFi": <Wifi className="w-5 h-5 text-primary" />,
    "Pool": <span className="text-lg">🏊</span>,
    "Kitchen": <Coffee className="w-5 h-5 text-primary" />,
    "Parking": <Car className="w-5 h-5 text-primary" />,
    "Restaurant": <Utensils className="w-5 h-5 text-primary" />,
    "Breakfast": <Coffee className="w-5 h-5 text-primary" />,
    "Spa": <span className="text-lg">💆</span>,
    "Air Conditioning": <span className="text-lg">❄️</span>,
    "Safari Tours": <span className="text-lg">🦁</span>,
    "Game Drives": <span className="text-lg">🚙</span>,
    "Meals Included": <Utensils className="w-5 h-5 text-primary" />,
    "Campfire": <span className="text-lg">🔥</span>,
    "Bush Walks": <span className="text-lg">🚶</span>,
    "Falls View": <span className="text-lg">🌊</span>,
    "Helicopter Tours": <span className="text-lg">🚁</span>,
    "Gym": <span className="text-lg">🏋️</span>,
    "Ocean View": <span className="text-lg">🌅</span>,
    "Private Chef": <span className="text-lg">👨‍🍳</span>,
    "Wine Cellar": <span className="text-lg">🍷</span>,
    "Concierge": <span className="text-lg">🛎️</span>,
    "Beach Access": <span className="text-lg">🏖️</span>,
    "Water Sports": <span className="text-lg">🏄</span>,
    "Diving Center": <span className="text-lg">🤿</span>,
    "Security": <span className="text-lg">🔒</span>,
    "Gym Access": <span className="text-lg">🏋️</span>,
    "Room Service": <span className="text-lg">🛎️</span>,
  };
  return icons[amenity] || <Check className="w-5 h-5 text-primary" />;
};

const AccommodationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [accommodation, setAccommodation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(2);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      setLoading(true);
      try {
        // First try to fetch from database
        const { data, error } = await supabase
          .from('accommodations')
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
          setAccommodation({
            ...data,
            provider: data.providers
          });
        } else if (id && mockAccommodations[id]) {
          // Fallback to mock data for demo
          setAccommodation(mockAccommodations[id]);
        } else {
          navigate('/accommodation');
        }
      } catch (error) {
        console.error('Error fetching accommodation:', error);
        // Use mock data as fallback
        if (id && mockAccommodations[id]) {
          setAccommodation(mockAccommodations[id]);
        } else {
          navigate('/accommodation');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodation();
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
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const nights = differenceInDays(dateRange.to, dateRange.from);
      const totalAmount = nights * accommodation.price_per_night;

      // For mock data, simulate booking
      if (mockAccommodations[id!]) {
        // Call edge function to send SMS notification
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            type: 'accommodation',
            serviceName: accommodation.title,
            customerPhone: phone,
            customerEmail: user.email,
            providerPhone: accommodation.provider?.business_phone,
            providerEmail: accommodation.provider?.business_email,
            checkIn: format(dateRange.from, 'PPP'),
            checkOut: format(dateRange.to, 'PPP'),
            guests,
            totalAmount,
          }
        });

        toast({
          title: "Booking Confirmed!",
          description: `Your stay at ${accommodation.title} has been booked for ${nights} night(s).`,
        });
        navigate('/');
        return;
      }

      // Real booking
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        provider_id: accommodation.provider_id,
        service_type: 'accommodation',
        service_id: accommodation.id,
        check_in: format(dateRange.from, 'yyyy-MM-dd'),
        check_out: format(dateRange.to, 'yyyy-MM-dd'),
        guests,
        total_amount: totalAmount,
        notes,
        status: 'pending'
      });

      if (error) throw error;

      // Send notification via edge function
      await supabase.functions.invoke('send-booking-notification', {
        body: {
          type: 'accommodation',
          serviceName: accommodation.title,
          customerPhone: phone,
          customerEmail: user.email,
          providerPhone: accommodation.provider?.business_phone,
          providerEmail: accommodation.provider?.business_email,
          checkIn: format(dateRange.from, 'PPP'),
          checkOut: format(dateRange.to, 'PPP'),
          guests,
          totalAmount,
        }
      });

      toast({
        title: "Booking Confirmed!",
        description: `Your stay at ${accommodation.title} has been booked for ${nights} night(s).`,
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

  if (!accommodation) {
    return null;
  }

  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) 
    : 0;
  const totalPrice = nights * accommodation.price_per_night;

  const images = accommodation.images?.length > 0 
    ? accommodation.images 
    : [safariTentImg];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to listings
          </Button>

          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <div className="aspect-[16/9] lg:aspect-[21/9]">
              <img
                src={images[currentImageIndex]}
                alt={accommodation.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(i => i === 0 ? images.length - 1 : i - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(i => i === images.length - 1 ? 0 : i + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-primary-foreground w-6"
                          : "bg-primary-foreground/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <Heart className={cn(
                  "w-5 h-5",
                  isFavorite ? "fill-accent text-accent" : "text-foreground"
                )} />
              </button>
              <button
                className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Basic Info */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{accommodation.type}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-semibold">{accommodation.rating}</span>
                    <span className="text-muted-foreground">({accommodation.reviews_count} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {accommodation.title}
                </h1>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{accommodation.location}</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-primary" />
                  <span>{accommodation.beds} Bed{accommodation.beds > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Up to {accommodation.max_guests} guests</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">About this place</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {accommodation.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {accommodation.amenities?.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      {getAmenityIcon(amenity)}
                      <span className="text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Host Info */}
              {accommodation.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Hosted by {accommodation.provider.business_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {accommodation.provider.business_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{accommodation.provider.business_phone}</span>
                      </div>
                    )}
                    {accommodation.provider.business_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{accommodation.provider.business_email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${accommodation.price_per_night}
                    </span>
                    <span className="text-muted-foreground">/night</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date Selection */}
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
                      {nights} night{nights > 1 ? 's' : ''}
                    </div>
                  )}

                  {/* Guests */}
                  <div>
                    <Label htmlFor="guests">Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={accommodation.max_guests}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>

                  {/* Phone for SMS notification */}
                  <div>
                    <Label htmlFor="phone">Phone Number (for SMS confirmation)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+254..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Special Requests (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  {/* Price Breakdown */}
                  {nights > 0 && (
                    <div className="space-y-2 pt-4 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ${accommodation.price_per_night} × {nights} night{nights > 1 ? 's' : ''}
                        </span>
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
                    {isBooking ? "Booking..." : "Reserve Now"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    You won't be charged yet
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

export default AccommodationDetailPage;
