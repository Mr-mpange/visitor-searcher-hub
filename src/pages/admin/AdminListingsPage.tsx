import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, MoreVertical, MapPin, Star, Eye, 
  CheckCircle, XCircle, Building, Car, CalendarDays
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ListingType = "accommodations" | "rides" | "events";

const typeConfig = {
  accommodations: {
    title: "Accommodations",
    icon: Building,
    table: "accommodations" as const,
    priceField: "price_per_night",
    priceLabel: "/night",
  },
  rides: {
    title: "Rides",
    icon: Car,
    table: "rides" as const,
    priceField: "price_per_day",
    priceLabel: "/day",
  },
  events: {
    title: "Event Halls",
    icon: CalendarDays,
    table: "event_halls" as const,
    priceField: "price_per_hour",
    priceLabel: "/hour",
  },
};

const AdminListingsPage = () => {
  const { type = "accommodations" } = useParams<{ type: ListingType }>();
  const { toast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const config = typeConfig[type as ListingType] || typeConfig.accommodations;

  useEffect(() => {
    fetchListings();
  }, [type, statusFilter]);

  const fetchListings = async () => {
    try {
      let query = supabase
        .from(config.table)
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as "draft" | "pending_approval" | "approved" | "rejected");
      }

      const { data, error } = await query;
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (listingId: string, status: "draft" | "pending_approval" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from(config.table)
        .update({ status })
        .eq('id', listingId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Listing ${status}`,
      });

      fetchListings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  const filteredListings = listings.filter(listing =>
    listing.title?.toLowerCase().includes(search.toLowerCase()) ||
    listing.location?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: listings.length,
    pending: listings.filter(l => l.status === 'pending_approval').length,
    approved: listings.filter(l => l.status === 'approved').length,
    rejected: listings.filter(l => l.status === 'rejected').length,
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <config.icon className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-success">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                          {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <config.icon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">{listing.type}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {listing.location}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        ${listing[config.priceField]}{config.priceLabel}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-warning text-warning" />
                        {listing.rating || 0} ({listing.reviews_count || 0})
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(listing.status)}>
                        {listing.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {listing.status === 'pending_approval' && (
                            <>
                              <DropdownMenuItem onClick={() => updateStatus(listing.id, 'approved')}>
                                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(listing.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {listing.status === 'approved' && (
                            <DropdownMenuItem onClick={() => updateStatus(listing.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-2 text-destructive" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          {listing.status === 'rejected' && (
                            <DropdownMenuItem onClick={() => updateStatus(listing.id, 'approved')}>
                              <CheckCircle className="w-4 h-4 mr-2 text-success" />
                              Restore
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminListingsPage;
