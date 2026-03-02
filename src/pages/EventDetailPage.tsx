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
  MapPin, Star, Heart, Users, Check, ChevronLeft, ChevronRight, 
  Share2, Phone, Mail, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";

// Static images
import weddingHallImg from "@/assets/event-wedding-hall.jpg";
import conferenceRoomImg from "@/assets/event-conference-room.jpg";
import gardenVenueImg from "@/assets/event-garden-venue.jpg";

// Mock data
const mockEventHalls: Record<string, any> = {
  "1": {
    id: "1",
    title: "Savanna Grand Ballroom",
    type: "Ballroom",
    location: "Nairobi, Kenya",
    city: "Nairobi",
    price_per_day: 2500,
    price_per_hour: 350,
    rating: 4.9,
    reviews_count: 78,
    images: [weddingHallImg, conferenceRoomImg, gardenVenueImg],
    capacity: 500,
    amenities: ["Catering", "PA System", "Parking", "WiFi", "Stage", "Lighting", "Air Conditioning"],
    description: "An elegant ballroom with stunning African-inspired decor. Perfect for weddings, galas, and corporate events. Features state-of-the-art sound and lighting systems.",
    provider: {
      business_name: "Nairobi Grand Events",
      business_phone: "+254 20 123 4567",
      business_email: "events@nairobigrand.co.ke"
    }
  },
  "2": {
    id: "2",
    title: "Safari Lodge Conference Center",
    type: "Conference",
    location: "Arusha, Tanzania",
    city: "Arusha",
    price_per_day: 1800,
    price_per_hour: 250,
    rating: 4.8,
    reviews_count: 92,
    images: [conferenceRoomImg, weddingHallImg],
    capacity: 200,
    amenities: ["Projector", "WiFi", "Catering", "Breakout Rooms", "Video Conferencing", "Whiteboard"],
    description: "Professional conference facilities with Mount Kilimanjaro views. Ideal for corporate retreats, seminars, and team-building events.",
    provider: {
      business_name: "Arusha Safari Lodge",
      business_phone: "+255 27 123 4567",
      business_email: "conference@arushasafari.co.tz"
    }
  },
  "3": {
    id: "3",
    title: "Oceanview Wedding Venue",
    type: "Wedding",
    location: "Zanzibar, Tanzania",
    city: "Zanzibar",
    price_per_day: 4500,
    price_per_hour: 600,
    rating: 4.95,
    reviews_count: 156,
    images: [weddingHallImg, gardenVenueImg, conferenceRoomImg],
    capacity: 300,
    amenities: ["Beach Access", "Catering", "Decor", "Bridal Suite", "Photography", "Live Band Stage"],
    description: "Say 'I do' with the Indian Ocean as your backdrop. Our wedding venue offers an unforgettable setting with white sand beaches and stunning sunsets.",
    provider: {
      business_name: "Zanzibar Dream Weddings",
      business_phone: "+255 24 567 8901",
      business_email: "weddings@zanzibardream.com"
    }
  },
  "4": {
    id: "4",
    title: "Kigali Executive Boardroom",
    type: "Boardroom",
    location: "Kigali, Rwanda",
    city: "Kigali",
    price_per_day: 800,
    price_per_hour: 120,
    rating: 4.7,
    reviews_count: 64,
    images: [conferenceRoomImg],
    capacity: 25,
    amenities: ["Video Conference", "WiFi", "Coffee", "Whiteboard", "Presentation Screen", "Private Bathroom"],
    description: "An executive boardroom for high-level meetings and presentations. Features advanced video conferencing capabilities and premium amenities.",
    provider: {
      business_name: "Kigali Business Center",
      business_phone: "+250 78 123 4567",
      business_email: "boardroom@kigalibusiness.rw"
    }
  },
  "5": {
    id: "5",
    title: "Garden Party Pavilion",
    type: "Outdoor",
    location: "Cape Town, South Africa",
    city: "Cape Town",
    price_per_day: 3200,
    price_per_hour: 450,
    rating: 4.85,
    reviews_count: 89,
    images: [gardenVenueImg, weddingHallImg],
    capacity: 400,
    amenities: ["Garden", "Tenting", "Catering", "Parking", "Bar Service", "Dance Floor"],
    description: "A beautiful garden pavilion nestled at the foot of Table Mountain. Perfect for outdoor celebrations, garden parties, and alfresco dining events.",
    provider: {
      business_name: "Cape Garden Venues",
      business_phone: "+27 21 987 6543",
      business_email: "events@capegardens.co.za"
    }
  },
  "6": {
    id: "6",
    title: "Kampala Convention Hall",
    type: "Convention",
    location: "Kampala, Uganda",
    city: "Kampala",
    price_per_day: 5000,
    price_per_hour: 700,
    rating: 4.6,
    reviews_count: 45,
    images: [weddingHallImg, conferenceRoomImg, gardenVenueImg],
    capacity: 1000,
    amenities: ["Stage", "PA System", "Catering", "VIP Lounge", "Exhibition Space", "Translation Booths"],
    description: "Uganda's premier convention center for large-scale events. Host conferences, exhibitions, and concerts in our state-of-the-art facility.",
    provider: {
      business_name: "Kampala Convention Center",
      business_phone: "+256 41 234 5678",
      business_email: "events@kampalaconvention.co.ug"
    }
  }
};

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [hours, setHours] = useState(4);
  const [expectedGuests, setExpectedGuests] = useState(100);
  const [eventType, setEventType] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingType, setBookingType] = useState<"hourly" | "daily">("hourly");

  useEffect(() => {
    const fetchHall = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('event_halls')
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
          setHall({
            ...data,
            provider: data.providers
          });
        } else if (id && mockEventHalls[id]) {
          setHall(mockEventHalls[id]);
        } else {
          navigate('/events');
        }
      } catch (error) {
        console.error('Error fetching event hall:', error);
        if (id && mockEventHalls[id]) {
          setHall(mockEventHalls[id]);
        } else {
          navigate('/events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
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

    if (!selectedDate) {
      toast({
        title: "Select Date",
        description: "Please select an event date",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const totalAmount = bookingType === "hourly" 
        ? hours * hall.price_per_hour 
        : hall.price_per_day;

      if (mockEventHalls[id!]) {
        await supabase.functions.invoke('send-booking-notification', {
          body: {
            type: 'event_hall',
            serviceName: hall.title,
            customerPhone: phone,
            providerPhone: hall.provider?.business_phone,
            eventDate: format(selectedDate, 'PPP'),
            eventType,
            expectedGuests,
            hours: bookingType === "hourly" ? hours : 'Full Day',
            totalAmount,
          }
        });

        // Trigger post-booking TTS call
        if (phone) {
          supabase.functions.invoke('post-booking-call', {
            body: {
              customerPhone: phone,
              serviceName: hall.title,
              type: 'event_hall',
              totalAmount,
              eventDate: format(selectedDate, 'PPP'),
              expectedGuests,
            }
          }).catch(err => console.log('Voice call skipped:', err));
        }

        toast({
          title: "Booking Confirmed!",
          description: `Your event at ${hall.title} has been booked for ${format(selectedDate, 'PPP')}.`,
        });
        navigate('/');
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        provider_id: hall.provider_id,
        service_type: 'event_hall',
        service_id: hall.id,
        start_date: format(selectedDate, 'yyyy-MM-dd'),
        end_date: format(selectedDate, 'yyyy-MM-dd'),
        guests: expectedGuests,
        total_amount: totalAmount,
        notes: `Event Type: ${eventType}. Duration: ${bookingType === "hourly" ? `${hours} hours` : 'Full Day'}. ${notes}`,
        status: 'pending'
      });

      if (error) throw error;

      await supabase.functions.invoke('send-booking-notification', {
        body: {
          type: 'event_hall',
          serviceName: hall.title,
          customerPhone: phone,
          providerPhone: hall.provider?.business_phone,
          eventDate: format(selectedDate, 'PPP'),
          eventType,
          expectedGuests,
          hours: bookingType === "hourly" ? hours : 'Full Day',
          totalAmount,
        }
      });

      // Trigger post-booking TTS call
      if (phone) {
        supabase.functions.invoke('post-booking-call', {
          body: {
            customerPhone: phone,
            serviceName: hall.title,
            type: 'event_hall',
            totalAmount,
            eventDate: format(selectedDate, 'PPP'),
            expectedGuests,
          }
        }).catch(err => console.log('Voice call skipped:', err));
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your event at ${hall.title} has been booked for ${format(selectedDate, 'PPP')}.`,
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

  if (!hall) return null;

  const totalPrice = bookingType === "hourly" 
    ? hours * hall.price_per_hour 
    : hall.price_per_day;

  const images = hall.images?.length > 0 ? hall.images : [weddingHallImg];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 lg:pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to venues
          </Button>

          {/* Image Gallery */}
          <div className="relative rounded-2xl overflow-hidden mb-8">
            <div className="aspect-[16/9] lg:aspect-[21/9]">
              <img src={images[currentImageIndex]} alt={hall.title} className="w-full h-full object-cover" />
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
                  <Badge variant="secondary">{hall.type}</Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-semibold">{hall.rating}</span>
                    <span className="text-muted-foreground">({hall.reviews_count} reviews)</span>
                  </div>
                </div>
                
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                  {hall.title}
                </h1>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{hall.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span>Up to {hall.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Flexible hours</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">About this venue</h2>
                <p className="text-muted-foreground leading-relaxed">{hall.description}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hall.amenities?.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <Check className="w-5 h-5 text-primary" />
                      <span className="text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {hall.provider && (
                <Card>
                  <CardHeader>
                    <CardTitle>Managed by {hall.provider.business_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hall.provider.business_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{hall.provider.business_phone}</span>
                      </div>
                    )}
                    {hall.provider.business_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{hall.provider.business_email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <ReviewsSection
                serviceType="event_hall"
                serviceId={hall.id}
                rating={hall.rating || 0}
                reviewsCount={hall.reviews_count || 0}
              />
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">${hall.price_per_hour}</span>
                      <span className="text-muted-foreground">/hour</span>
                    </div>
                    <p className="text-sm text-muted-foreground">or ${hall.price_per_day}/day</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Booking Type Toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      onClick={() => setBookingType("hourly")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                        bookingType === "hourly" ? "bg-card shadow-sm" : "hover:bg-card/50"
                      )}
                    >
                      Hourly
                    </button>
                    <button
                      onClick={() => setBookingType("daily")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors",
                        bookingType === "daily" ? "bg-card shadow-sm" : "hover:bg-card/50"
                      )}
                    >
                      Full Day
                    </button>
                  </div>

                  <div>
                    <Label className="mb-2 block">Event Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date() }}
                      className="rounded-md border"
                    />
                  </div>

                  {bookingType === "hourly" && (
                    <div>
                      <Label htmlFor="hours">Number of Hours</Label>
                      <Input
                        id="hours"
                        type="number"
                        min={1}
                        max={24}
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value) || 1)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="guests">Expected Guests</Label>
                    <Input
                      id="guests"
                      type="number"
                      min={1}
                      max={hall.capacity}
                      value={expectedGuests}
                      onChange={(e) => setExpectedGuests(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Input
                      id="eventType"
                      placeholder="e.g., Wedding, Conference..."
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
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
                    <Label htmlFor="notes">Special Requests (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requirements..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {bookingType === "hourly" 
                          ? `$${hall.price_per_hour} × ${hours} hour${hours > 1 ? 's' : ''}`
                          : 'Full day rate'
                        }
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || isBooking}
                    className="w-full"
                    size="lg"
                  >
                    {isBooking ? "Booking..." : "Book Venue"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Confirmation will be sent via SMS
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

export default EventDetailPage;
