import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ProviderLayout } from "@/components/layout/ProviderLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Pencil, Trash2, Eye, MoreVertical, 
  MapPin, Star, Building, Car, CalendarDays 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ListingType = "accommodations" | "rides" | "events";

const typeConfig = {
  accommodations: {
    title: "Accommodations",
    icon: Building,
    addLabel: "Add Accommodation",
    table: "accommodations" as const,
    priceField: "price_per_night",
    priceLabel: "/night",
  },
  rides: {
    title: "Rides & Transport",
    icon: Car,
    addLabel: "Add Vehicle",
    table: "rides" as const,
    priceField: "price_per_day",
    priceLabel: "/day",
  },
  events: {
    title: "Event Halls",
    icon: CalendarDays,
    addLabel: "Add Venue",
    table: "event_halls" as const,
    priceField: "price_per_hour",
    priceLabel: "/hour",
  },
};

const OwnerListingsPage = () => {
  const { type = "accommodations" } = useParams<{ type: ListingType }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

  const config = typeConfig[type as ListingType] || typeConfig.accommodations;

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, type]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // Get provider first
      const { data: providerData } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      setProvider(providerData);

      if (providerData) {
        const { data, error } = await supabase
          .from(config.table)
          .select('*')
          .eq('provider_id', providerData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await supabase
        .from(config.table)
        .delete()
        .eq('id', deleteId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Listing has been deleted",
      });

      setListings(listings.filter(l => l.id !== deleteId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete listing",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: "bg-muted text-muted-foreground",
      pending_approval: "bg-warning/10 text-warning",
      approved: "bg-success/10 text-success",
      rejected: "bg-destructive/10 text-destructive",
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  if (!provider && !loading) {
    return (
      <ProviderLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Please complete your provider profile first.</p>
          <Button asChild className="mt-4">
            <Link to="/owner/settings">Set Up Profile</Link>
          </Button>
        </div>
      </ProviderLayout>
    );
  }

  return (
    <ProviderLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <config.icon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
          </div>
          <Button asChild>
            <Link to={`/owner/${type}/new`}>
              <Plus className="w-4 h-4 mr-2" />
              {config.addLabel}
            </Link>
          </Button>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  {listing.images?.[0] ? (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <config.icon className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 left-3 ${getStatusBadge(listing.status)}`}>
                    {listing.status.replace('_', ' ')}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="absolute top-3 right-3 w-8 h-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/owner/${type}/${listing.id}/edit`}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/${type === 'events' ? 'events' : type}/${listing.id}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteId(listing.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {listing.location}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{listing.rating || 0}</span>
                      <span className="text-xs text-muted-foreground">({listing.reviews_count || 0})</span>
                    </div>
                    <div>
                      <span className="font-bold text-foreground">
                        ${listing[config.priceField]}
                      </span>
                      <span className="text-sm text-muted-foreground">{config.priceLabel}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <config.icon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No listings yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first listing to start receiving bookings
            </p>
            <Button asChild>
              <Link to={`/owner/${type}/new`}>
                <Plus className="w-4 h-4 mr-2" />
                {config.addLabel}
              </Link>
            </Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProviderLayout>
  );
};

export default OwnerListingsPage;
