import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type ServiceType = Database["public"]["Enums"]["service_type"];

interface Review {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  response?: string;
  response_at?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface CompletedBooking {
  id: string;
  service_id: string;
}

interface ReviewsSectionProps {
  serviceType: ServiceType;
  serviceId: string;
  rating: number;
  reviewsCount: number;
}

export const ReviewsSection = ({
  serviceType,
  serviceId,
  rating,
  reviewsCount,
}: ReviewsSectionProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [eligibleBooking, setEligibleBooking] = useState<CompletedBooking | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkEligibility();
    }
  }, [serviceType, serviceId, user]);

  const fetchReviews = async () => {
    try {
      // First fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          title,
          content,
          response,
          response_at,
          created_at,
          user_id
        `)
        .eq("service_type", serviceType)
        .eq("service_id", serviceId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      // Fetch profiles for all review authors
      const userIds = [...new Set(reviewsData.map(r => r.user_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Map profiles to reviews
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const reviewsWithProfiles = reviewsData.map(review => ({
        ...review,
        profiles: profilesMap.get(review.user_id) || undefined
      }));

      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;

    try {
      // Check if user has a completed booking for this service
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, service_id")
        .eq("user_id", user.id)
        .eq("service_type", serviceType)
        .eq("service_id", serviceId)
        .eq("status", "completed")
        .limit(1);

      if (bookingsError) throw bookingsError;

      if (bookings && bookings.length > 0) {
        // Check if user already reviewed this booking
        const { data: existingReview, error: reviewError } = await supabase
          .from("reviews")
          .select("id")
          .eq("booking_id", bookings[0].id)
          .maybeSingle();

        if (reviewError) throw reviewError;

        if (existingReview) {
          setHasReviewed(true);
        } else {
          setEligibleBooking(bookings[0]);
        }
      }
    } catch (error) {
      console.error("Error checking review eligibility:", error);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setEligibleBooking(null);
    setHasReviewed(true);
    fetchReviews();
  };

  const averageRating = rating || 0;
  const totalReviews = reviewsCount || reviews.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-warning text-warning" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
            </span>
          </div>
        </div>

        {/* Write Review Button */}
        {user && eligibleBooking && !hasReviewed && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && eligibleBooking && user && (
        <ReviewForm
          bookingId={eligibleBooking.id}
          serviceType={serviceType}
          serviceId={serviceId}
          userId={user.id}
          onSuccess={handleReviewSuccess}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Has Already Reviewed Message */}
      {hasReviewed && (
        <div className="p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            ✓ You've already reviewed this place. Thank you for your feedback!
          </p>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-secondary rounded-lg" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-secondary/30 rounded-lg">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
};
