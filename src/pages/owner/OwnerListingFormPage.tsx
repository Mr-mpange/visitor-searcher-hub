import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/provider/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListingType = "accommodations" | "rides" | "events";

const typeConfig = {
  accommodations: {
    title: "Accommodation",
    table: "accommodations" as const,
    fields: {
      price: { label: "Price per Night ($)", field: "price_per_night" },
      extra: [
        { name: "beds", label: "Number of Beds", type: "number", default: 1 },
        { name: "max_guests", label: "Max Guests", type: "number", default: 2 },
      ],
      types: ["Lodge", "Hotel", "Villa", "Camp", "Resort", "Apartment", "Guest House"],
      listField: "amenities",
      listLabel: "Amenities (comma separated)",
      listPlaceholder: "WiFi, Pool, Breakfast, Spa",
    },
  },
  rides: {
    title: "Vehicle",
    table: "rides" as const,
    fields: {
      price: { label: "Price per Day ($)", field: "price_per_day" },
      extra: [
        { name: "seats", label: "Number of Seats", type: "number", default: 4 },
        { name: "price_per_km", label: "Price per KM ($)", type: "number", default: 0 },
      ],
      types: ["Safari Vehicle", "Airport Transfer", "Group Transport", "City Tour", "Long Distance"],
      listField: "features",
      listLabel: "Features (comma separated)",
      listPlaceholder: "4WD, AC, WiFi, GPS",
    },
  },
  events: {
    title: "Event Venue",
    table: "event_halls" as const,
    fields: {
      price: { label: "Price per Hour ($)", field: "price_per_hour" },
      extra: [
        { name: "capacity", label: "Max Capacity", type: "number", default: 100 },
        { name: "price_per_day", label: "Price per Day ($)", type: "number", default: 0 },
      ],
      types: ["Ballroom", "Conference", "Wedding", "Boardroom", "Outdoor", "Convention"],
      listField: "amenities",
      listLabel: "Amenities (comma separated)",
      listPlaceholder: "Catering, PA System, WiFi, Parking",
    },
  },
};

const OwnerListingFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Determine type from URL path
  const pathType = location.pathname.includes('/accommodations') 
    ? 'accommodations' 
    : location.pathname.includes('/rides') 
      ? 'rides' 
      : 'events';

  const config = typeConfig[pathType as ListingType];
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [location_, setLocation] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [images, setImages] = useState<string[]>([]);
  const [listItems, setListItems] = useState("");
  const [available, setAvailable] = useState(true);
  const [extraFields, setExtraFields] = useState<Record<string, number>>({});

  useEffect(() => {
    const initialize = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get provider
        const { data: providerData } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!providerData) {
          toast({
            title: "Provider Profile Required",
            description: "Please complete your provider profile first",
            variant: "destructive",
          });
          navigate('/owner/settings');
          return;
        }

        setProvider(providerData);

        // Initialize extra fields with defaults
        const defaults: Record<string, number> = {};
        config.fields.extra.forEach(field => {
          defaults[field.name] = field.default;
        });
        setExtraFields(defaults);

        // If editing, fetch existing data
        if (isEditing) {
          const { data, error } = await supabase
            .from(config.table)
            .select('*')
            .eq('id', id)
            .eq('provider_id', providerData.id)
            .maybeSingle();

          if (error || !data) {
            toast({
              title: "Not Found",
              description: "Listing not found",
              variant: "destructive",
            });
            navigate(`/owner/${pathType}`);
            return;
          }

          setTitle(data.title);
          setDescription(data.description || "");
          setType(data.type);
          setLocation(data.location);
          setCity(data.city);
          setPrice(data[config.fields.price.field] || 0);
          setImages(data.images || []);
          setAvailable(data.available ?? true);

          // Set list items (amenities/features)
          const listData = data[config.fields.listField as keyof typeof data];
          if (Array.isArray(listData)) {
            setListItems(listData.join(", "));
          }

          // Set extra fields
          const extraData: Record<string, number> = {};
          config.fields.extra.forEach(field => {
            const value = data[field.name as keyof typeof data];
            extraData[field.name] = typeof value === 'number' ? value : field.default;
          });
          setExtraFields(extraData);
        }
      } catch (error) {
        console.error('Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [user, id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !type || !location_ || !city || !price) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const listArray = listItems
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const payload: Record<string, any> = {
        title,
        description,
        type,
        location: location_,
        city,
        [config.fields.price.field]: price,
        images,
        [config.fields.listField]: listArray,
        available,
        status: 'pending_approval',
        ...extraFields,
      };

      if (isEditing) {
        const { error } = await supabase
          .from(config.table)
          .update(payload)
          .eq('id', id);

        if (error) throw error;

        toast({
          title: "Updated",
          description: "Listing updated successfully",
        });
      } else {
        payload.provider_id = provider.id;

        // Use separate insert calls based on table type to satisfy TypeScript
        let error: any = null;
        
        if (pathType === 'accommodations') {
          const result = await supabase.from('accommodations').insert({
            title,
            description,
            type,
            location: location_,
            city,
            price_per_night: price,
            images,
            amenities: listArray,
            available,
            status: 'pending_approval' as const,
            provider_id: provider.id,
            beds: extraFields.beds || 1,
            max_guests: extraFields.max_guests || 2,
          });
          error = result.error;
        } else if (pathType === 'rides') {
          const result = await supabase.from('rides').insert({
            title,
            description,
            type,
            location: location_,
            city,
            price_per_day: price,
            images,
            features: listArray,
            available,
            status: 'pending_approval' as const,
            provider_id: provider.id,
            seats: extraFields.seats || 4,
            price_per_km: extraFields.price_per_km || 0,
          });
          error = result.error;
        } else {
          const result = await supabase.from('event_halls').insert({
            title,
            description,
            type,
            location: location_,
            city,
            price_per_hour: price,
            images,
            amenities: listArray,
            available,
            status: 'pending_approval' as const,
            provider_id: provider.id,
            capacity: extraFields.capacity || 100,
            price_per_day: extraFields.price_per_day || 0,
          });
          error = result.error;
        }

        if (error) throw error;

        toast({
          title: "Created",
          description: "Listing created and submitted for approval",
        });
      }

      navigate(`/owner/${pathType}`);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save listing",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProviderLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(`/owner/${pathType}`)}
          className="mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {config.title}s
        </Button>

        <h1 className="text-2xl font-bold text-foreground mb-8">
          {isEditing ? `Edit ${config.title}` : `Add New ${config.title}`}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the main details of your listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`Enter ${config.title.toLowerCase()} name`}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={setType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.fields.types.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Nairobi"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="location">Full Address *</Label>
                  <Input
                    id="location"
                    value={location_}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Serengeti, Tanzania"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your listing..."
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Details */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">{config.fields.price.label} *</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                {config.fields.extra.map((field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name}>{field.label}</Label>
                    <Input
                      id={field.name}
                      type="number"
                      min={0}
                      value={extraFields[field.name] || 0}
                      onChange={(e) => setExtraFields({
                        ...extraFields,
                        [field.name]: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="listItems">{config.fields.listLabel}</Label>
                <Input
                  id="listItems"
                  value={listItems}
                  onChange={(e) => setListItems(e.target.value)}
                  placeholder={config.fields.listPlaceholder}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="available"
                  checked={available}
                  onCheckedChange={setAvailable}
                />
                <Label htmlFor="available">Currently Available for Booking</Label>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Upload up to 5 high-quality photos</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/owner/${pathType}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Update Listing" : "Submit for Approval"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProviderLayout>
  );
};

export default OwnerListingFormPage;
